import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  Truck,
  Phone,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import PullToRefresh from '../components/common/PullToRefresh';
import PageTransition from '../components/common/PageTransition';
import DeliveryTrackingCard from '../components/delivery/DeliveryTrackingCard';
import DeliveryRatingModal from '../components/delivery/DeliveryRatingModal';

export default function Deliveries() {
  const [user, setUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchUserAndDeliveries();
  }, []);

  const fetchUserAndDeliveries = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allDeliveries = await base44.entities.Delivery.filter({
        customer_email: currentUser.email
      }, '-created_date');

      setDeliveries(allDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleRateDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      await base44.entities.Delivery.update(selectedDelivery.id, {
        delivery_rating: {
          ...ratingData,
          rated_at: new Date().toISOString()
        }
      });
      toast.success('Thank you for your feedback!');
      setShowRatingModal(false);
      fetchUserAndDeliveries();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your deliveries.</p>
      </div>
    );
  }

  const activeDeliveries = deliveries.filter(d => 
    ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(d.status)
  );
  
  const completedDeliveries = deliveries.filter(d => 
    d.status === 'delivered'
  );

  const failedDeliveries = deliveries.filter(d => 
    d.status === 'failed'
  );

  return (
    <PageTransition>
      <PullToRefresh onRefresh={fetchUserAndDeliveries}>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-gray-600 mt-2">Track your deliveries and provide feedback</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{activeDeliveries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedDeliveries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(completedDeliveries
                      .filter(d => d.delivery_rating?.overall_rating)
                      .reduce((sum, d) => sum + d.delivery_rating.overall_rating, 0) / 
                      completedDeliveries.filter(d => d.delivery_rating?.overall_rating).length || 0
                    ).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="active">
              Active ({activeDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="failed">
              Issues ({failedDeliveries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6 mt-6">
            {activeDeliveries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active deliveries</p>
                </CardContent>
              </Card>
            ) : (
              activeDeliveries.map(delivery => (
                <DeliveryTrackingCard 
                  key={delivery.id} 
                  delivery={delivery}
                  onRefresh={fetchUserAndDeliveries}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6 mt-6">
            {completedDeliveries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No completed deliveries yet</p>
                </CardContent>
              </Card>
            ) : (
              completedDeliveries.map(delivery => (
                <Card key={delivery.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Delivery #{delivery.tracking_number}</h3>
                          <p className="text-sm text-gray-500">
                            Delivered on {new Date(delivery.actual_delivery_time || delivery.created_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {delivery.delivery_address?.street}, {delivery.delivery_address?.city}
                            </span>
                          </div>
                        </div>
                      </div>
                      {delivery.delivery_rating ? (
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{delivery.delivery_rating.overall_rating}</span>
                          </div>
                          <p className="text-xs text-gray-500">Rated</p>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRateDelivery(delivery)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Rate Delivery
                        </Button>
                      )}
                    </div>

                    {delivery.delivery_photo_url && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Delivery Photo:</p>
                        <img 
                          src={delivery.delivery_photo_url} 
                          alt="Delivery proof" 
                          className="rounded-lg max-h-40 object-cover"
                        />
                      </div>
                    )}

                    {delivery.delivery_rating?.feedback && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 italic">"{delivery.delivery_rating.feedback}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-6 mt-6">
            {failedDeliveries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No delivery issues</p>
                </CardContent>
              </Card>
            ) : (
              failedDeliveries.map(delivery => (
                <Card key={delivery.id} className="border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Delivery #{delivery.tracking_number}</h3>
                        <p className="text-sm text-gray-500 mb-3">
                          Scheduled for {new Date(delivery.scheduled_date).toLocaleDateString()}
                        </p>
                        {delivery.issues && delivery.issues.length > 0 && (
                          <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-red-900 mb-1">Issues:</p>
                            <ul className="text-sm text-red-700 space-y-1">
                              {delivery.issues.map((issue, idx) => (
                                <li key={idx}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

          {/* Rating Modal */}
          {showRatingModal && (
            <DeliveryRatingModal
              delivery={selectedDelivery}
              onClose={() => setShowRatingModal(false)}
              onSubmit={handleRatingSubmit}
            />
          )}
        </div>
      </PullToRefresh>
    </PageTransition>
  );
}