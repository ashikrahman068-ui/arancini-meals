import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  CreditCard, 
  MapPin, 
  Package, 
  Edit, 
  Pause, 
  Play,
  XCircle,
  Loader2,
  Check,
  AlertCircle,
  SkipForward
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import SwapUpcomingMeals from '../components/subscription/SwapUpcomingMeals';
import DeliveryCalendar from '../components/subscription/DeliveryCalendar';

export default function ManageSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const user = await base44.auth.me();
      const subscriptions = await base44.entities.Subscription.filter({
        user_email: user.email,
        status: 'active'
      });

      if (subscriptions.length === 0) {
        toast.info('No active subscription found');
        navigate(createPageUrl('Subscriptions'));
        return;
      }

      setSubscription(subscriptions[0]);

      if (subscriptions[0].meal_preferences?.selected_meals) {
        const allMeals = await base44.entities.Meal.list();
        const selectedMeals = subscriptions[0].meal_preferences.selected_meals
          .map(id => allMeals.find(m => m.id === id))
          .filter(Boolean);
        setMeals(selectedMeals);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription');
      navigate(createPageUrl('Subscriptions'));
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = async () => {
    setUpdating(true);
    try {
      await base44.entities.Subscription.update(subscription.id, { status: 'paused' });
      toast.success('Subscription paused successfully');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to pause subscription');
    } finally {
      setUpdating(false);
    }
  };

  const handleResumeSubscription = async () => {
    setUpdating(true);
    try {
      await base44.entities.Subscription.update(subscription.id, { status: 'active' });
      toast.success('Subscription resumed successfully');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to resume subscription');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    setUpdating(true);
    try {
      await base44.entities.Subscription.update(subscription.id, { status: 'cancelled' });
      toast.success('Subscription cancelled successfully');
      navigate(createPageUrl('Subscriptions'));
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setUpdating(false);
    }
  };

  const handleSkipNextDelivery = async () => {
    setUpdating(true);
    try {
      const currentDate = new Date(subscription.delivery_schedule.next_delivery_date);
      const frequencyDays = subscription.plan_type === 'weekly' ? 7 : subscription.plan_type === 'bi-weekly' ? 14 : 30;
      
      currentDate.setDate(currentDate.getDate() + frequencyDays);
      
      await base44.entities.Subscription.update(subscription.id, {
        delivery_schedule: {
          ...subscription.delivery_schedule,
          next_delivery_date: currentDate.toISOString().split('T')[0]
        }
      });
      
      toast.success('Next delivery skipped successfully');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to skip delivery');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeDeliveryDay = async (newDay) => {
    setUpdating(true);
    try {
      await base44.entities.Subscription.update(subscription.id, {
        delivery_schedule: {
          ...subscription.delivery_schedule,
          delivery_day: newDay
        }
      });
      toast.success('Delivery day updated successfully');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to update delivery day');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeTimeSlot = async (newSlot) => {
    setUpdating(true);
    try {
      await base44.entities.Subscription.update(subscription.id, {
        delivery_schedule: {
          ...subscription.delivery_schedule,
          time_slot: newSlot
        }
      });
      toast.success('Time slot updated successfully');
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to update time slot');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const isPaused = subscription.status === 'paused';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Subscription</h1>
              <p className="text-gray-600 mt-2">{subscription.plan_name}</p>
            </div>
            <Badge className={`${
              isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            } text-sm px-4 py-2`}>
              {isPaused ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Paused
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Active
                </>
              )}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Subscription Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Subscription Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Plan Type</p>
                        <p className="font-semibold capitalize">{subscription.plan_type} Delivery</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Meals per Delivery</p>
                        <p className="font-semibold">{subscription.meals_per_week} meals</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price per Delivery</p>
                        <p className="font-semibold">${subscription.price_per_delivery.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Savings</p>
                        <p className="font-semibold text-green-600">{subscription.discount_percentage}%</p>
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
                  <CardContent>
                    <div className="text-gray-600">
                      <p>{subscription.delivery_address?.street}</p>
                      <p>
                        {subscription.delivery_address?.city}, {subscription.delivery_address?.state} {subscription.delivery_address?.zip}
                      </p>
                      {subscription.delivery_address?.special_instructions && (
                        <p className="mt-2 text-sm italic">Note: {subscription.delivery_address.special_instructions}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Payment Method</p>
                      <p className="font-semibold">{subscription.billing_info?.payment_method}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Last Payment</p>
                        <p className="font-semibold">
                          {new Date(subscription.billing_info?.last_payment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Next Billing</p>
                        <p className="font-semibold">
                          {new Date(subscription.billing_info?.next_billing_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isPaused ? (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleResumeSubscription}
                        disabled={updating}
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        Resume Subscription
                      </Button>
                    ) : (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full" disabled={updating}>
                              <SkipForward className="w-4 h-4 mr-2" />
                              Skip Next Delivery
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Skip Next Delivery?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Your next delivery on {new Date(subscription.delivery_schedule?.next_delivery_date).toLocaleDateString()} will be skipped. You won't be charged and your following delivery will be rescheduled.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleSkipNextDelivery}>
                                Skip Delivery
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full" disabled={updating}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Pause Subscription?</AlertDialogTitle>
                              <AlertDialogDescription>
                                You won't be charged or receive deliveries while paused. You can resume anytime.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handlePauseSubscription}>
                                Pause Subscription
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    <Separator />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" disabled={updating}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel? You'll lose your discount and can always resubscribe later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
                            Cancel Subscription
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900">Need Help?</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Contact our support team for any questions about your subscription.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meals" className="space-y-6">
            <SwapUpcomingMeals subscription={subscription} onUpdate={fetchSubscription} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Current Meal Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {meals.map(meal => (
                    <div key={meal.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img src={meal.image_url} alt={meal.name} className="w-full h-32 object-cover" />
                      <div className="p-3">
                        <h4 className="font-semibold text-sm line-clamp-1">{meal.name}</h4>
                        <p className="text-xs text-gray-500 capitalize mt-1">{meal.category}</p>
                        <p className="text-xs text-gray-400 mt-1">{meal.nutrition?.calories || 0} cal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <DeliveryCalendar subscription={subscription} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Delivery Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Preferred Delivery Day
                  </label>
                  <Select 
                    value={subscription.delivery_schedule?.delivery_day} 
                    onValueChange={handleChangeDeliveryDay}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <SelectItem key={day} value={day} className="capitalize">
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Changes will apply to future deliveries
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Delivery Time Slot
                  </label>
                  <Select 
                    value={subscription.delivery_schedule?.time_slot} 
                    onValueChange={handleChangeTimeSlot}
                    disabled={updating}
                  >
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

                <div className="pt-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Delivery Schedule Confirmed</p>
                        <p className="text-xs text-green-700 mt-1">
                          You'll receive deliveries every {subscription.plan_type === 'bi-weekly' ? '2 weeks' : subscription.plan_type} on {subscription.delivery_schedule?.delivery_day}s
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}