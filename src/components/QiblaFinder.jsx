import { useEffect, useRef, useState } from 'react';

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

function calculateQiblaBearing(lat, lon) {
  const phiK = toRad(KAABA_LAT);
  const lambdaK = toRad(KAABA_LON);
  const phi = toRad(lat);
  const lambda = toRad(lon);

  const y = Math.sin(lambdaK - lambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

export default function QiblaFinder() {
  const [coords, setCoords] = useState(null);
  const [bearing, setBearing] = useState(null);
  const [heading, setHeading] = useState(null);
  const [error, setError] = useState(null);
  const [compassEnabled, setCompassEnabled] = useState(false);
  const [compassSource, setCompassSource] = useState(null);
  const [compassTimedOut, setCompassTimedOut] = useState(false);
  const compassSourceRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation unavailable in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setBearing(calculateQiblaBearing(latitude, longitude));
      },
      () => setError('Location access denied. Allow location to find your Qibla direction.')
    );
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleAbsoluteOrientation(event) {
    if (event.alpha != null) {
      setHeading(360 - event.alpha);
      compassSourceRef.current = 'absolute';
      setCompassSource('absolute');
      setCompassTimedOut(false);
    }
  }

  function handleOrientation(event) {
    if (event.webkitCompassHeading != null) {
      setHeading(event.webkitCompassHeading);
      compassSourceRef.current = 'ios';
      setCompassSource('ios');
      setCompassTimedOut(false);
    } else if (compassSourceRef.current !== 'absolute' && event.alpha != null) {
      setHeading(360 - event.alpha);
      compassSourceRef.current = 'relative';
      setCompassSource('relative');
      setCompassTimedOut(false);
    }
  }

  async function enableCompass() {
    if (!window.isSecureContext) {
      setError('Live compass requires a secure (https) connection.');
      return;
    }
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result !== 'granted') {
          setError('Compass permission denied.');
          return;
        }
      } catch {
        setError('Could not request compass permission.');
        return;
      }
    }

    window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    setCompassEnabled(true);
    setCompassTimedOut(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHeading((current) => {
        if (current == null) setCompassTimedOut(true);
        return current;
      });
    }, 4000);
  }

  const rotation = bearing != null ? (heading != null ? bearing - heading : bearing) : 0;

  return (
    <section id="qibla" className="scroll-mt-20 bg-emerald-50 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Qibla Direction</h2>
      <p className="text-gray-500 mt-2">Find the direction to the Kaaba in Mecca from your location</p>

      {error && <p className="text-amber-600 text-sm mt-3">{error}</p>}

      {bearing != null && (
        <div className="mt-10 flex flex-col items-center">
          <div className="relative w-56 h-56">
            <div className="absolute inset-0 rounded-full bg-white border-4 border-emerald-200 shadow-sm" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400">
              N
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="flex flex-col items-center">
                <span className="text-emerald-700 text-3xl leading-none">↑</span>
                <span className="text-xs text-emerald-700 font-medium mt-1">🕋</span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mt-6 font-medium">
            Qibla is {bearing.toFixed(1)}° from true north
          </p>
          {coords && (
            <p className="text-xs text-gray-400 mt-1">
              Your location: {coords.lat.toFixed(2)}, {coords.lon.toFixed(2)}
            </p>
          )}

          {!compassEnabled && (
            <>
              <button
                onClick={enableCompass}
                className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium"
              >
                Enable Live Compass
              </button>
              <p className="text-xs text-gray-400 mt-2 max-w-xs">
                Without this, the arrow shows a fixed direction and won't move as you turn your phone.
              </p>
            </>
          )}
          {compassEnabled && heading == null && !compassTimedOut && (
            <p className="text-xs text-gray-400 mt-3">
              Waiting for compass data&hellip; move your device in a figure-8 to calibrate.
            </p>
          )}
          {compassEnabled && heading == null && compassTimedOut && (
            <p className="text-xs text-amber-600 mt-3 max-w-xs">
              No compass data received. Your device or browser may not support a live compass —
              the arrow above still shows the correct fixed Qibla direction from true north.
            </p>
          )}
          {compassEnabled && heading != null && (
            <p className="text-xs text-emerald-600 mt-3">
              Live compass active{compassSource === 'relative' ? ' (approximate — your browser doesn\'t expose true compass heading)' : ''} — rotate your phone to align.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
