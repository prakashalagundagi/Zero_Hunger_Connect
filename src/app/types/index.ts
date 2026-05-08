// Type definitions for Zero Hunger Connect

export type UserRole = 'donor' | 'receiver' | 'volunteer' | 'ngo';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  avatar?: string;
  createdAt: string;
}

export type FoodType = 'prepared' | 'raw' | 'packaged' | 'produce' | 'bakery' | 'dairy';
export type DonationStatus = 'available' | 'claimed' | 'picked_up' | 'delivered' | 'expired';

export interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorAvatar?: string;
  title: string;
  description: string;
  foodType: FoodType;
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
  status: DonationStatus;
  image?: string;
  createdAt: string;
  claimedBy?: string;
  volunteerId?: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface FoodRequest {
  id: string;
  receiverId: string;
  receiverName: string;
  donationId: string;
  donationTitle: string;
  status: RequestStatus;
  message: string;
  createdAt: string;
  respondedAt?: string;
}

export type DeliveryStatus = 'assigned' | 'picked_up' | 'in_transit' | 'delivered';

export interface Delivery {
  id: string;
  volunteerId: string;
  volunteerName: string;
  donationId: string;
  donationTitle: string;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  status: DeliveryStatus;
  createdAt: string;
  completedAt?: string;
}

export interface ImpactStats {
  mealsSaved: number;
  foodWasteReduced: number; // in kg
  peopleHelped: number;
  co2Reduced: number; // in kg
  donationsCompleted: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
