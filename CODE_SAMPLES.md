# Zero Hunger Connect - Code Samples

This document provides key code samples for implementing core features in production.

---

## Table of Contents

1. [Backend API Examples](#backend-api-examples)
2. [Database Queries](#database-queries)
3. [Geolocation Features](#geolocation-features)
4. [Real-time Notifications](#real-time-notifications)
5. [File Upload](#file-upload)
6. [Authentication](#authentication)
7. [Email Notifications](#email-notifications)

---

## Backend API Examples

### Node.js + Express Backend

#### Setup Express Server

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import requestRoutes from './routes/requests.js';

app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Donation Routes

```javascript
// routes/donations.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllDonations,
  createDonation,
  getDonationById,
  updateDonation,
  deleteDonation,
  getNearbyDonations
} from '../controllers/donationController.js';

const router = express.Router();

router.get('/', getAllDonations);
router.post('/', authenticateToken, createDonation);
router.get('/nearby', getNearbyDonations);
router.get('/:id', getDonationById);
router.patch('/:id', authenticateToken, updateDonation);
router.delete('/:id', authenticateToken, deleteDonation);

export default router;
```

#### Donation Controller

```javascript
// controllers/donationController.js
import pool from '../db/pool.js';

export const createDonation = async (req, res) => {
  try {
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      locationLat,
      locationLng,
      address,
      pickupTimeStart,
      pickupTimeEnd,
      expiryDate
    } = req.body;

    const donorId = req.user.id;

    const result = await pool.query(
      `INSERT INTO food_donations (
        donor_id, title, description, food_type, quantity, unit,
        location_lat, location_lng, address,
        pickup_time_start, pickup_time_end, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        donorId, title, description, foodType, quantity, unit,
        locationLat, locationLng, address,
        pickupTimeStart, pickupTimeEnd, expiryDate
      ]
    );

    // Send notification to nearby users
    await notifyNearbyUsers(locationLat, locationLng, result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
};

export const getAllDonations = async (req, res) => {
  try {
    const { foodType, status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM active_donations WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (foodType) {
      query += ` AND food_type = $${paramCount}`;
      params.push(foodType);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
};

export const getNearbyDonations = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const result = await pool.query(
      `SELECT *,
        earth_distance(
          ll_to_earth($1, $2),
          ll_to_earth(location_lat, location_lng)
        ) / 1000 as distance_km
      FROM food_donations
      WHERE status = 'available'
        AND earth_distance(
          ll_to_earth($1, $2),
          ll_to_earth(location_lat, location_lng)
        ) <= $3 * 1000
      ORDER BY distance_km
      LIMIT 50`,
      [parseFloat(lat), parseFloat(lng), parseFloat(radius)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching nearby donations:', error);
    res.status(500).json({ error: 'Failed to fetch nearby donations' });
  }
};
```

---

## Database Queries

### Complex Queries with PostGIS

```javascript
// Get donations within radius with user info
export const getDonationsWithinRadius = async (lat, lng, radiusKm) => {
  const query = `
    SELECT 
      d.*,
      u.name as donor_name,
      u.avatar_url,
      u.phone,
      earth_distance(
        ll_to_earth($1, $2),
        ll_to_earth(d.location_lat, d.location_lng)
      ) / 1000 as distance_km
    FROM food_donations d
    JOIN users u ON d.donor_id = u.id
    WHERE d.status = 'available'
      AND d.expiry_date > NOW()
      AND earth_distance(
        ll_to_earth($1, $2),
        ll_to_earth(d.location_lat, d.location_lng)
      ) <= $3 * 1000
    ORDER BY distance_km
    LIMIT 50
  `;

  return await pool.query(query, [lat, lng, radiusKm]);
};

// Get user impact statistics
export const getUserImpactStats = async (userId) => {
  const query = `
    SELECT 
      COALESCE(SUM(CEIL(d.quantity)), 0) as meals_saved,
      COALESCE(SUM(d.quantity), 0) as food_waste_reduced,
      COALESCE(COUNT(DISTINCT CASE WHEN d.claimed_by IS NOT NULL THEN d.claimed_by END), 0) as people_helped,
      COALESCE(SUM(d.quantity * 1.5), 0) as co2_reduced,
      COALESCE(COUNT(*), 0) as donations_completed
    FROM food_donations d
    WHERE d.donor_id = $1
      AND d.status = 'delivered'
  `;

  return await pool.query(query, [userId]);
};

// Search donations with full-text search
export const searchDonations = async (searchTerm) => {
  const query = `
    SELECT *,
      ts_rank(
        to_tsvector('english', title || ' ' || description),
        plainto_tsquery('english', $1)
      ) as rank
    FROM food_donations
    WHERE status = 'available'
      AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC, created_at DESC
    LIMIT 50
  `;

  return await pool.query(query, [searchTerm]);
};
```

---

## Geolocation Features

### Calculate Distance (Haversine Formula)

```typescript
// utils/geolocation.ts
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get user's current location
export async function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

// Geocode address to coordinates
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng
    };
  }

  throw new Error('Address not found');
}
```

---

## Real-time Notifications

### Using Supabase Realtime

```typescript
// hooks/useRealtimeNotifications.ts
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useRealtimeNotifications(userId: string) {
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new;
          toast.success(notification.title, {
            description: notification.message
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
```

### Using WebSockets

```javascript
// server/websocket.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map(); // userId -> WebSocket

wss.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'auth') {
      clients.set(data.userId, ws);
    }
  });

  ws.on('close', () => {
    // Remove client
    for (const [userId, socket] of clients.entries()) {
      if (socket === ws) {
        clients.delete(userId);
        break;
      }
    }
  });
});

// Send notification to user
export function sendNotification(userId, notification) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'notification',
      data: notification
    }));
  }
}

