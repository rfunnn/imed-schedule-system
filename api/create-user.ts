const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbwQLu6bL7TUepL4jfir_72NqikzgykC0BC0TVAzLA6JLJNyT62Potfkb8yKg0VuwxOj/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const body = req.body || {};
    const icNo = req.query.icNo || body.icNo;
    let action = req.query.action || body.action || 'create-new-user';
    
    // If the frontend specifically calls this for an update, ensure it works
    if (action === 'update-user') {
      body._method = 'PATCH';
    }

    const params = new URLSearchParams();
    if (icNo) params.append('icNo', String(icNo));
    params.append('action', String(action));
    
    const forwardedUrl = `${EXTERNAL_URL}?${params.toString()}`;

    const response = await fetch(forwardedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, action, icNo }),
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(response.status || 200).json(data);
    } catch {
      res.status(response.status || 200).send(text);
    }
  } catch (error: any) {
    console.error('[Proxy Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}