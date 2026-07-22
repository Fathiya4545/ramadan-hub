import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../AuthContext';
import { addEvent, fetchEvents, removeEvent } from '../userData';

const ADMIN_EMAILS = ['fathiyayoosef@gmail.com'];

const EMPTY_FORM = { title: '', date: '', time: '', location: '', description: '', videoUrl: '' };

// Compress an image file to a small base64 JPEG (fits in Firestore)
function compressImage(file, maxSize = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function youtubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match ? match[1] : null;
}

function badgeFor(dateStr) {
  if (!dateStr) return 'Event';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1) return 'Upcoming';
  return 'Past';
}

function prettyDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function EventCard({ event, isAdmin, onRemove }) {
  const badge = badgeFor(event.date);
  const ytId = youtubeId(event.videoUrl);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm text-left flex flex-col">
      {event.imageData && (
        <img src={event.imageData} alt={event.title} className="w-full h-48 object-cover" />
      )}
      {ytId && (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={event.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
              badge === 'Today'
                ? 'bg-rose-100 text-rose-700'
                : badge === 'Tomorrow'
                ? 'bg-amber-100 text-amber-700'
                : badge === 'Past'
                ? 'bg-gray-100 text-gray-500'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {badge}
          </span>
          {isAdmin && (
            <button
              onClick={() => onRemove(event.id)}
              className="ml-auto text-xs text-red-400 hover:text-red-600"
            >
              Remove
            </button>
          )}
        </div>
        <h3 className="font-bold text-gray-800 mt-3 text-lg">{event.title}</h3>
        {event.description && <p className="text-sm text-gray-500 mt-1">{event.description}</p>}
        <div className="text-xs text-gray-500 mt-auto pt-4 space-y-0.5">
          {event.date && <p>📅 {prettyDate(event.date)}</p>}
          {event.time && <p>🕐 {event.time}</p>}
          {event.location && <p>📍 {event.location}</p>}
        </div>
      </div>
    </div>
  );
}

export default function CommunityEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageData, setImageData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef(null);

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email || '').toLowerCase());

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setError('Could not load events.'))
      .finally(() => setLoading(false));
  }, []);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await compressImage(file);
      if (data.length > 950000) {
        setError('That image is too large — please choose a smaller one.');
        return;
      }
      setImageData(data);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addEvent({ ...form, imageData: imageData || null });
      setForm(EMPTY_FORM);
      setImageData(null);
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
      setEvents(await fetchEvents());
    } catch {
      setError('Could not save the event. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id) {
    await removeEvent(id);
    setEvents((evts) => evts.filter((e) => e.id !== id));
  }

  return (
    <section id="community" className="scroll-mt-20 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Community Events</h2>
      <p className="text-gray-500 mt-2">Celebrations, gatherings, and what's coming up</p>

      {error && <p className="text-amber-600 text-sm mt-3">{error}</p>}

      {isAdmin && (
        <div className="mt-6">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold"
          >
            {showForm ? 'Close' : '➕ Post an Event'}
          </button>
        </div>
      )}

      {isAdmin && showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 max-w-xl mx-auto bg-white border border-gray-100 rounded-2xl p-6 text-left space-y-3 shadow-sm"
        >
          <input
            type="text"
            required
            placeholder="Event title (e.g. Eid Celebration)"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 rounded-2xl border border-gray-200 text-sm outline-none focus:border-emerald-400"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="Time (e.g. 6:30 PM - 8:30 PM)"
              value={form.time}
              onChange={(e) => setField('time', e.target.value)}
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <input
            type="text"
            placeholder="Location (e.g. Abubakr Islamic Center, Tukwila)"
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
          />
          <div>
            <label className="text-xs text-gray-500 font-medium">📷 Event photo (optional)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full text-sm mt-1"
            />
            {imageData && (
              <img src={imageData} alt="Preview" className="mt-2 rounded-xl max-h-40 object-cover" />
            )}
          </div>
          <input
            type="url"
            placeholder="🎬 YouTube video link (optional)"
            value={form.videoUrl}
            onChange={(e) => setField('videoUrl', e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-2.5 rounded-full text-sm font-semibold"
          >
            {saving ? 'Posting...' : 'Post Event'}
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto">
        {loading && <p className="text-gray-400 text-sm col-span-full">Loading events...</p>}
        {!loading && events.length === 0 && (
          <p className="text-gray-400 text-sm col-span-full">
            No events posted yet — check back soon!
          </p>
        )}
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} isAdmin={isAdmin} onRemove={handleRemove} />
        ))}
      </div>
    </section>
  );
}
