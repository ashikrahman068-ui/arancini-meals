import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { timezone = 'America/New_York' } = await req.json();

        // Get current date/time in specified timezone
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();

        // Sunday cutoff: Before Sunday 11:59 PM
        const beforeCutoff = dayOfWeek < 6 || (dayOfWeek === 6 && hour < 23);

        if (!beforeCutoff) {
            return Response.json({ 
                allowed: false,
                message: 'Changes are not allowed after Saturday 11:59 PM. Please try again on Sunday.',
                nextCutoff: getNextCutoff(now)
            });
        }

        return Response.json({ 
            allowed: true,
            message: 'Changes are allowed',
            nextCutoff: getNextCutoff(now)
        });

    } catch (error) {
        console.error('Cutoff validation error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});

function getNextCutoff(now) {
    const nextSaturday = new Date(now);
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(23, 59, 59, 999);
    return nextSaturday.toISOString();
}