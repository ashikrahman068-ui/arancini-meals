import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/alert-dialog';
import { Loader2, ShoppingBag, ArrowRight, Package, MapPin, Calendar, LogIn, UserPlus, Receipt, Download } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const fetchedOrders = await base44.entities.Order.filter({ customer_email: currentUser.email }, '-created_date');
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching user or orders:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await base44.entities.Order.update(orderId, { status: 'cancelled' });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    return `${statusColors[status] || 'bg-gray-100 text-gray-800'} capitalize`;
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl('Orders'));
  };

  const handleExportOrders = async () => {
    try {
      const response = await base44.functions.invoke('exportOrdersXlsx', {});
      
      // Create blob from response data
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">View Your Orders</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Log in to view your order history, track deliveries, and manage your purchases.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                  onClick={handleLogin}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Log In
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8"
                  onClick={handleLogin}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">With an account, you can:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600">Track all your orders in one place</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600">View detailed nutritional information</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600">Re-order your favorite meals easily</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600">Get real-time delivery updates</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm text-gray-500">
                  Don't have an account yet? Sign up now and get your first delivery free!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          {user?.role === 'admin' && orders.length > 0 && (
            <Button 
              onClick={handleExportOrders}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Orders (Excel)
            </Button>
          )}
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
              <Link to={createPageUrl("Meals")}>
                <Button className="bg-green-600 hover:bg-green-700">
                  Browse Meals
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order #{order.order_number || order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on {new Date(order.created_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      {order.status === 'pending' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600">
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this order? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Order</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelOrder(order.id)} className="bg-red-600 hover:bg-red-700">
                                Cancel Order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Order Items with Detailed Nutrition */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {item.meal_name} × {item.quantity}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                ${item.price_per_item?.toFixed(2)} each
                              </p>
                            </div>
                            <p className="font-bold text-gray-900">
                              ${(item.price_per_item * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          
                          {/* Nutrition Info for Order Items */}
                          {item.nutrition && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Nutrition per serving:</p>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-2 bg-white rounded">
                                  <div className="text-sm font-bold text-orange-600">{item.nutrition.calories || 0}</div>
                                  <div className="text-xs text-gray-500">Cal</div>
                                </div>
                                <div className="text-center p-2 bg-white rounded">
                                  <div className="text-sm font-bold text-blue-600">{item.nutrition.protein || 0}g</div>
                                  <div className="text-xs text-gray-500">Protein</div>
                                </div>
                                <div className="text-center p-2 bg-white rounded">
                                  <div className="text-sm font-bold text-green-600">{item.nutrition.carbs || 0}g</div>
                                  <div className="text-xs text-gray-500">Carbs</div>
                                </div>
                                <div className="text-center p-2 bg-white rounded">
                                  <div className="text-sm font-bold text-purple-600">{item.nutrition.fat || 0}g</div>
                                  <div className="text-xs text-gray-500">Fat</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Delivery Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.delivery_address?.street}</p>
                        <p>{order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.zip}</p>
                        {order.delivery_address?.special_instructions && (
                          <p className="mt-2 text-xs italic">Note: {order.delivery_address.special_instructions}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Delivery Details
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p>Date: {new Date(order.delivery_date).toLocaleDateString()}</p>
                        <p className="capitalize">Time: {order.delivery_time_slot?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">${order.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-semibold">
                          {order.delivery_fee === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `$${order.delivery_fee?.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-semibold">${order.tax?.toFixed(2)}</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-semibold">-${order.discount_amount?.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-green-600">${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}