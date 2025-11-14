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

        const { items, mode, orderId, subscriptionId, metadata } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return Response.json({ error: 'Items are required' }, { status: 400 });
        }

        // Get the app URL from the request
        const url = new URL(req.url);
        const origin = url.origin;

        // Create line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.description || '',
                    images: item.image_url ? [item.image_url] : [],
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
                ...(mode === 'subscription' && item.recurring && {
                    recurring: {
                        interval: item.recurring.interval || 'week',
                        interval_count: item.recurring.interval_count || 1,
                    }
                })
            },
            quantity: item.quantity || 1,
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: mode || 'payment', // 'payment' for one-time, 'subscription' for recurring
            success_url: `${origin}/?page=paymentsuccess&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/?page=paymentcancel`,
            customer_email: user.email,
            client_reference_id: orderId || subscriptionId || user.id,
            metadata: {
                user_id: user.id,
                user_email: user.email,
                order_id: orderId || '',
                subscription_id: subscriptionId || '',
                ...metadata
            },
        });

        return Response.json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Checkout error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});