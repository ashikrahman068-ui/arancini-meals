import React from 'react';
import { ChefHat } from "lucide-react";

export default function MealPlannerLoading() {
  const messages = [
    "Analyzing your preferences...",
    "Consulting with our virtual chefs...",
    "Balancing macronutrients...",
    "Crafting a delicious week...",
    "Sourcing the freshest digital ingredients...",
    "Simmering the perfect plan...",
    "Finalizing your personalized menu...",
  ];

  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-16">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 bg-green-200 rounded-full animate-ping"></div>
        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white">
          <ChefHat className="w-12 h-12" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Generating Your Plan
      </h2>
      <p className="text-gray-600 transition-opacity duration-500">
        {message}
      </p>
    </div>
  );
}