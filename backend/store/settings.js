const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data', 'settings.json');

// Ensure directory exists
const dir = path.dirname(FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

function readSettings() {
  try {
    if (!fs.existsSync(FILE)) return getDefaultSettings();
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (e) {
    return getDefault}

function writeSettings(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function getDefaultSettings() {
  return {
    termsAndConditions: '',
    refundPolicy: '',
    freeShippingThreshold: 100,
    standardCost: 9.99,
    expressCost: 19.99,
    processingTime: '1-2 business days',
    deliveryTime: '3-5 business days',
    shippingZones: ['Local', 'Domestic', 'International'],
    banners: [
      { id: 'hero1', title: 'Summer Sale', subtitle: 'Up to 50% off on selected items. Limited time only!', cta: 'Shop Now', color: '#4338ca', active: true },
      { id: 'hero2', title: 'New Electronics', subtitle: 'Latest smartphones, laptops & gadgets just arrived', cta: 'Explore', color: '#1e1b4b', active: true },
      { id: 'hero3', title: 'Free Shipping', subtitle: 'Free shipping on orders over $100', cta: 'Learn More', color: '#0f172a', active: true }
    ],
    maintenanceMode: false,
    couponDiscount: 0,
    couponCode: ''
  };
}

module.exports = { readSettings, writeSettings };
