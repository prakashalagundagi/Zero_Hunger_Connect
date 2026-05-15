// Authentication controller — handles register, login, logout, and profile
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { demoUsers } = require('../config/demoStore');

/**
 * Generate a signed JWT token for the given user ID.
 * Expires in 30 days.
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('⚠️  JWT_SECRET is not set — using insecure fallback. Set it in .env for production.');
  }
  return jwt.sign({ id }, secret || 'demo_secret_key_for_development_purpose_only', {
    expiresIn: '30d',
  });
};

/**
 * Format a user document (Mongoose or plain object) into the shape the frontend expects.
 * Mirrors the TypeScript User interface in src/app/types/index.ts.
 */
const formatUser = (user) => ({
  id: user._id ? user._id.toString() : user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  location: user.location || { lat: 12.9716, lng: 77.5946, address: '' },
  avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
  createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const validRoles = ['donor', 'receiver', 'volunteer', 'ngo'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    try {
      // ── Database path ──────────────────────────────────────────────────────
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      // Small random offset so map markers don't all overlap at the same point
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;

      const user = await User.create({
        name,
        email,
        password,
        role,
        phone: phone || '',
        location: {
          lat: 12.9716 + latOffset,
          lng: 77.5946 + lngOffset,
          address: address || '',
        },
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      });

      const token = generateToken(user._id);
      return res.status(201).json({ success: true, token, user: formatUser(user) });

    } catch (dbError) {
      // ── Demo / offline path ────────────────────────────────────────────────
      console.log('Database not available, storing user in demo storage:', dbError.message);

      const emailKey = email.toLowerCase();
      if (demoUsers.has(emailKey)) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const demoId = `demo_${Date.now()}`;
      const user = {
        _id: demoId,
        id: demoId,
        name,
        email: emailKey,
        role,
        phone: phone || '',
        location: {
          lat: 12.9716,
          lng: 77.5946,
          address: address || 'Bengaluru, Karnataka, India',
        },
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date(),
        password: hashedPassword,
      };

      demoUsers.set(emailKey, user);

      const token = generateToken(demoId);
      return res.status(201).json({ success: true, token, user: formatUser(user) });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
      // ── Database path ──────────────────────────────────────────────────────
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);
      return res.json({ success: true, token, user: formatUser(user) });

    } catch (dbError) {
      // ── Demo / offline path ────────────────────────────────────────────────
      console.log('Database not available, checking demo storage:', dbError.message);

      const user = demoUsers.get(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id || user.id);
      return res.json({ success: true, token, user: formatUser(user) });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// GET /api/auth/me — returns the currently authenticated user
const getMe = async (req, res) => {
  try {
    // req.user is already populated by the protect middleware
    // Try to get a fresh copy from the database
    try {
      const user = await User.findById(req.user._id || req.user.id);
      if (!user) {
        // Fall back to the user object already on req (demo mode)
        return res.json({ success: true, user: formatUser(req.user) });
      }
      return res.json({ success: true, user: formatUser(user) });
    } catch (dbError) {
      // Database not available — return the user already attached by middleware
      return res.json({ success: true, user: formatUser(req.user) });
    }
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/logout — JWT is stateless; client removes the token.
// This endpoint exists for a clean server-side confirmation.
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, logout };
