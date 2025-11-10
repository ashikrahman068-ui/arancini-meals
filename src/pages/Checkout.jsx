import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/cart/CartContext';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, Lock, CreditCard, Truck, Calendar } from 'lucide-react';

export default function Checkout() {
  const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    specialInstructions: ''
  });

  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvc: ''
  });

  const [deliveryOptions, setDeliveryOptions] = useState({
    date: '',
    timeSlot: 'morning'
  });

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 50 ? 0 : 7.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    setIsLoading(true);
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setDeliveryInfo({
          fullName: user.full_name || '',
          phone: user.phone || '',
          street: user.delivery_addresses?.[0]?.street || '',
          city: user.delivery_addresses?.[0]?.city || '',
          state: user.delivery_addresses?.[0]?.state || '',
          zip: user.delivery_addresses?.[0]?.zip || '',
          specialInstructions: ''
        });
      } catch (e) {
        toast.error("You must be logged in to checkout.");
        navigate(createPageUrl("Cart"));
      } finally {
        setIsLoading(false);
      }
    };

    if (cartItems.length === 0) {
      toast.info("Your cart is empty. Add some meals to checkout.");
      navigate(createPageUrl("Meals"));
    } else {
      fetchUser();
    }
  }, [cartItems, navigate]);

  const handleDeliveryChange = (field, value) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (field, value) => {
    setCardInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleDeliveryOptionChange = (field, value) => {
    setDeliveryOptions(prev => ({ ...prev, [field]: value }));
  };

  const generateOrderNumber = () => {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    
    if (!deliveryInfo.fullName || !deliveryInfo.street || !deliveryInfo.city || !deliveryInfo.state || !deliveryInfo.zip) {
      toast.error("Please fill in all delivery address fields.");
      setIsPlacingOrder(false);
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardInfo.cardNumber || !cardInfo.cardName || !cardInfo.expiryDate || !cardInfo.cvc) {
        toast.error("Please fill in all card details.");
        setIsPlacingOrder(false);
        return;
      }
    }

    const orderItems = cartItems.map(item => ({
      meal_id: item.id,
      meal_name: item.name,
      quantity: item.quantity,
      price_per_item: item.price,
    }));
    
    const paymentMethodText = paymentMethod === 'card' 
      ? `Card **** ${cardInfo.cardNumber.slice(-4)}` 
      : paymentMethod === 'afterpay' 
      ? 'Afterpay' 
      : 'PayPal';

    const orderData = {
      order_number: generateOrderNumber(),
      customer_email: currentUser.email,
      items: orderItems,
      subtotal,
      tax,
      delivery_fee: deliveryFee,
      total,
      delivery_address: {
        street: deliveryInfo.street,
        city: deliveryInfo.city,
        state: deliveryInfo.state,
        zip: deliveryInfo.zip,
        special_instructions: deliveryInfo.specialInstructions
      },
      delivery_date: deliveryOptions.date || new Date().toISOString().split('T')[0],
      delivery_time_slot: deliveryOptions.timeSlot,
      payment_method: paymentMethodText,
      payment_status: "paid",
      status: "confirmed",
      notes: deliveryInfo.specialInstructions
    };

    try {
      const newOrder = await base44.entities.Order.create(orderData);
      
      if (currentUser && (!currentUser.delivery_addresses || currentUser.delivery_addresses.length === 0)) {
        await base44.auth.updateMe({
          delivery_addresses: [{
            label: "Home",
            street: deliveryInfo.street,
            city: deliveryInfo.city,
            state: deliveryInfo.state,
            zip: deliveryInfo.zip,
            is_default: true
          }],
          phone: deliveryInfo.phone
        });
      }

      toast.success("Order placed successfully!");
      clearCart();
      navigate(createPageUrl(`OrderSuccess?orderId=${newOrder.id}`));
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error("There was an issue placing your order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gray-600" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input 
                      id="fullName" 
                      value={deliveryInfo.fullName} 
                      onChange={(e) => handleDeliveryChange('fullName', e.target.value)}
                      placeholder="John Doe"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      value={deliveryInfo.phone} 
                      onChange={(e) => handleDeliveryChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input 
                      id="street" 
                      value={deliveryInfo.street} 
                      onChange={(e) => handleDeliveryChange('street', e.target.value)}
                      placeholder="123 Main Street"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input 
                      id="city" 
                      value={deliveryInfo.city} 
                      onChange={(e) => handleDeliveryChange('city', e.target.value)}
                      placeholder="Sydney"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input 
                      id="state" 
                      value={deliveryInfo.state} 
                      onChange={(e) => handleDeliveryChange('state', e.target.value)}
                      placeholder="NSW"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">Postal Code *</Label>
                    <Input 
                      id="zip" 
                      value={deliveryInfo.zip} 
                      onChange={(e) => handleDeliveryChange('zip', e.target.value)}
                      placeholder="2000"
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="specialInstructions">Special Delivery Instructions</Label>
                    <Textarea 
                      id="specialInstructions" 
                      value={deliveryInfo.specialInstructions} 
                      onChange={(e) => handleDeliveryChange('specialInstructions', e.target.value)}
                      placeholder="Leave at front door, ring doorbell, etc."
                      className="h-20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Delivery Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryDate">Preferred Delivery Date</Label>
                    <Input 
                      id="deliveryDate" 
                      type="date"
                      value={deliveryOptions.date} 
                      onChange={(e) => handleDeliveryOptionChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeSlot">Delivery Time Slot</Label>
                    <Select value={deliveryOptions.timeSlot} onValueChange={(value) => handleDeliveryOptionChange('timeSlot', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentMethod('card')}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="flex items-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                      </div>
                      <span className="font-semibold">Credit / Debit Card</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentMethod('afterpay')}>
                    <RadioGroupItem value="afterpay" id="afterpay" />
                    <Label htmlFor="afterpay" className="flex items-center gap-3 cursor-pointer flex-1">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Afterpay_logo.svg" alt="Afterpay" className="h-6" />
                      <span className="font-semibold">Afterpay</span>
                      <span className="text-sm text-gray-500">Pay in 4 interest-free installments</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentMethod('paypal')}>
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                      <span className="font-semibold">PayPal</span>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 mt-6 p-6 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Card Details</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input 
                          id="cardNumber" 
                          placeholder="1234 5678 9012 3456"
                          value={cardInfo.cardNumber}
                          onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card *</Label>
                        <Input 
                          id="cardName" 
                          placeholder="John Doe"
                          value={cardInfo.cardName}
                          onChange={(e) => handleCardChange('cardName', e.target.value)}
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input 
                            id="expiryDate" 
                            placeholder="MM/YY"
                            value={cardInfo.expiryDate}
                            onChange={(e) => handleCardChange('expiryDate', e.target.value)}
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC *</Label>
                          <Input 
                            id="cvc" 
                            placeholder="123"
                            value={cardInfo.cvc}
                            onChange={(e) => handleCardChange('cvc', e.target.value)}
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Afterpay Info */}
                {paymentMethod === 'afterpay' && (
                  <div className="p-6 bg-mint-50 rounded-lg border border-mint-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Pay with Afterpay</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Split your purchase into 4 equal payments, due every 2 weeks. No interest, no fees when you pay on time.
                    </p>
                    <div className="flex items-center justify-between text-sm bg-white p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Today</p>
                        <p className="text-gray-600">${(total / 4).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Week 2</p>
                        <p className="text-gray-600">${(total / 4).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Week 4</p>
                        <p className="text-gray-600">${(total / 4).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Week 6</p>
                        <p className="text-gray-600">${(total / 4).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Info */}
                {paymentMethod === 'paypal' && (
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Pay with PayPal</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      You'll be redirected to PayPal to complete your purchase securely.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      <span>Secure payment processing through PayPal</span>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 flex items-center gap-2 pt-2 bg-green-50 p-3 rounded-lg">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span>Your payment information is secure and encrypted. We use industry-standard SSL protection.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-md object-cover"/>
                        <div>
                          <p className="font-semibold line-clamp-1">{item.name}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  {subtotal < 50 && (
                    <div className="bg-orange-50 p-3 rounded-lg mt-3">
                      <p className="text-sm text-orange-700">
                        Add ${(50 - subtotal).toFixed(2)} more for free delivery!
                      </p>
                    </div>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  type="submit"
                  size="lg" 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Complete Order - $${total.toFixed(2)}`
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <button 
                    type="button"
                    onClick={() => navigate(createPageUrl("Cart"))} 
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    ← Back to Cart
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}