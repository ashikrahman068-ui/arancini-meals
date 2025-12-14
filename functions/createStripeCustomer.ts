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

        // Check if user already has a Stripe customer ID
        if (user.stripe_customer_id) {
            return Response.json({ 
                customer_id: user.stripe_customer_id,
                exists: true
            });
        }

        // Create new Stripe customer
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.full_name,
            metadata: {
                user_id: user.id,
                user_email: user.email
            }
        });

        // Save customer ID to user record
        await base44.auth.updateMe({
            stripe_customer_id: customer.id
        });

        return Response.json({ 
            customer_id: customer.id,
            exists: false
        });

    } catch (error) {
        console.error('Create customer error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});