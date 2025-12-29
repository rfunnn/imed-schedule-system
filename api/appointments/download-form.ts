
const EXTERNAL_URL = 'https://script.google.com/macros/s/AKfycbzLUykxDvdFrRZYy4vcltnmXormXdK5mFBnyUw3al9NFV1OCENY_eUwCdVxiayRXLfe/exec';

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
