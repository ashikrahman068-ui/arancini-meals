import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Flame, 
  Star, 
  RotateCw, 
  Users, 
  ChefHat,
  Leaf,
  Zap,
  AlertCircle
} from "lucide-react";

function DetailedMealCard({ meal, mealType, onSwap }) {
  if (!meal) {
    return (
      <Card className="h-full bg-red-50 border-red-200 flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-sm text-red-600 text-center mb-3">
          Meal not available for {mealType}
        </p>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onSwap}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Find Alternative
        </Button>
      </Card>
    );
  }

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

  return (
    <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <img 
          src={meal.image_url} 
          alt={meal.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {meal.is_featured && (
            <Badge className="bg-orange-500 text-white border-0 shadow-md">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-900">
                {meal.nutrition?.calories || 0} cal
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-gray-900 border-0 shadow-md capitalize">
            {mealType}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{meal.name}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-3">
          {meal.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dietary Tags */}
        {meal.dietary_tags && meal.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meal.dietary_tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className={`${getDietaryBadgeColor(tag)} border text-xs`}>
                <CuisineIcon className="w-3 h-3 mr-1" />
                {tag.replace('-', ' ')}
              </Badge>
            ))}
            {meal.dietary_tags.length > 3 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                +{meal.dietary_tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="font-semibold text-gray-900">
              {meal.servings || 1}
            </div>
            <div className="text-gray-500">Serving{meal.servings > 1 ? 's' : ''}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <ChefHat className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="font-semibold text-gray-900 capitalize">
              {meal.cuisine_type?.replace('_', ' ') || 'Gourmet'}
            </div>
            <div className="text-gray-500">Cuisine</div>
          </div>
        </div>

        {/* Nutrition Information */}
        {meal.nutrition && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Nutrition Facts</h4>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="font-bold text-orange-600">{meal.nutrition.protein || 0}g</div>
                <div className="text-gray-600">Protein</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="font-bold text-green-600">{meal.nutrition.carbs || 0}g</div>
                <div className="text-gray-600">Carbs</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="font-bold text-purple-600">{meal.nutrition.fat || 0}g</div>
                <div className="text-gray-600">Fat</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="font-bold text-blue-600">{meal.nutrition.fiber || 0}g</div>
                <div className="text-gray-600">Fiber</div>
              </div>
            </div>
          </div>
        )}

        {/* Price and Swap Button */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ${meal.price?.toFixed(2) || '0.00'}
            </span>
            <span className="text-sm text-gray-500 ml-1">per serving</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSwap}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Swap Meal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MealPlanDisplay({ plan, allMeals, onSwapMeal }) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const mealTypes = ["breakfast", "lunch", "dinner"];

  const getMealById = (id) => {
    if (!id || !allMeals.length) return null;
    return allMeals.find(meal => meal.id === id);
  };

  // Calculate average daily nutrition
  const dailyNutrition = days.map(day => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    mealTypes.forEach(type => {
      const meal = getMealById(plan[day]?.[type]);
      if (meal && meal.nutrition) {
        calories += meal.nutrition.calories || 0;
        protein += meal.nutrition.protein || 0;
        carbs += meal.nutrition.carbs || 0;
        fat += meal.nutrition.fat || 0;
      }
    });
    return { calories, protein, carbs, fat };
  });
  
  const avgNutrition = {
    calories: Math.round(dailyNutrition.reduce((sum, day) => sum + day.calories, 0) / 7),
    protein: Math.round(dailyNutrition.reduce((sum, day) => sum + day.protein, 0) / 7),
    carbs: Math.round(dailyNutrition.reduce((sum, day) => sum + day.carbs, 0) / 7),
    fat: Math.round(dailyNutrition.reduce((sum, day) => sum + day.fat, 0) / 7),
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Weekly Meal Plan</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Here's your personalized plan crafted by our AI. You can swap any meal to better fit your preferences.
        </p>
      </div>

      {/* Nutrition Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flame className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600">Avg. Daily Calories</p>
          <p className="text-2xl font-bold text-orange-600">{avgNutrition.calories}</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">P</div>
          </div>
          <p className="text-sm text-gray-600">Avg. Daily Protein</p>
          <p className="text-2xl font-bold text-blue-600">{avgNutrition.protein}g</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-8 h-8 bg-green-600 rounded text-white flex items-center justify-center text-xs font-bold">C</div>
          </div>
          <p className="text-sm text-gray-600">Avg. Daily Carbs</p>
          <p className="text-2xl font-bold text-green-600">{avgNutrition.carbs}g</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-8 h-8 bg-purple-600 rounded text-white flex items-center justify-center text-xs font-bold">F</div>
          </div>
          <p className="text-sm text-gray-600">Avg. Daily Fat</p>
          <p className="text-2xl font-bold text-purple-600">{avgNutrition.fat}g</p>
        </div>
      </div>
      
      {/* Daily Meal Plans */}
      <div className="space-y-12">
        {days.map((day, dayIndex) => (
          <div key={day}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 capitalize">{day}</h3>
              <div className="text-right">
                <p className="text-sm text-gray-500">Daily Total</p>
                <p className="text-lg font-semibold text-gray-900">{dailyNutrition[dayIndex].calories} calories</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mealTypes.map(mealType => {
                const mealId = plan[day]?.[mealType];
                const meal = getMealById(mealId);
                return (
                  <DetailedMealCard 
                    key={mealType}
                    meal={meal} 
                    mealType={mealType}
                    onSwap={() => onSwapMeal(day, mealType, mealId, mealType)}
                  />
                );
              })}
            </div>
            
            {dayIndex < days.length - 1 && <Separator className="mt-8" />}
          </div>
        ))}
      </div>
    </div>
  );
}