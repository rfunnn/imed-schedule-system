
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbw9Fh4OCD99Q1PpLGe0JZnGTHA7aVA3Io_MdnxbQHOpsNSQbTXixYtOCYOn0YgjKCcos/exec';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') return res.status(405).end();
  
  try {
    const apiKey = process.env.API_KEY;
    const params = new URLSearchParams(req.query);
    if (apiKey) params.append('key', apiKey);
    params.append('action', 'list');

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status || 200).json(data);
    } else {
      const text = await response.text();
      res.status(response.status || 200).send(text);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
