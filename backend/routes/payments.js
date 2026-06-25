require('dotenv').config();
const router = require('express').Router();
const DB = require('../database');

// Lazy Stripe init — only loads when a payment route is actually called
let stripe = null;
function getStripe() {
  if (!stripe) {
    try {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key || key.includes('your_stripe')) {
        throw new Error('Stripe key not configured');
      }
      stripe = require('stripe')(key);
    } catch (e) {
      throw new Error('Stripe not configured: ' + e.message);
    }
  }
  return stripe;
}

// Create Payment Intent
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', customer_email, customer_name, shipping_address, items } = req.body;
    if (!amount || amount < 50) return res.status(400).json({ error: 'Invalid amount.' });

    const stripe = getStripe();
    // Create or retrieve Stripe customer
    let customer;
    const existing = await stripe.customers.list({ email: customer_email, limit: 1 });
    if (existing.data.length) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({ email: customer_email, name: customer_name });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency,
      customer: customer.id,
      receipt_email: customer_email,
      description: `ShopZone order for ${customer_name}`,
      metadata: { customer_name, customer_email, shipping_address: shipping_address || '' },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer.id,
    });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment initialization failed.' });
  }
});

// Confirm payment and create order
router.post('/confirm', async (req, res) => {
  try {
    const { payment_intent_id, customer_name, customer_email, shipping_address, subtotal, tax, shipping_cost, total, items } = req.body;

    const stripe = getStripe();
    // Verify payment with Stripe
    const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (pi.status !== 'succeeded') {
      return res.status(400).json({ error: `Payment not completed. Status: ${pi.status}` });
    }

    // Create order in database
    const order = DB.createOrder({
      customer_name,
      customer_email,
      shipping_address,
      subtotal,
      tax,
      shipping_cost,
      total,
      payment_method: 'Stripe',
      payment_intent_id: pi.id,
      payment_status: 'paid',
      items: items || [],
    });

    res.json({
      message: 'Payment successful! Order placed.',
      order_id: order.id,
      total: order.total,
      payment_status: 'paid',
    });
  } catch (err) {
    console.error('Confirm error:', err.message);
    res.status(500).json({ error: 'Order creation failed.' });
  }
});

// Get payment status
router.get('/status/:paymentIntentId', async (req, res) => {
  try {
    const s = getStripe();
    const pi = await s.paymentIntents.retrieve(req.params.paymentIntentId);
    res.json({ status: pi.status, amount: pi.amount / 100, currency: pi.currency });
  } catch (err) {
    res.status(400).json({ error: 'Payment not found or Stripe not configured.' });
  }
});

// Stripe webhook (for async events like disputes, refunds)
router.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const stripe = getStripe();
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).json({ error: 'Webhook signature failed.' });
  }

  if (event.type === 'payment_intent.succeeded') {
    console.log('✅ Webhook: Payment succeeded:', event.data.object.id);
  } else if (event.type === 'payment_intent.payment_failed') {
    console.log('❌ Webhook: Payment failed:', event.data.object.id);
  }

  res.json({ received: true });
});

module.exports = router;