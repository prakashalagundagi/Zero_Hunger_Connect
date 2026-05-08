# DETAILED DESCRIPTION OF MODELS
## Zero Hunger Connect - Comprehensive Model Analysis

**Version:** 1.0  
**Date:** April 29, 2026

---

## TABLE OF CONTENTS
1. Data Model Detailed Description
2. Process Model Detailed Description
3. State Model Detailed Description
4. Interface Model Detailed Description

---

## 1. DATA MODEL DETAILED DESCRIPTION

### 1.1 USER Entity Model

#### Entity Purpose
The USER entity represents all participants in the Zero Hunger Connect platform, encompassing donors, receivers, volunteers, and NGOs.

#### Attributes Description

| Attribute | Data Type | Size | Constraints | Business Rules |
|-----------|-----------|------|-------------|----------------|
| id | VARCHAR | 36 | PRIMARY KEY, NOT NULL, UNIQUE | UUID format, auto-generated |
| name | VARCHAR | 100 | NOT NULL | Minimum 2 characters, maximum 100 |
| email | VARCHAR | 255 | NOT NULL, UNIQUE | Valid email format, case-insensitive |
| password_hash | VARCHAR | 255 | NOT NULL | Hashed using bcrypt (cost factor 12) |
| role | ENUM | - | NOT NULL | Values: 'donor', 'receiver', 'volunteer', 'ngo' |
| phone | VARCHAR | 20 | NOT NULL | E.164 format recommended |
| location_lat | DECIMAL | (10,8) | NOT NULL | Range: -90 to 90 |
| location_lng | DECIMAL | (11,8) | NOT NULL | Range: -180 to 180 |
| address | TEXT | - | NOT NULL | Full street address |
| avatar | VARCHAR | 500 | NULL | URL to profile image |
| created_at | TIMESTAMP | - | NOT NULL, DEFAULT CURRENT_TIMESTAMP | UTC timezone |

#### Relationships
- **One-to-Many** with DONATION (as donor)
- **One-to-Many** with FOOD_REQUEST (as requester)
- **One-to-Many** with DELIVERY (as volunteer, donor, or receiver)
- **One-to-Many** with NOTIFICATION
- **One-to-One** with IMPACT_STATS

#### Business Logic
1. **Email Uniqueness**: Prevents duplicate accounts
2. **Role-Based Access**: Determines available features
3. **Location Requirement**: Essential for proximity matching
4. **Password Security**: Minimum 8 characters, mix of uppercase, lowercase, numbers

#### Example Data
```json
{
  "id": "user-1714390234567",
  "name": "Green Valley Restaurant",
  "email": "contact@greenvalley.com",
  "password_hash": "$2b$12$...",
  "role": "donor",
  "phone": "+1-555-0123",
  "location_lat": 40.7589,
  "location_lng": -73.9851,
  "address": "123 Broadway, New York, NY 10001",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=greenvalley",
  "created_at": "2026-04-15T10:30:00Z"
}
```

---

### 1.2 DONATION Entity Model

#### Entity Purpose
Represents food items available for donation, including details about type, quantity, location, and availability status.

#### Attributes Description

| Attribute | Data Type | Size | Constraints | Business Rules |
|-----------|-----------|------|-------------|----------------|
| id | VARCHAR | 36 | PRIMARY KEY, NOT NULL | UUID format |
| donor_id | VARCHAR | 36 | FOREIGN KEY → USER.id, NOT NULL | Must reference valid donor |
| food_type | VARCHAR | 200 | NOT NULL | Descriptive name |
| category | ENUM | - | NOT NULL | 'prepared', 'fresh', 'packaged', 'bakery', 'dairy' |
| quantity | INTEGER | - | NOT NULL, CHECK (quantity > 0) | Positive integer |
| unit | VARCHAR | 20 | NOT NULL | 'servings', 'kg', 'items', 'liters' |
| expiry_date | TIMESTAMP | - | NOT NULL, CHECK (expiry_date > NOW()) | Future date |
| pickup_lat | DECIMAL | (10,8) | NOT NULL | Latitude of pickup location |
| pickup_lng | DECIMAL | (11,8) | NOT NULL | Longitude of pickup location |
| pickup_address | TEXT | - | NOT NULL | Full pickup address |
| description | TEXT | - | NULL | Additional information |
| images | JSON | - | NULL | Array of image URLs |
| status | ENUM | - | NOT NULL, DEFAULT 'available' | 'available', 'claimed', 'completed', 'expired', 'cancelled' |
| created_at | TIMESTAMP | - | NOT NULL, DEFAULT NOW() | Creation timestamp |

