# Zero Hunger Connect - UI/UX Wireframes

## Design Philosophy

### Core Principles
- **Accessibility First**: Clear, readable, and navigable for all users
- **Mobile-Responsive**: Optimized for mobile devices with touch-friendly interfaces
- **Sustainability Theme**: Green and orange color palette representing food and hope
- **Intuitive Navigation**: Clear user flows with minimal clicks
- **Trust & Safety**: Transparent information display with safety guidelines

---

## Color Palette

### Primary Colors
```css
Green (Primary):    #10b981 (Emerald 500) - Growth, sustainability, giving
Orange (Accent):    #f97316 (Orange 500) - Warmth, community, food
Blue (Info):        #3b82f6 (Blue 500) - Trust, reliability
```

### Semantic Colors
```css
Success:    #10b981 (Green)
Warning:    #f59e0b (Amber)
Error:      #ef4444 (Red)
Info:       #3b82f6 (Blue)
```

### Neutral Colors
```css
Background:     #f9fafb (Gray 50)
Surface:        #ffffff (White)
Border:         #e5e7eb (Gray 200)
Text Primary:   #111827 (Gray 900)
Text Secondary: #6b7280 (Gray 500)
```

---

## Typography

### Fonts
- **System Font Stack**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
- Accessible and performant across all devices

### Type Scale
```
Display: 2.5rem (40px)
Heading 1: 2rem (32px)
Heading 2: 1.5rem (24px)
Heading 3: 1.25rem (20px)
Body: 1rem (16px)
Small: 0.875rem (14px)
```

---

## Component Library

### Buttons

#### Primary Button
```
Background: Green (#10b981)
Text: White
Hover: Darker Green (#059669)
Use: Main actions (Submit, Post, Accept)
```

#### Secondary Button
```
Background: Transparent
Border: Gray
Text: Gray
Use: Cancel, Back, Secondary actions
```

#### Danger Button
```
Background: Red (#ef4444)
Text: White
Use: Delete, Reject, Critical actions
```

### Cards
```
Background: White
Border: 1px solid Gray 200
Border Radius: 8px
Shadow: Subtle
Padding: 24px
```

### Badges
```
Small rounded pills with colored backgrounds
Food Type: Dynamic color based on type
Status: Dynamic color based on status
Role: Dynamic color based on user role
```

---

## Screen Wireframes

### 1. Authentication Screens

#### Login Page
```
┌─────────────────────────────────────┐
│                                     │
│           [LOGO]                    │
│     Zero Hunger Connect             │
│   "Ending food waste, feeding hope" │
│                                     │
│   ┌───────────────────────────┐    │
│   │  Login                    │    │
│   │  ─────────────────────    │    │
│   │  Email                    │    │
│   │  [input field]            │    │
│   │                           │    │
│   │  Password                 │    │
│   │  [input field]            │    │
│   │                           │    │
│   │  [Login Button - Green]   │    │
│   │                           │    │
│   │  Quick Demo Login:        │    │
│   │  [D] Donor               │    │
│   │  [V] Volunteer           │    │
│   │  [N] NGO                 │    │
│   │  [R] Receiver            │    │
│   │                           │    │
│   │  Don't have an account?   │    │
│   │  [Register]               │    │
│   └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

#### Register Page
```
┌─────────────────────────────────────┐
│                                     │
│           [LOGO]                    │
│     Zero Hunger Connect             │
│                                     │
│   ┌───────────────────────────┐    │
│   │  Create Account           │    │
│   │  ─────────────────────    │    │
│   │  Full Name                │    │
│   │  [input]                  │    │
│   │                           │    │
│   │  Email                    │    │
│   │  [input]                  │    │
│   │                           │    │
│   │  Password                 │    │
│   │  [input]                  │    │
│   │                           │    │
│   │  I am a...                │    │
│   │  [Dropdown: Donor/        │    │
│   │   Receiver/Volunteer/NGO] │    │
│   │                           │    │
│   │  Phone Number             │    │
│   │  [input]                  │    │
│   │                           │    │
│   │  Address                  │    │
│   │  [input]                  │    │
│   │                           │    │
│   │  [Create Account - Green] │    │
│   │                           │    │
│   │  Already have account?    │    │
│   │  [Login]                  │    │
│   └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

