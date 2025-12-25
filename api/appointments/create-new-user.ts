
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbw9Fh4OCD99Q1PpLGe0JZnGTHA7aVA3Io_MdnxbQHOpsNSQbTXixYtOCYOn0YgjKCcos/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const apiKey = process.env.API_KEY;
    const params = new URLSearchParams();
    if (apiKey) params.append('key', apiKey);
    
    // Some scripts prefer action in query, some in body. We'll ensure it's handled.
    // We'll also pass any incoming query params to the external URL
    const incomingParams = new URLSearchParams(req.query);
    incomingParams.forEach((val, key) => params.append(key, val));

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...req.body,
        action: 'create-new-user' // Ensure action is in the body
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
      // Return the actual status from Google if possible, or 200 if it worked
      res.status(response.status || 200).json(data);
    } catch (e) {
      // If not JSON, return the raw text (could be a Google error page)
      res.status(response.status || 200).send(text);
    }
  } catch (error: any) {
    console.error('[Proxy Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