#### Calculated Fields
- **distance_km**: Calculated based on user's current location
- **time_until_expiry**: Hours remaining until expiry
- **freshness_indicator**: Color code based on expiry proximity

#### Status Transitions
```
available → claimed → completed
available → expired
available → cancelled
claimed → available (unclaim)
```

#### Business Rules
1. **Expiry Validation**: Must be future date, triggers automatic status update
2. **Location Accuracy**: Coordinates must match address
3. **Image Upload**: Maximum 5 images, each ≤ 5MB
4. **Auto-Expiry**: Cron job marks as 'expired' when expiry_date passes
5. **Proximity Matching**: Automatically notifies receivers within 10km radius

#### Example Data
```json
{
  "id": "donation-1714390567890",
  "donor_id": "user-1714390234567",
  "food_type": "Fresh Vegetable Curry",
  "category": "prepared",
  "quantity": 20,
  "unit": "servings",
  "expiry_date": "2026-04-30T18:00:00Z",
  "pickup_lat": 40.7589,
  "pickup_lng": -73.9851,
  "pickup_address": "123 Broadway, New York, NY 10001",
  "description": "Mild spice level, vegetarian, contains nuts",
  "images": [
    "https://storage.example.com/donations/img1.jpg",
    "https://storage.example.com/donations/img2.jpg"
  ],
  "status": "available",
  "created_at": "2026-04-29T14:30:00Z"
}
```

---

### 1.3 FOOD_REQUEST Entity Model

#### Entity Purpose
Represents requests from receivers seeking specific food items.

#### Attributes Description

| Attribute | Data Type | Size | Constraints | Business Rules |
|-----------|-----------|------|-------------|----------------|
| id | VARCHAR | 36 | PRIMARY KEY, NOT NULL | UUID format |
| requester_id | VARCHAR | 36 | FOREIGN KEY → USER.id, NOT NULL | Must be receiver or NGO |
| food_type | VARCHAR | 200 | NULL | Preferred food type |
| quantity | INTEGER | - | CHECK (quantity > 0) | Requested amount |
| urgency | ENUM | - | NOT NULL, DEFAULT 'normal' | 'urgent', 'normal', 'low' |
| dietary_restrictions | JSON | - | NULL | Array of restrictions |
| location_lat | DECIMAL | (10,8) | NOT NULL | Delivery location |
| location_lng | DECIMAL | (11,8) | NOT NULL | Delivery location |
| address | TEXT | - | NOT NULL | Full delivery address |
| status | ENUM | - | NOT NULL, DEFAULT 'open' | 'open', 'matched', 'fulfilled', 'cancelled' |
| notes | TEXT | - | NULL | Additional information |
| created_at | TIMESTAMP | - | NOT NULL | Request timestamp |
| fulfilled_at | TIMESTAMP | - | NULL | Completion timestamp |

#### Matching Algorithm
1. Calculate distance to all available donations
2. Filter by dietary restrictions
3. Prioritize by urgency level
4. Sort by proximity
5. Notify top 5 matching donors

#### Business Rules
1. **Urgency Levels**:
   - `urgent`: Notify immediately, highlight in red
   - `normal`: Standard processing
   - `low`: Batched notifications
2. **Auto-Close**: Mark as fulfilled when matched with donation
3. **Expiry**: Auto-cancel after 7 days if no match

---

### 1.4 DELIVERY Entity Model

#### Entity Purpose
Tracks the logistics of food transfer from donor to receiver, with optional volunteer coordination.

#### Attributes Description

| Attribute | Data Type | Size | Constraints | Business Rules |
|-----------|-----------|------|-------------|----------------|
| id | VARCHAR | 36 | PRIMARY KEY, NOT NULL | UUID format |
| donation_id | VARCHAR | 36 | FOREIGN KEY → DONATION.id, NULL | Related donation |
| request_id | VARCHAR | 36 | FOREIGN KEY → FOOD_REQUEST.id, NULL | Related request |
| volunteer_id | VARCHAR | 36 | FOREIGN KEY → USER.id, NULL | Assigned volunteer |
| donor_id | VARCHAR | 36 | FOREIGN KEY → USER.id, NOT NULL | Donor |
| receiver_id | VARCHAR | 36 | FOREIGN KEY → USER.id, NOT NULL | Receiver |
| pickup_location | TEXT | - | NOT NULL | Pickup address |
| delivery_location | TEXT | - | NOT NULL | Delivery address |
| status | ENUM | - | NOT NULL, DEFAULT 'pending' | See status flow below |
| notes | TEXT | - | NULL | Special instructions |
| pickup_time | TIMESTAMP | - | NULL | Actual pickup time |
| delivery_time | TIMESTAMP | - | NULL | Actual delivery time |
| created_at | TIMESTAMP | - | NOT NULL | Creation time |
| completed_at | TIMESTAMP | - | NULL | Completion time |

