import { useEffect, useState } from 'react';
import { fetchMonthlyCalendar, fetchYearlyCalendar, fetchCityCoords } from '../api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const US_CITIES = [
  { name: 'Seattle, WA', lat: 47.6062, lon: -122.3321 },
  { name: 'Atlanta, GA', lat: 33.749, lon: -84.388 },
  { name: 'Austin, TX', lat: 30.2672, lon: -97.7431 },
  { name: 'Boston, MA', lat: 42.3601, lon: -71.0589 },
  { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298 },
  { name: 'Columbus, OH', lat: 39.9612, lon: -82.9988 },
  { name: 'Dallas, TX', lat: 32.7767, lon: -96.797 },
  { name: 'Denver, CO', lat: 39.7392, lon: -104.9903 },
  { name: 'Detroit, MI', lat: 42.3314, lon: -83.0458 },
  { name: 'Houston, TX', lat: 29.7604, lon: -95.3698 },
  { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437 },
  { name: 'Miami, FL', lat: 25.7617, lon: -80.1918 },
  { name: 'Minneapolis, MN', lat: 44.9778, lon: -93.265 },
  { name: 'Nashville, TN', lat: 36.1627, lon: -86.7816 },
  { name: 'New York, NY', lat: 40.7128, lon: -74.006 },
  { name: 'Philadelphia, PA', lat: 39.9526, lon: -75.1652 },
  { name: 'Phoenix, AZ', lat: 33.4484, lon: -112.074 },
  { name: 'Portland, OR', lat: 45.5152, lon: -122.6784 },
  { name: 'San Diego, CA', lat: 32.7157, lon: -117.1611 },
  { name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194 },
  { name: 'St. Louis, MO', lat: 38.627, lon: -90.1994 },
  { name: 'Tukwila, WA', lat: 47.474, lon: -122.2610 },
  { name: 'Washington, DC', lat: 38.9072, lon: -77.0369 },
];

// US daylight saving: starts 2nd Sunday of March, ends 1st Sunday of November
function nthSunday(year, monthIndex, n) {
  const first = new Date(year, monthIndex, 1);
  const offset = (7 - first.getDay()) % 7;
  return 1 + offset + (n - 1) * 7;
}

function dstNote(month, year) {
  if (month === 3) {
    const day = nthSunday(year, 2, 2);
    return `☀️ Daylight Saving Time starts on Sunday, March ${day}, ${year}. Please move your clock one hour ahead.`;
  }
  if (month === 11) {
    const day = nthSunday(year, 10, 1);
    return `🕐 Daylight Saving Time ends on Sunday, November ${day}, ${year}. Please move your clock one hour back.`;
  }
  return null;
}

