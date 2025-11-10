import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function SwapUpcomingMeals({ subscription, onUpdate }) {
  const [allMeals, setAllMeals] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMeals();
  }, [subscription]);

  const loadMeals = async () => {
    try {
      const meals = await base44.entities.Meal.list();
      setAllMeals(meals.filter(m => m.is_available !== false));
      
      if (subscription?.meal_preferences?.selected_meals) {
        setSelectedMeals(subscription.meal_preferences.selected_meals);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const toggleMeal = (mealId) => {
    setSelectedMeals(prev => {
      if (prev.includes(mealId)) {
        return prev.filter(id => id !== mealId);
      }
      if (prev.length < subscription.meals_per_week) {
        return [...prev, mealId];
      }
      toast.error(`You can only select ${subscription.meals_per_week} meals`);
      return prev;
    });
  };

  const handleSave = async () => {
    if (selectedMeals.length !== subscription.meals_per_week) {
      toast.error(`Please select exactly ${subscription.meals_per_week} meals`);
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Subscription.update(subscription.id, {
        meal_preferences: {
          ...subscription.meal_preferences,
          selected_meals: selectedMeals
        }
      });
      toast.success('Meals updated for your next delivery!');
      onUpdate();
    } catch (error) {
      console.error('Error updating meals:', error);
      toast.error('Failed to update meals');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  const filteredMeals = allMeals.filter(meal => {
    const dietaryPrefs = subscription.meal_preferences?.dietary_preferences || [];
    if (dietaryPrefs.length === 0) return true;
    return dietaryPrefs.every(pref => meal.dietary_tags && meal.dietary_tags.includes(pref));
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Swap Meals for Next Delivery
          </CardTitle>
          <Badge variant="secondary">
            {selectedMeals.length}/{subscription.meals_per_week} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Choose {subscription.meals_per_week} meals for your next delivery on{' '}
          {new Date(subscription.delivery_schedule?.next_delivery_date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeals.map(meal => (
              <div
                key={meal.id}
                onClick={() => toggleMeal(meal.id)}
                className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                  selectedMeals.includes(meal.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {selectedMeals.includes(meal.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center z-10">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <img 
                  src={meal.image_url} 
                  alt={meal.name} 
                  className="w-full h-32 object-cover rounded-t-lg" 
                />
                <div className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-1">{meal.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{meal.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {meal.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {meal.nutrition?.calories || 0} cal
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setSelectedMeals(subscription.meal_preferences?.selected_meals || [])}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleSave}
            disabled={saving || selectedMeals.length !== subscription.meals_per_week}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}