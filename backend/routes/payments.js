require('dotenv').config();
const router = require('express').Router();
const DB = require('../database');

// Check if Stripe is configured
function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  // Real keys are much longer than placeholders
  if (key.length < 30) return false;
  if (key.includes('...') || key.includes('your_') || key.includes('replace')) return false;
  if (key.startsWith('sk_test_') || key.startsWith('sk_live_')) return true;
  return false;
}

// Lazy Stripe init
let stripe = null;
function getStripe() {
  if (!isStripeConfigured()) return null;
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    stripe = require('stripe')(key);
  }
  return stripe;
}

// Create Payment Intent (or demo mode)
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', customer_email, customer_name, shipping_address, items } = req.body;
    if (!amount || amount < 0.5) return res.status(400).json({ error: 'Invalid amount.' });

    const s = getStripe();

    if (s) {
      // Real Stripe mode
      let customer;
      const existing = await s.customers.list({ email: customer_email, limit: 1 });
      if (existing.data.length) {
        customer = existing.data[0];
      } else {
        customer = await s.customers.create({ email: customer_email, name: customer_name });
      }

      const paymentIntent = await s.paymentIntents.create({
        amount: Math.round(amount * 100),
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
        mode: 'stripe'
      });
    } else {
      // Demo mode — no Stripe key, create a fake payment intent
      const fakeId = 'pi_demo_' + Date.now().toString(36);
      res.json({
        clientSecret: fakeId + '_secret_demo',
        paymentIntentId: fakeId,
        customerId: 'cus_demo',
        mode: 'demo'
      });
    }
  } catch (err) {
    console.error('Payment create error:', err.message);
    res.status(500).json({ error: 'Payment initialization failed.' });
  }
});

// Confirm payment and create order
router.post('/confirm', async (req, res) => {
  try {
    const { payment_intent_id, customer_name, customer_email, shipping_address, subtotal, tax, shipping_cost, total, items } = req.body;

    const s = getStripe();
    let paymentMethod = 'Credit Card';
    let paymentStatus = 'paid';

    if (s && payment_intent_id && !payment_intent_id.startsWith('pi_demo_')) {
      // Real Stripe — verify payment
      const pi = await s.paymentIntents.retrieve(payment_intent_id);
      if (pi.status !== 'succeeded') {
        return res.status(400).json({ error: `Payment not completed. Status: ${pi.status}` });
      }
      paymentMethod = 'Stripe';
      paymentStatus = 'paid';
    }
    // Demo mode — skip Stripe verification, order goes through directly

    // Create order in database
    const order = DB.createOrder({
      customer_name,
      customer_email,
      shipping_address,
      subtotal,
      tax,
      shipping_cost,
      total,
      payment_method: paymentMethod,
      payment_intent_id: payment_intent_id || 'demo',
      payment_status: paymentStatus,
      items: items || [],
    });

    res.json({
      message: 'Payment successful! Order placed.',
      order_id: order.id,
      total: order.total,
      payment_status: paymentStatus,
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
    if (!s) {
      // Demo mode
      return res.json({ status: 'succeeded', mode: 'demo' });
    }
    const pi = await s.paymentIntents.retrieve(req.params.paymentIntentId);
    res.json({ status: pi.status, amount: pi.amount / 100, currency: pi.currency, mode: 'stripe' });
  } catch (err) {
    res.status(400).json({ error: 'Payment not found.' });
  }
});

// Stripe webhook
router.post('/webhook', (req, res) => {
  const s = getStripe();
  if (!s) return res.json({ received: true, mode: 'demo' });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    event = s.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
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
