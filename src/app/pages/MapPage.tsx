import { useState } from 'react';
import { mockDonations } from '../data/mockData';
import { getCurrentUser } from '../utils/auth';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Package, Clock, Navigation, X } from 'lucide-react';
import { formatDateTime, getFoodTypeColor, calculateDistance, formatDistance } from '../utils/helpers';
import { FoodDonation } from '../types';

export function MapPage() {
  const user = getCurrentUser();
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [mapCenter] = useState({
    lat: user?.location.lat || 40.7128,
    lng: user?.location.lng || -74.0060
  });

  // Filter only available donations
  const availableDonations = mockDonations
    .filter(d => d.status === 'available')
    .map(donation => ({
      ...donation,
      distance: calculateDistance(
        user?.location.lat || 0,
        user?.location.lng || 0,
        donation.location.lat,
        donation.location.lng
      )
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Food Donations Map</h1>
        <p className="text-gray-600">View available food donations near you</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative bg-gradient-to-br from-green-100 to-blue-100 h-[600px] flex items-center justify-center">
              {/* Simulated Map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Grid lines to simulate map */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-8 grid-rows-8 h-full">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="border border-gray-400"></div>
                      ))}
                    </div>
                  </div>

                  {/* User Location Marker */}
                  <div
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        You
                      </div>
                    </div>
                  </div>

                  {/* Donation Markers */}
                  {availableDonations.map((donation, index) => {
                    // Calculate position relative to user (simplified)
                    const offsetX = (donation.location.lng - mapCenter.lng) * 1000;
                    const offsetY = -(donation.location.lat - mapCenter.lat) * 1000;
                    const isSelected = selectedDonation?.id === donation.id;

                    return (
                      <div
                        key={donation.id}
                        className="absolute cursor-pointer transition-transform hover:scale-110"
                        style={{
                          left: `calc(50% + ${offsetX}px)`,
                          top: `calc(50% + ${offsetY}px)`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => setSelectedDonation(donation)}
                      >
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                            isSelected ? 'bg-orange-500 ring-4 ring-orange-200' : 'bg-green-500'
                          }`}>
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          {isSelected && (
                            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium shadow-lg">
                              {donation.title.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-700">Your Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-700">Food Donation</span>
                    </div>
                  </div>

                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg">
                    <button className="p-3 hover:bg-gray-100 border-b border-gray-200">+</button>
                    <button className="p-3 hover:bg-gray-100">-</button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Donation List */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Nearby Donations ({availableDonations.length})
                </h3>
              </div>
              <div className="max-h-[536px] overflow-y-auto">
                {availableDonations.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {availableDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedDonation?.id === donation.id ? 'bg-green-50' : ''
                        }`}
                        onClick={() => setSelectedDonation(donation)}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={donation.donorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={donation.donorName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                              {donation.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">{donation.donorName}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              <Badge className={`text-xs ${getFoodTypeColor(donation.foodType)}`}>
                                {donation.foodType}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                {formatDistance(donation.distance)} away
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <Package className="w-3 h-3 mr-1" />
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
                    <p className="text-gray-500 text-sm">No donations nearby</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Donation Details */}
      {selectedDonation && (
        <Card className="bg-gradient-to-r from-green-50 to-orange-50 border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedDonation.donorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={selectedDonation.donorName}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedDonation.title}</h3>
                  <p className="text-gray-700 font-medium">{selectedDonation.donorName}</p>
                  <Badge className={`mt-2 ${getFoodTypeColor(selectedDonation.foodType)}`}>
                    {selectedDonation.foodType}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDonation(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-gray-700 mb-4">{selectedDonation.description}</p>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Quantity</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {selectedDonation.quantity} {selectedDonation.unit}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Distance</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatDistance(selectedDonation.distance)}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Pickup</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(selectedDonation.pickupTimeStart)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <Navigation className="w-4 h-4 mr-2 mt-0.5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pickup Location</p>
                  <p className="text-gray-900">{selectedDonation.location.address}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`https://maps.google.com/?q=${selectedDonation.location.lat},${selectedDonation.location.lng}`, '_blank')}
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
