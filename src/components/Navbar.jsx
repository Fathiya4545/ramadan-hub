import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import SignInModal from './SignInModal';

const navItems = [
  { label: 'Home', icon: '🏠', type: 'route', to: '/' },
  { label: 'Today', icon: '📅', type: 'route', to: '/today' },
  {
    label: 'Worship',
    icon: '🕌',
    type: 'group',
    children: [
      { label: 'Prayer Times', icon: '🕐', type: 'anchor', id: 'prayer-times' },
      { label: 'Qibla', icon: '🧭', type: 'anchor', id: 'qibla' },
      { label: 'Quran', icon: '📖', type: 'route', to: '/quran' },
      { label: 'Azkar', icon: '🤲', type: 'route', to: '/azkar' },
      { label: '99 Names', icon: '📿', type: 'route', to: '/names' },
      { label: 'Quran for Sleep', icon: '🌙', type: 'route', to: '/sleep' },
    ],
  },
  { label: 'Calendar', icon: '🗓️', type: 'route', to: '/calendar' },
  {
    label: 'Community',
    icon: '👥',
    type: 'group',
    children: [
      { label: 'Mosques', icon: '🕋', type: 'anchor', id: 'mosques' },
      { label: 'Events', icon: '🤝', type: 'route', to: '/events' },
      { label: 'Parents', icon: '👨‍👩‍👧', type: 'route', to: '/parents' },
    ],
  },
  { label: 'Media', icon: '🎥', type: 'route', to: '/media' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [openMobileGroup, setOpenMobileGroup] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (!navRef.current?.contains(e.target)) {
        setOpenGroup(null);
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function handleSignOut() {
    setShowUserMenu(false);
    setMenuOpen(false);
    logOut();
  }

  function handleNavClick(link) {
    setMenuOpen(false);
    setOpenGroup(null);
    setOpenMobileGroup(null);
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

  function isActive(item) {
    if (item.type === 'route') return location.pathname === item.to;
    if (item.type === 'group') {
      return item.children.some((c) => c.type === 'route' && location.pathname === c.to);
    }
    return false;
  }

  return (
    <nav
      ref={navRef}
      className="bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm dark:shadow-black/40 border-b border-transparent dark:border-gray-800"
    >
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-emerald-800 dark:text-emerald-300 text-2xl shrink-0"
        >
          <span className="text-3xl leading-none">☽</span>
          <span>Medina App</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8 xl:gap-10 text-gray-600 dark:text-gray-300 text-base font-medium">
          {navItems.map((item) => {
            const active = isActive(item);
            const activeClass = active
              ? 'text-emerald-700 dark:text-emerald-300 font-semibold border-emerald-600 dark:border-emerald-400'
              : 'border-transparent hover:text-emerald-700 dark:hover:text-emerald-300';

            if (item.type === 'group') {
              const open = openGroup === item.label;
              return (
                <li key={item.label} className="relative">
                  <button
                    onClick={() => setOpenGroup(open ? null : item.label)}
                    aria-expanded={open}
                    className={`flex items-center gap-1.5 py-1.5 border-b-2 cursor-pointer ${activeClass}`}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {open && (
                    <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2">
                      {item.children.map((child) => {
                        const childActive = child.type === 'route' && location.pathname === child.to;
                        return (
                          <button
                            key={child.label}
                            onClick={() => handleNavClick(child)}
                            className={`flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-gray-700 ${
                              childActive
                                ? 'text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50/60 dark:bg-gray-700/60'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            <span aria-hidden="true">{child.icon}</span>
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label}>
                <button
                  onClick={() => handleNavClick(item)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 py-1.5 border-b-2 cursor-pointer ${activeClass}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="hidden sm:block relative">
              <button
                onClick={() => setShowUserMenu((o) => !o)}
                className="flex items-center gap-2 bg-emerald-50 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-gray-700 rounded-full pl-1 pr-3 py-1"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium max-w-[100px] truncate">
                  {user.displayName || user.email}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
            aria-expanded={menuOpen}
            className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          >
            <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <ul className="lg:hidden flex flex-col px-6 pb-4 text-gray-600 dark:text-gray-300 text-base font-medium border-t border-gray-100 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);

            if (item.type === 'group') {
              const open = openMobileGroup === item.label;
              return (
                <li key={item.label} className="border-b border-gray-50 dark:border-gray-800">
                  <button
                    onClick={() => setOpenMobileGroup(open ? null : item.label)}
                    aria-expanded={open}
                    className={`flex items-center gap-2.5 w-full text-left py-3.5 ${
                      active ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : ''
                    }`}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {open && (
                    <div className="pb-2">
                      {item.children.map((child) => {
                        const childActive = child.type === 'route' && location.pathname === child.to;
                        return (
                          <button
                            key={child.label}
                            onClick={() => handleNavClick(child)}
                            className={`flex items-center gap-2.5 w-full text-left py-3 pl-6 ${
                              childActive ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : ''
                            }`}
                          >
                            <span aria-hidden="true">{child.icon}</span>
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label} className="border-b border-gray-50 dark:border-gray-800">
                <button
                  onClick={() => handleNavClick(item)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 w-full text-left py-3.5 ${
                    active ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : ''
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            );
          })}
          <li className="pt-3">
            {user ? (
              <button
                onClick={handleSignOut}
                className="sm:hidden w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full text-sm font-medium"
              >
                Sign Out ({user.displayName || user.email})
              </button>
            ) : (
              <button
                onClick={() => { setShowSignIn(true); setMenuOpen(false); }}
                className="sm:hidden w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-medium"
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
