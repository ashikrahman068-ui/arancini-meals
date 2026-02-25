import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentMealId, context } = await req.json();

        // Fetch user's past orders
        const orders = await base44.entities.Order.filter({
            customer_email: user.email
        }, '-created_date', 20);

        // Fetch user's subscription preferences
        const subscriptions = await base44.entities.Subscription.filter({
            user_email: user.email
        }, '-created_date', 5);

        // Fetch all available meals
        const allMeals = await base44.entities.Meal.filter({
            is_available: true
        });

        // Get current meal details if provided
        let currentMeal = null;
        if (currentMealId) {
            currentMeal = await base44.entities.Meal.get(currentMealId);
        }

        // Extract user preferences from historical data
        const orderedMealIds = orders.flatMap(order => 
            order.items?.map(item => item.meal_id) || []
        );

        const dietaryPreferences = subscriptions.flatMap(sub => 
            sub.meal_preferences?.dietary_preferences || []
        );

        const excludedIngredients = subscriptions.flatMap(sub => 
            sub.meal_preferences?.excluded_ingredients || []
        );

        // Build AI prompt for personalized recommendations
        const prompt = `You are a meal recommendation expert. Analyze the user's preferences and suggest meals.

USER PROFILE:
- Dietary preferences: ${dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'None specified'}
- Excluded ingredients: ${excludedIngredients.length > 0 ? excludedIngredients.join(', ') : 'None'}
- Previously ordered meal categories: ${orders.length > 0 ? orders.flatMap(o => o.items?.map(i => i.meal_name) || []).slice(0, 10).join(', ') : 'No history'}

${currentMeal ? `CURRENT MEAL:
- Name: ${currentMeal.name}
- Category: ${currentMeal.category}
- Cuisine: ${currentMeal.cuisine_type}
- Dietary tags: ${currentMeal.dietary_tags?.join(', ') || 'None'}
- Description: ${currentMeal.description}
` : ''}

AVAILABLE MEALS:
${allMeals.map(meal => `- ID: ${meal.id}, Name: ${meal.name}, Category: ${meal.category}, Cuisine: ${meal.cuisine_type}, Tags: ${meal.dietary_tags?.join(', ') || 'None'}, Price: $${meal.price}`).join('\n')}

${context === 'similar' ? 'Recommend 4-6 meals similar to the current meal that match the user\'s preferences.' : 'Recommend 6-8 meals based on the user\'s order history and preferences. Focus on variety and nutritional balance.'}

Return ONLY meal IDs that best match, ordered by relevance. Consider:
1. Dietary restrictions (must respect these)
2. Cuisine preferences from history
3. Category variety
4. Similar flavor profiles ${currentMeal ? 'to the current meal' : ''}
5. Nutritional balance

Respond with a JSON array of meal IDs, e.g., ["id1", "id2", "id3"]`;

        // Get AI recommendations
        const recommendations = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    meal_ids: {
                        type: "array",
                        items: { type: "string" }
                    },
                    reasoning: {
                        type: "string"
                    }
                },
                required: ["meal_ids"]
            }
        });

        // Fetch full meal details for recommended IDs
        const recommendedMealIds = recommendations.meal_ids || [];
        const recommendedMeals = allMeals.filter(meal => 
            recommendedMealIds.includes(meal.id)
        );

        // Sort by the order AI recommended
        recommendedMeals.sort((a, b) => 
            recommendedMealIds.indexOf(a.id) - recommendedMealIds.indexOf(b.id)
        );

        return Response.json({
            recommendations: recommendedMeals.slice(0, context === 'similar' ? 6 : 8),
            reasoning: recommendations.reasoning
        });

    } catch (error) {
        console.error('Recommendation error:', error);
        return Response.json({ 
            error: error.message,
            recommendations: []
        }, { status: 500 });
    }
});