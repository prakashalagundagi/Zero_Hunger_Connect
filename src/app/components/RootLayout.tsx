import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router';
import { Home, Package, Search, Map, FileText, Truck, User, TrendingUp, BookOpen, Bell, LogOut, CheckCheck, Trash2, Gift, MessageSquare, CheckCircle, XCircle, Bike } from 'lucide-react';
import { getCurrentUser, logout } from '../utils/auth';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { notificationsAPI } from '../services/api';
import { formatTimeAgo } from '../utils/helpers';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: string;
}

const typeIcon: Record<string, JSX.Element> = {
  new_donation: <Gift className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />,
  request_received: <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />,
  request_accepted: <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />,
  request_rejected: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />,
  delivery_assigned: <Bike className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />,
  delivery_completed: <CheckCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />,
};

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // Silently fail — don't disrupt the UI if notifications can't load
    }
  }, []);

  // Initial fetch + poll every 30 seconds for new notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // When the dropdown opens, mark all as read after a short delay
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      // Optimistically clear badge immediately
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      try {
        await notificationsAPI.markAllAsRead();
      } catch {
        // Best-effort
      }
    }
  };

  const handleClearAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Donate', href: '/donate', icon: Package, roles: ['donor', 'ngo'] },
    { name: 'Browse', href: '/browse', icon: Search },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Requests', href: '/requests', icon: FileText },
    { name: 'Deliveries', href: '/deliveries', icon: Truck, roles: ['volunteer'] },
    { name: 'Impact', href: '/impact', icon: TrendingUp },
    { name: 'Guidelines', href: '/guidelines', icon: BookOpen },
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
              {/* Notifications Bell */}
              <DropdownMenu open={open} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-2 text-gray-600 hover:text-gray-900">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 max-h-[480px] overflow-hidden flex flex-col p-0">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <div>
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-500">
                        {notifications.length === 0 ? 'All caught up!' : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                        onClick={handleClearAll}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">You'll be notified when donations are posted or requests are updated</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`cursor-pointer px-4 py-3 border-b border-gray-100 last:border-0 focus:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="mt-0.5">
                              {typeIcon[notification.type] ?? <Bell className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