#### Status Flow
```
pending → assigned → in_transit → delivered → completed
        ↓           ↓           ↓
     cancelled   failed      failed
```

#### Status Descriptions
- **pending**: Awaiting volunteer assignment
- **assigned**: Volunteer accepted task
- **in_transit**: Food picked up, en route to receiver
- **delivered**: Food handed to receiver
- **completed**: Receiver confirmed receipt
- **failed**: Issue occurred (food spoiled, unavailable)
- **cancelled**: Cancelled by any party

#### Business Rules
1. **Timeout**: Auto-notify if pending > 30 minutes
2. **Location Tracking**: Update volunteer's current location every 30 seconds when in_transit
3. **Verification**: Require receiver confirmation for completion
4. **Impact Calculation**: Update metrics only when status = 'completed'

#### Performance Metrics
- **Average Delivery Time**: pickup_time to delivery_time
- **Success Rate**: completed / (completed + failed + cancelled)
- **Volunteer Efficiency**: deliveries completed / deliveries assigned

---

### 1.5 NOTIFICATION Entity Model

#### Entity Purpose
Manages all system notifications to users for various events.

#### Attributes Description

| Attribute | Data Type | Size | Constraints | Business Rules |
|-----------|-----------|------|-------------|----------------|
| id | VARCHAR | 36 | PRIMARY KEY, NOT NULL | UUID format |
| user_id | VARCHAR | 36 | FOREIGN KEY → USER.id, NOT NULL | Recipient |
| type | ENUM | - | NOT NULL | Notification category |
| title | VARCHAR | 200 | NOT NULL | Short headline |
| message | TEXT | - | NOT NULL | Full message content |
| related_id | VARCHAR | 36 | NULL | ID of related entity |
| related_type | VARCHAR | 50 | NULL | Type of related entity |
| read | BOOLEAN | - | NOT NULL, DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | - | NOT NULL | Notification time |

#### Notification Types
1. **donation_nearby**: New donation within user's radius
2. **request_matched**: Request matched with donation
3. **delivery_assigned**: Delivery task assigned to volunteer
4. **status_update**: Delivery status changed
5. **expiry_warning**: Donation expiring soon (24h, 6h, 1h)
6. **impact_milestone**: User reached achievement

#### Business Rules
1. **Real-Time Delivery**: Use WebSocket for instant push
2. **Badge Count**: Calculate unread count for UI badge
3. **Retention**: Delete notifications older than 30 days if read
4. **Preference Filtering**: Respect user notification preferences

---

### 1.6 IMPACT_STATS Entity Model

#### Entity Purpose
Aggregated impact metrics for users and platform analytics.

#### Attributes Description

| Attribute | Data Type | Size | Constraints | Business Rules |
|-----------|-----------|------|-------------|----------------|
| id | VARCHAR | 36 | PRIMARY KEY, NOT NULL | UUID format |
| user_id | VARCHAR | 36 | FOREIGN KEY → USER.id, UNIQUE | One record per user |
| meals_saved | INTEGER | - | NOT NULL, DEFAULT 0 | Total meals donated/received |
| food_waste_reduced_kg | DECIMAL | (10,2) | NOT NULL, DEFAULT 0 | Total weight in kg |
| people_helped | INTEGER | - | NOT NULL, DEFAULT 0 | Unique receivers |
| co2_reduced_kg | DECIMAL | (10,2) | NOT NULL, DEFAULT 0 | Carbon footprint |
| deliveries_completed | INTEGER | - | NOT NULL, DEFAULT 0 | For volunteers |
| donations_made | INTEGER | - | NOT NULL, DEFAULT 0 | For donors |
| donations_received | INTEGER | - | NOT NULL, DEFAULT 0 | For receivers |
| updated_at | TIMESTAMP | - | NOT NULL | Last calculation |

#### Calculation Formulas
```javascript
// CO2 Reduction Calculation
co2_reduced_kg = food_waste_reduced_kg * 2.5

// Equivalent Trees Planted
trees_planted = (co2_reduced_kg / 1000) * 45

// Water Saved (liters)
water_saved_liters = food_waste_reduced_kg * 2.5

// Landfill Space Saved (cubic meters)
landfill_saved_m3 = food_waste_reduced_kg / 1000
```

#### Update Triggers
- After delivery marked as 'completed'
- Recalculated nightly for accuracy
- Real-time increment for user engagement

---

## 2. PROCESS MODEL DETAILED DESCRIPTION

### 2.1 Food Donation Process

#### Process Overview
The donation process encompasses the entire lifecycle from listing food to final delivery.

