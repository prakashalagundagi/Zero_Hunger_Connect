import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { getCurrentUser } from '../utils/auth';
import { FoodType } from '../types';
import { donationsAPI } from '../services/api';
import { AddressAutocomplete } from '../components/AddressAutocomplete';

export function DonatePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    foodType: '' as FoodType,
    quantity: '',
    unit: 'kg',
    pickupTimeStart: '',
    pickupTimeEnd: '',
    expiryDate: '',
    address: '',
    lat: 0,
    lng: 0,
  });
  const [addressVerified, setAddressVerified] = useState(false);

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, address, lat, lng }));
    setAddressVerified(lat !== 0 && lng !== 0);
  };

  const handleAddressChange = (address: string) => {
    setFormData((prev) => ({ ...prev, address, lat: 0, lng: 0 }));
    setAddressVerified(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressVerified || formData.lat === 0) {
      toast.error('Please select a verified pickup address from the suggestions.');
      return;
    }

    if (!formData.foodType) {
      toast.error('Please select a food type.');
      return;
    }

    setIsLoading(true);
    try {
      await donationsAPI.create({
        title: formData.title,
        description: formData.description,
        foodType: formData.foodType,
        quantity: formData.quantity,
        unit: formData.unit,
        pickupTimeStart: new Date(formData.pickupTimeStart).toISOString(),
        pickupTimeEnd: new Date(formData.pickupTimeEnd).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
      });

      toast.success('Food donation posted successfully! It is now visible on the map.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const foodTypes: { value: FoodType; label: string }[] = [
    { value: 'prepared', label: 'Prepared Food (cooked meals)' },
    { value: 'raw', label: 'Raw Food (ingredients)' },
    { value: 'packaged', label: 'Packaged Food (canned, sealed)' },
    { value: 'produce', label: 'Fresh Produce (fruits, vegetables)' },
    { value: 'bakery', label: 'Bakery Items (bread, pastries)' },
    { value: 'dairy', label: 'Dairy Products (milk, cheese)' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Post a Food Donation</CardTitle>
          <CardDescription>
            Share your surplus food with those in need. Please ensure all food is safe and properly stored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Donation Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Fresh Vegetable Surplus"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the food items, their condition, and any special instructions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Food Type */}
            <div className="space-y-2">
              <Label>Food Type *</Label>
              <Select
                value={formData.foodType}
                onValueChange={(value) => setFormData({ ...formData, foodType: value as FoodType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  {foodTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="10"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="servings">Servings</SelectItem>
                    <SelectItem value="items">Items</SelectItem>
                    <SelectItem value="portions">Portions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pickup Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupTimeStart">Pickup Available From *</Label>
                <Input
                  id="pickupTimeStart"
                  type="datetime-local"
                  value={formData.pickupTimeStart}
                  onChange={(e) => setFormData({ ...formData, pickupTimeStart: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupTimeEnd">Pickup Available Until *</Label>
                <Input
                  id="pickupTimeEnd"
                  type="datetime-local"
                  value={formData.pickupTimeEnd}
                  onChange={(e) => setFormData({ ...formData, pickupTimeEnd: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Best Before / Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>

            {/* Pickup Address — Nominatim autocomplete */}
            <div className="space-y-2">
              <Label>Pickup Address * <span className="text-xs text-gray-500 font-normal">(must be selected from suggestions)</span></Label>
              <AddressAutocomplete
                value={formData.address}
                onSelect={handleAddressSelect}
                onChange={handleAddressChange}
                placeholder="Search your address in Bengaluru, Karnataka..."
                required
              />
              {formData.lat !== 0 && (
                <p className="text-xs text-gray-400">
                  📍 Coordinates: {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Food Safety Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Food Safety Guidelines</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Ensure food is stored at proper temperature</li>
                <li>• Only donate food that is safe to consume</li>
                <li>• Clearly label any allergens</li>
                <li>• Package food items properly</li>
                <li>• Be available during pickup time</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isLoading || !formData.foodType || !addressVerified}
              >
                {isLoading ? 'Posting...' : 'Post Donation'}
              </Button>
            </div>

            {!addressVerified && formData.address.length > 0 && (
              <p className="text-xs text-center text-amber-600">
                ⚠ Select a verified address from the dropdown to enable posting
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
