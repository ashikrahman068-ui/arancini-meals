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
        const lineItems = items.map(item => {
            const productData = {
                name: item.name,
                description: item.description || '',
            };
            
            // Only add images for payment mode with valid HTTPS URLs
            // Subscription mode: skip images to avoid Stripe validation issues
            if (mode !== 'subscription' && item.image_url) {
                const url = item.image_url.trim();
                // Strict validation: must be HTTPS, not blob/data URLs, not relative paths
                if (url.startsWith('https://') && !url.startsWith('https://blob:') && !url.includes('data:image')) {
                    productData.images = [url];
                }
            }
            
            return {
                price_data: {
                    currency: 'aud',
                    product_data: productData,
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                    ...(mode === 'subscription' && item.recurring && {
                        recurring: {
                            interval: item.recurring.interval || 'week',
                            interval_count: item.recurring.interval_count || 1,
                        }
                    })
                },
                quantity: item.quantity || 1,
            };
        });

        // Get or create Stripe customer
        let customerId = user.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.full_name,
                metadata: {
                    user_id: user.id,
                    user_email: user.email
                }
            });
            customerId = customer.id;
            
            // Save customer ID to user
            await base44.auth.updateMe({
                stripe_customer_id: customerId
            });
        }

        // Prepare session config
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: mode || 'payment',
            success_url: `${origin}/?page=paymentsuccess&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/?page=paymentcancel`,
            customer: customerId,
            client_reference_id: orderId || subscriptionId || user.id,
            metadata: {
                user_id: user.id,
                user_email: user.email,
                order_id: orderId || '',
                subscription_id: subscriptionId || '',
                draft_id: metadata?.draft_id || '',
                ...metadata
            }
        };

        // Validate required fields before creating session
        if (!sessionConfig.success_url || !sessionConfig.cancel_url) {
            console.error('Missing required URLs');
            return Response.json({ 
                error: 'Invalid checkout configuration: missing success/cancel URLs' 
            }, { status: 400 });
        }

        if (!sessionConfig.mode) {
            console.error('Missing checkout mode');
            return Response.json({ 
                error: 'Invalid checkout configuration: missing mode' 
            }, { status: 400 });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create(sessionConfig);

        return Response.json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('=== CHECKOUT ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error type:', error.type);
        console.error('Error code:', error.code);
        console.error('Full error:', JSON.stringify(error, null, 2));
        
        // Extract meaningful error message
        const errorMessage = error.raw?.message || error.message || 'Failed to create checkout session';
        const errorDetails = {
            message: errorMessage,
            type: error.type,
            code: error.code,
            param: error.param
        };
        
        console.error('Returning error:', errorDetails);
        
        return Response.json({ 
            error: errorMessage,
            details: errorDetails
        }, { status: 500 });
    }
});