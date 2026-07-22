import { useEffect, useState } from 'react';
import { azkarCategories } from '../data/azkar';
import { useArabicSpeech } from '../useArabicSpeech';
import { useAuth } from '../AuthContext';
import { watchAzkarCounts, incrementAzkarCount, resetAzkarCount } from '../userData';

export default function AzkarSection() {
  const [activeCategory, setActiveCategory] = useState(azkarCategories[0].category);
  const { speak, speakingId, supported } = useArabicSpeech();
  const { user } = useAuth();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    if (!user) {
      setCounts({});
      return;
    }
    return watchAzkarCounts(user.uid, setCounts);
  }, [user]);

  const current = azkarCategories.find((c) => c.category === activeCategory);

  return (
    <section id="azkar" className="scroll-mt-20 bg-emerald-50 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Daily Azkar</h2>
      <p className="text-gray-500 mt-2">Remembrances and supplications for morning, evening, and daily life</p>

      <div className="flex flex-wrap gap-2 justify-center mt-6">
        {azkarCategories.map((c) => (
          <button
            key={c.category}
            onClick={() => setActiveCategory(c.category)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === c.category
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-400'
            }`}
          >
            {c.category}
          </button>
        ))}
      </div>

      <div className="space-y-5 mt-8 max-w-2xl mx-auto text-left">
        {current.items.map((item, i) => {
          const itemId = `${activeCategory}-${i}`;
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <p dir="rtl" className="text-2xl text-emerald-800 leading-relaxed flex-1">
                  {item.arabic}
                </p>
                {supported && (
                  <button
                    onClick={() => speak(itemId, item.arabic)}
                    className="text-xs text-emerald-700 hover:underline shrink-0 mt-1"
                  >
                    {speakingId === itemId ? '⏸ Pause' : '▶ Listen'}
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-3 text-sm italic">{item.translation}</p>
              {user && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => incrementAzkarCount(user.uid, itemId, counts)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-1.5 rounded-full"
                  >
                    Count: {counts[itemId] || 0}
                  </button>
                  {(counts[itemId] || 0) > 0 && (
                    <button
                      onClick={() => resetAzkarCount(user.uid, itemId, counts)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
