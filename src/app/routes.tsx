import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from './components/RootLayout';
import { AuthLayout } from './components/AuthLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DonatePage } from './pages/DonatePage';
import { BrowsePage } from './pages/BrowsePage';
import { MapPage } from './pages/MapPage';
import { RequestsPage } from './pages/RequestsPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { ProfilePage } from './pages/ProfilePage';
import { ImpactPage } from './pages/ImpactPage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { isAuthenticated } from './utils/auth';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><RootLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'donate', element: <DonatePage /> },
      { path: 'browse', element: <BrowsePage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'deliveries', element: <DeliveriesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'impact', element: <ImpactPage /> },
      { path: 'guidelines', element: <GuidelinesPage /> }
    ]
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
