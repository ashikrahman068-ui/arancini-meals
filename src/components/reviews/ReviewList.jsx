import React from 'react';
import { Star, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No reviews yet. Be the first to review this meal!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSentimentBadge = (sentiment) => {
    const colors = {
      positive: 'bg-green-100 text-green-700',
      neutral: 'bg-gray-100 text-gray-700',
      negative: 'bg-red-100 text-red-700'
    };
    return colors[sentiment] || colors.neutral;
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {review.user_email?.split('@')[0]}
                  </span>
                  <Badge variant="secondary" className={getSentimentBadge(review.sentiment)}>
                    {review.sentiment}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(review.created_date)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-gray-700 leading-relaxed mt-3">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}