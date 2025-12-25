const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbxaOJydyTkze3rYZ3s-5ta_Mg79bfGMXOEenruRl2E2wgh6SSI0tK_qWcc7HB6JqK0d/exec';

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