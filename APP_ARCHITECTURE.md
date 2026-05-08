# Zero Hunger Connect - Application Architecture

## Overview

Zero Hunger Connect is a food waste reduction platform that connects donors, receivers, volunteers, and NGOs to redistribute surplus food to those in need.

## Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript
- **Routing**: React Router v7 (Data Mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI (shadcn/ui)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner

### Simulated Backend (Mock Data)
In production, this would be replaced with:
- **Backend**: Node.js with Express or Supabase
- **Database**: PostgreSQL (via Supabase) or MongoDB
- **Authentication**: JWT or Supabase Auth
- **Real-time**: WebSockets or Supabase Realtime
- **Geolocation**: PostGIS or MongoDB Geospatial queries

## Project Structure

```
/src
├── /app
│   ├── /components
│   │   ├── /ui              # Reusable UI components (shadcn/ui)
│   │   ├── AuthLayout.tsx   # Authentication page layout
│   │   └── RootLayout.tsx   # Main app layout with navigation
│   ├── /data
│   │   └── mockData.ts      # Mock data for development
│   ├── /pages
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DonatePage.tsx
│   │   ├── BrowsePage.tsx
│   │   ├── MapPage.tsx
│   │   ├── RequestsPage.tsx
│   │   ├── DeliveriesPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ImpactPage.tsx
│   │   └── GuidelinesPage.tsx
│   ├── /types
│   │   └── index.ts         # TypeScript type definitions
│   ├── /utils
│   │   ├── auth.ts          # Authentication utilities
│   │   └── helpers.ts       # Helper functions
│   ├── App.tsx              # Root application component
│   └── routes.tsx           # Route configuration
├── /styles
│   ├── index.css
│   ├── tailwind.css
│   ├── theme.css
│   └── fonts.css
└── /public                  # Static assets
```

## Core Features

### 1. User Management
- **User Roles**: Donor, Receiver, Volunteer, NGO
- **Authentication**: Login/Register with role selection
- **Profile Management**: User information and settings

### 2. Food Donation System
- **Post Donations**: Donors can create food donation listings
- **Browse Donations**: Search and filter available food
- **Request System**: Receivers can request food donations
- **Status Tracking**: Track donation lifecycle (available → claimed → picked up → delivered)

### 3. Volunteer Delivery
- **Delivery Assignments**: Volunteers can accept delivery tasks
- **Route Information**: Pickup and delivery locations
- **Status Updates**: Track delivery progress
- **Delivery Completion**: Mark deliveries as complete

### 4. Map Integration
- **Interactive Map**: Visual representation of nearby donations
- **Distance Calculation**: Haversine formula for accurate distances
- **Location-based Filtering**: Find donations near user location
- **Navigation**: Integration with Google Maps for directions

### 5. Request Management
- **Send Requests**: Request food from donors
- **Manage Requests**: Accept/decline requests
- **Status Tracking**: Pending, accepted, rejected, completed

### 6. Impact Analytics
- **Personal Stats**: Individual user impact metrics
- **Platform Statistics**: Overall community impact
- **Visualizations**: Charts and graphs using Recharts
- **Environmental Impact**: CO2, water, and landfill metrics

### 7. Food Safety
- **Guidelines**: Comprehensive food safety information
- **Best Practices**: Temperature control, handling, packaging
- **Allergen Information**: Proper labeling and warnings

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'receiver' | 'volunteer' | 'ngo';
  phone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  avatar?: string;
  createdAt: string;
}
```

### FoodDonation
```typescript
interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorAvatar?: string;
  title: string;
  description: string;
  foodType: 'prepared' | 'raw' | 'packaged' | 'produce' | 'bakery' | 'dairy';
  quantity: number;
  unit: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  pickupTimeStart: string;
  pickupTimeEnd: string;
  expiryDate: string;
  status: 'available' | 'claimed' | 'picked_up' | 'delivered' | 'expired';
  image?: string;
  createdAt: string;
  claimedBy?: string;
  volunteerId?: string;
}
```

### FoodRequest
```typescript
interface FoodRequest {
  id: string;
  receiverId: string;
  receiverName: string;
  donationId: string;
  donationTitle: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  createdAt: string;
  respondedAt?: string;
}
```

### Delivery
```typescript
interface Delivery {
  id: string;
  volunteerId: string;
  volunteerName: string;
  donationId: string;
  donationTitle: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  createdAt: string;
  completedAt?: string;
}
```

### ImpactStats
```typescript
interface ImpactStats {
  mealsSaved: number;
  foodWasteReduced: number; // in kg
  peopleHelped: number;
  co2Reduced: number; // in kg
  donationsCompleted: number;
}
```

## Routing Structure

```
/login              - User login page
/register           - User registration page
/                   - Dashboard (protected)
/donate             - Create food donation (protected)
/browse             - Browse available donations (protected)
/map                - Map view of donations (protected)
/requests           - Manage food requests (protected)
/deliveries         - Volunteer deliveries (protected)
/profile            - User profile (protected)
/impact             - Impact statistics (protected)
/guidelines         - Food safety guidelines (protected)
```

## State Management

Currently using React's built-in state management:
- **Local State**: useState for component-level state
- **Context**: Could be added for global state (user, theme, etc.)
- **Local Storage**: Persisting authentication state

For production, consider:
- React Context + useReducer for complex state
- Redux Toolkit for larger applications
- Zustand for lightweight state management

## Authentication Flow

1. **Login**: User enters credentials → Mock authentication → Store user in localStorage
2. **Registration**: User provides details → Create user account → Auto-login
3. **Protected Routes**: Check localStorage for user → Redirect to /login if not authenticated
4. **Logout**: Clear localStorage → Redirect to /login

## API Integration (Future)

### Planned Endpoints

**Authentication**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

**Food Donations**
- GET /api/donations (with filters: location, type, status)
- POST /api/donations
- GET /api/donations/:id
- PATCH /api/donations/:id
- DELETE /api/donations/:id

**Requests**
- GET /api/requests
- POST /api/requests
- PATCH /api/requests/:id/accept
- PATCH /api/requests/:id/reject

**Deliveries**
- GET /api/deliveries
- POST /api/deliveries
- PATCH /api/deliveries/:id/status

**Impact**
- GET /api/impact/user/:userId
- GET /api/impact/platform

**Geolocation**
- GET /api/donations/nearby?lat=X&lng=Y&radius=Z

## Security Considerations

1. **Input Validation**: Validate all user inputs
2. **Authentication**: Use JWT tokens or session-based auth
3. **Authorization**: Role-based access control
4. **Data Sanitization**: Prevent XSS attacks
5. **HTTPS**: Encrypt all data in transit
6. **Rate Limiting**: Prevent abuse of API endpoints
7. **PII Protection**: Secure handling of personal information

## Performance Optimizations

1. **Code Splitting**: React Router automatically splits routes
2. **Lazy Loading**: Load components on demand
3. **Image Optimization**: Use proper image formats and sizes
4. **Caching**: Cache API responses where appropriate
5. **Debouncing**: For search and filter operations
6. **Pagination**: For large lists of donations

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Focus indicators

## Mobile Responsiveness

- Mobile-first design approach
- Responsive grid layouts
- Touch-friendly buttons and inputs
- Bottom navigation on mobile
- Optimized for various screen sizes

## Future Enhancements

1. **Push Notifications**: Real-time alerts for nearby donations
2. **Chat System**: In-app messaging between users
3. **Photo Upload**: Images of food donations
4. **Rating System**: User ratings and reviews
5. **Gamification**: Badges, achievements, leaderboards
6. **Multi-language**: Internationalization support
7. **Dark Mode**: Theme switching
8. **Advanced Filtering**: More search options
9. **Calendar Integration**: Schedule pickups
10. **SMS Notifications**: Alternative to push notifications
11. **QR Codes**: For quick donation pickup verification
12. **Admin Dashboard**: Moderate content and users
