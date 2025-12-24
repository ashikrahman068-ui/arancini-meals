import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const draftData = await req.json();

        // Validate cutoff
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const beforeCutoff = dayOfWeek < 6 || (dayOfWeek === 6 && hour < 23);

        if (!beforeCutoff) {
            return Response.json({ 
                error: 'Subscriptions cannot be created after Saturday 11:59 PM. Please try again on Sunday.',
                cutoffExceeded: true
            }, { status: 403 });
        }

        // Validate required fields
        if (!draftData.plan_id || !draftData.selected_meals || !draftData.delivery_address) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create draft with user email
        let draft;
        let subscription;

        try {
            draft = await base44.entities.SubscriptionDraft.create({
                ...draftData,
                user_email: user.email,
                status: 'pending'
            });
            console.log('Draft created:', draft.id);
        } catch (draftError) {
            console.error('Failed to create draft:', draftError);
            return Response.json({ 
                error: 'Failed to create subscription draft: ' + draftError.message 
            }, { status: 500 });
        }

        // Create pending subscription
        try {
            subscription = await base44.entities.Subscription.create({
                user_email: user.email,
                plan_type: draftData.plan_type,
                plan_name: draftData.plan_name,
                meals_per_week: draftData.meals_per_week,
                price_per_delivery: draftData.price_per_delivery,
                discount_percentage: draftData.discount_percentage || 0,
                status: 'pending',
                meal_preferences: {
                    selected_meals: draftData.selected_meals,
                    dietary_preferences: draftData.dietary_preferences || [],
                    excluded_ingredients: []
                },
                delivery_schedule: draftData.delivery_schedule,
                delivery_address: draftData.delivery_address,
                billing_info: {
                    payment_method: draftData.payment_method || 'card',
                    next_billing_date: draftData.next_billing_date,
                    billing_cycle_count: 0
                },
                start_date: new Date().toISOString().split('T')[0],
                discount_code: draftData.referral_code || null
            });
            console.log('Subscription created:', subscription.id);
        } catch (subError) {
            console.error('Failed to create subscription:', subError);
            // Clean up draft if subscription fails
            try {
                await base44.entities.SubscriptionDraft.delete(draft.id);
            } catch (cleanupError) {
                console.error('Failed to cleanup draft:', cleanupError);
            }
            return Response.json({ 
                error: 'Failed to create subscription: ' + subError.message 
            }, { status: 500 });
        }

        console.log(`Draft ${draft.id} and subscription ${subscription.id} created for user ${user.email}`);

        return Response.json({ 
            draft,
            subscription
        });

    } catch (error) {
        console.error('Create draft error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});