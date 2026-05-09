import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentUser } from '../utils/auth';
import { deliveriesAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Package, Navigation, CheckCircle2, Map, Loader2 } from 'lucide-react';
import { formatTimeAgo, getStatusColor } from '../utils/helpers';
import { toast } from 'sonner';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface DeliveryMapProps {
  delivery: any;
}

function DeliveryMap({ delivery }: DeliveryMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const pickup: [number, number] = [delivery.pickupLocation.lat, delivery.pickupLocation.lng];
    const dropoff: [number, number] = [delivery.deliveryLocation.lat, delivery.deliveryLocation.lng];
    const midLat = (pickup[0] + dropoff[0]) / 2;
    const midLng = (pickup[1] + dropoff[1]) / 2;

    const map = L.map(mapDivRef.current, {
      center: [midLat, midLng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.marker(pickup, { icon: blueIcon })
      .addTo(map)
      .bindPopup(`<strong>📦 Pickup</strong><br/>${delivery.pickupLocation.address}`)
      .openPopup();

    L.marker(dropoff, { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<strong>🏠 Delivery</strong><br/>${delivery.deliveryLocation.address}`);

    L.polyline([pickup, dropoff], { color: '#16a34a', weight: 3, dashArray: '6, 6', opacity: 0.8 }).addTo(map);

    map.fitBounds([pickup, dropoff], { padding: [40, 40] });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapDivRef} className="h-48 w-full rounded-lg overflow-hidden" />;
}

type DeliveryStatus = 'assigned' | 'picked_up' | 'in_transit' | 'delivered';

export function DeliveriesPage() {
  const user = getCurrentUser();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMap, setExpandedMap] = useState<string | null>(null);

  useEffect(() => {
    deliveriesAPI.getMy()
      .then(res => setDeliveries(res.deliveries || []))
      .catch(() => setDeliveries([]))
      .finally(() => setIsLoading(false));
  }, []);

  const updateDeliveryStatus = async (deliveryId: string, newStatus: DeliveryStatus) => {
    try {
      const res = await deliveriesAPI.updateStatus(deliveryId, newStatus);
      setDeliveries(prev =>
        prev.map(d => d.id === deliveryId ? { ...d, ...res.delivery } : d)
      );
      const statusMessages: Record<DeliveryStatus, string> = {
        assigned: 'Delivery assigned',
        picked_up: 'Food marked as picked up',
        in_transit: 'Delivery in transit',
        delivered: 'Delivery completed! Thank you for your service.',
      };
      toast.success(statusMessages[newStatus]);
    } catch {
      toast.error('Failed to update delivery status');
    }
  };

  const getNextAction = (status: DeliveryStatus) => {
    const actions: Record<DeliveryStatus, { label: string; nextStatus: DeliveryStatus } | null> = {
      assigned: { label: 'Mark as Picked Up', nextStatus: 'picked_up' },
      picked_up: { label: 'Start Delivery', nextStatus: 'in_transit' },
      in_transit: { label: 'Mark as Delivered', nextStatus: 'delivered' },
      delivered: null,
    };
    return actions[status];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Deliveries</h1>
        <p className="text-gray-600">Manage your volunteer delivery assignments in Bengaluru, Karnataka</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{deliveries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-orange-600">
                {deliveries.filter(d => d.status !== 'delivered').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {deliveries.filter(d => d.status === 'delivered').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">In Transit</p>
              <p className="text-3xl font-bold text-blue-600">
                {deliveries.filter(d => d.status === 'in_transit').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-green-500" />
          </div>
        ) : deliveries.length > 0 ? (
          deliveries.map((delivery) => {
            const nextAction = getNextAction(delivery.status as DeliveryStatus);
            const isCompleted = delivery.status === 'delivered';
            const isMapOpen = expandedMap === delivery.id;

            return (
              <Card key={delivery.id} className={isCompleted ? 'bg-gray-50' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{delivery.donationTitle}</h3>
                        <Badge className={`text-xs ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Assigned {formatTimeAgo(delivery.createdAt)}</p>
                      {delivery.completedAt && (
                        <p className="text-sm text-green-600">Completed {formatTimeAgo(delivery.completedAt)}</p>
                      )}
                    </div>
                    {isCompleted && <CheckCircle2 className="w-8 h-8 text-green-500" />}
                  </div>

                  {/* Route Information */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-900 mb-1">Pickup Location</p>
                        <p className="text-sm text-blue-800">{delivery.pickupLocation.address}</p>
                      </div>
                      <Button size="sm" variant="outline"
                        onClick={() => window.open(`https://www.openstreetmap.org/directions?from=&to=${delivery.pickupLocation.lat}%2C${delivery.pickupLocation.lng}`, '_blank')}>
                        <Navigation className="w-3 h-3 mr-1" />
                        Navigate
                      </Button>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-green-900 mb-1">Delivery Location</p>
                        <p className="text-sm text-green-800">{delivery.deliveryLocation.address}</p>
                      </div>
                      <Button size="sm" variant="outline"
                        onClick={() => window.open(`https://www.openstreetmap.org/directions?from=&to=${delivery.deliveryLocation.lat}%2C${delivery.deliveryLocation.lng}`, '_blank')}>
                        <Navigation className="w-3 h-3 mr-1" />
                        Navigate
                      </Button>
                    </div>
                  </div>

                  {/* Toggle Route Map */}
                  <Button
                    variant="outline" size="sm"
                    className="w-full mb-4 text-gray-600"
                    onClick={() => setExpandedMap(isMapOpen ? null : delivery.id)}
                  >
                    <Map className="w-4 h-4 mr-2" />
                    {isMapOpen ? 'Hide Route Map' : 'Show Route Map — Bengaluru'}
                  </Button>

                  {isMapOpen && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                      <DeliveryMap delivery={delivery} />
                    </div>
                  )}

                  {nextAction && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => updateDeliveryStatus(delivery.id, nextAction.nextStatus)}
                    >
                      {nextAction.label}
                    </Button>
                  )}

                  {isCompleted && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-sm text-green-700 font-medium">
                      ✓ Delivery Completed — Thank you for making a difference!
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries assigned</h3>
              <p className="text-gray-600 mb-4">Browse available donations and volunteer to deliver</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="/browse">Browse Donations</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Volunteer Tips */}
      {deliveries.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Volunteer Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-1.5"></span>
                Contact the donor before pickup to confirm availability
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-1.5"></span>
                Ensure food is properly packaged and stored during transport
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-1.5"></span>
                Deliver food promptly to maintain freshness and safety
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-1.5"></span>
                Be respectful and courteous to both donors and recipients
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
