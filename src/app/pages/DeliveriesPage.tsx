import { useState } from 'react';
import { mockDeliveries } from '../data/mockData';
import { getCurrentUser } from '../utils/auth';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Package, Navigation, CheckCircle2 } from 'lucide-react';
import { formatTimeAgo, getStatusColor } from '../utils/helpers';
import { toast } from 'sonner';
import { Delivery, DeliveryStatus } from '../types';

export function DeliveriesPage() {
  const user = getCurrentUser();
  const [deliveries, setDeliveries] = useState(mockDeliveries);

  const userDeliveries = deliveries.filter(d => d.volunteerId === user?.id);

  const updateDeliveryStatus = (deliveryId: string, newStatus: DeliveryStatus) => {
    setDeliveries(prev =>
      prev.map(d =>
        d.id === deliveryId
          ? {
              ...d,
              status: newStatus,
              completedAt: newStatus === 'delivered' ? new Date().toISOString() : d.completedAt
            }
          : d
      )
    );

    const statusMessages: Record<DeliveryStatus, string> = {
      assigned: 'Delivery assigned',
      picked_up: 'Food marked as picked up',
      in_transit: 'Delivery in transit',
      delivered: 'Delivery completed! Thank you for your service.'
    };

    toast.success(statusMessages[newStatus]);
  };

  const getNextAction = (status: DeliveryStatus): { label: string; nextStatus: DeliveryStatus } | null => {
    const actions: Record<DeliveryStatus, { label: string; nextStatus: DeliveryStatus } | null> = {
      assigned: { label: 'Mark as Picked Up', nextStatus: 'picked_up' },
      picked_up: { label: 'Start Delivery', nextStatus: 'in_transit' },
      in_transit: { label: 'Mark as Delivered', nextStatus: 'delivered' },
      delivered: null
    };

    return actions[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Deliveries</h1>
        <p className="text-gray-600">Manage your volunteer delivery assignments</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{userDeliveries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-orange-600">
                {userDeliveries.filter(d => d.status !== 'delivered').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {userDeliveries.filter(d => d.status === 'delivered').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">In Transit</p>
              <p className="text-3xl font-bold text-blue-600">
                {userDeliveries.filter(d => d.status === 'in_transit').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {userDeliveries.length > 0 ? (
          userDeliveries.map((delivery) => {
            const nextAction = getNextAction(delivery.status);
            const isCompleted = delivery.status === 'delivered';

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
                    {/* Pickup Location */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-900 mb-1">Pickup Location</p>
                        <p className="text-sm text-blue-800">{delivery.pickupLocation.address}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${delivery.pickupLocation.lat},${delivery.pickupLocation.lng}`,
                            '_blank'
                          )
                        }
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Navigate
                      </Button>
                    </div>

                    {/* Delivery Location */}
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-green-900 mb-1">Delivery Location</p>
                        <p className="text-sm text-green-800">{delivery.deliveryLocation.address}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${delivery.deliveryLocation.lat},${delivery.deliveryLocation.lng}`,
                            '_blank'
                          )
                        }
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Navigate
                      </Button>
                    </div>
                  </div>

                  {/* Action Button */}
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
                      ✓ Delivery Completed - Thank you for making a difference!
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
      {userDeliveries.length > 0 && (
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
