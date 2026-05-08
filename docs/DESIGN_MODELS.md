# DESIGN MODELS
## Zero Hunger Connect - System Design Models

**Version:** 1.0  
**Date:** April 29, 2026

---

## TABLE OF CONTENTS
1. Use Case Models
2. Data Models
3. Process Models
4. Component Models
5. Deployment Models
6. State Models

---

## 1. USE CASE MODELS

### 1.1 System-Level Use Case Diagram

```
                    Zero Hunger Connect System
    
    ┌─────────────────────────────────────────────────────────┐
    │                                                           │
    │         ┌──────────────────────────────────┐             │
    │         │   User Authentication            │             │
    │         │  - Register                      │             │
    │         │  - Login                         │◄────┐       │
    │         │  - Logout                        │     │       │
    │         └──────────────────────────────────┘     │       │
    │                                                   │       │
    │         ┌──────────────────────────────────┐     │       │
Donor ────────►  Donation Management             │     │       │
    │         │  - Create Donation               │     │       │
    │         │  - Update Donation               │     │  All  │
    │         │  - Delete Donation               │     │ Users │
    │         │  - View Donation History         │     │       │
    │         └──────────────────────────────────┘     │       │
    │                                                   │       │
    │         ┌──────────────────────────────────┐     │       │
Receiver ──────►  Browse & Request               │     │       │
    │         │  - Browse Available Food         │     │       │
    │         │  - Search by Location            │◄────┤       │
    │         │  - Create Food Request           │     │       │
    │         │  - Claim Donation                │     │       │
    │         └──────────────────────────────────┘     │       │
    │                                                   │       │
    │         ┌──────────────────────────────────┐     │       │
Volunteer ─────►  Delivery Management            │     │       │
    │         │  - Accept Delivery Task          │     │       │
    │         │  - Update Delivery Status        │     │       │
    │         │  - Complete Delivery             │◄────┤       │
    │         │  - View Delivery History         │     │       │
    │         └──────────────────────────────────┘     │       │
    │                                                   │       │
    │         ┌──────────────────────────────────┐     │       │
NGO ───────────►  Coordination                   │     │       │
    │         │  - Manage Bulk Donations         │     │       │
    │         │  - Coordinate Volunteers         │◄────┘       │
    │         │  - Generate Reports              │             │
    │         │  - Track Community Impact        │             │
    │         └──────────────────────────────────┘             │
    │                                                           │
    │         ┌──────────────────────────────────┐             │
    │         │   Mapping & Geolocation          │             │
All Users ────►  - View Food Map                 │             │
    │         │  - Find Nearby Food              │             │
    │         │  - Get Directions                │             │
    │         └──────────────────────────────────┘             │
    │                                                           │
    │         ┌──────────────────────────────────┐             │
    │         │   Impact Tracking                │             │
All Users ────►  - View Personal Impact          │             │
    │         │  - View Platform Impact          │             │
    │         │  - Access Analytics              │             │
    │         └──────────────────────────────────┘             │
    │                                                           │
    └─────────────────────────────────────────────────────────┘
```

### 1.2 Actor Descriptions

| Actor | Description | Primary Goals |
|-------|-------------|---------------|
| Donor | Individual/organization with surplus food | Donate food efficiently, reduce waste |
| Receiver | Individual/organization needing food | Find food nearby, receive donations |
| Volunteer | Person facilitating deliveries | Help community, coordinate transport |
| NGO | Organization managing distributions | Coordinate large-scale operations |

### 1.3 Detailed Use Cases

#### UC-1: Create Donation (Donor)
**Primary Actor**: Donor  
**Preconditions**: User is logged in as Donor  
**Postconditions**: Donation is posted and visible to receivers

**Main Flow**:
1. Donor navigates to "Donate" page
2. System displays donation form
3. Donor enters food details (type, quantity, expiry, location)
4. Donor optionally uploads photos
5. Donor submits form
6. System validates input
7. System creates donation record
8. System notifies nearby receivers
9. System displays success message

**Alternative Flows**:
- 6a. Validation fails → Display errors, return to step 3
- 8a. No receivers nearby → Skip notification

#### UC-2: Browse Available Food (Receiver)
**Primary Actor**: Receiver  
**Preconditions**: User is logged in as Receiver  
**Postconditions**: User views available donations

