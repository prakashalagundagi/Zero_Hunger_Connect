// Mock data for Zero Hunger Connect
import { User, FoodDonation, FoodRequest, Delivery, ImpactStats, Notification } from '../types';

// Mock current user - can be changed to test different roles
export let currentUser: User = {
  id: 'user-1',
  name: 'Priya Sharma',
  email: 'sarah@example.com',
  role: 'donor',
  phone: '+91 98450 12345',
  location: {
    lat: 12.9716,
    lng: 77.5946,
    address: '12, MG Road, Bengaluru, Karnataka 560001'
  },
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  createdAt: '2026-01-15T10:00:00Z'
};

export const setCurrentUser = (user: User) => {
  currentUser = user;
};

// Mock users
export const mockUsers: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Rahul Nair',
    email: 'mike@example.com',
    role: 'volunteer',
    phone: '+91 98450 67890',
    location: {
      lat: 12.9784,
      lng: 77.6408,
      address: '45, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'user-3',
    name: 'Asha Foundation',
    email: 'contact@hopefoundation.org',
    role: 'ngo',
    phone: '+91 80 2345 6789',
    location: {
      lat: 12.9352,
      lng: 77.6245,
      address: '78, Koramangala 4th Block, Bengaluru, Karnataka 560034'
    },
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Asha Foundation',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'user-4',
    name: 'Meena Kumari',
    email: 'maria@example.com',
    role: 'receiver',
    phone: '+91 98450 11223',
    location: {
      lat: 12.9250,
      lng: 77.5938,
      address: '22, Jayanagar 4th Block, Bengaluru, Karnataka 560041'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'user-5',
    name: 'Namma Supermarket',
    email: 'info@greengrocery.com',
    role: 'donor',
    phone: '+91 80 4567 8901',
    location: {
      lat: 13.0035,
      lng: 77.5655,
      address: '15, Sampige Road, Malleswaram, Bengaluru, Karnataka 560003'
    },
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Green Grocery',
    createdAt: '2026-01-05T10:00:00Z'
  }
];

// Mock food donations
export const mockDonations: FoodDonation[] = [
  {
    id: 'donation-1',
    donorId: 'user-1',
    donorName: 'Priya Sharma',
    donorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    title: 'Fresh Vegetable Surplus',
    description: 'Assorted fresh vegetables from our garden — tomatoes, brinjal, beans, and spinach. Perfect for making healthy meals.',
    foodType: 'produce',
    quantity: 15,
    unit: 'kg',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: '12, MG Road, Bengaluru, Karnataka 560001'
    },
    pickupTimeStart: '2026-03-14T10:00:00Z',
    pickupTimeEnd: '2026-03-14T18:00:00Z',
    expiryDate: '2026-03-16T00:00:00Z',
    status: 'available',
    createdAt: '2026-03-13T09:00:00Z'
  },
  {
    id: 'donation-2',
    donorId: 'user-5',
    donorName: 'Namma Supermarket',
    donorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Green Grocery',
    title: 'Packaged Bread and Pastries',
    description: 'End-of-day bakery items including bread loaves, buns, and cake slices. All packaged and fresh.',
    foodType: 'bakery',
    quantity: 30,
    unit: 'items',
    location: {
      lat: 13.0035,
      lng: 77.5655,
      address: '15, Sampige Road, Malleswaram, Bengaluru, Karnataka 560003'
    },
    pickupTimeStart: '2026-03-13T19:00:00Z',
    pickupTimeEnd: '2026-03-13T21:00:00Z',
    expiryDate: '2026-03-14T00:00:00Z',
    status: 'available',
    createdAt: '2026-03-13T18:00:00Z'
  },
  {
    id: 'donation-3',
    donorId: 'user-1',
    donorName: 'Priya Sharma',
    donorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    title: 'Home-Cooked Meals',
    description: 'Prepared vegetable sambar and rice for 20 people. Made fresh today with proper food safety standards.',
    foodType: 'prepared',
    quantity: 20,
    unit: 'servings',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: '12, MG Road, Bengaluru, Karnataka 560001'
    },
    pickupTimeStart: '2026-03-13T12:00:00Z',
    pickupTimeEnd: '2026-03-13T14:00:00Z',
    expiryDate: '2026-03-13T20:00:00Z',
    status: 'claimed',
    claimedBy: 'user-3',
    volunteerId: 'user-2',
    createdAt: '2026-03-13T08:00:00Z'
  },
  {
    id: 'donation-4',
    donorId: 'user-5',
    donorName: 'Namma Supermarket',
    donorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Green Grocery',
    title: 'Canned Goods Assortment',
    description: 'Various canned vegetables, soups, and dal nearing best-by date but still perfectly good.',
    foodType: 'packaged',
    quantity: 50,
    unit: 'items',
    location: {
      lat: 13.0035,
      lng: 77.5655,
      address: '15, Sampige Road, Malleswaram, Bengaluru, Karnataka 560003'
    },
    pickupTimeStart: '2026-03-14T09:00:00Z',
    pickupTimeEnd: '2026-03-14T17:00:00Z',
    expiryDate: '2026-04-01T00:00:00Z',
    status: 'available',
    createdAt: '2026-03-12T15:00:00Z'
  },
  {
    id: 'donation-5',
    donorId: 'user-5',
    donorName: 'Namma Supermarket',
    donorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Green Grocery',
    title: 'Dairy Products',
    description: 'Milk, curd, and paneer approaching sell-by date. All refrigerated and safe to consume.',
    foodType: 'dairy',
    quantity: 25,
    unit: 'items',
    location: {
      lat: 13.0035,
      lng: 77.5655,
      address: '15, Sampige Road, Malleswaram, Bengaluru, Karnataka 560003'
    },
    pickupTimeStart: '2026-03-14T08:00:00Z',
    pickupTimeEnd: '2026-03-14T12:00:00Z',
    expiryDate: '2026-03-15T00:00:00Z',
    status: 'available',
    createdAt: '2026-03-13T07:00:00Z'
  }
];

