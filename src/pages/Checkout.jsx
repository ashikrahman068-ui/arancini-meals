import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useCart } from '../components/cart/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ShoppingCart, 
  MapPin, 
  Calendar as CalendarIcon,
  CreditCard,
  Loader2,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    special_instructions: ''
  });

  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('morning');

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 50 ? 0 : 8.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      toast.error('Please log in to checkout');
      navigate(createPageUrl('Cart'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zip) {
      toast.error('Please fill in all delivery address fields');
      return false;
    }
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setProcessing(true);

    try {
      // Create order in database
      const orderData = {
        customer_email: user.email,
        status: 'pending',
        payment_status: 'pending',
        items: items.map(item => ({
          meal_id: item.id,
          meal_name: item.name,
          quantity: item.quantity,
          price_per_item: item.price,
          nutrition: item.nutrition
        })),
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        delivery_address: deliveryAddress,
        delivery_date: format(deliveryDate, 'yyyy-MM-dd'),
        delivery_time_slot: deliveryTimeSlot,
        order_number: `ORD-${Date.now()}`
      };

      const order = await base44.entities.Order.create(orderData);

      // Prepare items for Stripe checkout
      const checkoutItems = items.map(item => {
        const checkoutItem = {
          name: item.name,
          description: item.description || item.name || 'Meal item',
          price: item.price,
          quantity: item.quantity
        };
        
        // Only include image_url if it's a valid HTTP(S) URL
        if (item.image_url && (item.image_url.startsWith('http://') || item.image_url.startsWith('https://'))) {
          checkoutItem.image_url = item.image_url;
        }
        
        return checkoutItem;
      });

      // Add delivery fee if applicable
      if (deliveryFee > 0) {
        checkoutItems.push({
          name: 'Delivery Fee',
          description: 'Standard delivery',
          price: deliveryFee,
          quantity: 1
        });
      }

      // Add tax
      checkoutItems.push({
        name: 'Tax',
        description: 'Sales tax',
        price: tax,
        quantity: 1
      });

      // Create Stripe checkout session
      const response = await base44.functions.invoke('createCheckout', {
        items: checkoutItems,
        mode: 'payment',
        orderId: order.id,
        metadata: {
          delivery_date: format(deliveryDate, 'yyyy-MM-dd'),
          delivery_time_slot: deliveryTimeSlot
        }
      });

      console.log('Checkout response:', response);

      // Check if response has url property
      if (response?.url) {
        // Clear cart before redirecting
        clearCart();
        
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else if (response?.error) {
        throw new Error(response.error);
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response from payment provider. Please try again.');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      console.error('Error details:', JSON.stringify(error));
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to process checkout. Please try again.';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (items.length === 0) {
    navigate(createPageUrl('Cart'));
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(createPageUrl('Cart'))}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={deliveryAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="Sydney"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={deliveryAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="NSW"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zip">Postal Code</Label>
                  <Input
                    id="zip"
                    value={deliveryAddress.zip}
                    onChange={(e) => handleAddressChange('zip', e.target.value)}
                    placeholder="2000"
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    value={deliveryAddress.special_instructions}
                    onChange={(e) => handleAddressChange('special_instructions', e.target.value)}
                    placeholder="e.g., Leave at front door"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Delivery Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Preferred Time Slot</Label>
                  <RadioGroup value={deliveryTimeSlot} onValueChange={setDeliveryTimeSlot}>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="morning" id="morning" />
                      <Label htmlFor="morning" className="flex-1 cursor-pointer">
                        Morning (8AM - 12PM)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="afternoon" id="afternoon" />
                      <Label htmlFor="afternoon" className="flex-1 cursor-pointer">
                        Afternoon (12PM - 5PM)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value="evening" id="evening" />
                      <Label htmlFor="evening" className="flex-1 cursor-pointer">
                        Evening (5PM - 9PM)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">FREE</Badge>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>

                {/* Free Delivery Notice */}
                {deliveryFee > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    Add ${(50 - subtotal).toFixed(2)} more for free delivery!
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Secure payment powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}