const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbxNY-y0uBbb8KgX4bHmKA-g0LA-ZMpP7YtOHylRaELsI-gvTfoFi_QPXqZrdTSaSdW_/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const { icNo } = req.query;
    if (!icNo) {
      return res.status(400).json({ error: 'icNo parameter is required' });
    }

    const params = new URLSearchParams();
    params.append('icNo', icNo as string);
    params.append('action', 'get-user');

    const forwardedUrl = `${EXTERNAL_URL}?${params.toString()}`;

    const response = await fetch(forwardedUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      res.status(response.status || 200).json(data);
    } catch {
      res.status(response.status || 200).send(text);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}