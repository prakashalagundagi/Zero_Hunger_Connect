// Helper utilities
import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const formatDateTime = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
};

export const formatTimeAgo = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Haversine formula for calculating distance between two points
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

export const getFoodTypeColor = (foodType: string): string => {
  const colors: Record<string, string> = {
    prepared: 'bg-orange-100 text-orange-700',
    raw: 'bg-green-100 text-green-700',
    packaged: 'bg-blue-100 text-blue-700',
    produce: 'bg-emerald-100 text-emerald-700',
    bakery: 'bg-amber-100 text-amber-700',
    dairy: 'bg-cyan-100 text-cyan-700'
  };
  return colors[foodType] || 'bg-gray-100 text-gray-700';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    claimed: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-purple-100 text-purple-700',
    delivered: 'bg-teal-100 text-teal-700',
    expired: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-teal-100 text-teal-700',
    assigned: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-orange-100 text-orange-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    donor: 'bg-green-100 text-green-700',
    receiver: 'bg-blue-100 text-blue-700',
    volunteer: 'bg-purple-100 text-purple-700',
    ngo: 'bg-orange-100 text-orange-700'
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};
