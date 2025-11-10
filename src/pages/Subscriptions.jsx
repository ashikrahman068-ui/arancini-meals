
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Star, 
  Calendar, 
  Truck, 
  DollarSign,
  Zap,
  Heart,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const subscriptionPlans = [
  {
    id: 'weekly-5',
    name: 'Weekly Essentials',
    frequency: 'weekly',
    mealsPerWeek: 5,
    pricePerDelivery: 59.99,
    deliveryFee: 10,
    savingsPercent: 10,
    description: 'Perfect for busy individuals',
    features: [
      '5 chef-prepared meals per week',
      '$10 weekly delivery fee',
      '10% discount on all meals',
      'Flexible meal selection',
      'Skip or pause anytime'
    ],
    popular: false
  },
  {
    id: 'weekly-10',
    name: 'Weekly Premium',
    frequency: 'weekly',
    mealsPerWeek: 10,
    pricePerDelivery: 109.99,
    deliveryFee: 10,
    savingsPercent: 15,
    description: 'Best value for families',
    features: [
      '10 chef-prepared meals per week',
      '$10 weekly delivery fee',
      '15% discount on all meals',
      'Custom meal selection',
      'Skip or pause anytime',
      'Priority customer support'
    ],
    popular: true
  },
  {
    id: 'bi-weekly-10',
    name: 'Bi-Weekly Plan',
    frequency: 'bi-weekly',
    mealsPerWeek: 10,
    pricePerDelivery: 99.99,
    deliveryFee: 10,
    savingsPercent: 12,
    description: 'Flexible bi-weekly option',
    features: [
      '10 meals every 2 weeks',
      '$10 delivery fee per delivery',
      '12% discount on all meals',
      'Flexible meal selection',
      'Skip or pause anytime'
    ],
    popular: false
  },
  {
    id: 'monthly-20',
    name: 'Monthly Bundle',
    frequency: 'monthly',
    mealsPerWeek: 20,
    pricePerDelivery: 189.99,
    deliveryFee: 20,
    savingsPercent: 20,
    description: 'Maximum savings with reduced delivery fees',
    features: [
      '20 meals per month',
      'Only $20/month delivery (Save $20!)',
      '20% discount on all meals',
      'Custom meal plans',
      'Skip or pause anytime',
      'Dedicated account manager',
      'Exclusive new meal previews'
    ],
    popular: false
  }
];

export default function Subscriptions() {
  const [user, setUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndSubscription();
  }, []);

  const fetchUserAndSubscription = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const subscriptions = await base44.entities.Subscription.filter({ 
        user_email: currentUser.email,
        status: 'active'
      });
      
      if (subscriptions.length > 0) {
        setCurrentSubscription(subscriptions[0]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Please log in to view subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    // Navigate to subscription checkout with plan data
    navigate(createPageUrl(`SubscriptionCheckout?planId=${plan.id}`));
  };

  const handleManageSubscription = () => {
    navigate(createPageUrl('ManageSubscription'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-700">
            <Zap className="w-3 h-3 mr-1" />
            Save up to 20% with subscriptions
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Meal Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Subscribe and save! Get fresh, chef-prepared meals delivered on your schedule. 
            Pause or cancel anytime - no commitment required.
          </p>
        </div>

        {/* Current Subscription Alert */}
        {currentSubscription && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      Active Subscription: {currentSubscription.plan_name}
                    </h3>
                    <p className="text-gray-600">
                      {currentSubscription.meals_per_week} meals · {currentSubscription.plan_type} delivery
                    </p>
                  </div>
                </div>
                <Button onClick={handleManageSubscription} variant="outline">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Save More</h3>
              <p className="text-gray-600 text-sm">
                Get up to 20% off every order with our subscription plans
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexible Schedule</h3>
              <p className="text-gray-600 text-sm">
                Choose your delivery day and skip or pause anytime
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Low Delivery Fees</h3>
              <p className="text-gray-600 text-sm">
                Monthly plans get reduced delivery fees - just $20/month!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden ${
                plan.popular 
                  ? 'border-2 border-green-500 shadow-2xl transform scale-105' 
                  : 'border-0 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-green-600 text-white rounded-tl-none rounded-br-none">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-gray-900">
                    ${plan.pricePerDelivery}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    per {plan.frequency === 'bi-weekly' ? '2 weeks' : plan.frequency}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    + ${plan.deliveryFee} delivery
                  </div>
                  <Badge className="mt-2 bg-orange-100 text-orange-700">
                    Save {plan.savingsPercent}%
                  </Badge>
                  {plan.frequency === 'monthly' && (
                    <Badge className="mt-2 bg-blue-100 text-blue-700 ml-2">
                      Save $20 on delivery!
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                  onClick={() => handleSubscribe(plan)}
                  disabled={currentSubscription && currentSubscription.plan_name === plan.name}
                >
                  {currentSubscription && currentSubscription.plan_name === plan.name 
                    ? 'Current Plan' 
                    : 'Subscribe Now'
                  }
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Cancel or pause anytime
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delivery Fee Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6">Delivery Fee Comparison</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h4 className="font-semibold text-lg mb-4 text-gray-900">Weekly / Bi-Weekly Plans</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly delivery fee</span>
                      <span className="font-semibold">$10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly total (4 weeks)</span>
                      <span className="font-semibold text-red-600">$40</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md border-2 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg text-gray-900">Monthly Plan</h4>
                    <Badge className="bg-green-600">Best Value</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly delivery fee</span>
                      <span className="font-semibold text-green-600">$20</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">You save</span>
                      <span className="font-semibold text-green-600">$20/month</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-6">
                Choose a monthly plan and save 50% on delivery fees!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I customize my meals?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can choose your meals each week from our full menu. We'll remember your preferences 
                  and suggest meals you might like.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I skip a week?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely. You can skip any delivery up to 5 days before your scheduled delivery date. 
                  No fees, no questions asked.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does billing work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You'll be charged automatically before each delivery. For weekly plans, that's once a week. 
                  For bi-weekly, once every two weeks, and monthly plans are billed once per month.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! There's no long-term commitment. You can pause or cancel your subscription anytime 
                  from your account settings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center p-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl">
          <Heart className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy subscribers who are eating healthier and saving time.
          </p>
          <Button size="lg" className="bg-white text-green-700 hover:bg-gray-50" onClick={() => {
            const popularPlan = subscriptionPlans.find(p => p.popular);
            handleSubscribe(popularPlan);
          }}>
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}
