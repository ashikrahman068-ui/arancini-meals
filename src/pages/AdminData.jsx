import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Calendar, Loader2, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminData() {
  const [downloading, setDownloading] = useState(false);
  const [weekInfo, setWeekInfo] = useState(null);

  React.useEffect(() => {
    calculateWeekInfo();
  }, []);

  const calculateWeekInfo = () => {
    const now = new Date();
    const mostRecentSundayCutoff = new Date(now);
    
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
    mostRecentSundayCutoff.setDate(now.getDate() - daysToSubtract);
    mostRecentSundayCutoff.setHours(12, 0, 0, 0);
    
    if (now < mostRecentSundayCutoff) {
      mostRecentSundayCutoff.setDate(mostRecentSundayCutoff.getDate() - 7);
    }

    const deliveryWeekStart = new Date(mostRecentSundayCutoff);
    deliveryWeekStart.setDate(mostRecentSundayCutoff.getDate() + 1);
    deliveryWeekStart.setHours(0, 0, 0, 0);

    const deliveryWeekEnd = new Date(deliveryWeekStart);
    deliveryWeekEnd.setDate(deliveryWeekStart.getDate() + 6);

    setWeekInfo({
      cutoffDate: mostRecentSundayCutoff,
      weekStart: deliveryWeekStart,
      weekEnd: deliveryWeekEnd
    });
  };

  const handleDownloadWeeklyOrders = async () => {
    setDownloading(true);
    try {
      const response = await base44.functions.invoke('exportWeeklyOrders', {});
      
      // Create blob from response data
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename with current date
      const today = new Date().toISOString().split('T')[0];
      a.download = `AranciniMeals_WeeklyOrders_${today}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success('Weekly orders exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      
      if (error?.response?.data?.error === 'No orders found for this week') {
        toast.error('No orders found for this week');
      } else {
        toast.error('Failed to export orders. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-AU', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Data Management</h1>
          <p className="text-gray-600 mt-2">Export and manage order data</p>
        </div>

        <div className="grid gap-6">
          {/* Weekly Orders Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Weekly Order List
              </CardTitle>
              <CardDescription>
                Download consolidated order list for the current delivery week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weekInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 mb-2">Current Delivery Week</p>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>📅 Week: {formatDate(weekInfo.weekStart)} - {formatDate(weekInfo.weekEnd)}</p>
                        <p>🔒 Cutoff: {formatDate(weekInfo.cutoffDate)} at 12:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-900 mb-2">Export Includes:</p>
                <ul className="space-y-1 ml-5 list-disc">
                  <li>Customer details and contact information</li>
                  <li>Subscription plans and meal selections</li>
                  <li>Delivery schedule and addresses</li>
                  <li>Special instructions and preferences</li>
                  <li>Only active subscriptions as of cutoff</li>
                </ul>
              </div>

              <Button 
                onClick={handleDownloadWeeklyOrders}
                disabled={downloading}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Export...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download This Week's Order List
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                File format: Excel (.xlsx) | Updates automatically every week
              </p>
            </CardContent>
          </Card>

          {/* Future exports can be added here */}
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center text-gray-400">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">More export options coming soon</p>
              <p className="text-sm">Historical orders, customer reports, and more</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}