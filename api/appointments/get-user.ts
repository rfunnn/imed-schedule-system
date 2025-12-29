const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbziydfndSqOA3neXX6zmSeykWsYJ7OpatS9jFIVxxdVCAYCkji9XJw7E2PmQvkhxapI/exec';

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