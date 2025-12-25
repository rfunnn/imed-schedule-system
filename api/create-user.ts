
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbw9Fh4OCD99Q1PpLGe0JZnGTHA7aVA3IoMdnxbQHOpsNSQbTXixYtOCYOn0YgjKCcos/exec';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-HTTP-Method-Override');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const body = req.body || {};
    // Extract icNo and action from body or query for forwarding
    const icNo = req.query.icNo || body.icNo;
    const action = req.query.action || body.action || (req.headers['x-http-method-override'] === 'PATCH' ? 'update-user' : 'create-new-user');
    
    const apiKey = process.env.API_KEY;
    
    const params = new URLSearchParams();
    if (icNo) params.append('icNo', String(icNo));
    if (action) params.append('action', String(action));
    if (apiKey) params.append('key', apiKey);
    
    const forwardedUrl = `${EXTERNAL_URL}?${params.toString()}`;

    const headerOverride = req.headers['x-http-method-override'];
    const wantsPatch = (headerOverride && headerOverride.toUpperCase() === 'PATCH') || (body && body._method === 'PATCH');

    const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (wantsPatch) forwardHeaders['X-HTTP-Method-Override'] = 'PATCH';

    const response = await fetch(forwardedUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const text = await response.text();
    
    // Attempt to parse response as JSON, otherwise return text
    try {
      const data = JSON.parse(text);
      res.status(response.status || 200).json(data);
    } catch {
      // If the response is not JSON (like a Google error page), send as text
      res.status(response.status || 200).send(text);
    }
  } catch (error: any) {
    console.error('[Proxy Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
