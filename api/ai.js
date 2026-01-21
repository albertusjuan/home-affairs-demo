// Vercel Serverless Function - API Proxy
// Browser -> Vercel -> WYNI AI Hub (avoids CORS)

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const BASE_URL = process.env.WYNI_API_BASE_URL || 'https://hub.wyniai.com';
    const targetUrl = `${BASE_URL}/api/v1/developer/agent/query/stream`;

    try {
        const { message, tool_groups, context_history } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }

        // Forward request to WYNI AI Hub
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'x-tenant-subdomain': 'homeaffairshk'
            },
            body: JSON.stringify({
                message,
                tool_groups,
                context_history
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ 
                error: `API error: ${errorText}` 
            });
        }

        // Stream the response back to the client
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
        }

        res.end();
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Proxy request failed', 
            message: error.message 
        });
    }
}