### 2. Dashboard (Mobile)

```
┌─────────────────────────────────────┐
│ ☰  Zero Hunger Connect    🔔 [👤]  │
├─────────────────────────────────────┤
│                                     │
│  Good morning, Sarah! 👋            │
│  Thank you for helping reduce       │
│  food waste and feed those in need. │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 247 │ │ 143 │ │185kg│ │278kg│  │
│  │Meals│ │People│ │Waste│ │ CO₂ │  │
│  │Saved│ │Helped│ │ Red.│ │ Red.│  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  My Donations                [+New] │
│  ┌─────────────────────────────┐   │
│  │ [👤] Fresh Vegetable Surplus│   │
│  │ [Produce] [Available]       │   │
│  │ 15 kg • 2 hours ago         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Available Food Nearby    [View Map]│
│  ┌─────────────────────────────┐   │
│  │ [👤] Packaged Bread         │   │
│  │ [Bakery] • 0.8 km away      │   │
│  │ 30 items • 3 hours ago      │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [🏠] [📦] [🔍] [🗺️] [📊] [👤]     │
└─────────────────────────────────────┘
```

---

### 3. Donate Food Page

```
┌─────────────────────────────────────┐
│ ← Post a Food Donation              │
├─────────────────────────────────────┤
│                                     │
│  Share your surplus food with those │
│  in need. Ensure all food is safe.  │
│                                     │
│  Donation Title *                   │
│  [e.g., Fresh Vegetable Surplus]    │
│                                     │
│  Description *                      │
│  [Describe the food items...]       │
│  [                                ] │
│  [                                ] │
│                                     │
│  Food Type *                        │
│  [Dropdown: Prepared/Raw/...]       │
│                                     │
│  Quantity *        Unit *           │
│  [10]              [kg ▼]           │
│                                     │
│  Pickup Available From *            │
│  [Date/Time Picker]                 │
│                                     │
│  Pickup Available Until *           │
│  [Date/Time Picker]                 │
│                                     │
│  Expiry Date *                      │
│  [Date/Time Picker]                 │
│                                     │
│  Pickup Address *                   │
│  [123 Main St, City, State]         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Food Safety Guidelines      │   │
│  │ • Proper temperature        │   │
│  │ • Safe to consume           │   │
│  │ • Label allergens           │   │
│  │ • Package properly          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Cancel]    [Post Donation]        │
│                                     │
└─────────────────────────────────────┘
```

---

### 4. Browse Donations Page

```
┌─────────────────────────────────────┐
│ Browse Food Donations               │
├─────────────────────────────────────┤
│  Discover available food in your    │
│  area                               │
│                                     │
│  [🔍 Search...]  [Type▼] [Status▼] │
│                                     │
│  Found 12 donations                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [👤] Sarah Johnson          │   │
│  │ Fresh Vegetable Surplus     │   │
│  │ [Produce] [Available]       │   │
│  │                             │   │
│  │ Assorted fresh vegetables...│   │
│  │                             │   │
│  │ 📦 15 kg                    │   │
│  │ 📍 0.3 km away              │   │
│  │ 🕐 Pickup: Today 10AM-6PM   │   │
│  │                             │   │
│  │      [Request Food]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [👤] Green Grocery Store    │   │
│  │ Packaged Bread & Pastries   │   │
│  │ [Bakery] [Available]        │   │
│  │                             │   │
│  │ End-of-day bakery items...  │   │
│  │                             │   │
│  │ 📦 30 items                 │   │
│  │ 📍 0.8 km away              │   │
│  │ 🕐 Pickup: Today 7PM-9PM    │   │
│  │                             │   │
│  │      [Request Food]          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

### 5. Map View Page

```
┌─────────────────────────────────────┐
│ Food Donations Map                  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │         MAP AREA            │   │
│  │                             │   │
│  │    [📍 Donation markers]    │   │
│  │    [🔵 Your location]       │   │
│  │                             │   │
│  │  Legend:                    │   │
│  │  🔵 You                     │   │
│  │  📍 Food Donation           │   │
│  │                             │   │
│  │                     [+] [-] │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nearby Donations (5)               │
│  ┌─────────────────────────────┐   │
│  │ [👤] Fresh Vegetables       │   │
│  │ [Produce]                   │   │
│  │ 📍 0.3 km  📦 15 kg         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Selected: Fresh Vegetables  │   │
│  │ [👤] Sarah Johnson          │   │
│  │ [Produce]                   │   │
│  │                             │   │
│  │ Assorted fresh vegetables   │   │
│  │                             │   │
│  │ 📦 15 kg   📍 0.3 km       │   │
│  │ 🕐 Today 10AM-6PM          │   │
│  │ 📍 123 Main St, NY         │   │
│  │                             │   │
│  │ [Get Directions] [Request]  │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

