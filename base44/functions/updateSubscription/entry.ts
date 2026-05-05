import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subscriptionId, action, data } = await req.json();

        if (!subscriptionId || !action) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Fetch subscription and verify ownership
        const subscription = await base44.entities.Subscription.get(subscriptionId);
        
        if (!subscription || subscription.user_email !== user.email) {
            return Response.json({ error: 'Subscription not found or unauthorized' }, { status: 404 });
        }

        // Validate cutoff for certain actions
        if (['pause', 'resume', 'update_meals', 'update_schedule'].includes(action)) {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const hour = now.getHours();
            const beforeCutoff = dayOfWeek < 6 || (dayOfWeek === 6 && hour < 23);

            if (!beforeCutoff) {
                return Response.json({ 
                    error: 'Changes are not allowed after Saturday 11:59 PM. Please try again on Sunday.',
                    cutoffExceeded: true
                }, { status: 403 });
            }
        }

        let updatedSubscription;

        switch (action) {
            case 'pause':
                // Pause Stripe subscription
                if (subscription.stripe_subscription_id) {
                    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
                        pause_collection: {
                            behavior: 'void'
                        }
                    });
                }
                
                updatedSubscription = await base44.entities.Subscription.update(subscriptionId, {
                    status: 'paused',
                    notes: `Paused on ${new Date().toISOString().split('T')[0]}`
                });
                console.log(`Subscription ${subscriptionId} paused by user ${user.email}`);
                break;

            case 'resume':
                // Resume Stripe subscription
                if (subscription.stripe_subscription_id) {
                    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
                        pause_collection: null
                    });
                }
                
                updatedSubscription = await base44.entities.Subscription.update(subscriptionId, {
                    status: 'active',
                    notes: `Resumed on ${new Date().toISOString().split('T')[0]}`
                });
                console.log(`Subscription ${subscriptionId} resumed by user ${user.email}`);
                break;

            case 'cancel':
                // Cancel Stripe subscription at period end
                if (subscription.stripe_subscription_id) {
                    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
                        cancel_at_period_end: true
                    });
                }
                
                updatedSubscription = await base44.entities.Subscription.update(subscriptionId, {
                    status: 'cancelled',
                    notes: `Cancelled on ${new Date().toISOString().split('T')[0]}. Will remain active until end of billing period.`
                });
                console.log(`Subscription ${subscriptionId} cancelled by user ${user.email}`);
                break;

            case 'update_meals':
                updatedSubscription = await base44.entities.Subscription.update(subscriptionId, {
                    meal_preferences: {
                        ...subscription.meal_preferences,
                        selected_meals: data.selected_meals
                    }
                });
                console.log(`Meals updated for subscription ${subscriptionId}`);
                break;

            case 'update_schedule':
                updatedSubscription = await base44.entities.Subscription.update(subscriptionId, {
                    delivery_schedule: {
                        ...subscription.delivery_schedule,
                        ...data
                    }
                });
                console.log(`Schedule updated for subscription ${subscriptionId}`);
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        return Response.json({ 
            success: true,
            subscription: updatedSubscription
        });

    } catch (error) {
        console.error('Update subscription error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});