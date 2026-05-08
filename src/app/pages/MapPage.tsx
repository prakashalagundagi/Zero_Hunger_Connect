import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentUser } from '../utils/auth';
import { donationsAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Package, Clock, Navigation, Loader2 } from 'lucide-react';
import { formatDateTime, getFoodTypeColor, calculateDistance, formatDistance } from '../utils/helpers';
import { FoodDonation } from '../types';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green icon for donations
const donationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom blue icon for current user
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Fly to selected donation marker
function FlyToMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

export function MapPage() {
  const user = getCurrentUser();
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  const center: [number, number] = [
    user?.location.lat || 12.9716,
    user?.location.lng || 77.5946,
  ];

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await donationsAPI.getAll({ status: 'available' });
        setDonations(res.donations || []);
      } catch {
        setDonations([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const donationsWithDistance = donations.map((d) => ({
    ...d,
    distance: calculateDistance(
      center[0], center[1],
      d.location.lat, d.location.lng
    ),
  }));

  const handleSelect = (donation: FoodDonation) => {
    setSelectedDonation(donation);
    setFlyTo([donation.location.lat, donation.location.lng]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Food Donations Map</h1>
        <p className="text-gray-600">Live map of available food donations near you (Bengaluru, Karnataka)</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="h-[600px] w-full relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              )}
              <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location marker */}
                {user && (
                  <Marker position={center} icon={userIcon}>
                    <Popup>
                      <div className="text-sm font-medium">📍 Your Location<br />{user.name}</div>
                    </Popup>
                  </Marker>
                )}

                {/* Donation markers */}
                {donationsWithDistance.map((donation) => (
                  <Marker
                    key={donation.id}
                    position={[donation.location.lat, donation.location.lng]}
                    icon={donationIcon}
                    eventHandlers={{ click: () => handleSelect(donation) }}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-semibold text-gray-900 mb-1">{donation.title}</p>
                        <p className="text-xs text-gray-600 mb-1">{donation.donorName}</p>
                        <p className="text-xs text-gray-500 mb-2">{donation.location.address}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getFoodTypeColor(donation.foodType)}`}>
                          {donation.foodType}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                <FlyToMarker position={flyTo} />
              </MapContainer>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Available Donations ({donationsWithDistance.length})
                </h3>
              </div>
              <div className="max-h-[536px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading donations...</p>
                  </div>
                ) : donationsWithDistance.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {donationsWithDistance.map((donation) => (
                      <div
                        key={donation.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedDonation?.id === donation.id ? 'bg-green-50' : ''
                        }`}
                        onClick={() => handleSelect(donation)}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={donation.donorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donation.donorName}`}
                            alt={donation.donorName}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm mb-0.5 line-clamp-1">
                              {donation.title}
                            </h4>
                            <p className="text-xs text-gray-500 mb-1">{donation.donorName}</p>
                            <Badge className={`text-xs mb-1 ${getFoodTypeColor(donation.foodType)}`}>
                              {donation.foodType}
                            </Badge>
                            <div className="space-y-0.5">
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                {formatDistance(donation.distance)} away
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Package className="w-3 h-3 mr-1 flex-shrink-0" />
                                {donation.quantity} {donation.unit}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No available donations right now</p>
                    <p className="text-gray-400 text-xs mt-1">Check back soon!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Donation Detail */}
      {selectedDonation && (
        <Card className="bg-gradient-to-r from-green-50 to-orange-50 border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedDonation.donorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDonation.donorName}`}
                  alt={selectedDonation.donorName}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedDonation.title}</h3>
                  <p className="text-gray-700 font-medium">{selectedDonation.donorName}</p>
                  <Badge className={`mt-1 ${getFoodTypeColor(selectedDonation.foodType)}`}>
                    {selectedDonation.foodType}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDonation(null)}>✕</Button>
            </div>

            <p className="text-gray-700 mb-4">{selectedDonation.description}</p>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Quantity</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{selectedDonation.quantity} {selectedDonation.unit}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Distance</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatDistance(calculateDistance(center[0], center[1], selectedDonation.location.lat, selectedDonation.location.lng))}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Pickup From</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(selectedDonation.pickupTimeStart)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <Navigation className="w-4 h-4 mr-2 mt-0.5 text-gray-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-0.5">Pickup Location</p>
                  <p className="text-gray-900 text-sm">{selectedDonation.location.address}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() =>
                  window.open(
                    `https://www.openstreetmap.org/directions?from=&to=${selectedDonation.location.lat}%2C${selectedDonation.location.lng}`,
                    '_blank'
                  )
                }
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
              {(user?.role === 'receiver' || user?.role === 'ngo') && (
                <Button className="flex-1" variant="outline">
                  Request Food
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
