
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbx2MmyunYcI9HetGU8n-7at3v7hbh0ZdkPLWboEHeJEdlQKYca1g17tNe715EzLQFSs/exec';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { icNo } = req.query;
    const apiKey = process.env.API_KEY;
    
    const params = new URLSearchParams();
    if (icNo) params.append('icNo', icNo as string);
    if (apiKey) params.append('key', apiKey);
    params.append('action', 'update-user');

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'PATCH'
      },
      body: JSON.stringify({ ...req.body, _method: 'PATCH' }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
