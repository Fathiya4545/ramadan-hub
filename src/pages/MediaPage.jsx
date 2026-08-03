import { useRef, useState } from 'react';
import quranImg from '../assets/Quran2.jpg';
import recitationsImg from '../assets/Qran place.jpg';
import misharyImg from '../assets/Sheekh Mashery.JPG';
import ruqyahImg from '../assets/beutifal masjid.jpg';
import fatwaImg from '../assets/masjid.jpg';
import abdulBasitImg from '../assets/Makkah.jpg';
import makkahImg from '../assets/Makkah.jpg';
import madinahImg from '../assets/Masjid-optimized.jpg';
import islamChannelImg from '../assets/beutifal masjid.jpg';

// These are live broadcast IDs, so they die whenever the streamer restarts the
// stream — which is how the previous set went dead. YouTube's
// embed/live_stream?channel= form looks like the durable fix but renders
// "video is unavailable" for these channels, so each ID below was checked for
// isLiveNow AND playableInEmbed. Re-verify if a card ever goes black.
// Channel fallbacks: Makkah UCfBw_uwZb_oFLyVsjWk6owQ, Madinah UCOfsSW9j8JKlhbrMY39df5A
const LIVE_TV = [
  {
    id: 'makkah',
    name: 'Makkah Live HD',
    desc: 'Live 24/7 from Masjid al-Haram',
    videoId: 'mMlM1O25OyU',
    thumb: makkahImg,
  },
  {
    id: 'madinah',
    name: 'Madinah Live HD',
    desc: 'Live 24/7 from Masjid an-Nabawi',
    videoId: '3dEBSElM57U',
    thumb: madinahImg,
  },
  {
    id: 'islamchannel',
    name: 'Islam Channel',
    desc: 'English-language Islamic TV',
    videoId: 'nNOGatWmxV8',
    thumb: islamChannelImg,
  },
].map((c) => ({
  ...c,
  embedUrl: `https://www.youtube.com/embed/${c.videoId}?autoplay=1`,
  watchUrl: `https://www.youtube.com/watch?v=${c.videoId}`,
}));

const LIVE_RADIO = [
  { id: 'mix', name: 'Radio Quran (Main)', url: 'https://backup.qurango.net/radio/mix', image: quranImg },
  { id: 'salma', name: 'Beautiful Recitations', url: 'https://backup.qurango.net/radio/salma', image: recitationsImg },
  { id: 'mishary', name: 'Mishary Alafasy Radio', url: 'https://backup.qurango.net/radio/mishary_alafasi', image: misharyImg },
  { id: 'fatwa', name: 'Islamic Fatwas', url: 'https://backup.qurango.net/radio/fatwa', image: fatwaImg },
  { id: 'roqiah', name: 'Islamic Ruqyah', url: 'https://backup.qurango.net/radio/roqiah', image: ruqyahImg },
  { id: 'abdulbasit', name: 'Abdul Basit Radio', url: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad', image: abdulBasitImg },
];

function TVCard({ channel, playing, onPlay }) {
  const isPlaying = playing === channel.id;
  return (
    <div className="rounded-2xl overflow-hidden bg-black shadow-lg">
      {isPlaying ? (
        <div className="aspect-video">
          <iframe
            src={channel.embedUrl}
            title={channel.name}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          onClick={() => onPlay(channel.id)}
          className="relative w-full aspect-video flex items-center justify-center bg-cover bg-center"
          style={channel.thumb ? { backgroundImage: `url(${channel.thumb})` } : { backgroundColor: '#111' }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <span className="relative w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-2xl">
            ▶
          </span>
        </button>
      )}
      <div className="p-4 text-left flex items-end justify-between gap-3">
        <div>
          <p className="text-white font-bold">{channel.name}</p>
          <p className="text-white/50 text-xs mt-0.5">{channel.desc}</p>
        </div>
        {/* Live IDs go stale without warning; always leave a way through. */}
        <a
          href={channel.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs text-white/50 hover:text-white underline decoration-dotted"
        >
          Watch on YouTube ↗
        </a>
      </div>
    </div>
  );
}

function RadioCard({ station, playingId, onToggle }) {
  const isPlaying = playingId === station.id;
  return (
    <button
      onClick={() => onToggle(station)}
      className="rounded-2xl p-5 text-left text-white h-32 flex flex-col justify-between hover:opacity-90 transition-opacity relative bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${station.image})` }}
    >
      <div className="absolute inset-0 bg-black/45" />
      <span className="relative text-2xl">{isPlaying ? '⏸' : '▶'}</span>
      <span className="relative font-bold leading-tight drop-shadow">{station.name}</span>
      {isPlaying && (
        <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white dark:bg-gray-800" />
        </span>
      )}
    </button>
  );
}

export default function MediaPage() {
  const [playingTv, setPlayingTv] = useState(null);
  const [playingRadio, setPlayingRadio] = useState(null);
  const audioRef = useRef(null);

  function toggleRadio(station) {
    if (!audioRef.current) return;
    if (playingRadio === station.id) {
      audioRef.current.pause();
      setPlayingRadio(null);
      return;
    }
    audioRef.current.src = station.url;
    audioRef.current.play().catch(() => {});
    setPlayingRadio(station.id);
  }

  return (
    <section className="min-h-screen bg-gray-950 py-14 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center">📺 Media</h2>
        <p className="text-white/50 text-center mt-2">Live TV and radio from the Haramain and beyond</p>

        <h3 className="text-white text-xl font-bold mt-10 mb-1">Live TV</h3>
        <p className="text-white/50 text-sm mb-5">
          Watch free Islamic TV channels including Makkah, Madinah, and Islam Channel
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {LIVE_TV.map((ch) => (
            <TVCard key={ch.id} channel={ch} playing={playingTv} onPlay={setPlayingTv} />
          ))}
        </div>

        <h3 className="text-white text-xl font-bold mt-12 mb-1">Live Radio</h3>
        <p className="text-white/50 text-sm mb-5">Listen to the best Islamic live radio stations</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {LIVE_RADIO.map((station) => (
            <RadioCard key={station.id} station={station} playingId={playingRadio} onToggle={toggleRadio} />
          ))}
        </div>

        {playingRadio && (
          <div className="sticky bottom-4 mt-8 max-w-md mx-auto bg-emerald-900 text-white rounded-2xl shadow-lg px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              🔊 {LIVE_RADIO.find((s) => s.id === playingRadio)?.name}
            </span>
            <button
              onClick={() => toggleRadio(LIVE_RADIO.find((s) => s.id === playingRadio))}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-full"
            >
              Stop
            </button>
          </div>
        )}

        <audio ref={audioRef} onEnded={() => setPlayingRadio(null)} />
      </div>
    </section>
  );
}