### 6. Impact Dashboard

```
┌─────────────────────────────────────┐
│ Community Impact                    │
├─────────────────────────────────────┤
│  See the collective difference      │
│  we're making together              │
│                                     │
│  ┌────────────────────────────┐    │
│  │ 15,847 Total Meals Saved   │    │
│  │ 📦 +18% from last month    │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │ 8,932 People Helped        │    │
│  │ 👥 +22% from last month    │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │ 11.9 Tons Waste Reduced    │    │
│  │ 📊 +15% from last month    │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │ 17.8 Tons CO₂ Reduced      │    │
│  │ 🌱 +15% from last month    │    │
│  └────────────────────────────┘    │
│                                     │
│  Monthly Trends                     │
│  ┌────────────────────────────┐    │
│  │     [Line Chart]           │    │
│  │   ╱                        │    │
│  │  ╱                         │    │
│  │ ╱                          │    │
│  │─────────────────────       │    │
│  │ Sep Oct Nov Dec Jan Feb    │    │
│  └────────────────────────────┘    │
│                                     │
│  Food Type Distribution             │
│  ┌────────────────────────────┐    │
│  │     [Pie Chart]            │    │
│  │       🥘 35%               │    │
│  │     🥗 30%  📦 21%         │    │
│  │       🍞 11%  🥛 3%        │    │
│  └────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

### 7. Requests Management

```
┌─────────────────────────────────────┐
│ Food Requests                       │
├─────────────────────────────────────┤
│  Manage donation requests           │
│                                     │
│  [Received (2)] [Sent (1)]         │
│  ───────────                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Home-Cooked Meals           │   │
│  │ [Accepted]                  │   │
│  │ Requested by:               │   │
│  │ Hope Foundation             │   │
│  │ 4 hours ago                 │   │
│  │                             │   │
│  │ "We have a community kitchen│   │
│  │  serving 50 people today.   │   │
│  │  This would be a great help!"│   │
│  │                             │   │
│  │ ✓ Request accepted 3h ago   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Fresh Vegetable Surplus     │   │
│  │ [Pending]                   │   │
│  │ Requested by:               │   │
│  │ Maria Garcia                │   │
│  │ 1 hour ago                  │   │
│  │                             │   │
│  │ "I could really use some    │   │
│  │  fresh vegetables for my    │   │
│  │  family. Thank you!"        │   │
│  │                             │   │
│  │ [Accept]      [Decline]     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Quick Stats                        │
│  Pending: 1  Accepted: 1  Declined: 0│
│                                     │
└─────────────────────────────────────┘
```

---

### 8. Volunteer Deliveries

```
┌─────────────────────────────────────┐
│ My Deliveries                       │
├─────────────────────────────────────┤
│  Manage your volunteer delivery     │
│  assignments                        │
│                                     │
│  Total: 1  Active: 1  Completed: 0  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Home-Cooked Meals           │   │
│  │ [In Transit]                │   │
│  │ Assigned 2 hours ago        │   │
│  │                             │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ 📍 Pickup Location      │ │   │
│  │ │ 123 Main St, NY         │ │   │
│  │ │         [Navigate →]    │ │   │
│  │ └─────────────────────────┘ │   │
│  │                             │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ 📦 Delivery Location    │ │   │
│  │ │ 789 Charity Blvd, NY    │ │   │
│  │ │         [Navigate →]    │ │   │
│  │ └─────────────────────────┘ │   │
│  │                             │   │
│  │  [Mark as Delivered]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Volunteer Tips              │   │
│  │ • Contact donor before      │   │
│  │ • Proper packaging          │   │
│  │ • Deliver promptly          │   │
│  │ • Be respectful             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Navigation Patterns

