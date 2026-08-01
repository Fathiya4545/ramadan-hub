const MIRRORS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lon, radius = '10000' } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon}););out center 25;`;

  let lastError;
  for (const endpoint of MIRRORS) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 20000);
      // Overpass wants the query form-encoded as `data=`, and the mirrors
      // reject or rate-limit requests that don't identify themselves with a
      // meaningful User-Agent (fetch's default gets a 406/429).
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MedinaApp/1.0 (+https://github.com/Dhool143; mosque finder)',
          Accept: 'application/json',
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal,
      });
      clearTimeout(tid);
      if (!upstream.ok) {
        lastError = new Error(`Mirror ${upstream.status}`);
        continue;
      }
      const data = await upstream.json();
      return res.status(200).json(data);
    } catch (err) {
      lastError = err;
    }
  }

  return res.status(502).json({ error: lastError?.message || 'All mirrors failed' });
}
