import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  ChefHat, 
  Plus, 
  Flame,
  Star,
  Leaf,
  Zap
} from "lucide-react";

export default function MealCard({ meal, onAddToCart, onViewDetails }) {
  const getDietaryBadgeColor = (tag) => {
    const colors = {
      'vegan': 'bg-green-100 text-green-700',
      'vegetarian': 'bg-green-100 text-green-700',
      'gluten-free': 'bg-blue-100 text-blue-700',
      'keto': 'bg-purple-100 text-purple-700',
      'high-protein': 'bg-orange-100 text-orange-700',
      'low-carb': 'bg-yellow-100 text-yellow-700'
    };
    return colors[tag] || 'bg-gray-100 text-gray-700';
  };

  const getCuisineIcon = (cuisine) => {
    if (cuisine === 'vegan' || cuisine === 'vegetarian') return Leaf;
    return Zap;
  };

  const CuisineIcon = getCuisineIcon(meal.cuisine_type);

  const formatPrepTime = (minutes) => {
    if (minutes === undefined || minutes === null) return "N/A";
    if (minutes < 2) {
      const seconds = Math.round(minutes * 60);
      return `${seconds} sec`;
    }
    return `${minutes} min`;
  };

  // Calculate average rating
  const averageRating = meal.average_rating || 0;
  const reviewCount = meal.review_count || 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white">
      <div className="relative overflow-hidden">
        <img 
          src={meal.image_url} 
          alt={meal.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {meal.is_featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-orange-500 text-white border-0 shadow-md">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="text-xs font-semibold text-gray-900">
              {meal.nutrition?.calories || 0}
            </span>
          </div>
        </div>
        {meal.prep_time && (
          <div className="absolute bottom-3 left-3 bg-blue-500/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-white" />
              <span className="text-xs font-semibold text-white">
                {formatPrepTime(meal.prep_time)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
            {meal.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {meal.description}
          </p>
          
          {/* Rating Display */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}
          
          {meal.dietary_tags && meal.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {meal.dietary_tags.slice(0, 2).map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className={`${getDietaryBadgeColor(tag)} text-xs`}
                >
                  <CuisineIcon className="w-3 h-3 mr-1" />
                  {tag.replace('-', ' ')}
                </Badge>
              ))}
              {meal.dietary_tags.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                  +{meal.dietary_tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {meal.nutrition && (
          <div className="grid grid-cols-4 gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-xs font-semibold text-blue-600">
                {meal.nutrition.protein || 0}g
              </div>
              <div className="text-xs text-gray-500">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-green-600">
                {meal.nutrition.carbs || 0}g
              </div>
              <div className="text-xs text-gray-500">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-purple-600">
                {meal.nutrition.fat || 0}g
              </div>
              <div className="text-xs text-gray-500">Fat</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-orange-600">
                {meal.nutrition.fiber || 0}g
              </div>
              <div className="text-xs text-gray-500">Fiber</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              ${meal.price?.toFixed(2) || '0.00'}
            </span>
            <span className="text-xs text-gray-500">per serving</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(meal)}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              Details
            </Button>
            <Button 
              size="sm"
              onClick={() => onAddToCart(meal)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}