
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbw9Fh4OCD99Q1PpLGe0JZnGTHA7aVA3Io_MdnxbQHOpsNSQbTXixYtOCYOn0YgjKCcos/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const { icNo } = req.query;
    if (!icNo) {
      return res.status(400).json({ error: 'icNo parameter is required' });
    }

    const apiKey = process.env.API_KEY;
    const params = new URLSearchParams();
    params.append('icNo', icNo as string);
    if (apiKey) params.append('key', apiKey);

    const forwardedUrl = `${EXTERNAL_URL}?${params.toString()}`;

    const response = await fetch(forwardedUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      res.status(response.status).send(text);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