**Main Flow**:
1. Receiver navigates to "Browse" page
2. System fetches nearby donations
3. System displays donation cards
4. Receiver applies filters (distance, type)
5. System updates results
6. Receiver selects donation to view details
7. System displays full donation information

**Alternative Flows**:
- 2a. No donations nearby → Display empty state
- 4a. No results match filters → Display no results message

#### UC-3: Accept Delivery Task (Volunteer)
**Primary Actor**: Volunteer  
**Preconditions**: User is logged in as Volunteer, delivery tasks exist  
**Postconditions**: Delivery is assigned to volunteer

**Main Flow**:
1. Volunteer navigates to "Deliveries" page
2. System displays available tasks
3. Volunteer selects task
4. System shows task details (pickup, delivery locations)
5. Volunteer clicks "Accept Task"
6. System confirms acceptance
7. System assigns task to volunteer
8. System notifies donor and receiver

**Alternative Flows**:
- 5a. Task already assigned → Display error message

---

## 2. DATA MODELS

### 2.1 Entity-Relationship Diagram

```
┌─────────────────────┐
│       USER          │
├─────────────────────┤
│ PK id              │
│    name            │
│    email           │◄─────┐
│    password_hash   │      │
│    role            │      │
│    phone           │      │
│    location_lat    │      │
│    location_lng    │      │
│    address         │      │
│    avatar          │      │
│    created_at      │      │
└─────────────────────┘      │
         │                    │
         │ 1                  │ created_by
         │                    │
         │ *                  │
┌─────────────────────┐      │
│    DONATION         │      │
├─────────────────────┤      │
│ PK id              │      │
│ FK donor_id        │──────┘
│    food_type       │
│    category        │      ┌─────────────────────┐
│    quantity        │      │    FOOD_REQUEST     │
│    unit            │      ├─────────────────────┤
│    expiry_date     │      │ PK id              │
│    pickup_lat      │      │ FK requester_id    │───┐
│    pickup_lng      │      │    food_type       │   │
│    pickup_address  │      │    quantity        │   │
│    description     │      │    urgency         │   │
│    images[]        │      │    location_lat    │   │
│    status          │      │    location_lng    │   │
│    created_at      │      │    status          │   │
└─────────────────────┘      │    created_at      │   │
         │                    └─────────────────────┘   │
         │ donated_item            │                    │
         │                         │ requested_by       │
         │ 1                       │ 1                  │
         │                         │                    │
         │ *                       │ *                  │
┌─────────────────────┐           │                    │
│    DELIVERY         │           │                    │
├─────────────────────┤           │                    │
│ PK id              │           │                    │
│ FK donation_id     │───────────┘                    │
│ FK request_id      │────────────────────────────────┘
│ FK volunteer_id    │──────┐
│ FK donor_id        │      │
│ FK receiver_id     │      │
│    pickup_location │      │
│    delivery_location│     │
│    status          │      │
│    pickup_time     │      │
│    delivery_time   │      │
│    created_at      │      │
│    completed_at    │      │
└─────────────────────┘      │
                             │
         ┌───────────────────┘
         │ volunteer
         │ 1
         │
┌─────────────────────┐
│   NOTIFICATION      │
├─────────────────────┤
│ PK id              │
│ FK user_id         │
│    type            │
│    title           │
│    message         │
│    related_id      │
│    read            │
│    created_at      │
└─────────────────────┘

┌─────────────────────┐
│   IMPACT_STATS      │
├─────────────────────┤
│ PK id              │
│ FK user_id         │
│    meals_saved     │
│    food_waste_kg   │
│    people_helped   │
│    co2_reduced     │
│    deliveries      │
│    updated_at      │
└─────────────────────┘
```

### 2.2 Data Dictionary

#### USER Entity
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | String | PK, NOT NULL, UNIQUE | Unique user identifier |
| name | String | NOT NULL | User's full name |
| email | String | NOT NULL, UNIQUE | User's email address |
| password_hash | String | NOT NULL | Encrypted password |
| role | Enum | NOT NULL | donor, receiver, volunteer, ngo |
| phone | String | NOT NULL | Contact number |
| location_lat | Float | NOT NULL | Latitude coordinate |
| location_lng | Float | NOT NULL | Longitude coordinate |
| address | String | NOT NULL | Full address |
| avatar | String | NULL | Profile image URL |
| created_at | DateTime | NOT NULL | Account creation timestamp |

