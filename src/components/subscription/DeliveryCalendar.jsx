import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Truck, CreditCard, Package } from 'lucide-react';

export default function DeliveryCalendar({ subscription }) {
  const upcomingDeliveries = useMemo(() => {
    if (!subscription) return [];

    const deliveries = [];
    const startDate = new Date(subscription.delivery_schedule?.next_delivery_date);
    
    const frequencyDays = {
      'weekly': 7,
      'bi-weekly': 14,
      'monthly': 30
    };

    const daysInterval = frequencyDays[subscription.plan_type] || 7;

    // Generate next 6 deliveries
    for (let i = 0; i < 6; i++) {
      const deliveryDate = new Date(startDate);
      deliveryDate.setDate(startDate.getDate() + (i * daysInterval));
      
      const billingDate = new Date(deliveryDate);
      billingDate.setDate(deliveryDate.getDate() - 1);

      deliveries.push({
        deliveryDate: deliveryDate.toISOString(),
        billingDate: billingDate.toISOString(),
        amount: subscription.price_per_delivery - (subscription.price_per_delivery * subscription.discount_percentage / 100)
      });
    }

    return deliveries;
  }, [subscription]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDayOfWeek = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingDeliveries.map((delivery, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${
                index === 0 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-green-600' : 'bg-gray-200'
                  }`}>
                    <Truck className={`w-6 h-6 ${index === 0 ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {formatDate(delivery.deliveryDate)}
                      </h4>
                      {index === 0 && (
                        <Badge className="bg-green-600">Next</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {getDayOfWeek(delivery.deliveryDate)} • {subscription.delivery_schedule?.time_slot}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ${delivery.amount.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {subscription.meals_per_week} meals
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 pl-15">
                <CreditCard className="w-4 h-4" />
                <span>Billing on {formatDate(delivery.billingDate)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Delivery Schedule</p>
              <p className="text-xs text-blue-700 mt-1">
                Every {subscription.plan_type === 'bi-weekly' ? '2 weeks' : subscription.plan_type} on {subscription.delivery_schedule?.delivery_day}s during {subscription.delivery_schedule?.time_slot} hours
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}