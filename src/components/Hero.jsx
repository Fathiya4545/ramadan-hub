export default function Hero() {
  return (
    <section className="grid md:grid-cols-2 bg-emerald-50">
      <div className="flex flex-col justify-center px-6 md:px-16 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
          Welcome to <span className="text-emerald-600">Ramadan Hub</span>
        </h1>
        <p className="text-gray-500 mt-4 max-w-md">
          Your complete companion for the blessed month of Ramadan.
        </p>
        <div className="flex gap-4 mt-8">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium">
            Get Started
          </button>
          <button className="border border-emerald-600 text-emerald-700 px-6 py-3 rounded-full font-medium hover:bg-emerald-100">
            Learn More
          </button>
        </div>
      </div>
      <div className="relative min-h-[320px] overflow-hidden">
        <svg viewBox="0 0 700 500" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fcd9a8" />
              <stop offset="55%" stopColor="#f7b97a" />
              <stop offset="100%" stopColor="#e8935a" />
            </linearGradient>
            <radialGradient id="sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff6e0" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffe7b0" stopOpacity="0.15" />
            </radialGradient>
            <linearGradient id="silhouette" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a3a2e" />
              <stop offset="100%" stopColor="#3a2418" />
            </linearGradient>
          </defs>

          <rect width="700" height="500" fill="url(#sky)" />
          <circle cx="500" cy="190" r="110" fill="url(#sun)" />
          <circle cx="500" cy="190" r="60" fill="#ffe9b8" opacity="0.85" />

          <g fill="#7c4f3a" opacity="0.55">
            <circle cx="120" cy="430" r="3" />
            <circle cx="160" cy="410" r="2" />
            <circle cx="600" cy="420" r="3" />
            <circle cx="560" cy="400" r="2" />
          </g>

          <g fill="url(#silhouette)">
            <rect x="0" y="430" width="700" height="70" />

            {/* far minarets */}
            <rect x="40" y="300" width="10" height="135" />
            <circle cx="45" cy="296" r="6" />

            <rect x="634" y="300" width="10" height="135" />
            <circle cx="639" cy="296" r="6" />

            {/* side minarets with small domes */}
            <rect x="92" y="260" width="16" height="175" />
            <circle cx="100" cy="252" r="16" />
            <rect x="96" y="222" width="8" height="30" />
            <path d="M90 222 Q100 204 110 222 Z" />

            <rect x="566" y="260" width="16" height="175" />
            <circle cx="574" cy="252" r="16" />
            <rect x="570" y="222" width="8" height="30" />
            <path d="M564 222 Q574 204 584 222 Z" />

            {/* small flanking buildings */}
            <rect x="150" y="330" width="80" height="105" rx="10" />
            <rect x="470" y="330" width="80" height="105" rx="10" />

            {/* twin minarets either side of central dome */}
            <rect x="258" y="270" width="20" height="165" />
            <circle cx="268" cy="258" r="20" />
            <rect x="262" y="208" width="12" height="42" />
            <path d="M254 208 Q268 182 282 208 Z" />
            <circle cx="268" cy="178" r="7" />

            <rect x="412" y="270" width="20" height="165" />
            <circle cx="422" cy="258" r="20" />
            <rect x="416" y="208" width="12" height="42" />
            <path d="M408 208 Q422 182 436 208 Z" />
            <circle cx="422" cy="178" r="7" />

            {/* central dome building */}
            <rect x="280" y="320" width="120" height="115" />
            <path d="M280 320 Q280 250 340 250 Q400 250 400 320 Z" />
            <rect x="333" y="218" width="14" height="34" />
            <path d="M319 218 Q340 192 361 218 Z" />
            <circle cx="340" cy="185" r="8" />
          </g>

          {/* crescent moon */}
          <g fill="#fff6e0" opacity="0.95">
            <path d="M340 130 a 28 28 0 1 0 30 38 a 22 22 0 1 1 -30 -38 Z" />
          </g>

          {/* window glows */}
          <g fill="#ffe9b8" opacity="0.85">
            <ellipse cx="190" cy="385" rx="5" ry="9" />
            <ellipse cx="510" cy="385" rx="5" ry="9" />
            <ellipse cx="320" cy="395" rx="5" ry="9" />
            <ellipse cx="380" cy="395" rx="5" ry="9" />
          </g>
        </svg>
      </div>
    </section>
  );
}
