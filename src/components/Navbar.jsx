export default function Navbar() {
  const links = ['Home', 'Prayer Times', 'Quran', 'Mosques', 'Community'];
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2 font-bold text-emerald-800 text-lg">
        <span>☽</span>
        <span>Ramadan Hub</span>
      </div>
      <ul className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
        {links.map((link) => (
          <li key={link} className="hover:text-emerald-700 cursor-pointer">
            {link}
          </li>
        ))}
      </ul>
      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium">
        Sign In
      </button>
    </nav>
  );
}
