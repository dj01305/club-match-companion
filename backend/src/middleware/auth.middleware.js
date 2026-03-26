const jwt = require('jsonwebtoken');

// This middleware runs before any protected route handler.
// It checks for a valid JWT in the Authorization header.
// If valid, it attaches the decoded user payload to req.user.
// If invalid or missing, it immediately returns 401 and stops the request.
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next(); // pass control to the actual route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authenticateToken;
