import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const signature = req.headers.get('stripe-signature');
        
        if (!signature) {
            return Response.json({ error: 'No signature provided' }, { status: 400 });
        }

        const body = await req.text();
        
        // Verify webhook signature
        let event;
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                webhookSecret
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        console.log('Webhook event type:', event.type);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const orderId = session.metadata?.order_id;
                const subscriptionId = session.metadata?.subscription_id;
                const draftId = session.metadata?.draft_id;

                // Update order status
                if (orderId) {
                    const order = await base44.asServiceRole.entities.Order.update(orderId, {
                        payment_status: 'paid',
                        status: 'confirmed',
                        payment_method: 'stripe'
                    });

                    // Sync order to HubSpot
                    try {
                        await base44.asServiceRole.functions.invoke('hubspotCreateDeal', {
                            order_id: order.id,
                            order_number: order.order_number,
                            total: order.total,
                            items: order.items,
                            status: order.status
                        });
                    } catch (hubspotError) {
                        console.error('HubSpot sync failed:', hubspotError);
                    }
                }

                // Handle subscription completion
                if (subscriptionId && session.subscription) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
                    
                    // Get the subscription draft if exists
                    let draftData = null;
                    if (draftId) {
                        try {
                            const draft = await base44.asServiceRole.entities.SubscriptionDraft.get(draftId);
                            draftData = draft;
                            
                            // Mark draft as completed
                            await base44.asServiceRole.entities.SubscriptionDraft.update(draftId, {
                                status: 'completed'
                            });
                        } catch (error) {
                            console.error('Error fetching draft:', error);
                        }
                    }

                    // Update subscription with Stripe data
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

                    console.log('Subscription activated:', subscriptionId);
                }
                break;
            }

            case 'customer.subscription.created': {
                const subscription = event.data.object;
                const draftId = subscription.metadata?.draft_id;
                
                // Find subscription by metadata
                if (draftId) {
                    const drafts = await base44.asServiceRole.entities.SubscriptionDraft.filter({
                        id: draftId,
                        status: 'pending'
                    });
                    
                    if (drafts.length > 0) {
                        const draft = drafts[0];
                        
                        // Create subscription from draft
                        await base44.asServiceRole.entities.Subscription.create({
                            user_email: draft.user_email,
                            plan_type: draft.plan_type,
                            plan_name: draft.plan_name,
                            meals_per_week: draft.meals_per_week,
                            price_per_delivery: draft.price_per_delivery,
                            status: 'active',
                            stripe_subscription_id: subscription.id,
                            stripe_customer_id: subscription.customer,
                            meal_preferences: {
                                selected_meals: draft.selected_meals,
                                dietary_preferences: draft.dietary_preferences,
                                excluded_ingredients: []
                            },
                            delivery_schedule: draft.delivery_schedule,
                            delivery_address: draft.delivery_address,
                            billing_info: {
                                payment_method: draft.payment_method,
                                last_payment_date: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
                                next_billing_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
                                billing_cycle_count: 1
                            },
                            start_date: new Date().toISOString().split('T')[0],
                            discount_code: draft.referral_code
                        });
                        
                        console.log('Subscription created from draft:', draftId);
                    }
                }
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                console.log('Payment failed:', paymentIntent.id);
                
                // You could update order status to failed here
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                
                // Find subscription by stripe_subscription_id
                const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });
                
                if (subscriptions.length > 0) {
                    const subId = subscriptions[0].id;
                    await base44.asServiceRole.entities.Subscription.update(subId, {
                        status: subscription.status === 'active' ? 'active' : 
                               subscription.status === 'canceled' ? 'cancelled' : 
                               subscription.status === 'paused' ? 'paused' : 'active'
                    });
                }
                
                console.log('Subscription updated:', subscription.id);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                
                // Find subscription by stripe_subscription_id
                const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });
                
                if (subscriptions.length > 0) {
                    const subId = subscriptions[0].id;
                    await base44.asServiceRole.entities.Subscription.update(subId, {
                        status: 'cancelled'
                    });
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                
                // Find subscription by stripe_subscription_id
                if (invoice.subscription) {
                    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
                        stripe_subscription_id: invoice.subscription
                    });
                    
                    if (subscriptions.length > 0) {
                        const subscription = subscriptions[0];
                        await base44.asServiceRole.entities.Subscription.update(subscription.id, {
                            billing_info: {
                                ...subscription.billing_info,
                                last_payment_date: new Date().toISOString().split('T')[0],
                                billing_cycle_count: (subscription.billing_info?.billing_cycle_count || 0) + 1
                            }
                        });
                    }
                }
                
                console.log('Invoice payment succeeded:', invoice.id);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                
                // Find subscription and mark as payment_failed
                if (invoice.subscription) {
                    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
                        stripe_subscription_id: invoice.subscription
                    });
                    
                    if (subscriptions.length > 0) {
                        await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
                            status: 'payment_failed',
                            notes: `Payment failed on ${new Date().toISOString().split('T')[0]}. Please update your payment method.`
                        });
                    }
                }
                
                console.log('Invoice payment failed:', invoice.id);
                break;
            }

            case 'customer.subscription.paused': {
                const subscription = event.data.object;
                
                const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });
                
                if (subscriptions.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
                        status: 'paused'
                    });
                }
                break;
            }

            case 'customer.subscription.resumed': {
                const subscription = event.data.object;
                
                const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });
                
                if (subscriptions.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
                        status: 'active'
                    });
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});