const jwt = require('jsonwebtoken');

// Strict — must be logged in
module.exports.requireUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Please login to continue.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    console.error('JWT verify error:', e.message);
    res.status(403).json({ error: 'Session expired. Please login again.' });
  }
};

// Optional — attach user if token exists, continue either way
module.exports.optionalUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  }
  next();
};
