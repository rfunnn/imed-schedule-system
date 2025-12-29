const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbyjloynt_cjwOm7ia9F9TOw5lABkB97WjmoBO7M-NVOJLzo6t2ojwXLKp6P7J5eDzD0/exec';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const params = new URLSearchParams();
    params.append('action', 'download-form');

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}