import { useEffect, useState } from 'react';
import { fetchMonthlyCalendar, fetchCityCoords } from '../api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function PrayerCalendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState('your location');
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityQuery, setCityQuery] = useState('');
  const [searchingCity, setSearchingCity] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Location unavailable — search for your city below.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        setError('Location denied — search for your city below.');
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError(null);
    fetchMonthlyCalendar(coords.lat, coords.lon, month, year)
      .then(setDays)
      .catch(() => setError('Could not load the prayer calendar.'))
      .finally(() => setLoading(false));
  }, [coords, month, year]);

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

  const hijriLabel =
    days.length > 0
      ? [...new Set(days.map((d) => `${d.hijriMonth} ${d.hijriYear}`))].join(' / ') + ' AH'
      : '';

  const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <section className="scroll-mt-20 py-16 px-4 md:px-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Prayer Times Calendar</h2>
        <p className="text-gray-500 mt-2">
          Full monthly timetable for {locationLabel} &middot; Medina (Umm al-Qura) calendar
        </p>
        {hijriLabel && <p className="text-emerald-700 text-sm font-medium mt-1">{hijriLabel}</p>}
      </div>

      <form
        onSubmit={handleCitySearch}
        className="flex flex-col sm:flex-row gap-2 justify-center mt-6 max-w-md mx-auto"
      >
        <input
          type="text"
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
          placeholder="Search a city (e.g. Seattle, WA)"
          autoComplete="off"
          className="px-4 py-2 rounded-full border border-gray-200 text-sm outline-none flex-1"
        />
        <button
          type="submit"
          disabled={searchingCity}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-full text-sm font-medium"
        >
          {searchingCity ? '...' : 'Search'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 justify-center mt-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
        >
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-amber-600 text-sm mt-4 text-center">{error}</p>}
      {loading && <p className="text-gray-400 text-sm mt-6 text-center">Loading calendar...</p>}

      {!loading && days.length > 0 && (
        <div className="mt-8 max-w-5xl mx-auto overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm text-center border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-emerald-900 text-white">
                <th className="py-3 px-2 font-semibold">Day</th>
                <th className="py-3 px-2 font-semibold">Date</th>
                <th className="py-3 px-2 font-semibold">Hijri</th>
                <th className="py-3 px-2 font-semibold">Fajr</th>
                <th className="py-3 px-2 font-semibold">Sunrise</th>
                <th className="py-3 px-2 font-semibold">Dhuhr</th>
                <th className="py-3 px-2 font-semibold">Asr</th>
                <th className="py-3 px-2 font-semibold bg-emerald-700">Maghrib</th>
                <th className="py-3 px-2 font-semibold">Isha</th>
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
                        ? 'bg-amber-100 font-semibold'
                        : isFriday
                        ? 'bg-emerald-800 text-white'
                        : 'odd:bg-white even:bg-emerald-50/50'
                    }
                  >
                    <td className="py-2 px-2">{d.weekday.slice(0, 3)}</td>
                    <td className="py-2 px-2">{d.gregorianDay}</td>
                    <td className="py-2 px-2">{d.hijriDay}</td>
                    <td className="py-2 px-2">{d.fajr}</td>
                    <td className="py-2 px-2">{d.sunrise}</td>
                    <td className="py-2 px-2">{d.dhuhr}</td>
                    <td className="py-2 px-2">{d.asr}</td>
                    <td className={`py-2 px-2 font-medium ${isFriday || isToday ? '' : 'text-emerald-700'}`}>
                      {d.maghrib}
                    </td>
                    <td className="py-2 px-2">{d.isha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && days.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Times calculated with the Umm al-Qura method (Makkah &amp; Medina). Fridays highlighted.
        </p>
      )}
    </section>
  );
}
