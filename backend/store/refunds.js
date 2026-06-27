const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'data', 'refunds.json');

function readRefunds() {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch { return []; }
}

function writeRefunds(data) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readRefunds, writeRefunds };
