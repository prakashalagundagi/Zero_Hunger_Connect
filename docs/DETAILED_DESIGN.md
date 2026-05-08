# DETAILED DESIGN
## Zero Hunger Connect - Component and Algorithm Design

**Version:** 1.0  
**Date:** April 29, 2026

---

## TABLE OF CONTENTS
1. Component Detailed Design
2. Algorithm Design
3. Database Design Details
4. API Design
5. UI/UX Design Specifications

---

## 1. COMPONENT DETAILED DESIGN

### 1.1 Authentication Components

#### LoginPage Component

**Purpose**: Handles user authentication

**File**: `src/app/pages/LoginPage.tsx`

**Props**: None (Page component)

**State**:
```typescript
interface LoginState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
  isLoading: boolean;
}
```

**Methods**:
```typescript
handleEmailChange(e: ChangeEvent<HTMLInputElement>): void
handlePasswordChange(e: ChangeEvent<HTMLInputElement>): void
validateForm(): boolean
handleSubmit(e: FormEvent): Promise<void>
```

**Flow Diagram**:
```
User enters email/password
         │
         ▼
    Validates input
         │
    ◆ Valid?
    │
    ├─NO──► Display errors
    │
    YES
    │
    ▼
 Call auth.login()
    │
    ◆ Success?
    │
    ├─NO──► Show error message
    │
    YES
    │
    ▼
Store user in localStorage
    │
    ▼
Navigate to dashboard
```

**Validation Rules**:
- Email: Must be valid format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Password: Minimum 8 characters
- Both fields required

**Code Structure**:
```typescript
export function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = login(formData.email, formData.password);
      
      if (!user) {
        setErrors({ general: 'Invalid email or password' });
        return;
      }
      
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

### 1.2 Donation Components

#### DonationCard Component

**Purpose**: Displays individual donation in browse listings

**File**: `src/app/components/feature/DonationCard.tsx`

**Props**:
```typescript
interface DonationCardProps {
  donation: Donation;
  distance?: number;
  onClaim?: (donationId: string) => void;
  onViewDetails?: (donationId: string) => void;
  showActions?: boolean;
}
```

**Visual Design**:
```
┌─────────────────────────────────────────┐
│  ┌─────────────┐                        │
│  │             │   Fresh Vegetable Curry│
│  │    IMAGE    │   20 servings          │
│  │             │                        │
│  └─────────────┘   ⏰ Expires in 6 hours│
│                    📍 2.3 km away       │
│                                          │
│  🏢 Green Valley Restaurant             │
│                                          │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ View Details │  │  Claim Food     │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

