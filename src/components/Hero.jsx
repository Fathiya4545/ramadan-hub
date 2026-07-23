import { scrollToSection } from '../scrollTo';
import masjidImg from '../assets/Masjid-optimized.jpg';

export default function Hero() {
  return (
    <section id="home" className="scroll-mt-20 grid md:grid-cols-2 bg-emerald-50">
      <div className="flex flex-col justify-center px-6 md:px-16 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
          Welcome to <span className="text-emerald-600">Medina App</span>
        </h1>
        <p className="text-gray-500 mt-4 max-w-md">
          Your complete companion for the blessed month of Ramadan.
        </p>
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => scrollToSection('prayer-times')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium"
          >
            Get Started
          </button>
          <button
            onClick={() => scrollToSection('verse-of-day')}
            className="border border-emerald-600 text-emerald-700 px-6 py-3 rounded-full font-medium hover:bg-emerald-100"
          >
            Learn More
          </button>
        </div>
      </div>
      <div className="relative min-h-[320px] overflow-hidden">
        <img
          src={masjidImg}
          alt="Masjid al-Haram in Mecca"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}
