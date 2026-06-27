const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'data', 'settings.json');

function readSettings() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const defaults = {
        termsAndConditions: 'By using ShopZone, you agree to the following terms:\n\n1. All orders are subject to product availability.\n2. Prices may change without prior notice.\n3. Returns are subject to our 30-day return policy.\n4. We reserve the right to cancel any order.\n5. User data is protected according to our privacy policy.',
        refundPolicy: '30-day return policy. Items must be unused and in original packaging. Free return shipping for defective items. Refunds processed within 5-7 business days.',
        freeShippingThreshold: 100,
        standardShippingCost: 9.99,
        expressShippingCost: 19.99,
        taxRate: 8
      };
      writeSettings(defaults);
      return defaults;
    }
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeSettings(data) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readSettings, writeSettings };
