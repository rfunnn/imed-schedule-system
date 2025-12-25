
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbw9Fh4OCD99Q1PpLGe0JZnGTHA7aVA3Io_MdnxbQHOpsNSQbTXixYtOCYOn0YgjKCcos/exec';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-HTTP-Method-Override');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const { icNo } = req.query;
    let forwardedUrl = EXTERNAL_URL;
    if (icNo) {
      forwardedUrl = `${EXTERNAL_URL}?icNo=${encodeURIComponent(icNo)}`;
    }

    const headerOverride = req.headers['x-http-method-override'];
    const body = req.body;
    const wantsPatch = (headerOverride && headerOverride.toUpperCase() === 'PATCH') || (body && body._method === 'PATCH');

    const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (wantsPatch) forwardHeaders['X-HTTP-Method-Override'] = 'PATCH';

    console.log(`[Proxy] Forwarding ${req.method} to ${forwardedUrl} (Patch: ${wantsPatch})`);

    const response = await fetch(forwardedUrl, {
      method: 'POST', // Apps Script usually requires POST for everything
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      res.status(response.status).send(text);
    }
  } catch (error: any) {
    console.error('[Proxy Error]', error);
    res.status(500).json({ error: error.message });
  }
}
