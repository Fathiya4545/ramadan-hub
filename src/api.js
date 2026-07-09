const QURAN_BASE = 'https://api.alquran.cloud/v1';
const PRAYER_BASE = 'https://api.aladhan.com/v1';

export async function fetchVerseOfDay() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const ayahNumber = (dayOfYear % 6236) + 1;

  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${QURAN_BASE}/ayah/${ayahNumber}/quran-uthmani`),
    fetch(`${QURAN_BASE}/ayah/${ayahNumber}/en.asad`),
  ]);
  const arabic = await arabicRes.json();
  const translation = await translationRes.json();

  return {
    arabicText: arabic.data.text,
    translationText: translation.data.text,
    surahName: arabic.data.surah.englishName,
    audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`,
  };
}

export async function fetchSurahList() {
  const res = await fetch(`${QURAN_BASE}/surah`);
  const json = await res.json();
  return json.data;
}

export async function fetchSurah(number) {
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${QURAN_BASE}/surah/${number}/quran-uthmani`),
    fetch(`${QURAN_BASE}/surah/${number}/en.asad`),
  ]);
  const arabic = await arabicRes.json();
  const translation = await translationRes.json();

  return {
    ...arabic.data,
    ayahs: arabic.data.ayahs.map((ayah, i) => ({
      number: ayah.numberInSurah,
      globalNumber: ayah.number,
      arabicText: ayah.text,
      translationText: translation.data.ayahs[i].text,
    })),
  };
}

export async function fetchPrayerTimesByCoords(lat, lon) {
  const res = await fetch(
    `${PRAYER_BASE}/timings?latitude=${lat}&longitude=${lon}&method=2`
  );
  const json = await res.json();
  return { timings: json.data.timings, timezone: json.data.meta.timezone };
}

export async function fetchPrayerTimesByCity(city, country) {
  const res = await fetch(
    `${PRAYER_BASE}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`
  );
  const json = await res.json();
  if (json.code !== 200) {
    throw new Error(json.data || 'City not found');
  }
  return { timings: json.data.timings, timezone: json.data.meta.timezone };
}

export async function fetchCityCoords(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
  );
  const json = await res.json();
  if (!json.length) {
    throw new Error(`Could not find "${query}"`);
  }
  return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon), label: json[0].display_name };
}

const OVERPASS_MIRRORS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export async function fetchNearbyMosques(lat, lon, radiusMeters = 10000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});
    );
    out center 25;
  `;

  let lastError;
  for (const endpoint of OVERPASS_MIRRORS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(endpoint, {
        method: 'POST',
        body: query,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        lastError = new Error(`Overpass request failed (${res.status})`);
        continue;
      }

      const json = await res.json();
      return json.elements.map((el) => ({
        id: el.id,
        name: el.tags?.name || 'Mosque',
        lat: el.lat ?? el.center?.lat,
        lon: el.lon ?? el.center?.lon,
      }));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All Overpass mirrors failed');
}
