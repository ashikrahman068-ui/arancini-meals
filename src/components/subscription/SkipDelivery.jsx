import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, SkipForward, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SkipDelivery({ subscription }) {
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUpcomingDeliveries();
  }, [subscription]);

  const loadUpcomingDeliveries = async () => {
    setIsLoading(true);
    try {
      const deliveries = await base44.entities.Delivery.filter({
        subscription_id: subscription.id,
        status: { $in: ['pending', 'confirmed'] }
      });

      // Sort by scheduled date
      const sorted = deliveries.sort((a, b) => 
        new Date(a.scheduled_date) - new Date(b.scheduled_date)
      );
      
      setUpcomingDeliveries(sorted);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!selectedDelivery) return;

    setIsProcessing(true);
    try {
      await base44.entities.Delivery.update(selectedDelivery.id, {
        status: 'cancelled',
        notes: 'Skipped by customer'
      });

      toast.success('Delivery skipped successfully');
      setShowSkipDialog(false);
      setSelectedDelivery(null);
      loadUpcomingDeliveries();
    } catch (error) {
      toast.error('Failed to skip delivery');
    } finally {
      setIsProcessing(false);
    }
  };

  const openSkipDialog = (delivery) => {
    setSelectedDelivery(delivery);
    setShowSkipDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDeliveries.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No upcoming deliveries scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingDeliveries.slice(0, 3).map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(delivery.scheduled_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {delivery.scheduled_time_slot} delivery
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {delivery.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSkipDialog(delivery)}
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip This Delivery?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to skip the delivery scheduled for{' '}
              <strong>
                {selectedDelivery && new Date(selectedDelivery.scheduled_date).toLocaleDateString()}
              </strong>
              ? You won't be charged for this delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowSkipDialog(false);
                setSelectedDelivery(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSkip} disabled={isProcessing}>
              {isProcessing ? 'Skipping...' : 'Skip Delivery'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}