**Computed Properties**:
```typescript
// Time until expiry (formatted)
const timeUntilExpiry = useMemo(() => {
  const now = new Date();
  const expiry = new Date(donation.expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins} minutes`;
  }
  if (diffHours < 24) {
    return `${diffHours} hours`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days`;
}, [donation.expiryDate]);

// Urgency color
const urgencyColor = useMemo(() => {
  const hoursRemaining = (new Date(donation.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursRemaining < 2) return 'red';
  if (hoursRemaining < 6) return 'orange';
  return 'green';
}, [donation.expiryDate]);
```

**Category Icons**:
```typescript
const categoryIcons = {
  prepared: '🍽️',
  fresh: '🥗',
  packaged: '📦',
  bakery: '🥖',
  dairy: '🥛'
};
```

---

### 1.3 Map Components

#### MapView Component

**Purpose**: Interactive map showing donations, requests, and users

**File**: `src/app/components/feature/MapView.tsx`

**Dependencies**:
- `react-leaflet`: Map rendering
- `leaflet`: Core map library

**Props**:
```typescript
interface MapViewProps {
  center: [number, number];  // [lat, lng]
  zoom: number;
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  height?: string;
}

interface MapMarker {
  id: string;
  position: [number, number];
  type: 'donation' | 'request' | 'ngo' | 'user';
  data: any;
  popup?: string;
}
```

**Marker Customization**:
```typescript
import L from 'leaflet';

const markerIcons = {
  donation: L.icon({
    iconUrl: '/icons/donation-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  request: L.icon({
    iconUrl: '/icons/request-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  ngo: L.icon({
    iconUrl: '/icons/ngo-marker.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),
  user: L.icon({
    iconUrl: '/icons/user-marker.png',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
};
```

**Component Structure**:
```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export function MapView({ center, zoom, markers, onMarkerClick }: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={markerIcons[marker.type]}
          eventHandlers={{
            click: () => onMarkerClick?.(marker)
          }}
        >
          {marker.popup && (
            <Popup>
              <div>{marker.popup}</div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
```

**Performance Optimization**:
```typescript
// Marker clustering for many markers
import MarkerClusterGroup from 'react-leaflet-cluster';

<MarkerClusterGroup>
  {markers.map(marker => (
    <Marker key={marker.id} {...marker} />
  ))}
</MarkerClusterGroup>
```

---

## 2. ALGORITHM DESIGN

### 2.1 Distance Calculation Algorithm

**Purpose**: Calculate distance between two geographic coordinates

**Algorithm**: Haversine Formula

**Formula**:
```
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2(√a, √(1−a))
d = R ⋅ c

where:
φ = latitude
λ = longitude
R = Earth's radius (6371 km)
Δφ = φ2 − φ1
Δλ = λ2 − λ1
```

**Implementation**:
```typescript
/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lon1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lon2 - Longitude of point 2 (degrees)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const toRad = (degrees: number) => degrees * (Math.PI / 180);
  
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}
```

**Complexity**: O(1) - constant time

**Test Cases**:
```typescript
// Test 1: Same location
expect(calculateDistance(40.7128, -74.0060, 40.7128, -74.0060)).toBe(0);

// Test 2: New York to Los Angeles (approx 3944 km)
expect(calculateDistance(40.7128, -74.0060, 34.0522, -118.2437)).toBeCloseTo(3944, 0);

// Test 3: Short distance (1 km)
expect(calculateDistance(40.7128, -74.0060, 40.7218, -74.0060)).toBeCloseTo(1, 1);
```

---

### 2.2 Donation Matching Algorithm

**Purpose**: Match receivers with nearby available donations

**Inputs**:
- Receiver location (lat, lng)
- Search radius (km)
- Dietary restrictions (optional)
- Food preferences (optional)

**Outputs**:
- Sorted list of matching donations

**Algorithm**:
```typescript
interface MatchCriteria {
  receiverLocation: { lat: number; lng: number };
  maxDistance: number; // km
  dietaryRestrictions?: string[];
  foodPreferences?: string[];
}

function matchDonations(
  donations: Donation[],
  criteria: MatchCriteria
): Donation[] {
  const { receiverLocation, maxDistance, dietaryRestrictions, foodPreferences } = criteria;
  
  // Step 1: Filter by availability and expiry
  const available = donations.filter(d => 
    d.status === 'available' &&
    new Date(d.expiryDate) > new Date()
  );
  
  // Step 2: Calculate distances and filter by radius
  const withDistance = available.map(donation => ({
    ...donation,
    distance: calculateDistance(
      receiverLocation.lat,
      receiverLocation.lng,
      donation.pickupLat,
      donation.pickupLng
    )
  })).filter(d => d.distance <= maxDistance);
  
  // Step 3: Apply dietary restrictions
  let filtered = withDistance;
  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    filtered = filtered.filter(d => 
      !dietaryRestrictions.some(restriction =>
        d.description?.toLowerCase().includes(restriction.toLowerCase())
      )
    );
  }
  
  // Step 4: Sort by multiple criteria
  const sorted = filtered.sort((a, b) => {
    // Priority 1: Urgency (expiring soon first)
    const aUrgency = new Date(a.expiryDate).getTime() - Date.now();
    const bUrgency = new Date(b.expiryDate).getTime() - Date.now();
    if (aUrgency < bUrgency) return -1;
    if (aUrgency > bUrgency) return 1;
    
    // Priority 2: Distance (closer first)
    if (a.distance < b.distance) return -1;
    if (a.distance > b.distance) return 1;
    
    // Priority 3: Quantity (more first)
    return b.quantity - a.quantity;
  });
  
  return sorted;
}
```

**Complexity**:
- Time: O(n log n) where n = number of donations (dominated by sorting)
- Space: O(n) for filtered results

**Optimization for Large Datasets**:
```typescript
// Use spatial indexing for faster distance queries
// In production, this would be done at database level with PostGIS

// R-tree spatial index
class SpatialIndex {
  private tree: RTree;
  
  insert(donation: Donation) {
    this.tree.insert({
      minX: donation.pickupLng - 0.1,
      maxX: donation.pickupLng + 0.1,
      minY: donation.pickupLat - 0.1,
      maxY: donation.pickupLat + 0.1,
      data: donation
    });
  }
  
  search(lat: number, lng: number, radius: number): Donation[] {
    // Convert radius to degrees (approximate)
    const degreeOffset = radius / 111; // 1 degree ≈ 111 km
    
    const results = this.tree.search({
      minX: lng - degreeOffset,
      maxX: lng + degreeOffset,
      minY: lat - degreeOffset,
      maxY: lat + degreeOffset
    });
    
    return results.map(r => r.data);
  }
}

// Complexity with spatial index: O(log n + k) where k = results
```

---

### 2.3 Delivery Route Optimization

**Purpose**: Find optimal volunteer for delivery based on location and availability

**Inputs**:
- Pickup location
- Delivery location
- Available volunteers with their locations

**Algorithm**: Greedy selection with distance heuristic

```typescript
interface DeliveryRouteInput {
  pickupLocation: { lat: number; lng: number };
  deliveryLocation: { lat: number; lng: number };
  volunteers: Array<{
    id: string;
    location: { lat: number; lng: number };
    isAvailable: boolean;
  }>;
}

function selectOptimalVolunteer(input: DeliveryRouteInput): string | null {
  const { pickupLocation, deliveryLocation, volunteers } = input;
  
  // Filter available volunteers
  const available = volunteers.filter(v => v.isAvailable);
  if (available.length === 0) return null;
  
  // Calculate total distance for each volunteer
  const withCost = available.map(volunteer => {
    // Distance: volunteer → pickup → delivery
    const toPickup = calculateDistance(
      volunteer.location.lat,
      volunteer.location.lng,
      pickupLocation.lat,
      pickupLocation.lng
    );
    
    const toDelivery = calculateDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      deliveryLocation.lat,
      deliveryLocation.lng
    );
    
    const totalDistance = toPickup + toDelivery;
    
    return {
      volunteer,
      totalDistance,
      toPickup
    };
  });
  
  // Sort by total distance, then by distance to pickup
  withCost.sort((a, b) => {
    if (a.totalDistance !== b.totalDistance) {
      return a.totalDistance - b.totalDistance;
    }
    return a.toPickup - b.toPickup;
  });
  
  // Return closest volunteer
  return withCost[0].volunteer.id;
}
```

**Advanced: Multi-Delivery Optimization** (Future Enhancement)
```typescript
// For volunteers handling multiple deliveries
// Use Traveling Salesman Problem (TSP) approximation

function optimizeMultiDeliveryRoute(
  volunteerLocation: Location,
  deliveries: Array<{ pickup: Location; delivery: Location }>
): Location[] {
  // Nearest Neighbor Heuristic for TSP
  const route: Location[] = [volunteerLocation];
  const unvisited = [...deliveries];
  
  let current = volunteerLocation;
  
  while (unvisited.length > 0) {
    // Find nearest pickup or delivery
    let nearest = null;
    let nearestDistance = Infinity;
    let nearestIndex = -1;
    
    unvisited.forEach((delivery, index) => {
      const distToPickup = calculateDistance(
        current.lat, current.lng,
        delivery.pickup.lat, delivery.pickup.lng
      );
      
      if (distToPickup < nearestDistance) {
        nearest = delivery.pickup;
        nearestDistance = distToPickup;
        nearestIndex = index;
      }
    });
    
    if (nearest) {
      route.push(nearest);
      route.push(unvisited[nearestIndex].delivery);
      current = unvisited[nearestIndex].delivery;
      unvisited.splice(nearestIndex, 1);
    }
  }
  
  return route;
}

// Complexity: O(n²) where n = number of deliveries
// Better than brute force O(n!) for TSP
```

---

### 2.4 Impact Metrics Calculation

**Purpose**: Calculate environmental and social impact

**Formulas**:
```typescript
interface ImpactMetrics {
  mealsSaved: number;
  foodWasteKg: number;
  co2ReducedKg: number;
  waterSavedLiters: number;
  treesEquivalent: number;
}

function calculateImpact(deliveries: Delivery[]): ImpactMetrics {
  // Constants based on research
  const AVG_MEAL_WEIGHT_KG = 0.5;  // Average meal weight
  const CO2_PER_KG_FOOD = 2.5;      // kg CO2 per kg food waste
  const WATER_PER_KG = 2.5;         // liters water per kg food
  const KG_CO2_PER_TREE_YEAR = 22;  // kg CO2 absorbed by tree per year
  
  const completed = deliveries.filter(d => d.status === 'completed');
  
  // Calculate meals saved
  const mealsSaved = completed.reduce((sum, d) => {
    return sum + (d.donation?.quantity || 0);
  }, 0);
  
  // Estimate food waste reduced
  const foodWasteKg = mealsSaved * AVG_MEAL_WEIGHT_KG;
  
  // Calculate CO2 reduction
  const co2ReducedKg = foodWasteKg * CO2_PER_KG_FOOD;
  
  // Calculate water saved
  const waterSavedLiters = foodWasteKg * WATER_PER_KG;
  
  // Tree equivalentage (for one year)
  const treesEquivalent = Math.round(co2ReducedKg / KG_CO2_PER_TREE_YEAR);
  
  return {
    mealsSaved,
    foodWasteKg: Math.round(foodWasteKg * 10) / 10,
    co2ReducedKg: Math.round(co2ReducedKg * 10) / 10,
    waterSavedLiters: Math.round(waterSavedLiters),
    treesEquivalent
  };
}
```

---

## 3. DATABASE DESIGN DETAILS

### 3.1 Indexing Strategy

**Purpose**: Optimize query performance

**Indexes**:
```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users USING GIST(location);

-- Donation indexes
CREATE INDEX idx_donations_status_expiry ON donations(status, expiry_date);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_location ON donations USING GIST(pickup_location);
CREATE INDEX idx_donations_created ON donations(created_at DESC);
CREATE INDEX idx_donations_category ON donations(category);

-- Delivery indexes
CREATE INDEX idx_deliveries_volunteer ON deliveries(volunteer_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_created ON deliveries(created_at DESC);
CREATE INDEX idx_deliveries_donor_receiver ON deliveries(donor_id, receiver_id);

-- Composite index for common query
CREATE INDEX idx_donations_active ON donations(status, expiry_date) 
  WHERE status = 'available' AND expiry_date > NOW();
```

**Index Selection Rationale**:
- `GIST` index for geospatial queries (fast proximity search)
- Composite indexes for multi-column WHERE clauses
- Partial index for frequently filtered subsets
- DESC index on timestamps for sorting recent items

### 3.2 Query Optimization Examples

**Query 1: Find Nearby Donations**
```sql
-- Optimized query using spatial index
EXPLAIN ANALYZE
SELECT 
  d.id,
  d.food_type,
  d.quantity,
  d.expiry_date,
  ST_Distance(d.pickup_location, ST_MakePoint($1, $2)::geography) / 1000 AS distance_km
FROM donations d
WHERE 
  d.status = 'available'
  AND d.expiry_date > NOW()
  AND ST_DWithin(
    d.pickup_location::geography,
    ST_MakePoint($1, $2)::geography,
    10000  -- 10km in meters
  )
ORDER BY distance_km ASC
LIMIT 20;

-- Uses: idx_donations_location (GIST), idx_donations_active
-- Execution time: ~50ms (vs ~500ms without indexes)
```

**Query 2: User Activity History**
```sql
-- Optimized with covering index
CREATE INDEX idx_deliveries_user_history ON deliveries(
  receiver_id,
  created_at DESC,
  status
) INCLUDE (donation_id, donor_id, delivery_time);

SELECT 
  d.id,
  d.status,
  d.created_at,
  d.delivery_time,
  don.food_type,
  don.quantity
FROM deliveries d
JOIN donations don ON d.donation_id = don.id
WHERE d.receiver_id = $1
ORDER BY d.created_at DESC
LIMIT 50;

-- Execution time: ~10ms (index-only scan)
```

---

## 4. API DESIGN

### 4.1 RESTful Endpoint Specifications

#### GET /api/donations

**Description**: Retrieve list of donations with filtering

**Query Parameters**:
```typescript
interface DonationQueryParams {
  status?: 'available' | 'claimed' | 'completed' | 'expired';
  category?: 'prepared' | 'fresh' | 'packaged' | 'bakery' | 'dairy';
  lat?: number;
  lng?: number;
  radius?: number;  // km
  limit?: number;
  offset?: number;
  sort?: 'distance' | 'expiry' | 'created';
}
```

**Response**:
```typescript
interface DonationListResponse {
  success: boolean;
  data: Array<Donation & { distance?: number }>;
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

**Example**:
```http
GET /api/donations?lat=40.7128&lng=-74.0060&radius=5&status=available&limit=20

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "donation-123",
      "foodType": "Fresh Salad",
      "category": "fresh",
      "quantity": 15,
      "unit": "servings",
      "expiryDate": "2026-04-30T18:00:00Z",
      "distance": 1.2,
      ...
    }
  ],
  "meta": {
    "total": 47,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 5. UI/UX DESIGN SPECIFICATIONS

### 5.1 Color Palette

**Primary Colors**:
```css
--color-green-50: #f0fdf4;
--color-green-100: #dcfce7;
--color-green-500: #22c55e;
--color-green-600: #16a34a;
--color-green-700: #15803d;

--color-orange-50: #fff7ed;
--color-orange-100: #ffedd5;
--color-orange-500: #f97316;
--color-orange-600: #ea580c;
--color-orange-700: #c2410c;
```

**Status Colors**:
```css
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

### 5.2 Typography

**Font Family**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

**Font Sizes**:
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### 5.3 Spacing System

**Based on 4px base unit**:
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### 5.4 Responsive Breakpoints

```css
/* Mobile first approach */
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Laptops */
--screen-xl: 1280px;  /* Desktops */
```

---

**End of Detailed Design Document**
