import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Star,
  Plus,
  Flame,
  Zap,
  Leaf,
  Clock,
  Info
} from "lucide-react";

export default function MealCard({ meal, onAddToCart, onViewDetails }) {
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
    if (minutes < 2) {
      return `${Math.round(minutes * 60)}s`;
    }
    return `${minutes}min`;
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={meal.image_url}
          alt={meal.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {meal.is_featured && (
            <Badge className="bg-orange-500 text-white border-0 shadow-md">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {meal.dietary_tags && meal.dietary_tags.slice(0, 1).map((tag) => (
            <Badge key={tag} variant="secondary" className={`${getDietaryBadgeColor(tag)} border shadow-md`}>
              <CuisineIcon className="w-3 h-3 mr-1" />
              {tag.replace('-', ' ')}
            </Badge>
          ))}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md">
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-xs font-semibold text-gray-900">
                {meal.nutrition?.calories || 0} cal
              </span>
            </div>
          </div>
          {meal.prep_time && (
            <div className="bg-blue-500/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs font-semibold text-white">
                  {formatPrepTime(meal.prep_time)} prep
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200 line-clamp-1">
              {meal.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">
              {meal.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{meal.servings || 1} serving{meal.servings > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600 font-semibold">
                {meal.cuisine_type?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {meal.nutrition && (
            <div className="grid grid-cols-3 gap-4 py-3 px-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">
                  {meal.nutrition.protein || 0}g
                </div>
                <div className="text-xs text-gray-500">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">
                  {meal.nutrition.carbs || 0}g
                </div>
                <div className="text-xs text-gray-500">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">
                  {meal.nutrition.fat || 0}g
                </div>
                <div className="text-xs text-gray-500">Fat</div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2 mt-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  ${meal.price?.toFixed(2) || '0.00'}
                </span>
                <span className="text-sm text-gray-500 ml-1 block">per serving</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(meal)}
                className="border-green-200 text-green-700 hover:bg-green-50 w-full"
              >
                <Info className="w-4 h-4 mr-1" />
                Details
              </Button>
              <Button
                size="sm"
                onClick={() => onAddToCart(meal)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}