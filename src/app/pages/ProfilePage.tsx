import { getCurrentUser } from '../utils/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { formatDate, getRoleColor } from '../utils/helpers';
import { mockImpactStats } from '../data/mockData';

export function ProfilePage() {
  const user = getCurrentUser();
  const stats = mockImpactStats[user?.id || ''];

  if (!user) return null;

  const roleDescriptions: Record<string, string> = {
    donor: 'Helping reduce food waste by sharing surplus food',
    receiver: 'Receiving support from the community',
    volunteer: 'Delivering food and making a difference',
    ngo: 'Organizing community food distribution'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6 mb-6">
            <img
              src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={user.name}
              className="w-24 h-24 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <span className="text-sm text-gray-600">
                  Member since {formatDate(user.createdAt)}
                </span>
              </div>
              <p className="text-gray-600">{roleDescriptions[user.role]}</p>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label className="flex items-center text-gray-700">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Label>
              <Input value={user.email} disabled />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </Label>
              <Input value={user.phone} disabled />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2" />
                Address
              </Label>
              <Input value={user.location.address} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <CardTitle>Your Impact</CardTitle>
            </div>
            <CardDescription>The difference you've made</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-4xl font-bold text-green-700 mb-1">{stats.mealsSaved}</div>
                <p className="text-sm text-green-600 font-medium">Meals Saved</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-4xl font-bold text-blue-700 mb-1">{stats.peopleHelped}</div>
                <p className="text-sm text-blue-600 font-medium">People Helped</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-4xl font-bold text-orange-700 mb-1">
                  {stats.foodWasteReduced.toFixed(1)}
                  <span className="text-xl">kg</span>
                </div>
                <p className="text-sm text-orange-600 font-medium">Food Waste Reduced</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                <div className="text-4xl font-bold text-emerald-700 mb-1">
                  {stats.co2Reduced.toFixed(1)}
                  <span className="text-xl">kg</span>
                </div>
                <p className="text-sm text-emerald-600 font-medium">CO₂ Reduced</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-4xl font-bold text-purple-700 mb-1">{stats.donationsCompleted}</div>
                <p className="text-sm text-purple-600 font-medium">Donations Completed</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                <div className="text-4xl font-bold text-pink-700 mb-1">
                  {((stats.foodWasteReduced / 1000) * 2.5).toFixed(1)}
                </div>
                <p className="text-sm text-pink-600 font-medium">Trees Worth of CO₂</p>
              </div>
            </div>

            {/* Achievement Message */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-200">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    🎉 You're making a real difference!
                  </h4>
                  <p className="text-sm text-gray-700">
                    Your contributions have helped save {stats.mealsSaved} meals and prevented{' '}
                    {stats.foodWasteReduced.toFixed(0)}kg of food from going to waste. Together, we're building
                    a sustainable future and a hunger-free community.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your preferences and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates about donations and requests</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Location Services</h4>
              <p className="text-sm text-gray-600">Allow location access for nearby donations</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Privacy Settings</h4>
              <p className="text-sm text-gray-600">Control who can see your information</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