#### DONATION Entity
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | String | PK, NOT NULL, UNIQUE | Unique donation identifier |
| donor_id | String | FK → USER.id, NOT NULL | Reference to donor |
| food_type | String | NOT NULL | Type of food |
| category | Enum | NOT NULL | prepared, fresh, packaged, bakery, dairy |
| quantity | Number | NOT NULL, > 0 | Amount of food |
| unit | String | NOT NULL | servings, kg, items |
| expiry_date | DateTime | NOT NULL | Food expiration date |
| pickup_lat | Float | NOT NULL | Pickup latitude |
| pickup_lng | Float | NOT NULL | Pickup longitude |
| pickup_address | String | NOT NULL | Pickup location |
| description | String | NULL | Additional details |
| images | Array | NULL | Photo URLs |
| status | Enum | NOT NULL | available, claimed, completed, expired |
| created_at | DateTime | NOT NULL | Creation timestamp |

#### DELIVERY Entity
| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | String | PK, NOT NULL, UNIQUE | Unique delivery identifier |
| donation_id | String | FK → DONATION.id, NULL | Related donation |
| request_id | String | FK → FOOD_REQUEST.id, NULL | Related request |
| volunteer_id | String | FK → USER.id, NULL | Assigned volunteer |
| donor_id | String | FK → USER.id, NOT NULL | Donor |
| receiver_id | String | FK → USER.id, NOT NULL | Receiver |
| pickup_location | String | NOT NULL | Pickup address |
| delivery_location | String | NOT NULL | Delivery address |
| status | Enum | NOT NULL | pending, assigned, in-transit, delivered, completed, failed |
| pickup_time | DateTime | NULL | Actual pickup time |
| delivery_time | DateTime | NULL | Actual delivery time |
| created_at | DateTime | NOT NULL | Creation timestamp |
| completed_at | DateTime | NULL | Completion timestamp |

---

## 3. PROCESS MODELS

### 3.1 Activity Diagram: Donation Process

```
START
  │
  ▼
[Donor Logs In]
  │
  ▼
[Navigate to Donate Page]
  │
  ▼
[Fill Donation Form]
  │
  ├─► Food Type
  ├─► Quantity
  ├─► Expiry Date
  ├─► Location
  └─► Photos (Optional)
  │
  ▼
[Submit Form]
  │
  ▼
◇ Validation Successful?
  │
  ├─NO──► [Display Errors] ──┐
  │                            │
  │                            │
  YES                         │
  │◄──────────────────────────┘
  ▼
[Create Donation Record]
  │
  ▼
[Calculate Nearby Receivers] ←──[Geolocation Service]
  │
  ▼
[Send Notifications]
  │
  ├─► Receiver A
  ├─► Receiver B
  └─► Receiver C
  │
  ▼
[Display Success Message]
  │
  ▼
[Redirect to Dashboard]
  │
  ▼
END
```

### 3.2 Activity Diagram: Delivery Coordination

```
START: New Donation Created
  │
  ▼
◇ Receiver Nearby?
  │
  ├─NO──► [Wait for Request]
  │
  YES
  │
  ▼
[Receiver Claims Donation]
  │
  ▼
◇ Requires Delivery?
  │
  ├─NO──► [Direct Pickup] ──► [Mark Completed] ──► END
  │
  YES
  │
  ▼
[Create Delivery Task]
  │
  ▼
[Notify Available Volunteers]
  │
  ▼
◇ Volunteer Accepts?
  │
  ├─NO──► [Wait for Volunteer]
  │         │
  │         └─► [Timeout: 30min] ──► [Re-notify]
  │
  YES
  │
  ▼
[Assign Delivery to Volunteer]
  │
  ▼
[Update Status: ASSIGNED]
  │
  ▼
[Notify Donor & Receiver]
  │
  ▼
║ Parallel Execution ║
║                    ║
║ ┌────────────────────┐
║ │ Volunteer Process  │
║ │  - Pick up food    │
║ │  - Update status   │
║ │  - Navigate to     │
║ │    delivery        │
║ └────────────────────┘
║
║ ┌────────────────────┐
║ │ System Tracking    │
║ │  - Monitor status  │
║ │  - Send updates    │
║ │  - Track location  │
║ └────────────────────┘
║                    ║
║ End Parallel       ║
  │
  ▼
[Volunteer Confirms Delivery]
  │
  ▼
[Receiver Verifies Receipt]
  │
  ▼
[Update Impact Metrics]
  │
  ├─► Meals Saved +1
  ├─► Food Waste -Xkg
  ├─► CO₂ Reduced
  └─► People Helped +1
  │
  ▼
[Mark Delivery COMPLETED]
  │
  ▼
END
```

