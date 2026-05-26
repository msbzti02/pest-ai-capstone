import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Activity, Send } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored dots for pests
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px ${color}; border: 2px solid #fff;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const pestColors = {
  'Aphid': '#10b981', // Emerald
  'Rice Leafhopper': '#3b82f6', // Blue
  'Corn Borer': '#f59e0b', // Amber
  'Fall Armyworm': '#f43f5e', // Rose
  'Locust': '#a855f7', // Purple
  'Whitefly': '#f8fafc', // Slate
};

export default function MapView() {
  const [sightings, setSightings] = useState([]);
  
  // Form State
  const [lat, setLat] = useState('41.43');
  const [lng, setLng] = useState('30.37');
  const [pestType, setPestType] = useState('Aphid');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    try {
      const res = await axios.get('/api/sightings');
      setSightings(res.data);
    } catch (err) {
      console.error('Failed to fetch sightings', err);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/sightings', { 
        lat: parseFloat(lat), 
        lng: parseFloat(lng), 
        pestType 
      });
      fetchSightings(); // Refresh map
    } catch (err) {
      console.error('Failed to report', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Regional Pest Outbreak Map</h2>
        </div>
        <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-rose-500">Live Data</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-foreground">15</span>
          <span className="text-xs text-muted-foreground">Zones</span>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-foreground">{sightings.length}</span>
          <span className="text-xs text-muted-foreground">Reports</span>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-bold text-foreground">Corn Borer</span>
          <span className="text-xs text-muted-foreground">Top Pest</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="glass-panel border border-border/50 rounded-xl overflow-hidden h-[500px] relative z-0">
        <MapContainer center={[39.0, 35.0]} zoom={5} style={{ height: '100%', width: '100%', backgroundColor: '#0a0a0a' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {sightings.map((s, idx) => (
            <Marker 
              key={idx} 
              position={[s.lat, s.lng]} 
              icon={createCustomIcon(pestColors[s.pestType] || '#10b981')}
            >
              <Popup className="custom-popup">
                <strong>{s.pestType}</strong><br/>
                Reported: {new Date(s.createdAt).toLocaleDateString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 glass-panel p-4 z-[400] bg-background/90 backdrop-blur-md border-border/50">
          <div className="space-y-2">
            {Object.entries(pestColors).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-foreground font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Form */}
      <div className="glass-panel p-6">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Report a Sighting
        </h3>
        
        <form onSubmit={handleReport} className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Latitude</label>
            <input 
              type="text" 
              value={lat} 
              onChange={(e) => setLat(e.target.value)}
              className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary w-24"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Longitude</label>
            <input 
              type="text" 
              value={lng} 
              onChange={(e) => setLng(e.target.value)}
              className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary w-24"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Pest Type</label>
            <select 
              value={pestType} 
              onChange={(e) => setPestType(e.target.value)}
              className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary w-48 appearance-none"
            >
              {Object.keys(pestColors).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition flex items-center gap-2 text-sm h-[38px]"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-500 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          Privacy: Coordinates rounded to 0.1° (~11km grid). No personal data stored.
        </div>
      </div>
    </div>
  );
}
