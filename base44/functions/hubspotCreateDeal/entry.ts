import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const hubspotApiKey = Deno.env.get("HUBSPOT_API_KEY");
        if (!hubspotApiKey) {
            return Response.json({ error: 'HubSpot API key not configured' }, { status: 500 });
        }

        const { order_id, order_number, total, items, status } = await req.json();

        // First, find or create the contact
        let contactId;
        const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hubspotApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filterGroups: [{
                    filters: [{
                        propertyName: 'email',
                        operator: 'EQ',
                        value: user.email
                    }]
                }]
            })
        });

        const searchData = await searchResponse.json();
        if (searchData.results && searchData.results.length > 0) {
            contactId = searchData.results[0].id;
        } else {
            // Create contact if not exists
            const contactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${hubspotApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: {
                        email: user.email,
                        firstname: user.full_name?.split(' ')[0] || '',
                        lastname: user.full_name?.split(' ').slice(1).join(' ') || ''
                    }
                })
            });
            const contactData = await contactResponse.json();
            contactId = contactData.id;
        }

        // Map order status to deal stage
        const dealStageMap = {
            'pending': 'appointmentscheduled',
            'confirmed': 'qualifiedtobuy',
            'preparing': 'presentationscheduled',
            'ready': 'decisionmakerboughtin',
            'delivered': 'closedwon',
            'cancelled': 'closedlost'
        };

        // Create deal
        const dealData = {
            properties: {
                dealname: `Order ${order_number || order_id}`,
                amount: total,
                dealstage: dealStageMap[status] || 'appointmentscheduled',
                pipeline: 'default',
                order_id: order_id,
                order_number: order_number || '',
                closedate: new Date().toISOString().split('T')[0],
                description: items ? `Items: ${items.map(i => `${i.meal_name} (${i.quantity})`).join(', ')}` : ''
            },
            associations: [
                {
                    to: { id: contactId },
                    types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }]
                }
            ]
        };

        const dealResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hubspotApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dealData)
        });

        const dealResult = await dealResponse.json();
        return Response.json({ success: true, deal: dealResult, contact_id: contactId });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});