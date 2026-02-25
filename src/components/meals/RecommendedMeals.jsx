import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MealCard from './MealCard';
import { Sparkles, Loader2 } from 'lucide-react';

export default function RecommendedMeals({ currentMealId, context = 'general', title }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [currentMealId, context]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('getPersonalizedRecommendations', {
        currentMealId,
        context
      });

      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Unable to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span className="text-gray-600">Finding personalized recommendations...</span>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-yellow-500" />
        <h3 className="text-2xl font-bold text-gray-900">
          {title || (context === 'similar' ? 'You Might Also Like' : 'Recommended For You')}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
}