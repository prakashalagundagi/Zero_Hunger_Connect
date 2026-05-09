import { useState, useEffect } from 'react';
import { dashboardAPI, usersAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Leaf, Heart, Package, Award, Loader2 } from 'lucide-react';
import { getRoleColor } from '../utils/helpers';

const monthlyData = [
  { month: 'Sep', meals: 1243, waste: 932, people: 698 },
  { month: 'Oct', meals: 1456, waste: 1092, people: 823 },
  { month: 'Nov', meals: 1687, waste: 1265, people: 945 },
  { month: 'Dec', meals: 1834, waste: 1376, people: 1034 },
  { month: 'Jan', meals: 2145, waste: 1609, people: 1187 },
  { month: 'Feb', meals: 2398, waste: 1799, people: 1342 },
  { month: 'Mar', meals: 2584, waste: 1938, people: 1503 },
];

const foodTypeData = [
  { name: 'Prepared Food', value: 312, color: '#f97316' },
  { name: 'Fresh Produce', value: 267, color: '#10b981' },
  { name: 'Packaged Food', value: 189, color: '#3b82f6' },
  { name: 'Bakery Items', value: 98, color: '#f59e0b' },
  { name: 'Dairy Products', value: 26, color: '#06b6d4' },
];

export function ImpactPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState<'impact' | 'community'>('impact');

  useEffect(() => {
    dashboardAPI.getPlatformStats()
      .then(res => setStats(res.platformStats))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));

    usersAPI.getAll()
      .then(res => setUsers(res.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, []);

  const userRoleData = [
    { name: 'Donors', value: users.filter(u => u.role === 'donor').length },
    { name: 'Receivers', value: users.filter(u => u.role === 'receiver').length },
    { name: 'Volunteers', value: users.filter(u => u.role === 'volunteer').length },
    { name: 'NGOs', value: users.filter(u => u.role === 'ngo').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Impact</h1>
        <p className="text-gray-600">Real-time data — see the collective difference we're making in Bengaluru</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'impact' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('impact')}
        >
          Platform Impact
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'community' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('community')}
        >
          Community Members {!loadingUsers && `(${users.length})`}
        </button>
      </div>

      {activeTab === 'impact' && (
        <>
          {/* Key Metrics — live from MongoDB */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Total Meals Saved</p>
                    {loadingStats ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <p className="text-4xl font-bold">{(stats?.mealsSaved || 0).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8" />
                  </div>
                </div>
                <p className="text-green-100 text-sm">{stats?.totalDonations || 0} total donations</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">People Helped</p>
                    {loadingStats ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <p className="text-4xl font-bold">{(stats?.peopleHelped || 0).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8" />
                  </div>
                </div>
                <p className="text-blue-100 text-sm">{stats?.totalUsers || 0} registered users</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Food Waste Reduced</p>
                    {loadingStats ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <p className="text-4xl font-bold">
                        {((stats?.foodWasteReduced || 0) / 1000).toFixed(1)}
                        <span className="text-xl ml-1">tons</span>
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
                <p className="text-orange-100 text-sm">{stats?.donationsCompleted || 0} completed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-emerald-100 text-sm mb-1">CO₂ Reduced</p>
                    {loadingStats ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <p className="text-4xl font-bold">
                        {((stats?.co2Reduced || 0) / 1000).toFixed(1)}
                        <span className="text-xl ml-1">tons</span>
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Leaf className="w-8 h-8" />
                  </div>
                </div>
                <p className="text-emerald-100 text-sm">Live from database</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Growth over the past 7 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={2} name="Meals Saved" />
                    <Line type="monotone" dataKey="waste" stroke="#f97316" strokeWidth={2} name="Waste Reduced (kg)" />
                    <Line type="monotone" dataKey="people" stroke="#3b82f6" strokeWidth={2} name="People Helped" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Food Type Distribution</CardTitle>
                <CardDescription>Types of food donated this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={foodTypeData} cx="50%" cy="50%" labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80} fill="#8884d8" dataKey="value">
                      {foodTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Engagement</CardTitle>
                <CardDescription>Active users by role — live from database</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userRoleData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                      <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <CardTitle>Environmental Impact</CardTitle>
                </div>
                <CardDescription>Our contribution to sustainability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Equivalent Trees Planted</p>
                    <p className="text-2xl font-bold text-green-700">
                      {Math.round(((stats?.co2Reduced || 0) / 1000) * 45).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Water Saved</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {Math.round((stats?.foodWasteReduced || 0) * 2.5).toLocaleString()}L
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Landfill Space Saved</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {((stats?.foodWasteReduced || 0) / 1000).toFixed(1)} m³
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                <CardTitle>Community Milestones</CardTitle>
              </div>
              <CardDescription>Celebrating our collective achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{(stats?.mealsSaved || 0).toLocaleString()} Meals</h4>
                  <p className="text-sm text-gray-600">Saved across the platform</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">🌟</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{(stats?.totalUsers || 0).toLocaleString()}+ Users</h4>
                  <p className="text-sm text-gray-600">Active community members</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">🌱</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{((stats?.foodWasteReduced || 0) / 1000).toFixed(2)} Tons</h4>
                  <p className="text-sm text-gray-600">Food waste prevented</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'community' && (
        <div className="space-y-4">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-green-500" />
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No community members yet. Be the first to register!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-4 gap-3 mb-2">
                {['donor', 'volunteer', 'receiver', 'ngo'].map(role => (
                  <Card key={role} className="text-center">
                    <CardContent className="pt-4 pb-3">
                      <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === role).length}</p>
                      <p className="text-sm text-gray-500 capitalize">{role === 'ngo' ? 'NGOs' : role + 's'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{user.name}</h3>
                          <Badge className={`text-xs mt-0.5 ${getRoleColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1 truncate">{user.location?.address || 'Bengaluru, Karnataka'}</p>
                          {(user.role === 'donor' || user.role === 'ngo') && (
                            <p className="text-xs text-green-700 font-medium mt-1">
                              {user.donationsPosted} donation{user.donationsPosted !== 1 ? 's' : ''} posted
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
