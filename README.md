# Zero Hunger Connect 🌱

**Ending food waste, feeding hope**

A comprehensive mobile-first web application designed to reduce food waste and combat hunger by connecting restaurants, households, grocery stores, and NGOs with people and organizations in need.

![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo Accounts](#demo-accounts)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Zero Hunger Connect addresses the critical issues of food waste and hunger by creating a seamless platform that connects:

- **Donors** (Restaurants, Households, Grocery Stores) with surplus food
- **Receivers** (Individuals, Families in need)
- **Volunteers** (Delivery coordinators)
- **NGOs** (Community organizations)

### The Problem

- **1.3 billion tons** of food wasted globally each year
- **828 million people** facing hunger worldwide
- **8-10%** of global greenhouse gas emissions from food waste

### Our Solution

A digital platform that makes food redistribution easy, safe, and impactful through:
- Real-time donation matching
- GPS-based nearby food discovery
- Volunteer delivery coordination
- Impact tracking and analytics
- Food safety guidelines

---

## ✨ Features

### Core Features

#### 🔐 User Management
- Role-based registration (Donor, Receiver, Volunteer, NGO)
- Secure authentication system
- User profiles with location settings
- Activity history tracking

#### 🍲 Food Donation System
- Create detailed food listings
- Specify food type, quantity, and expiry
- Set pickup time windows
- Upload photos (in production)
- Track donation status

#### 🔍 Browse & Search
- Advanced filtering by food type, location, status
- Distance-based sorting
- Real-time availability updates
- Quick request functionality

#### 🗺️ Interactive Map View
- Visual representation of nearby donations
- Distance calculations
- Direct navigation to pickup locations
- Marker clustering for multiple donations

#### 📨 Request Management
- Send requests with custom messages
- Accept/decline incoming requests
- Track request status
- Automated notifications

#### 🚚 Volunteer Delivery
- Accept delivery assignments
- Pickup and delivery location tracking
- Multi-step delivery workflow
- Delivery completion confirmation

#### 📊 Impact Dashboard
- Personal impact metrics
- Platform-wide statistics
- Environmental impact calculations
- Visual charts and graphs
- Monthly trend analysis

#### 📱 Real-time Notifications
- New donations nearby
- Request responses
- Delivery updates
- System announcements

#### 🛡️ Food Safety Guidelines
- Comprehensive safety information
- Temperature control guidelines
- Packaging requirements
- Allergen labeling guide
- Handling best practices

---

## 👥 Demo Accounts

Try the app with these pre-configured accounts:

| Role | Email | Description |
|------|-------|-------------|
| **Donor** | sarah@example.com | Restaurant/household with surplus food |
| **Volunteer** | mike@example.com | Delivery coordinator |
| **NGO** | contact@hopefoundation.org | Community organization |
| **Receiver** | maria@example.com | Individual in need |

**Password for all accounts:** `demo123` (in mock implementation)

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript
- **Routing:** React Router v7 (Data Mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI (shadcn/ui)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Notifications:** Sonner
- **Build Tool:** Vite

### Backend (Production)
- **Recommended:** Node.js + Express or Supabase
- **Database:** PostgreSQL (with PostGIS) or MongoDB
- **Authentication:** JWT or Supabase Auth
- **Storage:** AWS S3 or Supabase Storage
- **Real-time:** WebSockets or Supabase Realtime

### DevOps
- **Hosting:** Vercel, Netlify, or AWS Amplify
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, UptimeRobot
- **Analytics:** Google Analytics 4

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zero-hunger-connect.git
   cd zero-hunger-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

---

## 📁 Project Structure

```
zero-hunger-connect/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   ├── AuthLayout.tsx   # Auth page layout
│   │   │   └── RootLayout.tsx   # Main app layout
│   │   ├── data/
│   │   │   └── mockData.ts      # Mock data for development
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DonatePage.tsx
│   │   │   ├── BrowsePage.tsx
│   │   │   ├── MapPage.tsx
│   │   │   ├── RequestsPage.tsx
│   │   │   ├── DeliveriesPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ImpactPage.tsx
│   │   │   └── GuidelinesPage.tsx
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript type definitions
│   │   ├── utils/
│   │   │   ├── auth.ts          # Authentication utilities
│   │   │   └── helpers.ts       # Helper functions
│   │   ├── App.tsx              # Root component
│   │   └── routes.tsx           # Route configuration
│   └── styles/                  # Global styles
├── public/                      # Static assets
├── APP_ARCHITECTURE.md          # Detailed architecture documentation
├── DATABASE_SCHEMA.md           # Database design and schema
├── DEPLOYMENT.md                # Deployment instructions
└── README.md                    # This file
```

---

## 📚 Documentation

### Comprehensive Guides

- **[Application Architecture](./APP_ARCHITECTURE.md)** - Detailed system design, data models, and technical architecture
- **[Database Schema](./DATABASE_SCHEMA.md)** - Complete database design with tables, indexes, and queries
- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment instructions for various platforms

### Key Concepts

#### User Roles

1. **Donor** - Posts surplus food donations
2. **Receiver** - Requests and receives food
3. **Volunteer** - Delivers food from donors to receivers
4. **NGO** - Coordinates large-scale food distribution

#### Food Donation Lifecycle

```
Available → Claimed → Picked Up → Delivered
```

#### Request Flow

```
Send Request → Donor Reviews → Accept/Decline → Coordinate Pickup
```

#### Delivery Flow

```
Assigned → Picked Up → In Transit → Delivered
```

---

## 📱 Screenshots

### Authentication
- Clean login/registration interface
- Role selection during signup
- Quick demo account access

### Dashboard
- Role-specific dashboard views
- Quick stats overview
- Recent activity feed

### Donation Management
- Comprehensive donation form
- Food type categorization
- Pickup time scheduling

### Map View
- Interactive map with markers
- Distance calculations
- Donation details popup

### Impact Dashboard
- Personal impact metrics
- Platform-wide statistics
- Environmental impact visualization

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Share your ideas
3. **Submit Pull Requests** - Fix bugs or add features
4. **Improve Documentation** - Help others understand the project
5. **Share Feedback** - Tell us about your experience

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use functional components and hooks
- Write meaningful commit messages
- Add comments for complex logic
- Ensure responsive design
- Test thoroughly before submitting

---

## 🌍 Social Impact

### Our Mission

To create a world where:
- **No food goes to waste** when someone is hungry
- **Communities are connected** through sharing
- **Environmental impact is reduced** through conscious action
- **Technology enables** social good

### Impact Metrics (Example Platform)

- 🍽️ **15,847 meals** saved from waste
- 👥 **8,932 people** helped
- 🌱 **11.9 tons** of food waste prevented
- 🌍 **17.8 tons** of CO₂ emissions reduced

---

## 🔒 Privacy & Security

### Data Protection

- User data is stored securely
- Passwords are hashed (in production)
- HTTPS encryption for all communications
- No sharing of personal information without consent

### Food Safety

- Comprehensive safety guidelines
- Donor accountability
- Expiry date tracking
- Allergen labeling requirements

**Note:** This platform is designed for demonstration and prototype purposes. For production use involving real user data, ensure compliance with:
- GDPR (Europe)
- CCPA (California)
- Local data protection laws
- Food safety regulations

---

## 📞 Support

### Get Help

- **Documentation:** See guides in repository
- **Issues:** [GitHub Issues](https://github.com/yourusername/zero-hunger-connect/issues)
- **Email:** support@zerohungerconnect.org (example)

### FAQs

**Q: Is this app available on mobile devices?**
A: Yes! The app is fully responsive and works on all devices.

**Q: How do I ensure food safety?**
A: Follow our comprehensive guidelines in the app and always use your best judgment.

**Q: Can I use this for my community?**
A: Yes! The codebase is open-source. See deployment guide for setup instructions.

**Q: How is distance calculated?**
A: We use the Haversine formula to calculate accurate distances between coordinates.

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core donation system
- ✅ User authentication
- ✅ Map visualization
- ✅ Impact dashboard
- ✅ Food safety guidelines

### Phase 2 (Planned)
- 📸 Photo uploads for donations
- 💬 In-app messaging
- 🔔 Push notifications
- ⭐ Rating and review system
- 🌐 Multi-language support

### Phase 3 (Future)
- 🤖 AI-powered demand prediction
- 📊 Advanced analytics
- 🏆 Gamification (badges, leaderboards)
- 🔗 Integration with food banks
- 📱 Native mobile apps

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Inspiration:** UN Sustainable Development Goal 2 (Zero Hunger)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

## 💚 Making a Difference

Every meal saved, every person helped, every ton of waste prevented - it all starts with connection. Join us in building a more sustainable, caring world.

**Together, we can achieve Zero Hunger.**

---

<div align="center">
  <p>Built with ❤️ by developers who care about making a difference</p>
  <p>
    <a href="#zero-hunger-connect-">Back to top</a>
  </p>
</div>
