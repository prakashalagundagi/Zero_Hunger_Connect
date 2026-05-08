# Zero Hunger Connect - Database Schema

## Overview

This document outlines the database schema for the Zero Hunger Connect platform. The schema is designed for a relational database (PostgreSQL recommended) but can be adapted for NoSQL databases like MongoDB.

## Database: PostgreSQL (Recommended)

### Advantages
- ACID compliance for data integrity
- PostGIS extension for geospatial queries
- Strong typing and constraints
- Complex queries and joins
- Excellent for structured data

---

## Tables

### 1. users

Stores user account information for all user types.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'receiver', 'volunteer', 'ngo')),
  phone VARCHAR(20) NOT NULL,
  avatar_url VARCHAR(500),
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users USING GIST(
  ll_to_earth(location_lat, location_lng)
);
```

### 2. food_donations

Stores food donation listings.

```sql
CREATE TABLE food_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  food_type VARCHAR(20) NOT NULL CHECK (
    food_type IN ('prepared', 'raw', 'packaged', 'produce', 'bakery', 'dairy')
  ),
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  pickup_time_start TIMESTAMP NOT NULL,
  pickup_time_end TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (
    status IN ('available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled')
  ),
  image_url VARCHAR(500),
  claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_donations_donor ON food_donations(donor_id);
CREATE INDEX idx_donations_status ON food_donations(status);
CREATE INDEX idx_donations_food_type ON food_donations(food_type);
CREATE INDEX idx_donations_created_at ON food_donations(created_at DESC);
CREATE INDEX idx_donations_location ON food_donations USING GIST(
  ll_to_earth(location_lat, location_lng)
);

-- Full-text search index
CREATE INDEX idx_donations_search ON food_donations USING GIN(
  to_tsvector('english', title || ' ' || description)
);
```

### 3. food_requests

Stores requests for food donations.

```sql
CREATE TABLE food_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')
  ),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_requests_receiver ON food_requests(receiver_id);
CREATE INDEX idx_requests_donation ON food_requests(donation_id);
CREATE INDEX idx_requests_status ON food_requests(status);
CREATE INDEX idx_requests_created_at ON food_requests(created_at DESC);

-- Prevent duplicate requests
CREATE UNIQUE INDEX idx_unique_active_request ON food_requests(receiver_id, donation_id)
  WHERE status IN ('pending', 'accepted');
```

### 4. deliveries

Tracks volunteer deliveries.

```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
  request_id UUID REFERENCES food_requests(id) ON DELETE SET NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_lat DECIMAL(10, 8) NOT NULL,
  delivery_lng DECIMAL(11, 8) NOT NULL,
  delivery_address TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (
    status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')
  ),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  picked_up_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_deliveries_volunteer ON deliveries(volunteer_id);
CREATE INDEX idx_deliveries_donation ON deliveries(donation_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at DESC);
```

### 5. notifications

Stores user notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 6. impact_stats

Tracks impact metrics for users and the platform.

```sql
CREATE TABLE impact_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  meals_saved INTEGER DEFAULT 0,
  food_waste_reduced DECIMAL(10, 2) DEFAULT 0, -- in kg
  people_helped INTEGER DEFAULT 0,
  co2_reduced DECIMAL(10, 2) DEFAULT 0, -- in kg
  donations_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_impact_user ON impact_stats(user_id);

-- For platform-wide stats
CREATE INDEX idx_impact_totals ON impact_stats(meals_saved, food_waste_reduced, people_helped);
```

### 7. user_sessions

Stores active user sessions for authentication.

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

### 8. messages (Optional - for chat feature)

Stores messages between users.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES food_donations(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_donation ON messages(donation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### 9. reviews (Optional - for rating system)

Stores user reviews and ratings.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES food_donations(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_user_id);
CREATE UNIQUE INDEX idx_unique_review ON reviews(reviewer_id, donation_id);
```

---

## Views

### active_donations

View for easily querying active donations.

```sql
CREATE VIEW active_donations AS
SELECT 
  d.*,
  u.name as donor_name,
  u.avatar_url as donor_avatar,
  u.phone as donor_phone
FROM food_donations d
JOIN users u ON d.donor_id = u.id
WHERE d.status = 'available'
  AND d.expiry_date > NOW()
ORDER BY d.created_at DESC;
```

### platform_impact

View for platform-wide impact statistics.

```sql
CREATE VIEW platform_impact AS
SELECT 
  SUM(meals_saved) as total_meals_saved,
  SUM(food_waste_reduced) as total_waste_reduced,
  SUM(people_helped) as total_people_helped,
  SUM(co2_reduced) as total_co2_reduced,
  SUM(donations_completed) as total_donations_completed
FROM impact_stats;
```

---

## Functions

### Update Impact Stats

Automatically update impact statistics when a donation is completed.