function MonthTable({ days, todayStr, isCurrentMonth }) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-2xl border-2 border-amber-500/40 bg-white">
      <table className="w-full text-sm text-center border-collapse min-w-[680px]">
        <thead>
          <tr className="bg-[#14284a] text-white">
            <th className="py-3 px-2 font-bold">DATE</th>
            <th className="py-3 px-2 font-bold">DAY</th>
            <th className="py-3 px-2 font-bold text-amber-300">HIJRI</th>
            <th className="py-3 px-2 font-bold">FAJR</th>
            <th className="py-3 px-2 font-bold">SUNRISE</th>
            <th className="py-3 px-2 font-bold">DUHR</th>
            <th className="py-3 px-2 font-bold">ASR</th>
            <th className="py-3 px-2 font-bold bg-emerald-700">MAGHRIB</th>
            <th className="py-3 px-2 font-bold">ISHA</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => {
            const isToday = isCurrentMonth && d.gregorianDate === todayStr;
            const isFriday = d.weekday === 'Friday';
            return (
              <tr
                key={d.gregorianDate}
                className={
                  isToday
                    ? 'bg-yellow-200 font-bold text-gray-900'
                    : isFriday
                    ? 'bg-[#1e3a6e] text-white font-semibold'
                    : 'odd:bg-white even:bg-blue-50/70 text-gray-800'
                }
              >
                <td className="py-2 px-2 font-semibold">{d.gregorianDay}</td>
                <td className="py-2 px-2">{d.weekday.slice(0, 3)}</td>
                <td className={`py-2 px-2 ${isFriday ? 'text-amber-300' : 'text-amber-600'} font-semibold`}>
                  {d.hijriDay}
                </td>
                <td className="py-2 px-2">{d.fajr}</td>
                <td className="py-2 px-2">{d.sunrise}</td>
                <td className="py-2 px-2">{d.dhuhr}</td>
                <td className="py-2 px-2">{d.asr}</td>
                <td
                  className={`py-2 px-2 font-bold ${
                    isToday
                      ? 'text-emerald-800 bg-emerald-100'
                      : isFriday
                      ? 'text-emerald-300 bg-emerald-900/40'
                      : 'text-emerald-700 bg-emerald-50'
                  }`}
                >
                  {d.maghrib}
                </td>
                <td className="py-2 px-2">{d.isha}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DstBanner({ month, year }) {
  const note = dstNote(month, year);
  if (!note) return null;
  return (
    <div className="mt-4 bg-yellow-300 text-blue-950 font-semibold text-sm md:text-base text-center rounded-lg px-4 py-3 shadow-lg">
      {note}
    </div>
  );
}

export default function PrayerCalendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'year'
  // Default: Seattle, WA
  const [coords, setCoords] = useState({ lat: 47.6062, lon: -122.3321 });
  const [locationLabel, setLocationLabel] = useState('Seattle, WA');
  const [days, setDays] = useState([]);
  const [yearData, setYearData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityQuery, setCityQuery] = useState('');
  const [searchingCity, setSearchingCity] = useState(false);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError(null);
    if (viewMode === 'year') {
      fetchYearlyCalendar(coords.lat, coords.lon, year)
        .then(setYearData)
        .catch(() => setError('Could not load the yearly calendar.'))
        .finally(() => setLoading(false));
    } else {
      fetchMonthlyCalendar(coords.lat, coords.lon, month, year)
        .then(setDays)
        .catch(() => setError('Could not load the prayer calendar.'))
        .finally(() => setLoading(false));
    }
  }, [coords, month, year, viewMode]);

  function handleCitySearch(e) {
    e.preventDefault();
    if (!cityQuery.trim()) return;
    setSearchingCity(true);
    setError(null);
    fetchCityCoords(cityQuery)
      .then(({ lat, lon, label }) => {
        setCoords({ lat, lon });
        setLocationLabel(label.split(',')[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setSearchingCity(false));
  }

  const activeDays = viewMode === 'month' ? days : yearData?.[now.getMonth() + 1] || [];
  const hijriLabel =
    activeDays.length > 0
      ? [...new Set(activeDays.map((d) => d.hijriYear))].join(' / ') + ' AH'
      : '';
  const hijriMonths =
    viewMode === 'month' && days.length > 0
      ? [...new Set(days.map((d) => d.hijriMonth))].join(' – ')
      : '';

  const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const hasData = viewMode === 'month' ? days.length > 0 : !!yearData;

  return (
    <section
      className="scroll-mt-20 py-10 px-3 md:px-10 min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 20% 10%, #1e3a5f 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, #7c2d12 0%, transparent 45%), linear-gradient(160deg, #0f1f3d 0%, #14284a 45%, #1a1a3e 100%)',
      }}
    >
      {/* Decorative stars */}
      <div className="text-center select-none" aria-hidden="true">
        <span className="text-amber-300/80 text-xl tracking-[1em]">✦ ✧ ✦ ✧ ✦</span>
      </div>

      {/* Poster header */}
      <div className="text-center mt-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl" aria-hidden="true">🏮</span>
          <h2
            className="text-5xl md:text-6xl font-extrabold tracking-wide"
            style={{
              color: '#f59e0b',
              textShadow: '0 2px 12px rgba(245,158,11,0.35)',
              fontFamily: 'Georgia, serif',
            }}
          >
            {viewMode === 'year' ? 'FULL YEAR' : MONTHS[month - 1].toUpperCase()}
          </h2>
          <span className="text-4xl" aria-hidden="true">🏮</span>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="text-white text-4xl md:text-5xl font-extrabold">{year}</span>
          <span className="text-amber-300 text-2xl" aria-hidden="true">✺</span>
          <div className="text-left">
            <p className="text-white font-bold text-xl md:text-2xl leading-tight">PRAYER TIMES</p>
            <p className="text-amber-300 font-semibold text-sm tracking-widest">MEDINA CALENDAR</p>
          </div>
        </div>
        <div className="text-amber-300/90 mt-3 tracking-[0.5em] text-sm select-none" aria-hidden="true">
          ✦ ・ ✧ ・ ✦ ・ ✧ ・ ✦
        </div>
        <p className="text-white font-bold text-lg md:text-xl mt-3 tracking-wide uppercase">
          {locationLabel}
          {hijriLabel && <span className="text-amber-300 font-semibold"> | {hijriLabel}</span>}
        </p>
        {hijriMonths && (
          <p className="text-emerald-200/80 text-sm mt-1">{hijriMonths}</p>
        )}
      </div>

      {/* US city picker */}
      <div className="flex flex-col items-center mt-6">
        <label className="text-amber-300 text-xs font-semibold tracking-widest uppercase mb-1">
          Choose your city
        </label>
        <select
          value={US_CITIES.some((c) => c.name === locationLabel) ? locationLabel : ''}
          onChange={(e) => {
            const city = US_CITIES.find((c) => c.name === e.target.value);
            if (!city) return;
            setCoords({ lat: city.lat, lon: city.lon });
            setLocationLabel(city.name);
          }}
          className="border border-amber-400/60 bg-white/10 text-white rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus:border-amber-300 [&>option]:text-gray-800 min-w-[220px] text-center"
        >
          <option value="">Other city (search below)</option>
          {US_CITIES.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <form
        onSubmit={handleCitySearch}
        className="flex flex-col sm:flex-row gap-2 justify-center mt-3 max-w-md mx-auto"
      >
        <input
          type="text"
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
          placeholder="Search a city (e.g. Seattle, WA)"
          autoComplete="off"
          className="px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white placeholder-white/50 text-sm outline-none flex-1 focus:border-amber-300"
        />
        <button
          type="submit"
          disabled={searchingCity}
          className="bg-amber-500 hover:bg-amber-400 disabled:bg-gray-500 text-blue-950 px-5 py-2 rounded-full text-sm font-bold"
        >
          {searchingCity ? '...' : 'Search'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {/* Month / Year toggle */}
        <div className="flex rounded-full border border-white/20 overflow-hidden">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 text-sm font-bold ${
              viewMode === 'month' ? 'bg-amber-500 text-blue-950' : 'bg-white/10 text-white'
            }`}
          >
            One Month
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-4 py-2 text-sm font-bold ${
              viewMode === 'year' ? 'bg-amber-500 text-blue-950' : 'bg-white/10 text-white'
            }`}
          >
            Whole Year
          </button>
        </div>

        {viewMode === 'month' && (
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-white/20 bg-white/10 text-white rounded-full px-4 py-2 text-sm outline-none focus:border-amber-300 [&>option]:text-gray-800"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        )}
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-white/20 bg-white/10 text-white rounded-full px-4 py-2 text-sm outline-none focus:border-amber-300 [&>option]:text-gray-800"
        >
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-amber-300 text-sm mt-4 text-center">{error}</p>}
      {loading && (
        <p className="text-white/60 text-sm mt-6 text-center">
          {viewMode === 'year' ? 'Loading the whole year — this takes a few seconds...' : 'Loading calendar...'}
        </p>
      )}

      {/* One month view */}
      {!loading && viewMode === 'month' && days.length > 0 && (
        <div className="mt-8 max-w-5xl mx-auto">
          <MonthTable
            days={days}
            todayStr={todayStr}
            isCurrentMonth={month === now.getMonth() + 1 && year === now.getFullYear()}
          />
          <DstBanner month={month} year={year} />
        </div>
      )}

      {/* Whole year view */}
      {!loading && viewMode === 'year' && yearData && (
        <div className="mt-8 max-w-5xl mx-auto space-y-12">
          {MONTHS.map((name, i) => {
            const m = i + 1;
            const monthDays = yearData[m] || [];
            if (monthDays.length === 0) return null;
            const hijri = [...new Set(monthDays.map((d) => d.hijriMonth))].join(' – ');
            return (
              <div key={name}>
                <div className="text-center mb-4">
                  <h3
                    className="text-3xl md:text-4xl font-extrabold tracking-wide"
                    style={{ color: '#f59e0b', fontFamily: 'Georgia, serif' }}
                  >
                    {name.toUpperCase()} {year}
                  </h3>
                  {hijri && <p className="text-emerald-200/80 text-sm mt-1">{hijri}</p>}
                </div>
                <MonthTable
                  days={monthDays}
                  todayStr={todayStr}
                  isCurrentMonth={m === now.getMonth() + 1 && year === now.getFullYear()}
                />
                <DstBanner month={m} year={year} />
              </div>
            );
          })}
        </div>
      )}

      {/* Poster footer */}
      {!loading && hasData && (
        <div className="max-w-5xl mx-auto mt-6 grid md:grid-cols-2 gap-4 text-left">
          <div className="bg-white/5 border border-amber-500/30 rounded-xl p-5">
            <p className="text-amber-300 font-bold mb-2">🤲 Du'a when Breaking the Fast</p>
            <p dir="rtl" className="text-white text-xl leading-relaxed">
              ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ
            </p>
            <p className="text-white/70 text-sm italic mt-2">
              The thirst has gone, the veins are quenched, and reward is certain, if Allah wills.
            </p>
          </div>
          <div className="bg-white/5 border border-amber-500/30 rounded-xl p-5">
            <p className="text-amber-300 font-bold mb-2">📖 Hadith</p>
            <p className="text-white/90 text-sm italic leading-relaxed">
              Allah's Messenger ﷺ said: "Whoever observes fast during the month of Ramadan out of
              sincere faith, and hoping to attain Allah's rewards, then all his past sins will be
              forgiven."
            </p>
            <p className="text-amber-300/80 text-xs mt-2">Sahih Al-Bukhari, 38</p>
          </div>
        </div>
      )}

      {!loading && hasData && (
        <p className="text-xs text-white/50 text-center mt-6">
          Times calculated with the Umm al-Qura method (Makkah &amp; Medina) &middot; Fridays in blue &middot; Today in yellow
        </p>
      )}
    </section>
  );
}
