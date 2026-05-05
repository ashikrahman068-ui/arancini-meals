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

        const { email, full_name, referral_code } = await req.json();

        // Create or update contact in HubSpot
        const contactData = {
            properties: {
                email: email || user.email,
                firstname: full_name?.split(' ')[0] || user.full_name?.split(' ')[0] || '',
                lastname: full_name?.split(' ').slice(1).join(' ') || user.full_name?.split(' ').slice(1).join(' ') || '',
                lifecyclestage: 'customer',
                hs_lead_status: 'NEW',
                referral_code: referral_code || ''
            }
        };

        // Try to create contact
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hubspotApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        if (response.status === 409) {
            // Contact already exists, update instead
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
                            value: email || user.email
                        }]
                    }]
                })
            });

            const searchData = await searchResponse.json();
            if (searchData.results && searchData.results.length > 0) {
                const contactId = searchData.results[0].id;
                
                const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${hubspotApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(contactData)
                });

                const updateData = await updateResponse.json();
                return Response.json({ success: true, contact: updateData, updated: true });
            }
        }

        const data = await response.json();
        return Response.json({ success: true, contact: data, created: true });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});