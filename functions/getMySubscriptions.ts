import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch subscriptions for the logged-in user only
        const subscriptions = await base44.entities.Subscription.filter({
            user_email: user.email
        }, '-created_date');

        console.log(`Fetched ${subscriptions.length} subscriptions for user: ${user.email}`);

        return Response.json({ subscriptions });

    } catch (error) {
        console.error('Get subscriptions error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});