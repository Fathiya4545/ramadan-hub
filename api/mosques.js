const MIRRORS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lon, radius = 10000 } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
    );
    out center 25;
  `;

  let lastError;
  for (const endpoint of MIRRORS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(endpoint, {
        method: 'POST',
        body: query,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        lastError = new Error(`Mirror returned ${response.status}`);
        continue;
      }
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      lastError = err;
    }
  }

  return res.status(502).json({ error: lastError?.message || 'All mirrors failed' });
}
