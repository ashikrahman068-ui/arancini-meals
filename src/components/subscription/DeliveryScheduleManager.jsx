import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock, Pause, Play, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeliveryScheduleManager({ subscription, onUpdate }) {
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [pauseDuration, setPauseDuration] = useState('1');
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [newDeliveryDay, setNewDeliveryDay] = useState(subscription?.delivery_schedule?.delivery_day || 'monday');
  const [newTimeSlot, setNewTimeSlot] = useState(subscription?.delivery_schedule?.time_slot || 'morning');

  useEffect(() => {
    if (subscription) {
      calculateUpcomingDeliveries();
    }
  }, [subscription]);

  const calculateUpcomingDeliveries = () => {
    const deliveries = [];
    const startDate = new Date();
    const frequency = subscription.plan_type;
    
    for (let i = 0; i < 4; i++) {
      const deliveryDate = new Date(startDate);
      
      if (frequency === 'weekly') {
        deliveryDate.setDate(startDate.getDate() + (i * 7));
      } else if (frequency === 'bi-weekly') {
        deliveryDate.setDate(startDate.getDate() + (i * 14));
      } else if (frequency === 'monthly') {
        deliveryDate.setMonth(startDate.getMonth() + i);
      }
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = dayNames.indexOf(subscription.delivery_schedule?.delivery_day || 'monday');
      const currentDay = deliveryDate.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      
      deliveryDate.setDate(deliveryDate.getDate() + daysUntilTarget);
      
      deliveries.push({
        date: deliveryDate,
        timeSlot: subscription.delivery_schedule?.time_slot || 'morning',
        status: i === 0 ? 'upcoming' : 'scheduled'
      });
    }
    
    setUpcomingDeliveries(deliveries);
  };

  const handlePauseSubscription = async () => {
    setLoading(true);
    try {
      const weeks = parseInt(pauseDuration);
      const pauseEndDate = new Date();
      pauseEndDate.setDate(pauseEndDate.getDate() + (weeks * 7));
      
      await base44.functions.invoke('updateSubscription', {
        subscriptionId: subscription.id,
        status: 'paused',
        pause_end_date: pauseEndDate.toISOString()
      });
      
      toast.success(`Subscription paused for ${weeks} week${weeks > 1 ? 's' : ''}`);
      setPauseDialogOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to pause subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('updateSubscription', {
        subscriptionId: subscription.id,
        status: 'active',
        pause_end_date: null
      });
      
      toast.success('Subscription resumed successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to resume subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    setLoading(true);
    try {
      // Check cutoff logic
      const now = new Date();
      const cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - now.getDay() + 6); // Next Saturday
      cutoffDate.setHours(23, 59, 59, 999);
      
      if (now > cutoffDate) {
        toast.error('Changes cannot be made after Saturday midnight. Updates will apply to deliveries after next week.');
      }
      
      await base44.functions.invoke('updateSubscription', {
        subscriptionId: subscription.id,
        delivery_schedule: {
          ...subscription.delivery_schedule,
          delivery_day: newDeliveryDay,
          time_slot: newTimeSlot
        }
      });
      
      toast.success('Delivery schedule updated successfully');
      setEditingSchedule(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update delivery schedule');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-AU', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeSlotLabel = (slot) => {
    const slots = {
      morning: '8AM - 12PM',
      afternoon: '12PM - 5PM',
      evening: '5PM - 8PM'
    };
    return slots[slot] || slot;
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Upcoming Deliveries
          </CardTitle>
          <CardDescription>Your next scheduled meal deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeliveries.map((delivery, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{formatDate(delivery.date)}</p>
                    <p className="text-sm text-gray-600">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getTimeSlotLabel(delivery.timeSlot)}
                    </p>
                  </div>
                </div>
                {index === 0 && (
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                    Next Delivery
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Delivery Schedule
          </CardTitle>
          <CardDescription>Change your preferred delivery day and time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSchedule ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Delivery Day</label>
                  <Select value={newDeliveryDay} onValueChange={setNewDeliveryDay}>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Time Slot</label>
                  <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
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
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  Changes made after Saturday midnight will apply to deliveries after next week.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateSchedule} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingSchedule(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Delivery Day</p>
                  <p className="font-semibold text-gray-900 capitalize">{subscription?.delivery_schedule?.delivery_day}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Time Slot</p>
                  <p className="font-semibold text-gray-900">{getTimeSlotLabel(subscription?.delivery_schedule?.time_slot)}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setEditingSchedule(true)} className="w-full">
                Change Schedule
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pause/Resume */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {subscription?.status === 'paused' ? (
              <Play className="w-5 h-5 text-blue-600" />
            ) : (
              <Pause className="w-5 h-5 text-orange-600" />
            )}
            {subscription?.status === 'paused' ? 'Resume Subscription' : 'Pause Deliveries'}
          </CardTitle>
          <CardDescription>
            {subscription?.status === 'paused' 
              ? 'Restart your meal deliveries'
              : 'Temporarily pause your subscription for 1-4 weeks'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription?.status === 'paused' ? (
            <Button onClick={handleResumeSubscription} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Resume Subscription
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setPauseDialogOpen(true)} className="w-full">
              <Pause className="w-4 h-4 mr-2" />
              Pause Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pause Dialog */}
      <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Your Subscription</DialogTitle>
            <DialogDescription>
              Choose how long you'd like to pause your deliveries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={pauseDuration} onValueChange={setPauseDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Week</SelectItem>
                <SelectItem value="2">2 Weeks</SelectItem>
                <SelectItem value="3">3 Weeks</SelectItem>
                <SelectItem value="4">4 Weeks</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Your subscription will automatically resume after {pauseDuration} week{parseInt(pauseDuration) > 1 ? 's' : ''}. You can also resume it manually anytime.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePauseSubscription} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Pause for {pauseDuration} Week{parseInt(pauseDuration) > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}