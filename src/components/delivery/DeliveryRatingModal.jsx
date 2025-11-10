import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Package, Clock, User, Loader2 } from 'lucide-react';

const RatingCategory = ({ label, icon: Icon, value, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                rating <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function DeliveryRatingModal({ delivery, onClose, onSubmit }) {
  const [ratings, setRatings] = useState({
    overall_rating: 5,
    timeliness_rating: 5,
    packaging_rating: 5,
    courier_rating: 5,
    feedback: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(ratings);
    setSubmitting(false);
  };

  const updateRating = (field, value) => {
    setRatings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate Your Delivery Experience</DialogTitle>
          <DialogDescription>
            Help us improve our service by sharing your feedback
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Delivery Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Delivery #{delivery.tracking_number}</p>
            <p className="text-sm text-gray-600">
              Delivered on {new Date(delivery.actual_delivery_time || delivery.created_date).toLocaleDateString()}
            </p>
          </div>

          {/* Overall Rating */}
          <RatingCategory
            label="Overall Experience"
            icon={Star}
            value={ratings.overall_rating}
            onChange={(v) => updateRating('overall_rating', v)}
          />

          {/* Timeliness Rating */}
          <RatingCategory
            label="Timeliness"
            icon={Clock}
            value={ratings.timeliness_rating}
            onChange={(v) => updateRating('timeliness_rating', v)}
          />

          {/* Packaging Rating */}
          <RatingCategory
            label="Packaging Quality"
            icon={Package}
            value={ratings.packaging_rating}
            onChange={(v) => updateRating('packaging_rating', v)}
          />

          {/* Courier Rating */}
          {delivery.courier_info && (
            <RatingCategory
              label="Courier Service"
              icon={User}
              value={ratings.courier_rating}
              onChange={(v) => updateRating('courier_rating', v)}
            />
          )}

          {/* Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Additional Feedback (Optional)
            </label>
            <Textarea
              placeholder="Tell us more about your delivery experience..."
              value={ratings.feedback}
              onChange={(e) => updateRating('feedback', e.target.value)}
              className="h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}