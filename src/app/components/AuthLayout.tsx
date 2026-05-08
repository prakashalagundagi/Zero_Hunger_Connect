import { Outlet } from 'react-router';
import { Package } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-orange-500 rounded-full mb-4">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Zero Hunger Connect</h1>
          <p className="text-gray-600">Ending food waste, feeding hope</p>
        </div>

        {/* Auth Form */}
        <Outlet />
      </div>
    </div>
  );
}