// Mock requests
export const mockRequests: FoodRequest[] = [
  {
    id: 'request-1',
    receiverId: 'user-3',
    receiverName: 'Asha Foundation',
    donationId: 'donation-3',
    donationTitle: 'Home-Cooked Meals',
    status: 'accepted',
    message: 'We run a community kitchen serving 50 people daily in Koramangala. This would be a great help!',
    createdAt: '2026-03-13T09:00:00Z',
    respondedAt: '2026-03-13T09:30:00Z'
  },
  {
    id: 'request-2',
    receiverId: 'user-4',
    receiverName: 'Meena Kumari',
    donationId: 'donation-1',
    donationTitle: 'Fresh Vegetable Surplus',
    status: 'pending',
    message: 'I could really use some fresh vegetables for my family. Thank you for your generosity.',
    createdAt: '2026-03-13T10:00:00Z'
  }
];

// Mock deliveries
export const mockDeliveries: Delivery[] = [
  {
    id: 'delivery-1',
    volunteerId: 'user-2',
    volunteerName: 'Rahul Nair',
    donationId: 'donation-3',
    donationTitle: 'Home-Cooked Meals',
    pickupLocation: {
      lat: 12.9716,
      lng: 77.5946,
      address: '12, MG Road, Bengaluru, Karnataka 560001'
    },
    deliveryLocation: {
      lat: 12.9352,
      lng: 77.6245,
      address: '78, Koramangala 4th Block, Bengaluru, Karnataka 560034'
    },
    status: 'in_transit',
    createdAt: '2026-03-13T10:00:00Z'
  }
];

// Mock impact statistics
export const mockImpactStats: Record<string, ImpactStats> = {
  'user-1': {
    mealsSaved: 247,
    foodWasteReduced: 185.5,
    peopleHelped: 143,
    co2Reduced: 278.25,
    donationsCompleted: 18
  },
  'user-2': {
    mealsSaved: 189,
    foodWasteReduced: 142.3,
    peopleHelped: 98,
    co2Reduced: 213.45,
    donationsCompleted: 24
  },
  'user-3': {
    mealsSaved: 1543,
    foodWasteReduced: 1156.2,
    peopleHelped: 892,
    co2Reduced: 1734.3,
    donationsCompleted: 67
  },
  'user-5': {
    mealsSaved: 892,
    foodWasteReduced: 669.0,
    peopleHelped: 534,
    co2Reduced: 1003.5,
    donationsCompleted: 45
  }
};

// Overall platform impact
export const platformImpactStats: ImpactStats = {
  mealsSaved: 15847,
  foodWasteReduced: 11885.3,
  peopleHelped: 8932,
  co2Reduced: 17827.95,
  donationsCompleted: 892
};

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'New Request Received',
    message: 'Meena Kumari requested your Fresh Vegetable Surplus donation',
    type: 'info',
    read: false,
    createdAt: '2026-03-13T10:00:00Z',
    actionUrl: '/requests'
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    title: 'Donation Picked Up',
    message: 'Rahul Nair picked up your Home-Cooked Meals donation',
    type: 'success',
    read: false,
    createdAt: '2026-03-13T10:30:00Z'
  },
  {
    id: 'notif-3',
    userId: 'user-2',
    title: 'New Donation Available',
    message: 'Fresh Vegetable Surplus available 0.5 km away in MG Road',
    type: 'info',
    read: true,
    createdAt: '2026-03-13T09:00:00Z'
  }
];
