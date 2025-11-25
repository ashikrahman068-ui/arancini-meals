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

                // Update order status
                if (orderId) {
                    const order = await base44.asServiceRole.entities.Order.update(orderId, {
                        payment_status: 'paid',
                        status: 'confirmed',
                        payment_method: 'stripe'
                    });

                    // Sync order to HubSpot as a deal
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

                // Update subscription status
                if (subscriptionId) {
                    await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
                        status: 'active',
                        billing_info: {
                            payment_method: 'stripe',
                            last_payment_date: new Date().toISOString(),
                        }
                    });
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
                console.log('Subscription updated:', subscription.id);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const subscriptionId = subscription.metadata?.subscription_id;
                
                if (subscriptionId) {
                    await base44.asServiceRole.entities.Subscription.update(subscriptionId, {
                        status: 'cancelled'
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