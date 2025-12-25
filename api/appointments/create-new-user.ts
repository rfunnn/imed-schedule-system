
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbw9Fh4OCD99Q1PpLGe0JZnGTHA7aVA3Io_MdnxbQHOpsNSQbTXixYtOCYOn0YgjKCcos/exec';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const apiKey = process.env.API_KEY;
    const params = new URLSearchParams();
    if (apiKey) params.append('key', apiKey);
    params.append('action', 'create-new-user');

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      // Forward the external status code or default to 200
      res.status(response.status || 200).json(data);
    } else {
      data = await response.text();
      res.status(response.status || 200).send(data);
    }
  } catch (error: any) {
    console.error('[API Error]:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Proxy Error', 
      message: error.message 
    });
  }
}
