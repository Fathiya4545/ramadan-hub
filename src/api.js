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
  const res = await fetch(`${QURAN_BASE}/surah/${number}/en.asad`);
  const json = await res.json();
  return json.data;
}

export async function fetchPrayerTimesByCoords(lat, lon) {
  const res = await fetch(
    `${PRAYER_BASE}/timings?latitude=${lat}&longitude=${lon}&method=2`
  );
  const json = await res.json();
  return json.data.timings;
}

export async function fetchNearbyMosques(lat, lon) {
  const query = `
    [out:json];
    node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lon});
    out body 15;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });
  const json = await res.json();
  return json.elements.map((el) => ({
    id: el.id,
    name: el.tags?.name || 'Mosque',
    lat: el.lat,
    lon: el.lon,
  }));
}
