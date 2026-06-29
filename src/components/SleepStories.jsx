import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storyCategories } from '../data/sleepStories';

const SLEEP_SURAHS = [
  { number: 67, name: 'Al-Mulk' },
  { number: 36, name: 'Yaseen' },
  { number: 56, name: "Al-Waqi'ah" },
  { number: 112, name: 'Al-Ikhlas' },
  { number: 113, name: 'Al-Falaq' },
  { number: 114, name: 'An-Nas' },
];

export default function SleepStories() {
  const [openStory, setOpenStory] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setSupported(true);
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function openCard(story) {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setOpenStory(story);
  }

  function closeCard() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setOpenStory(null);
  }

  function toggleNarration(story) {
    if (!supported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(story.text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    const calmVoice = voices.find((v) =>
      ['Samantha', 'Google US English', 'Microsoft Aria Online (Natural) - English (United States)', 'Microsoft Jenny Online (Natural) - English (United States)'].includes(v.name)
    ) || voices.find((v) => v.lang === 'en-US' && !v.name.toLowerCase().includes('compact'));
    if (calmVoice) utterance.voice = calmVoice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <section id="sleep" className="scroll-mt-20 bg-white py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">🌙 Sleep Stories</h2>
      <p className="text-gray-500 mt-2 max-w-xl mx-auto">
        Original short stories from Islamic history, narrated aloud to help you wind down
      </p>

      {openStory ? (
        <div className="max-w-2xl mx-auto mt-8 text-left bg-gray-50 border border-gray-100 rounded-2xl p-6">
          <button onClick={closeCard} className="text-emerald-700 text-sm font-medium hover:underline">
            &larr; Back to stories
          </button>
          <h3 className="text-2xl font-bold text-gray-800 mt-3">{openStory.title}</h3>
          <p className="text-sm text-gray-500">{openStory.subtitle} &middot; ~{openStory.minutes} min</p>

          <button
            onClick={() => toggleNarration(openStory)}
            disabled={!supported}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-full text-sm font-medium"
          >
            {speaking ? '⏸ Pause Narration' : '▶ Play Narration'}
          </button>
          {!supported && (
            <p className="text-xs text-amber-600 mt-2">
              Spoken narration isn't supported in this browser — you can still read the story below.
            </p>
          )}

          <p className="text-gray-700 leading-relaxed mt-5 whitespace-pre-line">{openStory.text}</p>
        </div>
      ) : (
        <div className="mt-8 max-w-4xl mx-auto text-left space-y-10">
          {storyCategories.map((cat) => (
            <div key={cat.category}>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{cat.category}</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {cat.stories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => openCard(story)}
                    className={`bg-gradient-to-br ${cat.color} rounded-xl p-5 text-left text-white h-36 flex flex-col justify-between hover:opacity-90 transition-opacity`}
                  >
                    <span className="text-xs bg-black/30 rounded-full px-2 py-1 self-start">
                      ~{story.minutes} min
                    </span>
                    <div>
                      <div className="font-bold leading-tight">{story.title}</div>
                      <div className="text-xs text-white/70 mt-1">{story.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Surahs for Sleep</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SLEEP_SURAHS.map((s) => (
                <Link
                  key={s.number}
                  to={`/quran?surah=${s.number}`}
                  className="bg-emerald-50 hover:bg-emerald-100 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="text-xs text-emerald-600 font-medium">Surah {s.number}</div>
                  <div className="font-bold text-gray-800">{s.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
