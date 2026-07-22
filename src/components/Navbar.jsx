import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SignInModal from './SignInModal';

const links = [
  { label: 'Home', type: 'route', to: '/' },
  { label: 'Today', type: 'route', to: '/today' },
  { label: 'Prayer Times', type: 'anchor', id: 'prayer-times' },
  { label: 'Calendar', type: 'route', to: '/calendar' },
  { label: 'Parents', type: 'route', to: '/parents' },
  { label: 'Qibla', type: 'anchor', id: 'qibla' },
  { label: 'Quran', type: 'route', to: '/quran' },
  { label: '99 Names', type: 'route', to: '/names' },
  { label: 'Azkar', type: 'route', to: '/azkar' },
  { label: 'Mosques', type: 'anchor', id: 'mosques' },
  { label: 'Community', type: 'anchor', id: 'community' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logOut } = useAuth();

  function handleSignOut() {
    setShowUserMenu(false);
    setMenuOpen(false);
    logOut();
  }

  function handleNavClick(link) {
    setMenuOpen(false);
    if (link.type === 'route') {
      navigate(link.to);
      return;
    }
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-emerald-800 text-lg">
          <span>☽</span>
          <span>Ramadan Hub</span>
        </Link>
        <ul className="hidden lg:flex gap-8 text-gray-600 text-sm font-medium">
          {links.map((link) => (
            <li key={link.label}>
              <button
                onClick={() => handleNavClick(link)}
                className="hover:text-emerald-700 cursor-pointer"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 relative">
          {user ? (
            <div className="hidden sm:block relative">
              <button
                onClick={() => setShowUserMenu((o) => !o)}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 rounded-full pl-1 pr-3 py-1"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-gray-700 font-medium max-w-[100px] truncate">
                  {user.displayName || user.email}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowSignIn(true)}
              className="hidden sm:inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          >
            <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <ul className="lg:hidden flex flex-col px-6 pb-4 gap-3 text-gray-600 text-sm font-medium border-t border-gray-100">
          {links.map((link) => (
            <li key={link.label}>
              <button
                onClick={() => handleNavClick(link)}
                className="block w-full text-left py-2 hover:text-emerald-700"
              >
                {link.label}
              </button>
            </li>
          ))}
          <li>
            {user ? (
              <button
                onClick={handleSignOut}
                className="sm:hidden w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-medium mt-1"
              >
                Sign Out ({user.displayName || user.email})
              </button>
            ) : (
              <button
                onClick={() => { setShowSignIn(true); setMenuOpen(false); }}
                className="sm:hidden w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium mt-1"
              >
                Sign In
              </button>
            )}
          </li>
        </ul>
      )}

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}