### 3.3 Sequence Diagram: Browse and Claim Food

```
Receiver    Frontend    Backend    Database    Notification
   │           │           │           │            │
   │──Login───►│           │           │            │
   │           │──Auth────►│           │            │
   │           │           │──Verify──►│            │
   │           │           │◄──OK─────┤            │
   │           │◄──Token──┤           │            │
   │           │           │           │            │
   │──Browse──►│           │           │            │
   │           │──GET─────►│           │            │
   │           │ /donations│           │            │
   │           │ +location │           │            │
   │           │           │──Query───►│            │
   │           │           │ nearby    │            │
   │           │           │ active    │            │
   │           │           │◄──Data───┤            │
   │           │           │           │            │
   │           │           │──Calculate│            │
   │           │           │ Distance  │            │
   │           │           │──Sort────►│            │
   │           │◄──List───┤           │            │
   │◄──Display┤           │           │            │
   │           │           │           │            │
   │──Select──►│           │           │            │
   │ Donation  │           │           │            │
   │           │──GET─────►│           │            │
   │           │ /donations│           │            │
   │           │ /{id}     │           │            │
   │           │           │──Fetch───►│            │
   │           │           │◄──Details┤            │
   │           │◄──Data───┤           │            │
   │◄──Show───┤           │           │            │
   │  Details  │           │           │            │
   │           │           │           │            │
   │──Claim───►│           │           │            │
   │           │──POST────►│           │            │
   │           │ /claim    │           │            │
   │           │           │──Check───►│            │
   │           │           │ Available │            │
   │           │           │◄──OK─────┤            │
   │           │           │──Update──►│            │
   │           │           │ Status    │            │
   │           │           │ =claimed  │            │
   │           │           │◄──Done───┤            │
   │           │           │           │            │
   │           │           │──Create──►│            │
   │           │           │ Delivery  │            │
   │           │           │◄──ID─────┤            │
   │           │           │           │            │
   │           │           │───────────┼──Notify──►│
   │           │           │           │  Donor     │
   │           │           │           │  Volunteer │
   │           │◄──Success┤           │            │
   │◄──Confirm┤           │           │            │
   │           │           │           │            │
```

---

## 4. COMPONENT MODELS

### 4.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Mobile Web   │  │ Tablet Web   │  │ Desktop Web  │     │
│  │  Browser     │  │  Browser     │  │  Browser     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                           ▼                                 │
│              ┌─────────────────────────┐                    │
│              │   React Application     │                    │
│              │   (Single Page App)     │                    │
│              └─────────────────────────┘                    │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Pages    │  │ Components │  │   Routes   │            │
│  │            │  │            │  │            │            │
│  │ - Login    │  │ - Header   │  │ - Auth     │            │
│  │ - Dashboard│  │ - Sidebar  │  │ - Protected│            │
│  │ - Donate   │  │ - Cards    │  │ - Public   │            │
│  │ - Browse   │  │ - Forms    │  │            │            │
│  │ - Map      │  │ - Buttons  │  │            │            │
│  │ - Profile  │  │ - Modals   │  │            │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  State Management│  │  Utility Services│                │
│  │                  │  │                  │                │
│  │ - User Context   │  │ - Auth Utils     │                │
│  │ - App State      │  │ - Validation     │                │
│  │ - Local Storage  │  │ - Formatting     │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Domain Logic    │  │  API Clients     │                │
│  │                  │  │                  │                │
│  │ - Donation Logic │  │ - HTTP Client    │                │
│  │ - Delivery Logic │  │ - WebSocket      │                │
│  │ - Impact Calc    │  │ - Mock API       │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Local Storage   │  │  Mock Data       │                │
│  │                  │  │                  │                │
│  │ - User Session   │  │ - Users          │                │
│  │ - Preferences    │  │ - Donations      │                │
│  │ - Cache          │  │ - Deliveries     │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  External APIs   │  │  Third-Party     │                │
│  │                  │  │                  │                │
│  │ - Geolocation    │  │ - Leaflet Maps   │                │
│  │ - Maps           │  │ - Image CDN      │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Component Dependency Diagram

