const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer token on the request and attaches the decoded
 * payload ({ id, name, email, role, department }) to req.user.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * Restricts a route to specific roles, e.g. authorize('admin', 'tutor').
 * Must be used AFTER verifyToken.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to do this.' });
    }
    next();
  };
}

module.exports = { verifyToken, authorize };
