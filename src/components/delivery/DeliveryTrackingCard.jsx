import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  MapPin, 
  Clock, 
  Phone,
  User,
  Truck,
  CheckCircle,
  AlertCircle,
  Thermometer
} from 'lucide-react';

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Package
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle
  }
};

export default function DeliveryTrackingCard({ delivery, onRefresh }) {
  const config = statusConfig[delivery.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEstimatedArrival = () => {
    if (delivery.estimated_arrival) {
      return new Date(delivery.estimated_arrival);
    }
    return null;
  };

  const estimatedArrival = getEstimatedArrival();
  const isArrivalSoon = estimatedArrival && (estimatedArrival - new Date()) < 3600000; // Within 1 hour

  return (
    <Card className={`${delivery.status === 'out_for_delivery' ? 'border-2 border-purple-500' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <StatusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Delivery #{delivery.tracking_number}</CardTitle>
              <p className="text-sm text-gray-500">
                Scheduled for {formatDate(delivery.scheduled_date)} • {delivery.scheduled_time_slot}
              </p>
            </div>
          </div>
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estimated Arrival */}
        {estimatedArrival && delivery.status === 'out_for_delivery' && (
          <div className={`p-4 rounded-lg ${isArrivalSoon ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${isArrivalSoon ? 'text-orange-600' : 'text-blue-600'}`} />
              <div>
                <p className={`font-semibold ${isArrivalSoon ? 'text-orange-900' : 'text-blue-900'}`}>
                  Estimated Arrival: {formatTime(delivery.estimated_arrival)}
                </p>
                <p className={`text-sm ${isArrivalSoon ? 'text-orange-700' : 'text-blue-700'}`}>
                  {isArrivalSoon ? 'Your delivery is arriving soon!' : `Expected ${formatDate(delivery.estimated_arrival)}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Delivery Address</p>
              <p className="text-sm text-gray-600">
                {delivery.delivery_address?.street}<br />
                {delivery.delivery_address?.city}, {delivery.delivery_address?.state} {delivery.delivery_address?.zip}
              </p>
              {delivery.delivery_address?.special_instructions && (
                <p className="text-sm text-gray-500 mt-2 italic">
                  Note: {delivery.delivery_address.special_instructions}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Courier Information */}
        {delivery.courier_info && delivery.status === 'out_for_delivery' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-3">Your Courier</p>
            <div className="flex items-center gap-4">
              {delivery.courier_info.photo_url ? (
                <img 
                  src={delivery.courier_info.photo_url} 
                  alt={delivery.courier_info.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{delivery.courier_info.name}</p>
                {delivery.courier_info.vehicle && (
                  <p className="text-sm text-gray-600">{delivery.courier_info.vehicle}</p>
                )}
              </div>
              {delivery.courier_info.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${delivery.courier_info.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Temperature Monitoring */}
        {delivery.temperature_log && delivery.temperature_log.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-blue-600" />
              <p className="font-medium text-blue-900">Temperature Monitored</p>
            </div>
            <p className="text-sm text-blue-700">
              Last reading: {delivery.temperature_log[delivery.temperature_log.length - 1].temperature}°F
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Your meals are kept at optimal temperature throughout delivery
            </p>
          </div>
        )}

        {/* Tracking Timeline */}
        {delivery.tracking_updates && delivery.tracking_updates.length > 0 && (
          <div>
            <p className="font-medium text-gray-900 mb-4">Tracking Timeline</p>
            <div className="space-y-4">
              {delivery.tracking_updates.slice().reverse().map((update, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-600' : 'bg-gray-300'}`} />
                    {index < delivery.tracking_updates.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900">{update.status}</p>
                    <p className="text-sm text-gray-600">{update.message}</p>
                    {update.location && (
                      <p className="text-xs text-gray-500 mt-1">{update.location}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(update.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {delivery.issues && delivery.issues.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 mb-2">Reported Issues</p>
                <ul className="space-y-1">
                  {delivery.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-red-700">• {issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}