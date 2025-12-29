
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbxaOJydyTkze3rYZ3s-5ta_Mg79bfGMXOEenruRl2E2wgh6SSI0tK_qWcc7HB6JqK0d/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  // We use POST to communicate with Apps Script as it does not natively support PATCH
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { icNo } = req.query;
    const params = new URLSearchParams();
    if (icNo) params.append('icNo', icNo as string);
    // Explicitly set the action for the Apps Script dispatcher
    params.append('action', 'update-user');

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...req.body, 
        action: 'update-user', 
        icNo: icNo 
      }),
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch {
      // In case the response is not valid JSON
      res.status(200).send(text);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
