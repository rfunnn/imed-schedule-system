
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbx2MmyunYcI9HetGU8n-7at3v7hbh0ZdkPLWboEHeJEdlQKYca1g17tNe715EzLQFSs/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') return res.status(405).end();
  
  try {
    const apiKey = process.env.API_KEY;
    const params = new URLSearchParams();
    if (apiKey) params.append('key', apiKey);
    params.append('action', 'list');

    // Add any other query params passed from the frontend
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'action' && key !== 'key') {
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
