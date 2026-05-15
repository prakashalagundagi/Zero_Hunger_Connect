import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Search, MapPin, Clock, Package, AlertTriangle } from 'lucide-react';
import { formatTimeAgo, formatDateTime, getFoodTypeColor, getStatusColor, calculateDistance, formatDistance } from '../utils/helpers';
import { toast } from 'sonner';
import { FoodDonation, DonationStatus } from '../types';
import { donationsAPI, requestsAPI } from '../services/api';

export function BrowsePage() {
  const user = getCurrentUser();
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [isLoadingDonations, setIsLoadingDonations] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<DonationStatus | 'all'>('all');
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Fetch donations from the backend
  const fetchDonations = useCallback(async () => {
    setIsLoadingDonations(true);
    try {
      const res = await donationsAPI.getAll({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        foodType: filterType !== 'all' ? filterType : undefined,
        search: searchTerm || undefined,
      });
      setDonations(res.donations);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load donations');
    } finally {
      setIsLoadingDonations(false);
    }
  }, [filterStatus, filterType, searchTerm]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Sort donations by distance from user's location
  const sortedDonations = donations
    .map((donation) => ({
      ...donation,
      distance: calculateDistance(
        user?.location.lat || 0,
        user?.location.lng || 0,
        donation.location.lat,
        donation.location.lng
      )
    }))
    .sort((a, b) => a.distance - b.distance);

  const handleRequest = async () => {
    if (!selectedDonation) return;
    setIsSubmittingRequest(true);

    try {
      await requestsAPI.create(selectedDonation.id, requestMessage);
      toast.success('Food request submitted successfully!');
      setShowRequestDialog(false);
      setRequestMessage('');
      setSelectedDonation(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleVolunteer = async (donation: FoodDonation) => {
    try {
      setIsSubmittingRequest(true);
      
      // Use the dedicated volunteer-claim endpoint (not the donor-only status endpoint)
      await donationsAPI.volunteerClaim(donation.id);
      
      toast.success(`You've volunteered to deliver "${donation.title}"`);
      
      // Refresh donations list to show updated status
      setDonations(prev => 
        prev.map(d => 
          d.id === donation.id 
            ? { ...d, status: 'claimed' as const, claimedBy: user?.id, volunteerId: user?.id }
            : d
        )
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to volunteer for delivery');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Food Donations</h1>
        <p className="text-gray-600">Discover available food in your area</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Food Type Filter */}
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Food Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="prepared">Prepared Food</SelectItem>
                  <SelectItem value="raw">Raw Food</SelectItem>
                  <SelectItem value="packaged">Packaged Food</SelectItem>
                  <SelectItem value="produce">Fresh Produce</SelectItem>
                  <SelectItem value="bakery">Bakery Items</SelectItem>
                  <SelectItem value="dairy">Dairy Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as DonationStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {isLoadingDonations ? 'Loading...' : `Found ${sortedDonations.length} donation${sortedDonations.length !== 1 ? 's' : ''}`}
      </div>

      {/* Loading State */}
      {isLoadingDonations && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Donations Grid */}
      {!isLoadingDonations && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDonations.map((donation) => (
            <Card key={donation.id} className={`transition-shadow ${donation.status === 'expired' ? 'opacity-60' : 'hover:shadow-lg'}`}>
              <CardContent className="pt-6">
                {donation.status === 'expired' && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>This donation listing has expired</span>
                  </div>
                )}
                {/* Donor Info */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={donation.donorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donation.donorName}`}
                    alt={donation.donorName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{donation.donorName}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(donation.createdAt)}</p>
                  </div>
                </div>

                {/* Title and Badges */}
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{donation.title}</h3>
                <div className="flex gap-2 mb-3">
                  <Badge className={`text-xs ${getFoodTypeColor(donation.foodType)}`}>
                    {donation.foodType}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(donation.status)}`}>
                    {donation.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{donation.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-2" />
                    {donation.quantity} {donation.unit}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {formatDistance((donation as any).distance)} away
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Pickup: {formatDateTime(donation.pickupTimeStart)}
                  </div>
                </div>

                {/* Actions */}
                {donation.status === 'available' && (
                  <div className="flex gap-2">
                    {(user?.role === 'receiver' || user?.role === 'ngo') && (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedDonation(donation);
                          setShowRequestDialog(true);
                        }}
                      >
                        Request
                      </Button>
                    )}
                    {user?.role === 'volunteer' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleVolunteer(donation)}
                      >
                        Volunteer to Deliver
                      </Button>
                    )}
                    {user?.role === 'donor' && user.id !== donation.donorId && (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedDonation(donation);
                          setShowRequestDialog(true);
                        }}
                      >
                        Request
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingDonations && sortedDonations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later</p>
          </CardContent>
        </Card>
      )}

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Food Donation</DialogTitle>
            <DialogDescription>
              Send a request to {selectedDonation?.donorName} for their food donation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDonation && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedDonation.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Quantity: {selectedDonation.quantity} {selectedDonation.unit}</p>
                  <p>Pickup: {formatDateTime(selectedDonation.pickupTimeStart)}</p>
                  <p>Location: {selectedDonation.location.address}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell the donor why you need this food and any special arrangements..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleRequest}
              disabled={isSubmittingRequest}
            >
              {isSubmittingRequest ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