#### Detailed Steps

**Step 1: Donor Authentication**
- **Input**: Email, password
- **Process**: Validate credentials, check role = 'donor'
- **Output**: Authenticated session
- **Duration**: 0.5-1 second
- **Error Handling**: Invalid credentials → Display error, allow retry

**Step 2: Navigate to Donation Form**
- **Input**: Navigation click
- **Process**: Load donation page, initialize form
- **Output**: Empty form displayed
- **Duration**: < 300ms
- **Pre-fill**: Location from user profile

**Step 3: Fill Donation Details**
- **Input**: User enters food information
- **Fields**:
  - Food Type (required, text input)
  - Category (required, dropdown)
  - Quantity (required, number)
  - Unit (required, dropdown)
  - Expiry Date & Time (required, datetime picker)
  - Description (optional, textarea)
  - Photos (optional, file upload)
- **Validation**: Client-side real-time validation
- **Duration**: 2-5 minutes (user input time)

**Step 4: Location Selection**
- **Input**: GPS coordinates or manual address
- **Process**: 
  1. Request geolocation permission
  2. Get current coordinates
  3. Reverse geocode to address
  4. Allow manual override
- **Output**: pickup_lat, pickup_lng, pickup_address
- **Duration**: 2-3 seconds
- **Fallback**: Manual address entry if GPS denied

**Step 5: Photo Upload**
- **Input**: Image files (JPG, PNG, WEBP)
- **Process**:
  1. Validate file type and size
  2. Compress images (max 1920px width)
  3. Upload to cloud storage
  4. Generate URLs
- **Output**: Array of image URLs
- **Duration**: 5-10 seconds per image
- **Constraints**: Max 5 images, 5MB each

**Step 6: Form Submission**
- **Input**: Completed form data
- **Process**:
  1. Validate all required fields
  2. Check expiry date is future
  3. Sanitize input data
  4. Generate unique donation ID
- **Output**: Validation result
- **Duration**: < 100ms

**Step 7: Database Insertion**
- **Input**: Validated donation object
- **Process**:
  1. Create donation record
  2. Index by location (geospatial)
  3. Set status = 'available'
- **Output**: Created donation with ID
- **Duration**: 100-200ms
- **Transaction**: ACID compliant

**Step 8: Proximity Calculation**
- **Input**: Donation location
- **Process**:
  1. Query users with role = 'receiver'
  2. Calculate distance using Haversine formula
  3. Filter users within 10km radius
  4. Sort by distance
