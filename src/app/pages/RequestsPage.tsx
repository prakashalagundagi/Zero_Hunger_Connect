import { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Check, X, Clock, Package } from 'lucide-react';
import { formatTimeAgo, getStatusColor } from '../utils/helpers';
import { toast } from 'sonner';
import { FoodRequest } from '../types';
import { requestsAPI, donationsAPI } from '../services/api';

export function RequestsPage() {
  const user = getCurrentUser();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myDonationIds, setMyDonationIds] = useState<Set<string>>(new Set());

  // Fetch requests and the donor's own donation IDs in parallel
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [reqRes, donRes] = await Promise.all([
          requestsAPI.getAll(),
          donationsAPI.getMy(),
        ]);
        setRequests(reqRes.requests);
        setMyDonationIds(new Set(donRes.donations.map((d: any) => d.id)));
      } catch (err: any) {
        toast.error(err.message || 'Failed to load requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Separate requests: received (for my donations) vs sent (by me)
  const receivedRequests = requests.filter((r) => myDonationIds.has(r.donationId));
  const sentRequests = requests.filter((r) => r.receiverId === user?.id);

  const handleAccept = async (request: FoodRequest) => {
    try {
      const res = await requestsAPI.respond(request.id, 'accepted');
      // Update local state — also mark other pending requests for same donation as rejected
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === request.id) return res.request;
          if (r.donationId === request.donationId && r.status === 'pending') {
            return { ...r, status: 'rejected' as const };
          }
          return r;
        })
      );
      toast.success('Request accepted! The requester has been notified.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept request');
    }
  };

  const handleReject = async (request: FoodRequest) => {
    try {
      const res = await requestsAPI.respond(request.id, 'rejected');
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? res.request : r))
      );
      toast.success('Request declined.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline request');
    }
  };

  const RequestCard = ({ request, isReceived }: { request: FoodRequest; isReceived: boolean }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{request.donationTitle}</h3>
              <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                {request.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {isReceived ? 'Requested by:' : 'Your request to:'}{' '}
              <span className="font-medium">{request.receiverName}</span>
            </p>
            <p className="text-xs text-gray-500">{formatTimeAgo(request.createdAt)}</p>
          </div>
        </div>

        {request.message && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">{request.message}</p>
          </div>
        )}

        {isReceived && request.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleAccept(request)}
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700"
              onClick={() => handleReject(request)}
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {request.status === 'accepted' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✓ Request accepted{request.respondedAt && ` ${formatTimeAgo(request.respondedAt)}`}
          </div>
        )}

        {request.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            Request declined{request.respondedAt && ` ${formatTimeAgo(request.respondedAt)}`}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6 h-32">
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Food Requests</h1>
        <p className="text-gray-600">Manage donation requests</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={user?.role === 'donor' ? 'received' : 'sent'} className="space-y-6">
        <TabsList>
          {(user?.role === 'donor' || user?.role === 'ngo') && (
            <TabsTrigger value="received">
              Received ({receivedRequests.length})
            </TabsTrigger>
          )}
          {(user?.role === 'receiver' || user?.role === 'ngo') && (
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Received Requests */}
        {(user?.role === 'donor' || user?.role === 'ngo') && (
          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length > 0 ? (
              receivedRequests.map((request) => (
                <RequestCard key={request.id} request={request} isReceived={true} />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                  <p className="text-gray-600">When someone requests your donations, they'll appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Sent Requests */}
        {(user?.role === 'receiver' || user?.role === 'ngo') && (
          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <RequestCard key={request.id} request={request} isReceived={false} />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests sent</h3>
                  <p className="text-gray-600 mb-4">Browse available donations and send requests</p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <a href="/browse">Browse Donations</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => r.status === 'accepted').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Declined</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => r.status === 'rejected').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
