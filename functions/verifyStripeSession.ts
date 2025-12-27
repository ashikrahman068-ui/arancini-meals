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

        const { sessionId } = await req.json();

        if (!sessionId) {
            return Response.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        const subscriptionId = session.metadata?.subscription_id;
        const draftId = session.metadata?.draft_id;

        // If this is a subscription payment
        if (subscriptionId && session.subscription) {
            const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
            
            // Update subscription with Stripe data using service role
            const subscription = await base44.asServiceRole.entities.Subscription.get(subscriptionId);
            
            await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
                status: 'active',
                stripe_subscription_id: stripeSubscription.id,
                stripe_customer_id: session.customer,
                billing_info: {
                    ...subscription.billing_info,
                    payment_method: session.payment_method_types?.[0] || 'stripe',
                    last_payment_date: new Date(stripeSubscription.current_period_start * 1000).toISOString().split('T')[0],
                    next_billing_date: new Date(stripeSubscription.current_period_end * 1000).toISOString().split('T')[0],
                    billing_cycle_count: 1
                }
            });

            // Mark draft as completed if exists
            if (draftId) {
                try {
                    await base44.asServiceRole.entities.SubscriptionDraft.update(draftId, {
                        status: 'completed'
                    });
                } catch (error) {
                    console.error('Error updating draft:', error);
                }
            }

            console.log('Subscription activated via frontend verification:', subscriptionId);
        }

        return Response.json({ 
            success: true, 
            session: {
                id: session.id,
                status: session.payment_status,
                subscription: session.subscription
            }
        });

    } catch (error) {
        console.error('Session verification error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});