import { useNavigate } from 'react-router-dom';
import { scrollToSection } from '../scrollTo';
import masjidImg from '../assets/Masjid-optimized.jpg';

const quickCards = [
  { icon: '🕌', label: 'Prayer Times', id: 'prayer-times' },
  { icon: '📖', label: 'Quran', to: '/quran' },
  { icon: '🧭', label: 'Qibla', id: 'qibla' },
  { icon: '🤲', label: 'Daily Duas', to: '/azkar' },
];

const stats = [
  { icon: '📖', value: '114', label: 'Surahs' },
  { icon: '📿', value: '99', label: 'Names of Allah' },
  { icon: '🕌', value: 'Nearby', label: 'Mosque Locator' },
  { icon: '🧭', value: 'Live', label: 'Qibla Direction' },
];

export default function Hero() {
  const navigate = useNavigate();

  function openCard(card) {
    if (card.to) navigate(card.to);
    else scrollToSection(card.id);
  }

  return (
    <section id="home" className="scroll-mt-20 grid md:grid-cols-2 bg-emerald-50 dark:bg-gray-900">
      <div className="flex flex-col justify-center px-6 md:px-16 py-16 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
          Welcome to <span className="text-emerald-600 dark:text-emerald-400">Medina App</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-md">
          Helping Muslims stay connected to their faith through prayer times, Quran, duas, and daily
          Islamic resources.
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-8">
          <button
            onClick={() => scrollToSection('prayer-times')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-9 py-4 rounded-full font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/quran')}
            className="border border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 px-6 py-3 rounded-full font-medium hover:bg-emerald-100 dark:hover:bg-gray-800 transition"
          >
            Explore Quran
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-md">
          {quickCards.map((card) => (
            <button
              key={card.label}
              onClick={() => openCard(card)}
              className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 rounded-2xl px-2 py-4 hover:border-emerald-400 dark:hover:border-emerald-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-600/15 dark:hover:shadow-emerald-400/10 transition duration-200"
            >
              <span className="text-2xl" aria-hidden="true">{card.icon}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center">
                {card.label}
              </span>
            </button>
          ))}
        </div>

        <dl className="flex flex-wrap gap-x-6 gap-y-3 mt-8 max-w-md">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span aria-hidden="true">{stat.icon}</span>
              <div>
                <dd className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none">
                  {stat.value}
                </dd>
                <dt className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative min-h-[320px] p-4 md:p-6">
        <img
          src={masjidImg}
          alt="Masjid al-Haram in Mecca"
          className="w-full h-full object-cover rounded-2xl shadow-lg"
        />
      </div>
    </section>
  );
}
