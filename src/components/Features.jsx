import { useNavigate } from 'react-router-dom';
import { scrollToSection } from '../scrollTo';

const features = [
  { icon: '📖', title: 'Daily Quran', desc: 'Daily verses and translations with audio recitations', route: '/quran' },
  { icon: '🕐', title: 'Prayer Times', desc: 'Accurate prayer times based on your location', id: 'prayer-times' },
  { icon: '🕌', title: 'Mosque Finder', desc: 'Find nearby mosques with directions and details', id: 'mosques' },
  { icon: '🤝', title: 'Community', desc: 'Connect with local Muslim community events', route: '/events' },
];

export default function Features() {
  const navigate = useNavigate();

  function handleClick(f) {
    if (f.route) {
      navigate(f.route);
    } else {
      scrollToSection(f.id);
    }
  }

  return (
    <section className="py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Essential Features</h2>
      <p className="text-gray-500 mt-2">Everything you need during the blessed month</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12 max-w-5xl mx-auto">
        {features.map((f) => (
          <button
            key={f.title}
            onClick={() => handleClick(f)}
            className="flex flex-col items-center text-center hover:opacity-80"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl mb-4">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-800">{f.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