```
┌─────────────┐
│     App     │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌─────────────┐                  ┌─────────────┐
│   Router    │                  │   Toaster   │
└──────┬──────┘                  └─────────────┘
       │
       ├──────────┬────────────┬─────────────┐
       │          │            │             │
       ▼          ▼            ▼             ▼
┌───────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐
│ AuthLayout│ │RootLayout│ │Protected│ │Navigate │
└─────┬─────┘ └────┬─────┘ │ Route   │ └─────────┘
      │            │        └─────────┘
      │            │
      ▼            ▼
┌─────────┐  ┌──────────────────────────────────┐
│  Login  │  │          Pages                   │
│ Register│  │  - Dashboard                     │
└─────────┘  │  - Donate                        │
             │  - Browse                        │
             │  - Map                           │
             │  - Deliveries                    │
             │  - Profile                       │
             │  - Impact                        │
             └──────────┬───────────────────────┘
                        │
                        ├────────────────┬────────────┐
                        │                │            │
                        ▼                ▼            ▼
                   ┌─────────┐     ┌─────────┐  ┌─────────┐
                   │  Cards  │     │  Forms  │  │  Maps   │
                   └────┬────┘     └────┬────┘  └────┬────┘
                        │               │            │
                        └───────┬───────┴────────────┘
                                │
                                ▼
                        ┌──────────────┐
                        │ UI Components│
                        │ - Button     │
                        │ - Input      │
                        │ - Badge      │
                        │ - Dialog     │
                        └──────┬───────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  Utilities  │
                        │ - cn()      │
                        │ - utils     │
                        └─────────────┘
```

---

## 5. DEPLOYMENT MODELS

### 5.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER DEVICES                             │
│                                                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │  Mobile   │  │  Tablet   │  │  Desktop  │               │
│  │  Phone    │  │           │  │           │               │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │
│        │              │              │                      │
└────────┼──────────────┼──────────────┼──────────────────────┘
         │              │              │
         └──────────────┴──────────────┘
                        │
                    HTTPS/WSS
                        │
         ┌──────────────▼──────────────┐
         │     CDN / Edge Network      │
         │  (CloudFlare, Vercel, etc)  │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │      Load Balancer          │
         └──────────────┬──────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐          ┌─────────────────┐
│  Web Server 1   │          │  Web Server 2   │
│  (Node.js)      │          │  (Node.js)      │
│                 │          │                 │
│  - Static Assets│          │  - Static Assets│
│  - React App    │          │  - React App    │
│  - API Proxy    │          │  - API Proxy    │
└────────┬────────┘          └────────┬────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │      API Gateway            │
         │  (Express/Fastify)          │
         └──────────────┬──────────────┘
                        │
         ┌──────────────┴──────────────┬──────────────┐
         │                             │              │
         ▼                             ▼              ▼
┌─────────────────┐          ┌──────────────┐ ┌──────────────┐
│   Application   │          │   Cache      │ │   Queue      │
│   Servers       │          │   (Redis)    │ │   (RabbitMQ) │
│                 │          │              │ │              │
│ - Auth Service  │          │ - Sessions   │ │ - Async Jobs │
│ - Donation API  │          │ - Data Cache │ │ - Emails     │
│ - Delivery API  │          │              │ │ - Notifs     │
│ - Map Service   │          │              │ │              │
└────────┬────────┘          └──────────────┘ └──────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Primary    │  │   Replica    │  │   Backup     │      │
│  │   Database   │──│   Database   │  │   Storage    │      │
│  │  (PostgreSQL)│  │  (Read-Only) │  │   (S3/Blob)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                EXTERNAL SERVICES                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Maps API   │  │   Email      │  │  Analytics   │      │
│  │  (MapBox)    │  │  (SendGrid)  │  │  (GA, Posthog)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Routing | React Router 7 | Client-side routing |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| UI Components | Radix UI | Accessible components |
| Maps | Leaflet | Interactive maps |
| Charts | Recharts | Data visualization |
| State | React Context | Global state |
| Storage | LocalStorage | Client-side persistence |
| Build | Vite | Build tool |
| Package Manager | pnpm | Dependency management |

---

## 6. STATE MODELS

### 6.1 Donation State Machine

