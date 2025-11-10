import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, Check } from "lucide-react";

const AlternativeMealCard = ({ meal, onSelect }) => (
  <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
    <img src={meal.image_url} alt={meal.name} className="w-16 h-16 object-cover rounded-md" />
    <div className="flex-1">
      <h4 className="font-semibold text-gray-900">{meal.name}</h4>
      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {meal.nutrition?.calories} cal</span>
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {meal.popularity_score}</span>
      </div>
    </div>
    <Button size="sm" onClick={() => onSelect(meal.id)}>
      <Check className="w-4 h-4 mr-2" />
      Select
    </Button>
  </div>
);

export default function SwapMealModal({ isOpen, onClose, onConfirmSwap, allMeals, swappingMealInfo, preferences }) {
  const alternativeMeals = useMemo(() => {
    if (!swappingMealInfo || !allMeals.length) return [];

    const originalMealId = swappingMealInfo.mealId;
    const mealCategory = swappingMealInfo.mealCategory;
    const dietaryNeeds = preferences?.dietary_restrictions || [];

    return allMeals.filter(meal => {
      // Must be the same category (breakfast, lunch, etc.)
      if (meal.category !== mealCategory) return false;

      // Must not be the same meal we are swapping
      if (meal.id === originalMealId) return false;

      // Must meet all dietary requirements
      if (dietaryNeeds.length > 0) {
        const mealTags = meal.dietary_tags || [];
        const hasAllTags = dietaryNeeds.every(need => mealTags.includes(need));
        if (!hasAllTags) return false;
      }

      return true;
    }).sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0)); // Sort by popularity
  }, [swappingMealInfo, allMeals, preferences]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Swap Your Meal</DialogTitle>
          <DialogDescription>
            Choose a replacement from the list of suitable alternatives below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-4 -mr-4">
          <div className="space-y-3">
            {alternativeMeals.length > 0 ? (
              alternativeMeals.map(meal => (
                <AlternativeMealCard key={meal.id} meal={meal} onSelect={onConfirmSwap} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No suitable alternative meals found.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}