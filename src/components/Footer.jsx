import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { scrollToSection } from '../scrollTo';

const quickLinks = [
  { label: 'Prayer Times', type: 'anchor', id: 'prayer-times' },
  { label: 'Quran', type: 'route', to: '/quran' },
  { label: 'Find Mosque', type: 'anchor', id: 'mosques' },
  { label: 'Community', type: 'anchor', id: 'community' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  }

  function handleLinkClick(link) {
    if (link.type === 'route') {
      navigate(link.to);
      return;
    }
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToSection(link.id), 100);
    } else {
      scrollToSection(link.id);
    }
  }

  return (
    <>
      <section className="bg-emerald-800 text-white text-center py-16 px-6">
        <h2 className="text-2xl font-bold">Stay Connected</h2>
        <p className="text-emerald-100 mt-2">
          Subscribe to receive updates about prayer times, events, and more
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center mt-6 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-4 py-3 rounded-full text-gray-800 flex-1 outline-none"
            required
          />
          <button className="bg-emerald-500 hover:bg-emerald-400 px-6 py-3 rounded-full font-medium">
            Subscribe
          </button>
        </form>
        {subscribed && (
          <p className="text-emerald-200 mt-3 text-sm">Thanks for subscribing!</p>
        )}
      </section>
      <footer className="bg-emerald-950 text-emerald-200 py-10 px-6 md:px-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div>
            <Link to="/" className="font-bold text-white">☽ Medina App</Link>
            <p className="text-sm mt-2">Your complete companion for the blessed month of Ramadan.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Quick Links</h4>
            <ul className="text-sm space-y-1">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Resources</h4>
            <ul className="text-sm space-y-1">
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <button onClick={() => handleLinkClick({ type: 'route', to: '/names' })} className="hover:text-white">
                  99 Names of Allah
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick({ type: 'route', to: '/azkar' })} className="hover:text-white">
                  Azkar
                </button>
              </li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Connect</h4>
            <div className="flex gap-3">
              {[
                { label: 'Facebook', path: 'M13 10h2.5l.4-3H13V5.5c0-.97.27-1.5 1.5-1.5H16V1.1C15.6 1.05 14.6 1 13.5 1 10.9 1 9 2.6 9 5.2V7H6v3h3v9h4z' },
                { label: 'X', path: 'M3 3l7.5 9L3 21h2.4l6-7.1 5 7.1H21l-7.8-9.6L20.7 3h-2.4l-5.4 6.4L8.5 3H3z' },
                { label: 'Instagram', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.5 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z' },
                { label: 'YouTube', path: 'M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8zM10 15.5v-7l6 3.5z' },
              ].map((icon) => (
                <button
                  key={icon.label}
                  aria-label={icon.label}
                  title={`${icon.label} (coming soon)`}
                  className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-emerald-700 flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-200">
                    <path d={icon.path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs mt-8">© 2026 Medina App. All rights reserved.</p>
      </footer>
    </>
  );
}