### Mobile Bottom Navigation
```
┌─────────────────────────────────────┐
│                                     │
│         [Main Content]              │
│                                     │
├─────────────────────────────────────┤
│ [🏠]  [📦]  [🔍]  [🗺️]  [👤]      │
│ Home  Donate Browse Map  Profile    │
└─────────────────────────────────────┘
```

### Desktop Sidebar Navigation
```
┌───────┬─────────────────────────────┐
│ [🏠] │                             │
│ Home  │                             │
│       │      Main Content           │
│ [📦] │                             │
│Donate │                             │
│       │                             │
│ [🔍] │                             │
│Browse │                             │
│       │                             │
│ [🗺️] │                             │
│ Map   │                             │
│       │                             │
│ [📊] │                             │
│Impact │                             │
└───────┴─────────────────────────────┘
```

---

## Responsive Breakpoints

```css
Mobile:     < 640px  (Full width, bottom nav)
Tablet:     640px - 1024px (Adjusted layouts)
Desktop:    > 1024px (Side navigation, multi-column)
```

---

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate
- Escape to close modals/dialogs

### Screen Reader Support
- Semantic HTML elements
- ARIA labels for icons
- Descriptive alt text
- Live regions for notifications

### Visual
- High contrast text
- Focus indicators
- Sufficient touch targets (44x44px minimum)
- Scalable fonts

---

## Interaction States

### Buttons
```
Default:  Normal appearance
Hover:    Slight color change, cursor pointer
Active:   Pressed appearance
Disabled: Grayed out, no interaction
Loading:  Spinner or progress indicator
```

### Input Fields
```
Default:  Border gray
Focus:    Border green, focus ring
Error:    Border red, error message
Success:  Border green, checkmark
```

### Cards
```
Default:  Normal shadow
Hover:    Elevated shadow (for clickable cards)
Selected: Border highlight, background tint
```

---

## Animation Guidelines

### Micro-interactions
- Button hover: 150ms ease
- Card hover: 200ms ease
- Modal open: 300ms ease-out
- Toast notifications: Slide in/out

### Page Transitions
- Smooth page changes
- Loading states for async operations
- Skeleton screens for data loading

---

## Empty States

### No Donations
```
┌─────────────────────────────────┐
│          [📦 Icon]              │
│                                 │
│    No donations found           │
│    Try adjusting your filters   │
│                                 │
│      [Browse All]               │
└─────────────────────────────────┘
```

### No Requests
```
┌─────────────────────────────────┐
│          [📋 Icon]              │
│                                 │
│    No requests yet              │
│    When someone requests your   │
│    donations, they'll appear    │
│    here                         │
└─────────────────────────────────┘
```

---

## Loading States

### Skeleton Screens
```
┌─────────────────────────────────┐
│ [█████████████░░░░░░░]          │
│ [███░░░░] [███░░░░]             │
│ [█████████████████████░░░░]     │
│ [████░░░░]                      │
└─────────────────────────────────┘
```

### Spinners
- Use for button actions
- Use for page loads
- Center in container

---

## Best Practices

1. **Consistency**: Use same patterns throughout
2. **Clarity**: Clear labels and instructions
3. **Feedback**: Immediate response to user actions
4. **Forgiveness**: Confirm destructive actions
5. **Efficiency**: Minimize clicks to complete tasks
6. **Accessibility**: Design for all users
7. **Performance**: Fast load times, smooth interactions
8. **Mobile-First**: Design for mobile, enhance for desktop

---

This wireframe document provides a comprehensive visual and structural guide for implementing the Zero Hunger Connect user interface. All components follow modern UX best practices and maintain consistency across the application.