- **Output**: List of nearby receivers
- **Duration**: 500ms - 1 second
- **Algorithm**:
```javascript
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

**Step 9: Notification Dispatch**
- **Input**: List of nearby receivers
- **Process**:
  1. Create notification records
  2. Send push notifications (if enabled)
  3. Update badge counts
- **Output**: Notifications sent
- **Duration**: 1-2 seconds
- **Rate Limiting**: Max 100 notifications per donation

**Step 10: Confirmation Display**
- **Input**: Success response
- **Process**:
  1. Display success message
  2. Show donation details
  3. Redirect to dashboard
- **Output**: User feedback
- **Duration**: Immediate

#### Error Scenarios

| Error | Cause | Handling |
|-------|-------|----------|
| Validation Error | Invalid input | Display field-specific errors |
| Network Error | Connection lost | Retry with exponential backoff |
| Upload Error | File too large | Show size limit message |
| Database Error | Server issue | Log error, show generic message |
| Geolocation Error | Permission denied | Fallback to manual entry |

#### Performance Requirements
- **Total Process Time**: < 30 seconds (excluding user input)
- **Form Load**: < 500ms
- **Submission Response**: < 2 seconds
- **Notification Delivery**: < 3 seconds

---

### 2.2 Food Browsing and Claiming Process

#### Process Overview
Receivers discover and claim available food donations.

#### Detailed Steps

**Step 1: Access Browse Page**
- **Input**: Navigation action
- **Process**: Load browse interface with filters
- **Output**: Displayed UI
- **Duration**: < 500ms

**Step 2: Fetch Available Donations**
- **Input**: User location, active filters
- **Process**:
  1. Get user's current location
  2. Query donations with status = 'available'
  3. Filter by expiry_date > NOW()
  4. Calculate distances
  5. Apply user-selected filters
  6. Sort by distance or date
- **Output**: Paginated donation list
- **Duration**: 1-2 seconds
- **Pagination**: 20 items per page

**Step 3: Apply Filters**
- **Available Filters**:
  - Distance radius (1km, 5km, 10km, 20km, all)
  - Category (prepared, fresh, packaged, etc.)
  - Food type (text search)
  - Expiry (today, tomorrow, this week)
- **Process**: Re-query with filter parameters
- **Output**: Updated results
- **Duration**: < 1 second

**Step 4: View Donation Details**
- **Input**: Click on donation card
- **Process**:
  1. Fetch full donation data
  2. Load donor information
  3. Calculate route distance/time
  4. Display image gallery
- **Output**: Detail view modal
- **Duration**: 300-500ms

**Step 5: Claim Decision**
- **Input**: User clicks "Claim" button
- **Process**:
  1. Verify donation still available
  2. Check for concurrent claims
  3. Create claim transaction
- **Output**: Claim confirmation dialog
- **Duration**: < 200ms

**Step 6: Process Claim**
- **Input**: Confirmed claim action
- **Process**:
  1. Update donation status = 'claimed'
  2. Record receiver_id
  3. Create delivery record
  4. Lock donation (prevent double-claim)
- **Output**: Claim success
- **Duration**: 500ms - 1 second
- **Concurrency**: Optimistic locking prevents double-claims

**Step 7: Create Delivery Task**
- **Input**: Claim details
- **Process**:
  1. Generate delivery ID
  2. Set pickup and delivery locations
  3. Calculate estimated delivery time
  4. Set status = 'pending'
- **Output**: Delivery record created
- **Duration**: 200-300ms

**Step 8: Notify Stakeholders**
- **Recipients**:
  - Donor: "Your donation has been claimed!"
  - Receiver: "Claim successful! Delivery arranged."
  - Nearby Volunteers: "New delivery task available"
- **Process**: Create and dispatch notifications
- **Duration**: 1-2 seconds

#### Unclaim Scenario
- **Trigger**: Receiver cancels within 5 minutes
- **Process**:
  1. Update donation status = 'available'
  2. Cancel delivery record
  3. Re-notify receivers
- **Output**: Donation back in pool

---

### 2.3 Delivery Coordination Process

#### Process Overview
Volunteers facilitate food transfer from donors to receivers.

#### Volunteer Assignment

**Step 1: Task Creation**
- **Trigger**: Donation claimed, requires delivery
- **Process**: System creates delivery task
- **Output**: Task available in pool

**Step 2: Volunteer Notification**
- **Input**: New delivery task
- **Process**:
  1. Query volunteers within 5km of pickup location
  2. Filter by availability status
  3. Send notifications
- **Output**: Up to 10 volunteers notified
- **Duration**: 1-2 seconds

**Step 3: Volunteer Accepts**
- **Input**: Volunteer clicks "Accept"
- **Process**:
  1. Check task still available
  2. Assign volunteer_id
  3. Update status = 'assigned'
  4. Remove from available tasks
- **Output**: Assignment confirmed
- **Duration**: 300-500ms
- **Race Condition**: First accept wins

**Step 4: Pickup Coordination**
- **Input**: Assigned delivery
- **Process**:
  1. Display donor contact info
  2. Show navigation to pickup
  3. Provide estimated arrival time
- **Output**: Volunteer navigates to donor
- **Duration**: Variable (travel time)

**Step 5: Pickup Confirmation**
- **Input**: Volunteer arrives, receives food
- **Process**:
  1. Volunteer clicks "Picked Up"
  2. Record pickup_time
  3. Update status = 'in_transit'
  4. Start delivery timer
- **Output**: Status updated, notifications sent
- **Duration**: < 500ms

**Step 6: Delivery Navigation**
- **Input**: In-transit status
- **Process**:
  1. Display route to receiver
  2. Track volunteer location (every 30s)
  3. Update ETA
  4. Notify receiver of progress
- **Output**: Real-time tracking
- **Duration**: Variable (travel time)

**Step 7: Delivery Confirmation**
- **Input**: Food handed to receiver
- **Process**:
  1. Volunteer clicks "Delivered"
  2. Record delivery_time
  3. Update status = 'delivered'
  4. Request receiver confirmation
- **Output**: Pending receiver verification
- **Duration**: < 500ms

**Step 8: Receiver Verification**
- **Input**: Receiver confirms receipt
- **Process**:
  1. Receiver clicks "Confirm Receipt"
  2. Optional: Rate delivery experience
  3. Update status = 'completed'
  4. Record completed_at timestamp
- **Output**: Delivery completed
- **Duration**: < 500ms

**Step 9: Impact Calculation**
- **Input**: Completed delivery
- **Process**:
  1. Update donor's IMPACT_STATS
  2. Update receiver's IMPACT_STATS
  3. Update volunteer's IMPACT_STATS
  4. Update platform metrics
- **Calculations**:
  - meals_saved += quantity
  - food_waste_reduced_kg += estimated weight
  - co2_reduced_kg += weight * 2.5
  - people_helped += 1 (if new receiver)
- **Output**: Updated statistics
- **Duration**: 200-300ms

#### Failure Scenarios

**Scenario 1: No Volunteer Available**
- **Trigger**: No acceptance within 30 minutes
- **Response**:
  1. Notify donor of delay
  2. Expand search radius to 10km
  3. Re-notify volunteers
  4. Offer direct pickup option to receiver

**Scenario 2: Volunteer Cancels**
- **Trigger**: Volunteer backs out after accepting
- **Response**:
  1. Reset status = 'pending'
  2. Remove volunteer assignment
  3. Re-notify other volunteers
  4. Flag volunteer for reliability tracking

**Scenario 3: Food Unavailable at Pickup**
- **Trigger**: Donor reports food no longer available
- **Response**:
  1. Update status = 'failed'
  2. Notify receiver and volunteer
  3. Cancel delivery
  4. Remove donation from listings

**Scenario 4: Receiver Unavailable**
- **Trigger**: Cannot deliver to receiver
- **Response**:
  1. Volunteer contacts receiver
  2. Attempt to reschedule
  3. If no response within 10 min, mark 'failed'
  4. Food returned to donor or disposed

---

## 3. STATE MODEL DETAILED DESCRIPTION

### 3.1 Donation Lifecycle States

#### State Definitions

**DRAFT (Optional State)**
- **Description**: Donation being created but not yet submitted
- **Entry**: User clicks "Create Donation"
- **Exit**: User submits form or abandons
- **Duration**: Typically 2-5 minutes
- **Actions**: Form validation, auto-save to localStorage
- **Data Persistence**: Temporary local storage only

**AVAILABLE**
- **Description**: Donation is active and claimable
- **Entry**: Form submitted and validated
- **Exit**: Claimed, expired, or cancelled
- **Duration**: Until expiry or claim (hours to days)
- **Actions**:
  - Visible in browse listings
  - Included in map markers
  - Generates notifications
- **Background Jobs**:
  - Expiry check (every 15 minutes)
  - Freshness indicator update

**CLAIMED**
- **Description**: Receiver has claimed the donation
- **Entry**: Receiver clicks "Claim"
- **Exit**: Completed, unclaimed, or cancelled
- **Duration**: Until delivery completion (hours)
- **Actions**:
  - Hidden from browse listings
  - Delivery task created
  - Notifications to donor and receiver
- **Grace Period**: 5 minutes for unclaim

**IN_DELIVERY** (Sub-state of CLAIMED)
- **Description**: Food is being transported
- **Entry**: Volunteer picks up food
- **Exit**: Delivered or failed
- **Duration**: Travel time (typically < 2 hours)
- **Actions**:
  - Real-time location tracking
  - ETA updates
  - Status notifications

**COMPLETED**
- **Description**: Delivery verified and finished
- **Entry**: Receiver confirms receipt
- **Exit**: None (terminal state)
- **Duration**: Permanent
- **Actions**:
  - Impact metrics updated
  - Archived in history
  - Removed from active queries
- **Data Retention**: Kept for analytics, historical reference

**EXPIRED**
- **Description**: Past expiry date without claim
- **Entry**: System cron job detects expiry
- **Exit**: None (terminal state)
- **Duration**: Permanent
- **Actions**:
  - Removed from listings
  - Donor notified
  - Marked for cleanup
- **Cleanup**: Soft delete after 7 days

**CANCELLED**
- **Description**: Donor removed donation before claim
- **Entry**: Donor clicks "Cancel"
- **Exit**: None (terminal state)
- **Duration**: Permanent
- **Actions**:
  - Immediate removal from listings
  - Notifications cancelled
- **Impact**: No metrics updated

#### State Transition Rules

| From State | To State | Trigger | Validation | Side Effects |
|------------|----------|---------|------------|--------------|
| DRAFT | AVAILABLE | Submit form | All required fields | Create record, notify |
| AVAILABLE | CLAIMED | User claim | Still available | Lock donation, create delivery |
| AVAILABLE | EXPIRED | Expiry time passed | System check | Notify donor |
| AVAILABLE | CANCELLED | Donor cancels | No claims | Remove listings |
| CLAIMED | AVAILABLE | Unclaim within 5min | Grace period | Cancel delivery |
| CLAIMED | COMPLETED | Receiver confirms | Delivery occurred | Update metrics |
| CLAIMED | CANCELLED | Any party cancels | Valid reason | Notify parties |
| IN_DELIVERY | COMPLETED | Delivered + confirmed | Both confirmations | Finalize delivery |
| IN_DELIVERY | FAILED | Issue reported | Reason provided | Cleanup, notify |

---

### 3.2 Delivery State Machine

#### Detailed State Descriptions

**PENDING**
- **Description**: Awaiting volunteer assignment
- **Entry Conditions**:
  - Donation claimed
  - Delivery required (not self-pickup)
- **Exit Conditions**:
  - Volunteer accepts
  - Timeout (30 minutes)
  - Cancellation
- **System Behavior**:
  - Notify nearby volunteers (0-5km)
  - Display in "Available Deliveries" list
  - Auto-escalate if no response
- **Timeout Handling**:
  - After 15 min: Expand radius to 10km
  - After 30 min: Notify donor of delay, offer alternatives

**ASSIGNED**
- **Description**: Volunteer accepted, preparing to pick up
- **Entry**: Volunteer clicks "Accept Task"
- **Exit**: Pickup confirmed or volunteer cancels
- **Duration**: Typically 15-30 minutes
- **System Behavior**:
  - Display donor contact info to volunteer
  - Display volunteer info to donor
  - Show navigation route
  - Enable messaging between parties
- **Monitoring**:
  - Track volunteer's movement toward pickup
  - Alert if volunteer stationary for > 10 minutes

**IN_TRANSIT**
- **Description**: Food picked up, en route to receiver
- **Entry**: Volunteer confirms pickup
- **Exit**: Delivery confirmed or failed
- **Duration**: Based on route (typically 10-45 minutes)
- **System Behavior**:
  - Track volunteer location (GPS updates every 30s)
  - Calculate and update ETA
  - Notify receiver when volunteer is 5 minutes away
  - Display live map to all parties
- **Monitoring**:
  - Alert if route significantly deviates
  - Alert if delivery takes > 2 hours

**DELIVERED**
- **Description**: Volunteer handed food to receiver, awaiting confirmation
- **Entry**: Volunteer clicks "Delivered"
- **Exit**: Receiver confirms or disputes
- **Duration**: Typically < 5 minutes
- **System Behavior**:
  - Send confirmation request to receiver
  - Optional: Request rating/feedback
  - Hold in "pending confirmation" state
- **Timeout**: Auto-confirm after 24 hours if no dispute

**COMPLETED**
- **Description**: Delivery fully confirmed and successful
- **Entry**: Receiver confirms receipt
- **Exit**: None (terminal state)
- **System Behavior**:
  - Update all impact metrics
  - Archive delivery record
  - Enable review/rating
  - Release volunteer for new tasks
- **Data Recorded**:
  - Total delivery time
  - Distance traveled
  - Ratings (if provided)

**FAILED**
- **Description**: Delivery could not be completed
- **Entry**: Any party reports issue
- **Exit**: None (terminal state)
- **Failure Reasons**:
  - Food spoiled during transport
  - Receiver unavailable/unreachable
  - Volunteer incident/emergency
  - Food not available at pickup
- **System Behavior**:
  - Collect failure reason
  - Notify all parties
  - Log incident for analytics
  - Optionally attempt reassignment

**CANCELLED**
- **Description**: Cancelled before completion
- **Entry**: Any party cancels
- **Exit**: None (terminal state)
- **Cancellation Rules**:
  - Donor can cancel before pickup
  - Receiver can cancel before delivery
  - Volunteer can cancel before pickup (penalty)
  - System cancels if timeout
- **System Behavior**:
  - Notify all parties with reason
  - Log cancellation
  - Update donation status appropriately
  - Release resources

#### State Metrics

| State | Average Duration | Success Rate | Monitoring Alerts |
|-------|------------------|--------------|-------------------|
| PENDING | 10-15 minutes | 85% assigned | > 30 min |
| ASSIGNED | 15-30 minutes | 90% pickup | > 45 min |
| IN_TRANSIT | 20-40 minutes | 95% delivered | > 120 min |
| DELIVERED | 2-5 minutes | 98% confirmed | > 24 hours |

---

## 4. INTERFACE MODEL DETAILED DESCRIPTION

### 4.1 User Interface Components

#### Component Hierarchy
```
App
├── AuthLayout
│   ├── LoginPage
│   └── RegisterPage
└── RootLayout
    ├── Header
    │   ├── Logo
    │   ├── NotificationBell
    │   └── UserMenu
    ├── Sidebar (Desktop)
    │   └── NavigationLinks
    ├── MobileNav
    │   └── NavigationLinks
    └── Pages
        ├── DashboardPage
        │   ├── WelcomeCard
        │   ├── QuickStats
        │   ├── RecentActivity
        │   └── ActionButtons
        ├── DonatePage
        │   ├── DonationForm
        │   │   ├── FoodTypeInput
        │   │   ├── CategorySelect
        │   │   ├── QuantityInput
        │   │   ├── ExpiryPicker
        │   │   ├── LocationPicker
        │   │   └── ImageUpload
        │   └── DonationPreview
        ├── BrowsePage
        │   ├── FilterPanel
        │   ├── DonationGrid
        │   │   └── DonationCard[]
        │   └── DetailModal
        ├── MapPage
        │   ├── InteractiveMap
        │   │   ├── MapMarker[]
        │   │   └── InfoPopup
        │   └── MapControls
        ├── DeliveriesPage
        │   ├── DeliveryList
        │   │   └── DeliveryCard[]
        │   └── DeliveryDetail
        ├── ImpactPage
        │   ├── MetricCards
        │   ├── TrendCharts
        │   └── Milestones
        └── ProfilePage
            ├── ProfileInfo
            ├── EditForm
            └── ActivityHistory
