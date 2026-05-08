import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getCurrentUser } from '../utils/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, Users, TrendingUp, Heart, Clock, MapPin, ArrowRight } from 'lucide-react';
import { formatTimeAgo, getFoodTypeColor, getStatusColor } from '../utils/helpers';
import { dashboardAPI } from '../services/api';
import { FoodDonation, FoodRequest, ImpactStats } from '../types';

interface DashboardData {
  userStats: ImpactStats;
  myDonations: FoodDonation[];
  myRequests: FoodRequest[];
  availableDonations: FoodDonation[];
}

const defaultStats: ImpactStats = {
  mealsSaved: 0,
  foodWasteReduced: 0,
  peopleHelped: 0,
  co2Reduced: 0,
  donationsCompleted: 0,
};

export function DashboardPage() {
  const user = getCurrentUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await dashboardAPI.getData();
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // Show empty state rather than crashing on error
        setData({
          userStats: defaultStats,
          myDonations: [],
          myRequests: [],
          availableDonations: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const userStats = data?.userStats || defaultStats;
  const myDonations = data?.myDonations || [];
  const myRequests = data?.myRequests || [];
  const availableDonations = data?.availableDonations || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-24">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-gray-600">
          {user?.role === 'donor' && "Thank you for helping reduce food waste and feed those in need."}
          {user?.role === 'volunteer' && "Your dedication to delivering food makes a real difference."}
          {user?.role === 'ngo' && "Together we're building a hunger-free community."}
          {user?.role === 'receiver' && "We're here to help connect you with available food resources."}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meals Saved</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.mealsSaved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">People Helped</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.peopleHelped}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Waste Reduced</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.foodWasteReduced.toFixed(0)}
                  <span className="text-sm text-gray-600">kg</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CO₂ Reduced</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.co2Reduced.toFixed(0)}
                  <span className="text-sm text-gray-600">kg</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* For Donors/NGOs: My Donations */}
        {(user?.role === 'donor' || user?.role === 'ngo') && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Donations</CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link to="/donate">
                    <Package className="w-4 h-4 mr-2" />
                    Donate Food
                  </Link>
                </Button>
              </div>
              <CardDescription>Track your food donations</CardDescription>
            </CardHeader>
            <CardContent>
              {myDonations.length > 0 ? (
                <div className="space-y-3">
                  {myDonations.slice(0, 3).map((donation) => (
                    <div key={donation.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{donation.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getFoodTypeColor(donation.foodType)}`}>
                            {donation.foodType}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(donation.status)}`}>
                            {donation.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(donation.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="link" className="w-full">
                    <Link to="/browse">
                      View all donations <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No donations yet</p>
                  <Button asChild size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                    <Link to="/donate">Post Your First Donation</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* For Volunteers: placeholder (deliveries not wired to backend yet) */}
        {user?.role === 'volunteer' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Deliveries</CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link to="/deliveries">View All</Link>
                </Button>
              </div>
              <CardDescription>Your delivery assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No active deliveries</p>
                <Button asChild size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                  <Link to="/browse">Browse Available Donations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Food Nearby */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Available Food Nearby</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link to="/map">View Map</Link>
              </Button>
            </div>
            <CardDescription>Fresh donations in your area</CardDescription>
          </CardHeader>
          <CardContent>
            {availableDonations.length > 0 ? (
              <div className="space-y-3">
                {availableDonations.map((donation) => (
                  <div key={donation.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{donation.title}</p>
                        <p className="text-sm text-gray-600">{donation.donorName}</p>
                      </div>
                      <Badge className={`text-xs ${getFoodTypeColor(donation.foodType)}`}>
                        {donation.foodType}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {donation.quantity} {donation.unit}
                      </span>
                      <span className="flex items-center text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(donation.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <Button asChild variant="link" className="w-full">
                  <Link to="/browse">
                    Browse all donations <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No donations available right now</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* For Receivers/NGOs: My Requests */}
        {(user?.role === 'receiver' || user?.role === 'ngo') && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Requests</CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link to="/requests">View All</Link>
                </Button>
              </div>
              <CardDescription>Your food requests</CardDescription>
            </CardHeader>
            <CardContent>
              {myRequests.length > 0 ? (
                <div className="space-y-3">
                  {myRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900">{request.donationTitle}</p>
                        <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{request.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(request.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No requests yet</p>
                  <Button asChild size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                    <Link to="/browse">Browse Available Food</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