```
              ┌─────────────────┐
    START ───►│     DRAFT       │
              └────────┬────────┘
                       │
                  [Submit]
                       │
                       ▼
              ┌─────────────────┐
              │   AVAILABLE     │◄──────────┐
              └────────┬────────┘           │
                       │                [Unclaim]
                       │                    │
            ┌──────────┼──────────┐         │
            │          │          │         │
       [Expire]    [Claim]   [Cancel]      │
            │          │          │         │
            │          ▼          │         │
            │   ┌─────────────┐  │         │
            │   │   CLAIMED   │──┘         │
            │   └──────┬──────┘            │
            │          │                    │
            │     [Complete]               │
            │          │                    │
            ▼          ▼                    ▼
        ┌────────┐ ┌────────┐       ┌──────────┐
        │EXPIRED │ │COMPLETE│       │ CANCELLED│
        └────────┘ └────────┘       └──────────┘
            │          │                  │
            └──────────┴──────────────────┘
                       │
                       ▼
                     END
```

### 6.2 Delivery State Machine

```
              ┌─────────────────┐
    START ───►│    PENDING      │
              └────────┬────────┘
                       │
                  [Volunteer
                   Accepts]
                       │
                       ▼
              ┌─────────────────┐
              │    ASSIGNED     │
              └────────┬────────┘
                       │
                 [Volunteer
                  Picks Up]
                       │
                       ▼
              ┌─────────────────┐
              │   IN_TRANSIT    │
              └────────┬────────┘
                       │
            ┌──────────┼──────────┐
            │          │          │
       [Deliver]   [Issue]   [Cancel]
            │          │          │
            ▼          ▼          ▼
        ┌────────┐ ┌────────┐ ┌────────┐
        │DELIVERED│ │ FAILED │ │CANCELLED│
        └────┬───┘ └────┬───┘ └───┬────┘
             │          │         │
        [Receiver      │         │
         Confirms]     │         │
             │          │         │
             ▼          │         │
        ┌────────┐     │         │
        │COMPLETE│     │         │
        └────┬───┘     │         │
             │         │         │
             └─────────┴─────────┘
                      │
                      ▼
                    END
```

### 6.3 User Session State

```
┌────────────────┐
│  ANONYMOUS     │
└───────┬────────┘
        │
   [Navigate
    to Login]
        │
        ▼
┌────────────────┐
│  LOGGING_IN    │
└───────┬────────┘
        │
     [Submit
   Credentials]
        │
  ┌─────┴─────┐
  │           │
 FAIL       SUCCESS
  │           │
  │           ▼
  │   ┌────────────────┐
  │   │ AUTHENTICATED  │◄───────┐
  │   └───────┬────────┘        │
  │           │                 │
  │      [Activity]         [Refresh
  │           │              Token]
  │           ▼                 │
  │   ┌────────────────┐        │
  │   │     ACTIVE     │────────┘
  │   └───────┬────────┘
  │           │
  │      [Timeout /
  │       Logout]
  │           │
  └───────────┼───────────┐
              │           │
              ▼           ▼
      ┌────────────┐  ┌────────────┐
      │  EXPIRED   │  │ LOGGED_OUT │
      └──────┬─────┘  └──────┬─────┘
             │               │
             └───────┬───────┘
                     │
                     ▼
              ┌────────────┐
              │ ANONYMOUS  │
              └────────────┘
```

---

## 7. INTERACTION MODELS

### 7.1 User Journey Map: Donor Flow

```
1. DISCOVER → 2. REGISTER → 3. POST → 4. MATCH → 5. COORDINATE → 6. IMPACT

┌───────────────────────────────────────────────────────────────┐
│  1. DISCOVER                                                  │
│  User learns about platform                                   │
│  Touchpoints: Website, social media, word of mouth            │
│  Actions: Visit site, browse info                             │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  2. REGISTER                                                  │
│  Create account as donor                                      │
│  Touchpoints: Registration form                               │
│  Actions: Enter details, select "Donor" role                  │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  3. POST DONATION                                             │
│  List surplus food                                            │
│  Touchpoints: Donate page, form                               │
│  Actions: Upload photo, describe food, set expiry             │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  4. MATCH                                                     │
│  Receiver claims donation                                     │
│  Touchpoints: Notification, dashboard                         │
│  Actions: View match, confirm availability                    │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  5. COORDINATE                                                │
│  Arrange pickup/delivery                                      │
│  Touchpoints: Chat, phone, map                                │
│  Actions: Communicate with receiver/volunteer                 │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  6. VIEW IMPACT                                               │
│  See contribution metrics                                     │
│  Touchpoints: Impact dashboard                                │
│  Actions: Review stats, share achievements                    │
└───────────────────────────────────────────────────────────────┘
```

---

**End of Design Models Document**
