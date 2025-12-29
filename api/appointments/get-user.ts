const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbwQLu6bL7TUepL4jfir_72NqikzgykC0BC0TVAzLA6JLJNyT62Potfkb8yKg0VuwxOj/exec';

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