const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbxaOJydyTkze3rYZ3s-5ta_Mg79bfGMXOEenruRl2E2wgh6SSI0tK_qWcc7HB6JqK0d/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const params = new URLSearchParams();
    const incomingParams = new URLSearchParams(req.query);
    incomingParams.forEach((val, key) => params.append(key, val));

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...req.body,
        action: 'create-new-user' 
      }),
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(response.status || 200).json(data);
    } catch (e) {
      res.status(response.status || 200).send(text);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}