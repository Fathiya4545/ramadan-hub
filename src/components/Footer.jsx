import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
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
            <div className="font-bold text-white">☽ Ramadan Hub</div>
            <p className="text-sm mt-2">Your complete companion for the blessed month of Ramadan.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Quick Links</h4>
            <ul className="text-sm space-y-1">
              <li>Prayer Times</li>
              <li>Quran</li>
              <li>Find Mosque</li>
              <li>Community</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Resources</h4>
            <ul className="text-sm space-y-1">
              <li>About Us</li>
              <li>Blog</li>
              <li>FAQ</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Connect</h4>
            <div className="flex gap-3 text-sm">
              <span>f</span><span>x</span><span>ig</span><span>yt</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs mt-8">© 2026 Ramadan Hub. All rights reserved.</p>
      </footer>
    </>
  );
}
