import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Pause, Play, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionManagement({ subscription, onUpdate }) {
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [pauseDuration, setPauseDuration] = useState('1_week');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePause = async () => {
    setIsProcessing(true);
    try {
      const pauseUntil = new Date();
      switch (pauseDuration) {
        case '1_week':
          pauseUntil.setDate(pauseUntil.getDate() + 7);
          break;
        case '2_weeks':
          pauseUntil.setDate(pauseUntil.getDate() + 14);
          break;
        case '1_month':
          pauseUntil.setMonth(pauseUntil.getMonth() + 1);
          break;
      }

      await base44.entities.Subscription.update(subscription.id, {
        status: 'paused',
        notes: `Paused until ${pauseUntil.toISOString()}`
      });

      toast.success('Subscription paused successfully');
      setShowPauseDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to pause subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    setIsProcessing(true);
    try {
      await base44.entities.Subscription.update(subscription.id, {
        status: 'active',
        notes: 'Resumed by user'
      });

      toast.success('Subscription resumed successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to resume subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      toast.error('Please select a reason for cancellation');
      return;
    }

    setIsProcessing(true);
    try {
      await base44.entities.Subscription.update(subscription.id, {
        status: 'cancelled',
        notes: `Cancelled. Reason: ${cancelReason}. Feedback: ${cancelFeedback}`
      });

      toast.success('Subscription cancelled successfully');
      setShowCancelDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    const statusColors = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-700'
    };

    return (
      <Badge className={statusColors[subscription.status] || 'bg-gray-100 text-gray-700'}>
        {subscription.status}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{subscription.plan_name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {subscription.meals_per_week} meals per week • ${subscription.price_per_delivery} per delivery
              </p>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Delivery Day</p>
              <p className="font-medium capitalize">
                {subscription.delivery_schedule?.delivery_day || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Time Slot</p>
              <p className="font-medium capitalize">
                {subscription.delivery_schedule?.time_slot || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Next Delivery</p>
              <p className="font-medium">
                {subscription.delivery_schedule?.next_delivery_date
                  ? new Date(subscription.delivery_schedule.next_delivery_date).toLocaleDateString()
                  : 'Not scheduled'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Next Billing</p>
              <p className="font-medium">
                {subscription.billing_info?.next_billing_date
                  ? new Date(subscription.billing_info.next_billing_date).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            {subscription.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPauseDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause Subscription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                  Cancel Subscription
                </Button>
              </>
            )}

            {subscription.status === 'paused' && (
              <Button
                onClick={handleResume}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                Resume Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pause Dialog */}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause Your Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              How long would you like to pause your subscription?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <RadioGroup value={pauseDuration} onValueChange={setPauseDuration}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1_week" id="1_week" />
              <Label htmlFor="1_week">1 week</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2_weeks" id="2_weeks" />
              <Label htmlFor="2_weeks">2 weeks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1_month" id="1_month" />
              <Label htmlFor="1_month">1 month</Label>
            </div>
          </RadioGroup>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePause} disabled={isProcessing}>
              {isProcessing ? 'Pausing...' : 'Pause Subscription'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription>
              We're sorry to see you go. Please help us improve by telling us why you're cancelling.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Reason for cancellation</Label>
              <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="too_expensive" id="too_expensive" />
                  <Label htmlFor="too_expensive" className="font-normal">Too expensive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quality_issues" id="quality_issues" />
                  <Label htmlFor="quality_issues" className="font-normal">Quality issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery_problems" id="delivery_problems" />
                  <Label htmlFor="delivery_problems" className="font-normal">Delivery problems</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limited_variety" id="limited_variety" />
                  <Label htmlFor="limited_variety" className="font-normal">Limited meal variety</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moving" id="moving" />
                  <Label htmlFor="moving" className="font-normal">Moving/relocating</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="feedback" className="text-sm font-medium mb-2 block">
                Additional feedback (optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Tell us more about your experience..."
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Cancelling will stop all future deliveries. You can reactivate anytime.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isProcessing || !cancelReason}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}