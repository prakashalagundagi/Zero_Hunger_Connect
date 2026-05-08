import { Outlet, useLocation, Link } from 'react-router';
import { Home, Package, Search, Map, FileText, Truck, User, TrendingUp, BookOpen, Bell, LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '../utils/auth';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { mockNotifications } from '../data/mockData';

export function RootLayout() {
  const location = useLocation();
  const user = getCurrentUser();
  const unreadCount = mockNotifications.filter(n => n.userId === user?.id && !n.read).length;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Donate', href: '/donate', icon: Package, roles: ['donor', 'ngo'] },
    { name: 'Browse', href: '/browse', icon: Search },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Requests', href: '/requests', icon: FileText },
    { name: 'Deliveries', href: '/deliveries', icon: Truck, roles: ['volunteer'] },
    { name: 'Impact', href: '/impact', icon: TrendingUp },
    { name: 'Guidelines', href: '/guidelines', icon: BookOpen }
  ];

  const visibleNavigation = navigation.filter(
    item => !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-orange-500 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl text-gray-900">Zero Hunger Connect</h1>
                <p className="text-xs text-gray-500">Ending food waste, feeding hope</p>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-2 text-gray-600 hover:text-gray-900">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                  </div>
                  {mockNotifications
                    .filter(n => n.userId === user?.id)
                    .slice(0, 10)
                    .map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`cursor-pointer px-4 py-3 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-normal'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  {mockNotifications.filter(n => n.userId === user?.id).length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <img
                      src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto px-4 space-x-4 py-2 hide-scrollbar">
          {visibleNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="space-y-1 bg-white rounded-lg shadow-sm p-4">
              {visibleNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Page Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
