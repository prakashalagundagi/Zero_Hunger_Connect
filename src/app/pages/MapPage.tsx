import { useState, useEffect, useRef } from 'react';
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

// Fix Leaflet default icon broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MapPage() {
  const user = getCurrentUser();
  const mapRef = useRef<L.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    user?.location?.lat || 12.9716,
    user?.location?.lng || 77.5946,
  ]);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch donations from real backend
  useEffect(() => {
    donationsAPI.getAll() // Get all donations regardless of status
      .then((res) => setDonations(res.donations || []))
      .catch(() => setDonations([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Refresh donations when page becomes visible (handles volunteer status updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        donationsAPI.getAll() // Get all donations regardless of status
          .then((res) => setDonations(res.donations || []))
          .catch(() => setDonations([]));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocationTracking(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        setUserLocation(newLocation);
        setIsLocationTracking(false);
        
        // Update map center if map exists
        if (mapRef.current) {
          mapRef.current.setView(newLocation, 15);
        }
      },
      (error) => {
        setIsLocationTracking(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while getting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Watch user's location for live tracking
  const startLiveTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already tracking
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        setUserLocation(newLocation);
        
        // Update map center if map exists
        if (mapRef.current) {
          mapRef.current.setView(newLocation, 15);
        }
        
        // Update user location marker
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLatLng(newLocation);
        }
      },
      (error) => {
        console.error('Live tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
    setIsLiveTracking(true);
  };

  // Stop live tracking
  const stopLiveTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
  };

  // Initialize map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: userLocation,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // User location marker
    if (user) {
      userLocationMarkerRef.current = L.marker(userLocation, { icon: blueIcon })
        .addTo(map)
        .bindPopup(`<strong>📍 Your Location</strong><br/>${user.name}`);
    }

    mapRef.current = map;

    // Start live tracking automatically
    startLiveTracking();

    return () => {
      stopLiveTracking();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add/update donation markers whenever donations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old donation markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    donations.forEach((donation) => {
      const marker = L.marker([donation.location.lat, donation.location.lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:160px">
            <strong style="font-size:13px">${donation.title}</strong><br/>
            <span style="color:#555;font-size:12px">${donation.donorName}</span><br/>
            <span style="color:#777;font-size:11px">${donation.location.address}</span>
          </div>
        `);

      marker.on('click', () => {
        setSelectedDonation(donation);
        map.flyTo([donation.location.lat, donation.location.lng], 15, { duration: 0.8 });
      });

      markersRef.current.push(marker);
    });
  }, [donations]);

  const handleSidebarSelect = (donation: FoodDonation) => {
    setSelectedDonation(donation);
    if (mapRef.current) {
      mapRef.current.flyTo([donation.location.lat, donation.location.lng], 15, { duration: 0.8 });
      // Open the corresponding popup
      const idx = donations.findIndex((d) => d.id === donation.id);
      if (idx >= 0 && markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
  };

  const donationsWithDistance = donations.map((d) => ({
    ...d,
    distance: calculateDistance(userLocation[0], userLocation[1], d.location.lat, d.location.lng),
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Food Donations Map</h1>
            <p className="text-gray-600">Live map of available food donations near you — Bengaluru, Karnataka</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isLocationTracking}
              className="flex items-center gap-2"
            >
              {isLocationTracking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Get Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={isLiveTracking ? stopLiveTracking : startLiveTracking}
              className={`flex items-center gap-2 ${
                isLiveTracking ? 'bg-red-50 text-red-600 border-red-200' : ''
              }`}
            >
              <MapPin className="w-4 h-4" />
              {isLiveTracking ? 'Stop Tracking' : 'Live Tracking'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (mapRef.current && userLocation) {
                  // Force map to update by using panTo and then setView
                  const map = mapRef.current;
                  const currentZoom = map.getZoom();
                  
                  // Use invalidateSize to force map recalculation
                  map.invalidateSize();
                  
                  // Pan to location with animation
                  map.flyTo(userLocation, currentZoom || 15, {
                    duration: 1.5
                  });
                }
              }}
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              My Location
            </Button>
          </div>
        </div>
        {locationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {locationError}
          </div>
        )}
        {isLiveTracking && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live location tracking is active
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative h-[600px]">
              {isLoading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              )}
              <div ref={mapDivRef} className="h-full w-full" />
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
                        onClick={() => handleSidebarSelect(donation)}
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
                  {formatDistance(calculateDistance(userLocation[0], userLocation[1], selectedDonation.location.lat, selectedDonation.location.lng))}
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
                onClick={() => {
                  const fromCoords = `${userLocation[0]},${userLocation[1]}`;
                  const toCoords = `${selectedDonation.location.lat},${selectedDonation.location.lng}`;
                  const toAddress = encodeURIComponent(selectedDonation.location.address);
                  
                  // Try Google Maps first, fallback to OpenStreetMap
                  const googleMapsUrl = `https://www.google.com/maps/dir/${fromCoords}/${toCoords}/`;
                  const osmUrl = `https://www.openstreetmap.org/directions?from=${fromCoords}&to=${toCoords}`;
                  
                  // Open Google Maps (more reliable)
                  window.open(googleMapsUrl, '_blank');
                }}
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
