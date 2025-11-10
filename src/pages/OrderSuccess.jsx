import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Order } from '@/entities/Order';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  Loader2
} from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      try {
        // Since we can't get by ID directly, we'll filter by order number or use a workaround
        const orders = await Order.list();
        const foundOrder = orders.find(o => o.id === orderId);
        setOrder(foundOrder);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <Link to={createPageUrl("Orders")}>
            <Button className="bg-green-600 hover:bg-green-700">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const estimatedDeliveryDate = new Date(order.delivery_date || new Date());
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you for your order! We've received your payment and are preparing your delicious meals.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Order Number</span>
                <span className="font-mono text-sm bg-white px-3 py-1 rounded">
                  {order.order_number || order.id.slice(0, 8)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Status</span>
                <Badge className="bg-blue-100 text-blue-800 capitalize">
                  {order.status}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold text-green-600">
                  ${order.total.toFixed(2)}
                </span>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Items Ordered</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{item.meal_name} × {item.quantity}</span>
                      <span className="font-semibold">
                        ${(item.price_per_item * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Estimated Delivery
                </h4>
                <p className="text-lg font-semibold text-green-600">
                  {estimatedDeliveryDate.toLocaleDateString('en-AU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {order.delivery_time_slot?.replace('_', ' ')} delivery window
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </h4>
                <div className="text-sm text-gray-600">
                  <p>{order.delivery_address?.street}</p>
                  <p>
                    {order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.zip}
                  </p>
                  {order.delivery_address?.special_instructions && (
                    <p className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800 text-xs">
                      <strong>Special Instructions:</strong> {order.delivery_address.special_instructions}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Order confirmed and being prepared</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span>Out for delivery</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span>Delivered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link to={createPageUrl("Orders")}>
            <Button variant="outline" size="lg">
              View All Orders
            </Button>
          </Link>
          <Link to={createPageUrl("Meals")}>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Order More Meals
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Confirmation Email Notice */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl text-center">
          <p className="text-blue-800">
            📧 A confirmation email has been sent to <strong>{order.customer_email}</strong>
          </p>
          <p className="text-sm text-blue-600 mt-2">
            You'll receive updates about your order status and delivery tracking.
          </p>
        </div>
      </div>
    </div>
  );
}