// Notify nearby users of new donation
export async function notifyNearbyUsers(lat, lng, donation) {
  const nearbyUsers = await getNearbyUsers(lat, lng, 10); // 10km radius

  nearbyUsers.forEach(user => {
    sendNotification(user.id, {
      title: 'New Donation Nearby',
      message: `${donation.title} is available ${calculateDistance(user.lat, user.lng, lat, lng).toFixed(1)}km away`,
      actionUrl: `/donations/${donation.id}`
    });
  });
}
```

---

## File Upload

### Image Upload to S3

```javascript
// controllers/uploadController.js
import AWS from 'aws-sdk';
import multer from 'multer';
import sharp from 'sharp';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

export const uploadDonationImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Resize and optimize image
    const optimizedImage = await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileName = `donations/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: optimizedImage,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    res.json({ url: result.Location });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const uploadMiddleware = upload.single('image');
```

---

## Authentication

### JWT Authentication

```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
}

// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, lat, lng } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, address, location_lat, location_lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role, phone, location_lat, location_lng, address, created_at`,
      [name, email, passwordHash, role, phone, address, lat, lng]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password_hash;

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};
```

---

## Email Notifications

### Using Nodemailer

```javascript
// utils/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: '"Zero Hunger Connect" <noreply@zerohungerconnect.org>',
      to,
      subject,
      html
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  newDonationNearby: (userName, donationTitle, distance) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #f97316); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 New Food Donation Nearby!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Good news! A new food donation is available near you:</p>
          <h2>${donationTitle}</h2>
          <p><strong>Distance:</strong> ${distance} km away</p>
          <p>Act fast to claim this donation before it's gone!</p>
          <a href="https://yourapp.com/donations" class="button">View Donation</a>
          <p>Together, we're ending food waste and feeding hope.</p>
          <p>- Zero Hunger Connect Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  requestAccepted: (receiverName, donationTitle, pickupAddress) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #f97316); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Request Accepted!</h1>
        </div>
        <div class="content">
          <p>Hi ${receiverName},</p>
          <p>Great news! Your request for <strong>${donationTitle}</strong> has been accepted.</p>
          <div class="info-box">
            <h3>Pickup Details:</h3>
            <p><strong>Address:</strong> ${pickupAddress}</p>
            <p>Please coordinate with the donor for pickup time.</p>
          </div>
          <p>Thank you for using Zero Hunger Connect!</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Usage
export async function notifyNewDonation(user, donation, distance) {
  await sendEmail({
    to: user.email,
    subject: 'New Food Donation Available Nearby',
    html: emailTemplates.newDonationNearby(
      user.name,
      donation.title,
      distance.toFixed(1)
    )
  });
}
```

---

## Frontend API Integration

### API Client with Axios

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const donationApi = {
  getAll: (params?: { foodType?: string; status?: string }) =>
    api.get('/donations', { params }),

  getNearby: (lat: number, lng: number, radius = 10) =>
    api.get('/donations/nearby', { params: { lat, lng, radius } }),

  getById: (id: string) =>
    api.get(`/donations/${id}`),

  create: (data: CreateDonationDto) =>
    api.post('/donations', data),

  update: (id: string, data: UpdateDonationDto) =>
    api.patch(`/donations/${id}`, data),

  delete: (id: string) =>
    api.delete(`/donations/${id}`)
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: RegisterDto) =>
    api.post('/auth/register', data),

  me: () =>
    api.get('/auth/me')
};

export default api;
```

---

These code samples provide a solid foundation for implementing the Zero Hunger Connect application in production. Adapt them based on your specific requirements and infrastructure choices.
