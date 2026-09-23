import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, businesses } from '../data/businesses';

function directionsUrl(business) {
  // A shared Maps link points at the exact pin; a text search for a common
  // name can land on a different business in another city.
  if (business.mapUrl) return business.mapUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapSearch)}`;
}

export default function BusinessesPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return businesses.filter((business) => {
      const matchesSearch =
        !search ||
        business.name.toLowerCase().includes(search) ||
        business.city.toLowerCase().includes(search) ||
        business.category.toLowerCase().includes(search) ||
        (business.address || '').toLowerCase().includes(search);
      const matchesCategory =
        selectedCategory === 'All' || business.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchText, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#F5FBF7] dark:bg-gray-900">
      <header className="bg-[#176B4D] px-5 pt-8 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* The phone screen this came from had a Back button in its header, so
              it is kept here rather than leaving a header that looks unfinished. */}
          <button
            onClick={() => navigate(-1)}
            className="text-white text-[17px] font-semibold mb-4 hover:text-emerald-100"
          >
            ← Back
          </button>
          <h1 className="text-white text-3xl font-bold">Muslim &amp; Halal Businesses</h1>
          <p className="text-[#D6F5E7] text-[17px] mt-1.5">Washington State</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-5 pb-10">
        <label htmlFor="business-search" className="sr-only">
          Search businesses
        </label>
        <input
          id="business-search"
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by name, city, or category"
          className="w-full bg-white dark:bg-gray-800 border border-[#D7E6DE] dark:border-gray-700 rounded-2xl px-4 py-3.5 text-base text-[#222] dark:text-gray-100 placeholder:text-[#777] outline-none focus:border-[#176B4D] dark:focus:border-emerald-400"
        />

        <div className="flex gap-2.5 overflow-x-auto mt-4 mb-3.5 pb-1">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={active}
                className={`shrink-0 px-4.5 py-2.5 rounded-full font-semibold text-sm transition ${
                  active
                    ? 'bg-[#176B4D] text-white'
                    : 'bg-[#E5F2EB] dark:bg-gray-800 text-[#176B4D] dark:text-emerald-300'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <p className="text-[#555] dark:text-gray-400 text-[15px] mb-3">
          {filtered.length} {filtered.length === 1 ? 'place' : 'places'} found
        </p>

        <ul className="space-y-4">
          {filtered.map((business) => (
            <li
              key={business.id}
              className="bg-white dark:bg-gray-800 rounded-[18px] p-[18px] border border-[#E1ECE6] dark:border-gray-700"
            >
              <span className="inline-block bg-[#E5F2EB] dark:bg-gray-700 text-[#176B4D] dark:text-emerald-300 text-[13px] font-bold rounded-xl px-2.5 py-1 mb-2.5">
                {business.category}
              </span>
              <h2 className="text-[#173D30] dark:text-gray-100 text-[21px] font-bold">
                {business.name}
              </h2>
              <p className="text-[#666] dark:text-gray-400 text-[15px] mt-1.5">
                📍 {business.address || `${business.city}, Washington`}
              </p>
              <p className="text-[#444] dark:text-gray-300 text-[15px] leading-[22px] mt-3">
                {business.description}
              </p>

              <div className="flex gap-2.5 mt-4">
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-[#176B4D] hover:bg-[#12583F] text-white font-bold text-center py-3 rounded-[10px]"
                  >
                    Visit Website
                  </a>
                )}
                {business.mapSearch !== '' && (
                  <a
                    href={directionsUrl(business)}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 border border-[#176B4D] dark:border-emerald-400 text-[#176B4D] dark:text-emerald-300 font-bold text-center py-3 rounded-[10px] hover:bg-[#E5F2EB] dark:hover:bg-gray-700 ${
                      business.website ? '' : 'bg-[#E5F2EB] dark:bg-gray-700'
                    }`}
                  >
                    Directions
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <p className="text-[19px] font-bold text-[#173D30] dark:text-gray-100">
              No businesses found
            </p>
            <p className="text-[#666] dark:text-gray-400 mt-1.5">
              Try another name, city, or category.
            </p>
          </div>
        )}

        <div className="bg-[#FFF6D8] dark:bg-amber-950/40 rounded-[14px] p-4 mt-6">
          <p className="text-[#725600] dark:text-amber-200 text-base font-bold">Important</p>
          <p className="text-[#725600] dark:text-amber-200/90 leading-[21px] mt-1.5">
            Business information may change. Please contact the business directly to confirm its
            address, opening hours, ownership, and halal products.
          </p>
        </div>
      </div>
    </main>
  );
}
