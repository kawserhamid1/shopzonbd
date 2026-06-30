const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, 'store', 'data');

// Ensure directory exists
if (!fs.existsSync(STORE_DIR)) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}

function readJSON(filename) {
  try {
    const filePath = path.join(STORE_DIR, filename + '.json');
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeJSON(filename, data) {
  const filePath = path.join(STORE_DIR, filename + '.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readJSON, writeJSON };
