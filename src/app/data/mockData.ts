// Mock data for Zero Hunger Connect
import { User, FoodDonation, FoodRequest, Delivery, ImpactStats, Notification } from '../types';

// Mock current user - can be changed to test different roles
export let currentUser: User = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  role: 'donor',
  phone: '+1 234 567 8900',
  location: {
    lat: 40.7128,
    lng: -74.0060,
    address: '123 Main St, New York, NY 10001'
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
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'volunteer',
    phone: '+1 234 567 8901',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: '456 Park Ave, New York, NY 10022'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'user-3',
    name: 'Hope Foundation',
    email: 'contact@hopefoundation.org',
    role: 'ngo',
    phone: '+1 234 567 8902',
    location: {
      lat: 40.7489,
      lng: -73.9680,
      address: '789 Charity Blvd, New York, NY 10016'
    },
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Hope Foundation',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'user-4',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    role: 'receiver',
    phone: '+1 234 567 8903',
    location: {
      lat: 40.7306,
      lng: -73.9352,
      address: '321 Community St, New York, NY 11101'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'user-5',
    name: 'Green Grocery Store',
    email: 'info@greengrocery.com',
    role: 'donor',
    phone: '+1 234 567 8904',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '555 Broadway, New York, NY 10012'
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
    donorName: 'Sarah Johnson',
    donorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    title: 'Fresh Vegetable Surplus',
    description: 'Assorted fresh vegetables from our garden - tomatoes, lettuce, carrots, and zucchini. Perfect for making healthy meals.',
    foodType: 'produce',
    quantity: 15,
    unit: 'kg',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY 10001'
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
    donorName: 'Green Grocery Store',
    donorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Green Grocery',
    title: 'Packaged Bread and Pastries',
    description: 'End-of-day bakery items including bread loaves, croissants, and muffins. All packaged and fresh.',
    foodType: 'bakery',
    quantity: 30,
    unit: 'items',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '555 Broadway, New York, NY 10012'
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
    donorName: 'Sarah Johnson',
    donorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    title: 'Home-Cooked Meals',
    description: 'Prepared vegetarian curry and rice for 20 people. Made fresh today with proper food safety standards.',
    foodType: 'prepared',
    quantity: 20,
    unit: 'servings',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY 10001'
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
    donorName: 'Green Grocery Store',
    donorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Green Grocery',
    title: 'Canned Goods Assortment',
    description: 'Various canned vegetables, soups, and beans nearing best-by date but still perfectly good.',
    foodType: 'packaged',
    quantity: 50,
    unit: 'cans',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '555 Broadway, New York, NY 10012'
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
    donorName: 'Green Grocery Store',
    donorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Green Grocery',
    title: 'Dairy Products',
    description: 'Milk, yogurt, and cheese approaching sell-by date. All refrigerated and safe to consume.',
    foodType: 'dairy',
    quantity: 25,
    unit: 'items',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '555 Broadway, New York, NY 10012'
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
    receiverName: 'Hope Foundation',
    donationId: 'donation-3',
    donationTitle: 'Home-Cooked Meals',
    status: 'accepted',
    message: 'We have a community kitchen serving 50 people today. This would be a great help!',
    createdAt: '2026-03-13T09:00:00Z',
    respondedAt: '2026-03-13T09:30:00Z'
  },
  {
    id: 'request-2',
    receiverId: 'user-4',
    receiverName: 'Maria Garcia',
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
    volunteerName: 'Mike Chen',
    donationId: 'donation-3',
    donationTitle: 'Home-Cooked Meals',
    pickupLocation: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY 10001'
    },
    deliveryLocation: {
      lat: 40.7489,
      lng: -73.9680,
      address: '789 Charity Blvd, New York, NY 10016'
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
    message: 'Maria Garcia requested your Fresh Vegetable Surplus donation',
    type: 'info',
    read: false,
    createdAt: '2026-03-13T10:00:00Z',
    actionUrl: '/requests'
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    title: 'Donation Picked Up',
    message: 'Mike Chen picked up your Home-Cooked Meals donation',
    type: 'success',
    read: false,
    createdAt: '2026-03-13T10:30:00Z'
  },
  {
    id: 'notif-3',
    userId: 'user-2',
    title: 'New Donation Available',
    message: 'Fresh Vegetable Surplus available 0.5 km away',
    type: 'info',
    read: true,
    createdAt: '2026-03-13T09:00:00Z'
  }
];
