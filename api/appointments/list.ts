const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbwvctkBRhToebC3iuHEQMmJu0v3gDY3dm5tzCrK6z0HIDC9-tiECoHwABxJJ5umjRN_/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') return res.status(405).end();
  
  try {
    const params = new URLSearchParams();
    params.append('action', 'list');

    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'action') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`);
    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      res.status(response.status || 200).json(data);
    } catch (e) {
      res.status(response.status || 200).send(text);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}