```sql
CREATE OR REPLACE FUNCTION update_impact_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    -- Update donor stats
    INSERT INTO impact_stats (user_id, donations_completed, meals_saved, food_waste_reduced, co2_reduced)
    VALUES (
      NEW.donor_id,
      1,
      CEIL(NEW.quantity::numeric),
      NEW.quantity,
      NEW.quantity * 1.5
    )
    ON CONFLICT (user_id) DO UPDATE SET
      donations_completed = impact_stats.donations_completed + 1,
      meals_saved = impact_stats.meals_saved + CEIL(NEW.quantity::numeric),
      food_waste_reduced = impact_stats.food_waste_reduced + NEW.quantity,
      co2_reduced = impact_stats.co2_reduced + (NEW.quantity * 1.5),
      updated_at = NOW();
    
    -- Update volunteer stats if applicable
    IF NEW.volunteer_id IS NOT NULL THEN
      INSERT INTO impact_stats (user_id, donations_completed, people_helped)
      VALUES (NEW.volunteer_id, 1, 1)
      ON CONFLICT (user_id) DO UPDATE SET
        donations_completed = impact_stats.donations_completed + 1,
        people_helped = impact_stats.people_helped + 1,
        updated_at = NOW();
    END IF;
    
    -- Update receiver stats if applicable
    IF NEW.claimed_by IS NOT NULL THEN
      INSERT INTO impact_stats (user_id, people_helped)
      VALUES (NEW.claimed_by, 1)
      ON CONFLICT (user_id) DO UPDATE SET
        people_helped = impact_stats.people_helped + 1,
        updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_impact
AFTER UPDATE ON food_donations
FOR EACH ROW
EXECUTE FUNCTION update_impact_stats();
```

### Nearby Donations Function

Find donations within a specified radius.

```sql
CREATE OR REPLACE FUNCTION nearby_donations(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    earth_distance(
      ll_to_earth(user_lat, user_lng),
      ll_to_earth(d.location_lat, d.location_lng)
    ) / 1000 as distance_km
  FROM food_donations d
  WHERE d.status = 'available'
    AND earth_distance(
      ll_to_earth(user_lat, user_lng),
      ll_to_earth(d.location_lat, d.location_lng)
    ) <= radius_km * 1000
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers

### Update Timestamp Trigger

Automatically update the `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON food_donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Row-Level Security (RLS)

Enable RLS for data protection (Supabase).

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can view available donations
CREATE POLICY "Anyone can view available donations" ON food_donations
  FOR SELECT USING (status = 'available');

-- Donors can create donations
CREATE POLICY "Donors can create donations" ON food_donations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- Donors can update their own donations
CREATE POLICY "Donors can update own donations" ON food_donations
  FOR UPDATE USING (auth.uid() = donor_id);
```

---

## Indexes Strategy

1. **Primary Keys**: Automatic B-tree index
2. **Foreign Keys**: Index for join performance
3. **Geospatial**: GIST index for location-based queries
4. **Full-text Search**: GIN index for search functionality
5. **Status Fields**: For filtering queries
6. **Timestamp Fields**: For sorting by date
7. **Unique Constraints**: Prevent duplicates

---

## Backup and Maintenance

### Daily Tasks
- Automated backups
- Delete expired donations (status = 'expired' and expiry_date < NOW() - INTERVAL '7 days')
- Delete old notifications (is_read = true and created_at < NOW() - INTERVAL '30 days')
- Delete expired sessions (expires_at < NOW())

### Weekly Tasks
- Analyze query performance
- Optimize slow queries
- Check database size and growth

### Monthly Tasks
- Full database backup
- Archive old completed donations
- Review and optimize indexes

---

## Migration Strategy

### Initial Setup
1. Create database
2. Enable required extensions (PostGIS, pgcrypto)
3. Create tables in order (users first, then dependent tables)
4. Create indexes
5. Create views and functions
6. Set up row-level security
7. Seed initial data

### Version Control
Use a migration tool like:
- Prisma
- TypeORM
- Knex.js
- Flyway
- Liquibase

---

## Alternative: MongoDB Schema

For NoSQL implementation:

```javascript
// users collection
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String (enum),
  phone: String,
  avatar: String,
  location: {
    type: "Point",
    coordinates: [lng, lat]
  },
  address: String,
  createdAt: Date,
  updatedAt: Date
}

// food_donations collection
{
  _id: ObjectId,
  donorId: ObjectId (ref: users),
  title: String,
  description: String,
  foodType: String (enum),
  quantity: Number,
  unit: String,
  location: {
    type: "Point",
    coordinates: [lng, lat]
  },
  address: String,
  pickupTime: {
    start: Date,
    end: Date
  },
  expiryDate: Date,
  status: String (enum),
  imageUrl: String,
  claimedBy: ObjectId (ref: users),
  volunteerId: ObjectId (ref: users),
  createdAt: Date,
  updatedAt: Date
}

// Create geospatial index
db.food_donations.createIndex({ location: "2dsphere" })

// Query nearby donations
db.food_donations.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      $maxDistance: 10000 // 10km in meters
    }
  },
  status: "available"
})
```
