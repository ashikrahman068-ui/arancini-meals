import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Utensils, Heart, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const fitnessGoals = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_muscle', label: 'Gain Muscle' },
  { value: 'maintain_weight', label: 'Maintain Weight' },
  { value: 'improve_health', label: 'General Health' },
];

const dietaryNeeds = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'nut-free', label: 'Nut-Free' },
];

export default function MealPlannerForm({ onSubmit, initialData }) {
  const [fitnessGoal, setFitnessGoal] = useState(initialData?.fitness_goal || 'maintain_weight');
  const [targetCalories, setTargetCalories] = useState(initialData?.target_calories || 2000);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(initialData?.dietary_restrictions || []);

  const handleDietaryChange = (id) => {
    setDietaryRestrictions(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      fitness_goal: fitnessGoal,
      target_calories: targetCalories,
      dietary_restrictions: dietaryRestrictions,
    });
  };

  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <Heart className="w-6 h-6 text-green-600" />
          Customize Your Weekly Plan
        </CardTitle>
        <CardDescription>
          Tell us your preferences, and our AI will create a personalized meal plan just for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Fitness Goal */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-500" />
              What's your primary goal?
            </Label>
            <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
              <SelectTrigger className="py-6 text-lg">
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                {fitnessGoals.map(goal => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Calories */}
          <div className="space-y-4">
            <Label htmlFor="calories" className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-gray-500" />
              Daily Calorie Target
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="calories"
                min={1200}
                max={4000}
                step={50}
                value={[targetCalories]}
                onValueChange={(value) => setTargetCalories(value[0])}
              />
              <div className="w-32 border rounded-md p-2 text-center font-semibold text-lg">
                {targetCalories} cal
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Utensils className="w-5 h-5 text-gray-500" />
              Do you have any dietary needs?
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dietaryNeeds.map(diet => (
                <div key={diet.id} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                  <Checkbox
                    id={diet.id}
                    checked={dietaryRestrictions.includes(diet.id)}
                    onCheckedChange={() => handleDietaryChange(diet.id)}
                  />
                  <Label htmlFor={diet.id} className="text-base cursor-pointer">
                    {diet.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center pt-4">
            <Button type="submit" size="lg" className="w-full md:w-1/2 bg-green-600 hover:bg-green-700 text-lg py-7 rounded-xl shadow-lg">
              <Zap className="w-5 h-5 mr-2" />
              Generate My Plan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}