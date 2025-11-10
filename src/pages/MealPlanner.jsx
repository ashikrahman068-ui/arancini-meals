
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { Meal } from "@/entities/Meal";
import { MealPlan } from "@/entities/MealPlan";
import { User } from "@/entities/User";
import { useCart } from "../components/cart/CartContext";

import MealPlannerForm from "../components/meal-planner/MealPlannerForm";
import MealPlanDisplay from "../components/meal-planner/MealPlanDisplay";
import MealPlannerLoading from "../components/meal-planner/MealPlannerLoading";
import SwapMealModal from "../components/meal-planner/SwapMealModal";

import {
  Zap,
  RotateCw,
  Save,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";


export default function MealPlanner() {
  const [step, setStep] = useState('form'); // 'form', 'generating', 'display', 'error'
  const [preferences, setPreferences] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [allMeals, setAllMeals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swappingMealInfo, setSwappingMealInfo] = useState(null);
  
  const { addMultipleToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meals = await Meal.list();
        setAllMeals(meals);
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.warn("User not logged in or failed to fetch data");
      }
    };
    fetchData();
  }, []);

  const handleGeneratePlan = async (prefs) => {
    setPreferences(prefs);
    setStep('generating');
    setError(null);
    setGeneratedPlan(null);

    const mealContext = allMeals
      .filter(m => m.is_available !== false)
      .map(m => ({
        id: m.id,
        // Removed `name: m.name` from mealContext to simplify the input for the AI and reduce potential for hallucination/misuse of meal names.
        // The AI should focus solely on the ID and other structural properties.
        category: m.category,
        calories: m.nutrition?.calories,
        dietary_tags: m.dietary_tags
    }));

    const prompt = `
      You are an expert nutritionist creating a 7-day meal plan. Your primary goal is to adhere strictly to the user's preferences and the available meals.

      Client's Goal: ${prefs.fitness_goal}
      Client's Dietary Needs: ${prefs.dietary_restrictions.join(', ') || 'None'}
      Target Daily Calories: Approximately ${prefs.target_calories} calories.
      Meals per day: 3 (breakfast, lunch, dinner).

      CRITICAL INSTRUCTIONS:
      1.  You MUST ONLY use the exact meal 'id' from the "Available Meals" list provided below.
      2.  Do NOT invent, create, or hallucinate any meal IDs. If a suitable meal is not found, it is better to leave a slot empty (use null) than to invent an ID.
      3.  Ensure the meal's 'category' perfectly matches the meal slot (e.g., 'breakfast' category for the breakfast slot).
      4.  Strictly respect the client's dietary needs by checking the 'dietary_tags'.
      5.  Aim to get as close as possible to the target daily calories.

      Available Meals (JSON format, use only the 'id' field for your response):
      ${JSON.stringify(mealContext, null, 2)}

      FINAL VALIDATION: Before providing the JSON output, double-check that every single meal ID you have chosen is present in the "Available Meals" list above. An invalid ID will cause the system to fail.

      Your output MUST be a valid JSON object following the specified schema. Do not include any text, notes, or explanations outside of the JSON object.
    `;
    
    const response_json_schema = {
      type: "object",
      properties: {
        monday: { type: "object", properties: { breakfast: { type: "string", description: "The ID of the breakfast meal from the available meals list." }, lunch: { type: "string", description: "The ID of the lunch meal from the available meals list." }, dinner: { type: "string", description: "The ID of the dinner meal from the available meals list." } }, required: ["breakfast", "lunch", "dinner"] },
        tuesday: { type: "object", properties: { breakfast: { type: "string", description: "The ID of the breakfast meal from the available meals list." }, lunch: { type: "string", description: "The ID of the lunch meal from the available meals list." }, dinner: { type: "string", description: "The ID of the dinner meal from the available meals list." } }, required: ["breakfast", "lunch", "dinner"] },
        wednesday: { type: "object", properties: { breakfast: { type: "string", description: "The ID of the breakfast meal from the available meals list." }, lunch: { type: "string", description: "The ID of the lunch meal from the available meals list." }, dinner: { type: "string", description: "The ID of the dinner meal from the available meals list." } }, required: ["breakfast", "lunch", "dinner"] },
        thursday: { type: "object", properties: { breakfast: { type: "string", description: "The ID of the breakfast meal from the available meals list." }, lunch: { type: "string", description: "The ID of the lunch meal from the available meals list." }, dinner: { type: "string", description: "The ID of the dinner meal from the available meals list." } }, required: ["breakfast", "lunch", "dinner"] },
        friday: { type: "object", properties: { breakfast: { type: "string", description: "The ID of the breakfast meal from the available meals list." }, lunch: { type: "string", description: "The ID of the lunch meal from the available meals list." }, dinner: { type: "string", description: "The ID of the dinner meal from the available meals list." } }, required: ["breakfast", "lunch", "dinner"] },
        saturday: { type: "object", properties: { breakfast: { type: "string", description: "The ID of the breakfast meal from the available meals list." }, lunch: { type: "string", description: "The ID of the lunch meal from the available meals list." }, dinner: { type: "string", description: "The ID of the dinner meal from the available meals list." } }, required: ["breakfast", "lunch", "dinner"] },
        sunday: { type: "object", properties: { breakfast: { type: "string", description: "The ID of the breakfast meal from the available meals list." }, lunch: { type: "string", description: "The ID of the lunch meal from the available meals list." }, dinner: { type: "string", description: "The ID of the dinner meal from the available meals list." } }, required: ["breakfast", "lunch", "dinner"] }
      },
      required: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    };

    try {
      const result = await InvokeLLM({ prompt, response_json_schema });
      if (result) {
        // SANITIZE AND VALIDATE THE PLAN
        const sanitizedPlan = { ...result };
        const allMealIdsFromDB = new Set(allMeals.map(m => m.id));

        for (const day in sanitizedPlan) {
          for (const mealType in sanitizedPlan[day]) {
            const mealId = sanitizedPlan[day][mealType];
            // If the meal ID is invalid or doesn't exist, set it to null
            if (!mealId || !allMealIdsFromDB.has(mealId)) {
              sanitizedPlan[day][mealType] = null;
            }
          }
        }

        setGeneratedPlan(sanitizedPlan);
        setStep('display');
      } else {
        throw new Error("AI failed to generate a plan.");
      }
    } catch (e) {
      console.error("Error generating meal plan:", e);
      setError("We had trouble generating your meal plan. Please try again or adjust your preferences. " + e.message);
      setStep('error');
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan || !currentUser) {
      toast.error("You must be logged in to save a plan.");
      return;
    }

    try {
      const planToSave = {
        plan_name: `${preferences.fitness_goal.replace('_', ' ')} Plan`,
        user_email: currentUser.email,
        week_start_date: new Date().toISOString().split('T')[0],
        plan_type: preferences.fitness_goal,
        target_calories: preferences.target_calories,
        dietary_preferences: preferences.dietary_restrictions,
        meals: generatedPlan,
      };
      await MealPlan.create(planToSave);
      toast.success("Meal plan saved successfully to your account!");
    } catch (e) {
      console.error("Error saving meal plan:", e);
      toast.error("Could not save the meal plan. Please try again.");
    }
  };

  const handleAddAllToCart = () => {
    if (!generatedPlan || !allMeals.length) return;

    const mealIdsInPlan = [];
    Object.values(generatedPlan).forEach(day => {
      Object.values(day).forEach(mealId => {
        if(mealId && typeof mealId === 'string') mealIdsInPlan.push(mealId);
      });
    });

    const mealsToAdd = mealIdsInPlan.map(id => allMeals.find(m => m.id === id)).filter(Boolean);
    addMultipleToCart(mealsToAdd);

    toast.success(`${mealsToAdd.length} meals from your plan have been added to the cart!`);
  };

  const handleOpenSwapModal = (day, mealType, mealId, mealCategory) => {
    setSwappingMealInfo({ day, mealType, mealId, mealCategory });
    setIsSwapModalOpen(true);
  };

  const handleConfirmSwap = (newMealId) => {
    if (!swappingMealInfo) return;

    const { day, mealType } = swappingMealInfo;
    setGeneratedPlan(prevPlan => {
      const newPlan = { ...prevPlan };
      newPlan[day] = { ...newPlan[day], [mealType]: newMealId };
      return newPlan;
    });

    setIsSwapModalOpen(false);
    setSwappingMealInfo(null);
    toast.success("Meal swapped successfully!");
  };


  const renderContent = () => {
    switch (step) {
      case 'form':
        return <MealPlannerForm onSubmit={handleGeneratePlan} initialData={currentUser} />;
      case 'generating':
        return <MealPlannerLoading />;
      case 'display':
        return <MealPlanDisplay plan={generatedPlan} allMeals={allMeals} onSwapMeal={handleOpenSwapModal} />;
      case 'error':
        return (
          <div className="text-center">
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Generation Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => setStep('form')}>Try Again</Button>
          </div>
        );
      default:
        return <MealPlannerForm onSubmit={handleGeneratePlan} initialData={currentUser} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Zap className="w-12 h-12 text-orange-500 bg-orange-100 p-2 rounded-full mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            AI Meal Planner
          </h1>
          <p className="text-lg text-gray-600">
            Let our AI craft the perfect weekly meal plan for your goals.
          </p>
        </div>
        
        {step === 'display' && (
          <div className="flex justify-center gap-4 mb-8">
            <Button onClick={() => setStep('form')} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            {currentUser && (
              <Button onClick={handleSavePlan} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Plan
              </Button>
            )}
            <Button onClick={handleAddAllToCart} className="bg-orange-500 hover:bg-orange-600">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>
          </div>
        )}
        
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl">
          {renderContent()}
        </div>
      </div>
       <SwapMealModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onConfirmSwap={handleConfirmSwap}
        allMeals={allMeals}
        swappingMealInfo={swappingMealInfo}
        preferences={preferences}
      />
    </div>
  );
}
