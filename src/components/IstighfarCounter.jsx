import { useEffect, useRef, useState } from 'react';

const GOAL = 1000;
const STORAGE_KEY = 'istighfarCount';

function loadCount() {
  try {
    const raw = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(raw) && raw >= 0 && raw <= GOAL ? raw : 0;
  } catch {
    return 0;
  }
}

export default function IstighfarCounter() {
  const [count, setCount] = useState(loadCount);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const celebrated = useRef(count >= GOAL);

  // A tasbih that forgets itself on refresh is worse than no tasbih — someone
  // 800 deep should not lose the count by locking their phone.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(count));
    } catch {
      // Private browsing refuses writes; counting still works for this visit.
    }
  }, [count]);

  const reached = count >= GOAL;

  function addCount() {
    if (reached) return;
    setCount((c) => Math.min(GOAL, c + 1));
    setConfirmingReset(false);
  }

  function resetCount() {
    setCount(0);
    setConfirmingReset(false);
    celebrated.current = false;
  }

  const percent = Math.round((count / GOAL) * 100);
  // Circumference of the r=54 progress ring below.
  const circumference = 2 * Math.PI * 54;

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 bg-emerald-50/60 dark:bg-gray-900">
      <p className="text-4xl md:text-5xl text-emerald-800 dark:text-emerald-300 mb-3" lang="ar" dir="rtl">
        أَسْتَغْفِرُ اللّٰهَ
      </p>
      <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-300">Astaghfirullah</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">I ask Allah for forgiveness</p>

      <p className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 tabular-nums" aria-live="polite">
        {count} <span className="text-gray-400 dark:text-gray-500 text-2xl">/ {GOAL}</span>
      </p>

      <button
        onClick={addCount}
        disabled={reached}
        aria-label={reached ? 'Goal complete' : 'Count one Astaghfirullah'}
        className="relative mt-8 w-56 h-56 rounded-full flex items-center justify-center select-none transition active:scale-95 disabled:active:scale-100 bg-emerald-600 enabled:hover:bg-emerald-700 disabled:bg-emerald-800 text-white shadow-xl shadow-emerald-600/25"
      >
        {/* Progress ring around the tap target */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#fcd34d"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - count / GOAL)}
            style={{ transition: 'stroke-dashoffset 150ms linear' }}
          />
        </svg>
        <span className="relative text-xl font-bold">{reached ? 'Complete' : 'Tap to Count'}</span>
      </button>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">{percent}% complete</p>

      {reached && (
        <div className="mt-6 max-w-sm text-center rounded-2xl px-5 py-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800">
          <p className="font-bold text-emerald-800 dark:text-emerald-200">MashaAllah! 🎉</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
            You completed 1,000 Astaghfirullah.
          </p>
        </div>
      )}

      {/* Resetting throws away real effort, so make it a deliberate second tap. */}
      {confirmingReset ? (
        <div className="flex items-center gap-2 mt-8">
          <span className="text-sm text-gray-600 dark:text-gray-300">Reset to zero?</span>
          <button
            onClick={resetCount}
            className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
          >
            Yes, reset
          </button>
          <button
            onClick={() => setConfirmingReset(false)}
            className="px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmingReset(true)}
          disabled={count === 0}
          className="mt-8 px-8 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-800"
        >
          Reset
        </button>
      )}
    </section>
  );
}
