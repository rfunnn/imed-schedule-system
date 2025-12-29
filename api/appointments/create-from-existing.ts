const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbzJQQd0vTniSMk0hb9LYx3zw8ehJwFWkcZOEYBmWL2oYF8HAgfqARKY4BG0X7zHyn2k/exec';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const params = new URLSearchParams();
    params.append('action', 'create-from-existing');

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