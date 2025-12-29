const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbzJQQd0vTniSMk0hb9LYx3zw8ehJwFWkcZOEYBmWL2oYF8HAgfqARKY4BG0X7zHyn2k/exec';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).end();
  
  try {
    const { icNo } = req.query;
    const params = new URLSearchParams();
    params.append('icNo', icNo as string);
    params.append('action', 'get-user');

    const response = await fetch(`${EXTERNAL_URL}?${params.toString()}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}