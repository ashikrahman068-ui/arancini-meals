
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Users, 
  ChefHat,
  Flame,
  Plus,
  X,
  Star,
  Leaf,
  Zap,
  MessageSquare
} from "lucide-react";
import ReviewForm from '../reviews/ReviewForm';
import ReviewList from '../reviews/ReviewList';

export default function MealDetailsModal({ meal, isOpen, onClose, onAddToCart }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (isOpen && meal) {
      loadReviews();
      checkUserPurchase();
    }
  }, [isOpen, meal]);

  const loadReviews = async () => {
    if (!meal) return;
    
    setLoadingReviews(true);
    try {
      const fetchedReviews = await base44.entities.Review.filter(
        { meal_id: meal.id },
        '-created_date'
      );
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkUserPurchase = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check if user has ordered this meal
      const orders = await base44.entities.Order.filter({
        customer_email: currentUser.email
      });

      const hasPurchased = orders.some(order => 
        order.items?.some(item => item.meal_id === meal.id)
      );

      setUserOrders(orders);
      setShowReviewForm(hasPurchased);
    } catch (error) {
      // User not logged in or error fetching user/orders
      setUser(null);
      setShowReviewForm(false);
    }
  };

  const handleReviewSubmitted = () => {
    loadReviews(); // Reload reviews to show the new one
    setShowReviewForm(false); // Optionally hide the form after submission, or refresh it
  };

  if (!meal) return null;

  const getDietaryBadgeColor = (tag) => {
    const colors = {
      'vegan': 'bg-green-100 text-green-700 border-green-200',
      'vegetarian': 'bg-green-100 text-green-700 border-green-200',
      'gluten-free': 'bg-blue-100 text-blue-700 border-blue-200',
      'keto': 'bg-purple-100 text-purple-700 border-purple-200',
      'high-protein': 'bg-orange-100 text-orange-700 border-orange-200',
      'low-carb': 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[tag] || 'bg-gray-100 text-gray-700 border-gray-200';
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
      return `${seconds} seconds`;
    }
    return `${minutes} minutes`;
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Meal Details</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="relative">
            <img 
              src={meal.image_url} 
              alt={meal.name}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {meal.is_featured && (
                <Badge className="bg-orange-500 text-white border-0 shadow-md">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-900">
                    {meal.nutrition?.calories || 0} calories
                  </span>
                </div>
              </div>
              {meal.prep_time && (
                <div className="bg-blue-500/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {formatPrepTime(meal.prep_time)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {meal.name}
              </h1>
              
              {/* Rating Summary */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              
              <p className="text-gray-600 leading-relaxed">
                {meal.description}
              </p>
            </div>

            {/* Dietary Tags */}
            {meal.dietary_tags && meal.dietary_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {meal.dietary_tags.map(tag => (
                  <Badge key={tag} variant="secondary" className={`${getDietaryBadgeColor(tag)} border`}>
                    <CuisineIcon className="w-3 h-3 mr-1" />
                    {tag.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4 py-4 px-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {meal.servings || 1}
                </div>
                <div className="text-xs text-gray-500">Serving{meal.servings > 1 ? 's' : ''}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatPrepTime(meal.prep_time || 0)}
                </div>
                <div className="text-xs text-gray-500">Prep Time</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <ChefHat className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-sm font-semibold text-gray-900 capitalize">
                  {meal.cuisine_type?.replace('_', ' ') || 'Gourmet'}
                </div>
                <div className="text-xs text-gray-500">Cuisine</div>
              </div>
            </div>

            {/* Price and Add to Cart */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  ${meal.price?.toFixed(2) || '0.00'}
                </span>
                <span className="text-sm text-gray-500 ml-1">per serving</span>
              </div>
              <Button 
                size="lg"
                onClick={() => onAddToCart(meal)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Comprehensive Nutrition Information */}
        <Separator className="my-6" />

        {meal.nutrition && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Complete Nutrition Facts
            </h3>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-orange-600">
                    {meal.nutrition.calories || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Calories</div>
                  <div className="text-xs text-gray-500 mt-1">per serving</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-blue-600">
                    {meal.nutrition.protein || 0}g
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Protein</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {meal.nutrition.calories > 0 ? Math.round((meal.nutrition.protein * 4 / meal.nutrition.calories) * 100) : 0}% of calories
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600">
                    {meal.nutrition.carbs || 0}g
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Carbs</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {meal.nutrition.calories > 0 ? Math.round((meal.nutrition.carbs * 4 / meal.nutrition.calories) * 100) : 0}% of calories
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-purple-600">
                    {meal.nutrition.fat || 0}g
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Fat</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {meal.nutrition.calories > 0 ? Math.round((meal.nutrition.fat * 9 / meal.nutrition.calories) * 100) : 0}% of calories
                  </div>
                </div>
              </div>
              
              {/* Additional Nutrition */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {meal.nutrition.fiber || 0}g
                  </div>
                  <div className="text-xs text-gray-600">Dietary Fiber</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {meal.nutrition.sugar || 0}g
                  </div>
                  <div className="text-xs text-gray-600">Sugar</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {meal.nutrition.sodium || 0}mg
                  </div>
                  <div className="text-xs text-gray-600">Sodium</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients */}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Fresh Ingredients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {meal.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">{ingredient.name}</span>
                    <span className="text-sm text-gray-600">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        {meal.instructions && meal.instructions.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Easy Heating Instructions
              </h3>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="space-y-4">
                  {meal.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">
                        {instruction}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <strong>Total prep time:</strong> {formatPrepTime(meal.prep_time || 0)} - Ready to enjoy!
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reviews Section */}
        <Separator className="my-6" />
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            Customer Reviews ({reviews.length})
          </h3>

          {/* Review Form - Only shown if user has purchased */}
          {showReviewForm && user && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Write a Review</h4>
              <ReviewForm 
                meal={meal} 
                orderId={userOrders.find(order => order.items?.some(item => item.meal_id === meal.id))?.id}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          )}

          {!user && (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Log in to leave a review after purchasing this meal.
              </p>
            </div>
          )}
          
          {user && !showReviewForm && (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                You can write a review after purchasing this meal.
              </p>
            </div>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <ReviewList reviews={reviews} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
