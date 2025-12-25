import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Lock, CreditCard, Calendar, MapPin, Package, Check, Gift } from 'lucide-react'; // Added Gift icon

const subscriptionPlans = {
  'weekly-5': { name: 'Weekly Essentials', frequency: 'weekly', mealsPerWeek: 5, price: 59.99, deliveryFee: 10, savings: 10 },
  'weekly-10': { name: 'Weekly Premium', frequency: 'weekly', mealsPerWeek: 10, price: 109.99, deliveryFee: 10, savings: 15 },
  'bi-weekly-10': { name: 'Bi-Weekly Plan', frequency: 'bi-weekly', mealsPerWeek: 10, price: 99.99, deliveryFee: 10, savings: 12 },
  'monthly-20': { name: 'Monthly Bundle', frequency: 'monthly', mealsPerWeek: 20, price: 189.99, deliveryFee: 20, savings: 20 }
};

export default function SubscriptionCheckout() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const refCode = searchParams.get('ref'); // Get refCode from search params
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [availableMeals, setAvailableMeals] = useState([]);
  const [referralCode, setReferralCode] = useState(refCode ? refCode.toUpperCase() : '');
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cutoffError, setCutoffError] = useState(null);

  const plan = subscriptionPlans[planId];

  const [formData, setFormData] = useState({
    deliveryDay: 'monday',
    timeSlot: 'morning',
    street: '',
    city: '',
    state: '',
    zip: '',
    specialInstructions: '',
    dietaryPreferences: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Validate referral code when it changes or user is loaded
    if (user && referralCode && referralCode.length > 3) {
      validateReferralCode();
    } else if (!referralCode) {
      setReferralDiscount(0);
    }
  }, [referralCode, user]); // Added user to dependencies to ensure user is loaded before validation

  const fetchData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.delivery_addresses && currentUser.delivery_addresses.length > 0) {
        const defaultAddress = currentUser.delivery_addresses.find(addr => addr.is_default) || currentUser.delivery_addresses[0];
        setFormData(prev => ({
          ...prev,
          street: defaultAddress.street || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          zip: defaultAddress.zip || ''
        }));
      }

      const meals = await base44.entities.Meal.list();
      setAvailableMeals(meals.filter(m => m.is_available !== false));
    } catch (error) {
      toast.error('Please log in to continue');
      navigate(createPageUrl('Subscriptions'));
    } finally {
      setLoading(false);
    }
  };

  const validateReferralCode = async () => {
    if (!user) return; // Ensure user is loaded before validation

    setValidatingReferral(true);
    try {
      const users = await base44.entities.User.filter({ referral_code: referralCode.toUpperCase() });
      if (users.length > 0 && users[0].email !== user.email) {
        setReferralDiscount(10);
        toast.success('Referral code applied! $10 discount added.');
      } else {
        setReferralDiscount(0);
        if (users.length > 0 && users[0].email === user.email) {
          toast.error("You can't use your own referral code!");
        } else {
          toast.error('Invalid referral code');
        }
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setReferralDiscount(0);
      toast.error('Error validating referral code.');
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMealSelection = (mealId) => {
    setSelectedMeals(prev => {
      if (prev.includes(mealId)) {
        return prev.filter(id => id !== mealId);
      }
      if (prev.length < plan.mealsPerWeek) {
        return [...prev, mealId];
      }
      toast.error(`You can only select ${plan.mealsPerWeek} meals for this plan`);
      return prev;
    });
  };

  const handleDietaryToggle = (diet) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(diet)
        ? prev.dietaryPreferences.filter(d => d !== diet)
        : [...prev.dietaryPreferences, diet]
    }));
  };

  const calculateNextDeliveryDate = () => {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = dayNames.indexOf(formData.deliveryDay);
    const currentDay = today.getDay();
    
    let daysUntilDelivery = targetDay - currentDay;
    if (daysUntilDelivery <= 0) {
      daysUntilDelivery += 7;
    }
    
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysUntilDelivery);
    return deliveryDate.toISOString().split('T')[0];
  };

  const calculateNextBillingDate = () => {
    const nextDelivery = new Date(calculateNextDeliveryDate());
    return nextDelivery.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate PayPal is not supported
    if (paymentMethod === 'paypal') {
      toast.error('PayPal is not available yet. Please use a credit or debit card.');
      setSubmitting(false);
      return;
    }

    if (!formData.street || !formData.city || !formData.state || !formData.zip) {
      toast.error('Please fill in all delivery address fields');
      setSubmitting(false);
      return;
    }

    if (selectedMeals.length !== plan.mealsPerWeek) {
      toast.error(`Please select exactly ${plan.mealsPerWeek} meals`);
      setSubmitting(false);
      return;
    }

    try {
      // Create draft and subscription via backend
      const draftResponse = await base44.functions.invoke('createSubscriptionDraft', {
        plan_id: planId,
        plan_name: plan.name,
        plan_type: plan.frequency,
        meals_per_week: plan.mealsPerWeek,
        price_per_delivery: plan.price,
        discount_percentage: plan.savings,
        selected_meals: selectedMeals,
        dietary_preferences: formData.dietaryPreferences,
        delivery_schedule: {
          delivery_day: formData.deliveryDay,
          time_slot: formData.timeSlot,
          next_delivery_date: calculateNextDeliveryDate()
        },
        delivery_address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          special_instructions: formData.specialInstructions
        },
        referral_code: referralCode || null,
        payment_method: paymentMethod,
        next_billing_date: calculateNextBillingDate()
      });

      console.log('RAW createSubscriptionDraft response:', draftResponse);

      const payload =
        draftResponse?.output ||
        draftResponse?.data ||
        draftResponse?.result ||
        draftResponse;

      const draft = payload?.draft;
      const newSubscription = payload?.subscription;

      if (!draft || !newSubscription) {
        console.error('Missing draft or subscription:', payload);
        throw new Error('Subscription service failed to return data');
      }
      


      // Create Stripe checkout for subscription
      const intervalMap = {
        'weekly': 'week',
        'bi-weekly': 'week',
        'monthly': 'month'
      };

      const intervalCountMap = {
        'weekly': 1,
        'bi-weekly': 2,
        'monthly': 1
      };

      const checkoutItems = [{
        name: `${plan.name} Subscription`,
        description: `${plan.mealsPerWeek} meals per ${plan.frequency}`,
        price: currentTotal,
        quantity: 1,
        recurring: {
          interval: intervalMap[plan.frequency],
          interval_count: intervalCountMap[plan.frequency]
        }
      }];

      console.log('Creating checkout with:', {
        items: checkoutItems,
        mode: 'subscription',
        subscriptionId: newSubscription.id
      });

      const checkoutResponse = await base44.functions.invoke('createCheckout', {
        items: checkoutItems,
        mode: 'subscription',
        subscriptionId: newSubscription.id,
        metadata: {
          subscription_id: newSubscription.id,
          draft_id: draft.id,
          plan_name: plan.name,
          meals_per_week: plan.mealsPerWeek,
          referral_code: referralCode || '',
          payment_method: paymentMethod
        }
      });

      console.log('Checkout response:', checkoutResponse);

      // Check for error in checkout response
      if (checkoutResponse?.error) {
        console.error('Checkout error:', checkoutResponse);
        throw new Error(checkoutResponse.error);
      }

      const checkoutUrl = 
        checkoutResponse?.output?.url ||
        checkoutResponse?.data?.url ||
        checkoutResponse?.result?.url ||
        checkoutResponse?.url;

      if (!checkoutUrl) {
        console.error('No checkout URL:', checkoutResponse);
        throw new Error('Stripe checkout URL was not returned');
      }

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error) {
  console.error('=== SUBSCRIPTION ERROR ===');
  console.error(error);

  let message = 'Unknown error';

  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.error) {
    message = error.error;
  } else if (error?.result?.error) {
    message = error.result.error;
  }

  toast.error(message, { duration: 6000 });
  setSubmitting(false);
}

  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Plan Not Found</h1>
          <Button onClick={() => navigate(createPageUrl('Subscriptions'))}>
            View All Plans
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const filteredMeals = availableMeals.filter(meal => {
    if (formData.dietaryPreferences.length === 0) return true;
    return formData.dietaryPreferences.every(pref => meal.dietary_tags && meal.dietary_tags.includes(pref));
  });

  const mealDiscountAmount = (plan.price * plan.savings / 100);
  let currentTotal = plan.price - mealDiscountAmount + plan.deliveryFee - referralDiscount; // Subtract referral discount
  let monthlyDeliveryDiscount = 0;
  if (plan.frequency === 'monthly') {
    monthlyDeliveryDiscount = 20;
    currentTotal -= monthlyDeliveryDiscount;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Subscription</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Meal Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Select Your Meals ({selectedMeals.length}/{plan.mealsPerWeek})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {['vegan', 'vegetarian', 'gluten-free', 'keto', 'high-protein'].map(diet => (
                    <Button
                      key={diet}
                      type="button"
                      variant={formData.dietaryPreferences.includes(diet) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDietaryToggle(diet)}
                      className="capitalize"
                    >
                      {diet.replace('-', ' ')}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredMeals.map(meal => (
                    <div
                      key={meal.id}
                      onClick={() => handleMealSelection(meal.id)}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                        selectedMeals.includes(meal.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {selectedMeals.includes(meal.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <img src={meal.image_url} alt={meal.name} className="w-full h-32 object-cover rounded-t-lg" />
                      <div className="p-3">
                        <h4 className="font-semibold text-sm line-clamp-1">{meal.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{meal.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs capitalize">{meal.category}</Badge>
                          <span className="text-xs text-gray-500">{meal.nutrition?.calories || 0} cal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Delivery Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Delivery Day</Label>
                    <Select value={formData.deliveryDay} onValueChange={(value) => handleInputChange('deliveryDay', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                          <SelectItem key={day} value={day} className="capitalize">{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Slot</Label>
                    <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange('timeSlot', value)}>
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
                  <Label>Street Address *</Label>
                  <Input value={formData.street} onChange={(e) => handleInputChange('street', e.target.value)} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} required />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} required />
                  </div>
                  <div>
                    <Label>Zip *</Label>
                    <Input value={formData.zip} onChange={(e) => handleInputChange('zip', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label>Special Instructions</Label>
                  <Textarea value={formData.specialInstructions} onChange={(e) => handleInputChange('specialInstructions', e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Referral Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Referral Code (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Have a referral code?</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="uppercase"
                      disabled={validatingReferral}
                    />
                    {validatingReferral && <Loader2 className="w-4 h-4 animate-spin text-gray-400 self-center" />}
                  </div>
                  {referralDiscount > 0 && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Referral code applied! You'll save $10 on your first subscription.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer" onClick={() => setPaymentMethod('card')}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer font-semibold">Credit / Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-not-allowed opacity-50" title="Coming soon">
                    <RadioGroupItem value="paypal" id="paypal" disabled />
                    <Label htmlFor="paypal" className="flex-1 font-semibold text-gray-400">
                      PayPal <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                    </Label>
                  </div>
                </RadioGroup>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    You'll be redirected to Stripe's secure checkout to complete your payment.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secured by Stripe - Your payment information is encrypted</span>
                </div>
              </CardContent>
            </Card>

            {/* Cutoff Warning */}
            {cutoffError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-sm text-red-800">{cutoffError}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Subscription Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{plan.frequency} delivery</p>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{plan.mealsPerWeek} meals</span>
                    <span>A${plan.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Meal discount ({plan.savings}%)</span>
                    <span>-A${mealDiscountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery fee</span>
                    <span>A${plan.deliveryFee.toFixed(2)}</span>
                  </div>
                  {plan.frequency === 'monthly' && (
                    <div className="flex justify-between text-blue-600 font-semibold">
                      <span>Monthly delivery savings</span>
                      <span>-A${monthlyDeliveryDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {referralDiscount > 0 && (
                    <div className="flex justify-between text-purple-600 font-semibold">
                      <span>Referral discount</span>
                      <span>-A${referralDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>A${currentTotal.toFixed(2)}</span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• First delivery: {new Date(calculateNextDeliveryDate()).toLocaleDateString()}</p>
                  <p>• Billing: {plan.frequency}</p>
                  {plan.frequency === 'monthly' && (
                    <p className="text-green-600 font-semibold">• Save ${monthlyDeliveryDiscount.toFixed(0)} on delivery vs weekly plans!</p>
                  )}
                  {referralDiscount > 0 && (
                    <p className="text-purple-600 font-semibold">• Referral discount applied!</p>
                  )}
                  <p>• Cancel anytime</p>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  You'll be redirected to Stripe to complete payment
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}