
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbzLUykxDvdFrRZYy4vcltnmXormXdK5mFBnyUw3al9NFV1OCENY_eUwCdVxiayRXLfe/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  
  // We use POST to communicate with Apps Script as it does not natively support PATCH.
  // The Apps Script looks for _method: "PATCH" in the body.
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST for updates.' });
  
  try {
    const icNo = req.query.icNo || req.body.icNo;
    const params = new URLSearchParams();
    if (icNo) params.append('icNo', icNo as string);
    
    // Forwarding the request to Apps Script
    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...req.body, 
        _method: 'PATCH', // CRITICAL: This triggers handlePatch() in the Apps Script
        icNo: icNo 
      }),
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch {
      res.status(200).send(text);
    }
  } catch (error: any) {
    console.error('[Update User Proxy Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
