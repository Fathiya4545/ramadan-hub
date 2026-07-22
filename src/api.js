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

function mapCalendarDay(day) {
  return {
    gregorianDate: day.date.gregorian.date,
    gregorianDay: day.date.gregorian.day,
    weekday: day.date.gregorian.weekday.en,
    hijriDay: day.date.hijri.day,
    hijriMonth: day.date.hijri.month.en,
    hijriYear: day.date.hijri.year,
    fajr: day.timings.Fajr.split(' ')[0],
    sunrise: day.timings.Sunrise.split(' ')[0],
    dhuhr: day.timings.Dhuhr.split(' ')[0],
    asr: day.timings.Asr.split(' ')[0],
    maghrib: day.timings.Maghrib.split(' ')[0],
    isha: day.timings.Isha.split(' ')[0],
  };
}

export async function fetchYearlyCalendar(lat, lon, year) {
  // method=4 is Umm al-Qura, Makkah/Medina calendar; annual=true returns all 12 months
  const res = await fetch(
    `${PRAYER_BASE}/calendar?latitude=${lat}&longitude=${lon}&method=4&year=${year}&annual=true`
  );
  const json = await res.json();
  if (json.code !== 200) throw new Error('Could not load calendar');
  // json.data is { "1": [...days], "2": [...], ..., "12": [...] }
  const months = {};
  for (let m = 1; m <= 12; m++) {
    months[m] = (json.data[m] || []).map(mapCalendarDay);
  }
  return months;
}

export async function fetchMonthlyCalendar(lat, lon, month, year) {
  // method=4 is Umm al-Qura, Makkah/Medina calendar
  const res = await fetch(
    `${PRAYER_BASE}/calendar?latitude=${lat}&longitude=${lon}&method=4&month=${month}&year=${year}`
  );
  const json = await res.json();
  if (json.code !== 200) throw new Error('Could not load calendar');
  return json.data.map((day) => ({
    gregorianDate: day.date.gregorian.date,
    gregorianDay: day.date.gregorian.day,
    weekday: day.date.gregorian.weekday.en,
    hijriDay: day.date.hijri.day,
    hijriMonth: day.date.hijri.month.en,
    hijriYear: day.date.hijri.year,
    fajr: day.timings.Fajr.split(' ')[0],
    sunrise: day.timings.Sunrise.split(' ')[0],
    dhuhr: day.timings.Dhuhr.split(' ')[0],
    asr: day.timings.Asr.split(' ')[0],
    maghrib: day.timings.Maghrib.split(' ')[0],
    isha: day.timings.Isha.split(' ')[0],
  }));
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

export async function fetchNearbyMosques(lat, lon, radiusMeters = 10000) {
  const res = await fetch(
    `/api/mosques?lat=${lat}&lon=${lon}&radius=${radiusMeters}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const json = await res.json();
  return json.elements.map((el) => ({
    id: el.id,
    name: el.tags?.name || 'Mosque',
    lat: el.lat ?? el.center?.lat,
    lon: el.lon ?? el.center?.lon,
  }));
}
