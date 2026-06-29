import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchNearbyMosques } from '../api';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FlyToOnce({ lat, lon }) {
  const map = useMap();
  const lastRef = useRef(null);
  useEffect(() => {
    const key = `${lat},${lon}`;
    if (lastRef.current === key) return;
    lastRef.current = key;
    map.flyTo([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MosqueFinder() {
  const [coords, setCoords] = useState(null);
  const [searchPoint, setSearchPoint] = useState(null);
  const [mosques, setMosques] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation unavailable.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(point);
        setSearchPoint(point);
      },
      () => {
        setError('Location access denied.');
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!searchPoint) return;
    setLoading(true);
    fetchNearbyMosques(searchPoint.lat, searchPoint.lon)
      .then((data) => {
        setMosques(data);
        if (data.length === 0) {
          setError('No mosques found within 10km of this point.');
        } else {
          setError(null);
        }
      })
      .catch((err) => setError(`Could not load nearby mosques (${err.message}).`))
      .finally(() => setLoading(false));
  }, [searchPoint]);

  function handleMapSelect(lat, lon) {
    setSearchPoint({ lat, lon });
  }

  const mapCenter = searchPoint
    ? [searchPoint.lat, searchPoint.lon]
    : [21.4225, 39.8262];

  return (
    <section id="mosques" className="scroll-mt-20 bg-emerald-50 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Find Nearby Mosques</h2>
      <p className="text-gray-500 mt-2">
        Locate mosques near you, or click anywhere on the map to search that area
      </p>

      {error && <p className="text-amber-600 text-sm mt-3">{error}</p>}

      <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto text-left">
        <div className="bg-white rounded-xl p-4 max-h-96 overflow-y-auto">
          {loading && <p className="text-gray-400 text-sm">Searching nearby mosques...</p>}
          {!loading && mosques.length === 0 && !error && (
            <p className="text-gray-400 text-sm">No mosques found within 10km.</p>
          )}
          {mosques.map((m) => (
            <div key={m.id} className="border-b border-gray-100 py-3 last:border-0">
              <div className="font-semibold text-gray-800">{m.name}</div>
              {searchPoint && (
                <div className="text-xs text-gray-500 mt-1">
                  {haversine(searchPoint.lat, searchPoint.lon, m.lat, m.lon).toFixed(1)}km away
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="md:col-span-2 rounded-xl overflow-hidden h-96">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onSelect={handleMapSelect} />
            {searchPoint && <FlyToOnce lat={searchPoint.lat} lon={searchPoint.lon} />}
            {coords && (
              <Marker position={[coords.lat, coords.lon]} icon={markerIcon}>
                <Popup>Your location</Popup>
              </Marker>
            )}
            {searchPoint && (coords?.lat !== searchPoint.lat || coords?.lon !== searchPoint.lon) && (
              <Marker position={[searchPoint.lat, searchPoint.lon]} icon={markerIcon}>
                <Popup>Search point</Popup>
              </Marker>
            )}
            {mosques.map((m) => (
              <Marker key={m.id} position={[m.lat, m.lon]} icon={markerIcon}>
                <Popup>{m.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