```

#### Key Component Specifications

**DonationCard Component**
```typescript
interface DonationCardProps {
  donation: {
    id: string;
    foodType: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    distance: number;
    images: string[];
    donor: {
      name: string;
      avatar: string;
    };
  };
  onClaim: (donationId: string) => void;
  onViewDetails: (donationId: string) => void;
}

// Visual Elements:
// - Food image (fallback to category icon)
// - Food type and quantity
// - Expiry countdown with color coding
// - Distance indicator
// - Donor info with avatar
// - Claim button (role-dependent)
// - Detail view button
```

**InteractiveMap Component**
```typescript
interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
  onMarkerClick: (markerId: string) => void;
}

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  type: 'donation' | 'request' | 'ngo' | 'user';
  data: any;
}

// Features:
// - Leaflet-based interactive map
// - Custom marker icons by type
// - Marker clustering for performance
// - Click to show info popup
// - Current location tracking
// - Route visualization
```

### 4.2 API Interface Specifications

#### RESTful Endpoints

**Authentication Endpoints**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

**Donation Endpoints**
```
GET    /api/donations                  # List donations (with filters)
GET    /api/donations/:id              # Get single donation
POST   /api/donations                  # Create donation
PUT    /api/donations/:id              # Update donation
DELETE /api/donations/:id              # Delete donation
POST   /api/donations/:id/claim        # Claim donation
POST   /api/donations/:id/unclaim      # Unclaim donation
```

**Request Endpoints**
```
GET    /api/requests                   # List food requests
GET    /api/requests/:id               # Get single request
POST   /api/requests                   # Create request
PUT    /api/requests/:id               # Update request
DELETE /api/requests/:id               # Delete request
POST   /api/requests/:id/fulfill       # Mark as fulfilled
```

**Delivery Endpoints**
```
GET    /api/deliveries                 # List deliveries
GET    /api/deliveries/:id             # Get delivery details
POST   /api/deliveries/:id/accept      # Volunteer accepts
PUT    /api/deliveries/:id/status      # Update status
POST   /api/deliveries/:id/complete    # Mark complete
```

**User Endpoints**
```
GET    /api/users/me                   # Current user profile
PUT    /api/users/me                   # Update profile
GET    /api/users/me/impact            # User impact stats
GET    /api/users/me/history           # Activity history
```

**Notification Endpoints**
```
GET    /api/notifications              # List notifications
PUT    /api/notifications/:id/read     # Mark as read
PUT    /api/notifications/read-all     # Mark all read
DELETE /api/notifications/:id          # Delete notification
```

#### Example API Request/Response

**POST /api/donations**

Request:
```json
{
  "foodType": "Grilled Chicken Meal",
  "category": "prepared",
  "quantity": 50,
  "unit": "servings",
  "expiryDate": "2026-04-30T20:00:00Z",
  "pickupLocation": {
    "lat": 40.7589,
    "lng": -73.9851,
    "address": "123 Broadway, New York, NY 10001"
  },
  "description": "Freshly prepared, contains gluten",
  "images": [
    "https://storage.example.com/temp/img1.jpg"
  ]
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "donation-1714390890123",
    "donorId": "user-1714390234567",
    "foodType": "Grilled Chicken Meal",
    "category": "prepared",
    "quantity": 50,
    "unit": "servings",
    "expiryDate": "2026-04-30T20:00:00Z",
    "pickupLat": 40.7589,
    "pickupLng": -73.9851,
    "pickupAddress": "123 Broadway, New York, NY 10001",
    "description": "Freshly prepared, contains gluten",
    "images": [
      "https://storage.example.com/donations/img1.jpg"
    ],
    "status": "available",
    "createdAt": "2026-04-29T15:30:00Z"
  },
  "meta": {
    "notificationsSent": 12,
    "nearbyReceivers": 12
  }
}
```

---

**End of Detailed Description of Models**
