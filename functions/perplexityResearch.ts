import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { query, model = 'llama-3.1-sonar-large-128k-online' } = await req.json();
    
    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Call Perplexity API
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!perplexityApiKey) {
      return Response.json({ error: 'Perplexity API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful research assistant. Provide detailed, accurate, and well-sourced information. Include relevant citations and sources when available.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      return Response.json({ 
        error: 'Failed to get research from Perplexity',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json({
      success: true,
      query: query,
      response: data.choices[0]?.message?.content || '',
      model: model,
      citations: data.citations || [],
      usage: data.usage || {}
    });

  } catch (error) {
    console.error('Error in perplexityResearch:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});