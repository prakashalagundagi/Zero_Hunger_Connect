// JWT authentication middleware
// Protects routes by verifying the Bearer token in the Authorization header
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { demoUsers } = require('../config/demoStore');

const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token provided' });
  }

  try {
    // Verify token signature and expiry
    const secret = process.env.JWT_SECRET || 'demo_secret_key_for_development_purpose_only';
    const decoded = jwt.verify(token, secret);

    try {
      // ── Database path ────────────────────────────────────────────────────
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found — please log in again' });
      }
      req.user = user;
    } catch (dbError) {
      // ── Demo / offline path ──────────────────────────────────────────────
      // Look up the user in the shared demo store by their stored ID
      console.log('Database not available in auth middleware, checking demo store');

      let demoUser = null;
      for (const user of demoUsers.values()) {
        const userId = user._id || user.id;
        if (userId === decoded.id) {
          demoUser = user;
          break;
        }
      }

      if (!demoUser) {
        // Token is valid but user not in demo store — likely server restarted
        return res.status(401).json({
          success: false,
          message: 'Session expired — please log in again',
        });
      }

      req.user = demoUser;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired — please log in again' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized — invalid token' });
  }
};

module.exports = { protect };
