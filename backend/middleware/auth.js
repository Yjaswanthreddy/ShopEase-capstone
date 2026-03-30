const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    const e = new Error('Authentication required');
    e.status = 401;
    return next(e);
  }
  try {
    const payload = jwt.verify(h.slice(7), process.env.JWT_SECRET || 'dev-secret');
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    const e = new Error('Invalid or expired token');
    e.status = 401;
    next(e);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    const e = new Error('Admin access required');
    e.status = 403;
    return next(e);
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
