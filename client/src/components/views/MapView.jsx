import { MapPin, AlertTriangle, Bug, Filter, Plus, Crosshair } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Leaflet CSS must be imported for tiles to render
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

// Fix default marker icon issue in bundlers
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Turkey bounds
const TURKEY_CENTER = [39.0, 35.0];
const TURKEY_ZOOM = 6;

// Severity colors
const SEVERITY_COLORS = {
  High: { fill: '#ef4444', stroke: '#dc2626' },
  Medium: { fill: '#f59e0b', stroke: '#d97706' },
  Low: { fill: '#3b82f6', stroke: '#2563eb' },
};

// Helper to recenter map
function RecenterButton() {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(TURKEY_CENTER, TURKEY_ZOOM, { duration: 1 })}
      className="absolute top-20 right-3 z-[1000] p-2 bg-secondary/90 backdrop-blur border border-border/50 rounded-lg hover:bg-secondary transition text-foreground shadow-lg"
      title="Reset to Turkey"
    >
      <Crosshair className="w-5 h-5" />
    </button>
  );
}

export default function MapView() {
  const [sightings, setSightings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSighting, setNewSighting] = useState({ lat: '', lng: '', pestType: '', severity: 'Medium', count: 1 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sightingsRes, alertsRes] = await Promise.all([
          axios.get('/api/sightings'),
          axios.get('/api/alerts')
        ]);
        setSightings(sightingsRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error('Failed to fetch map data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddSighting = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/sightings', {
        lat: parseFloat(newSighting.lat),
        lng: parseFloat(newSighting.lng),
        pestType: newSighting.pestType,
        severity: newSighting.severity,
        count: parseInt(newSighting.count) || 1,
      });
      setSightings(prev => [...prev, res.data]);
      setNewSighting({ lat: '', lng: '', pestType: '', severity: 'Medium', count: 1 });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add sighting', err);
    }
  };

  const filteredSightings = filter === 'all' ? sightings : sightings.filter(s => s.pestType === filter);
  const uniquePests = [...new Set(sightings.map(s => s.pestType))];

  return (
    <div className="w-full h-full space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="text-rose-500" /> Regional Outbreak Map
          </h2>
          <p className="text-muted-foreground text-sm">Real-time pest sighting heatmap and alerts across Turkey</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-sm hover:bg-rose-500/30 transition"
          >
            <Plus className="w-4 h-4" /> Report Sighting
          </button>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-rose-500 appearance-none min-w-[160px]"
            >
              <option value="all">All Pests</option>
              {uniquePests.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Add Sighting Form */}
      {showAddForm && (
        <form onSubmit={handleAddSighting} className="glass-panel p-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Latitude</label>
            <input type="number" step="0.01" required placeholder="39.92" value={newSighting.lat} onChange={e => setNewSighting(p => ({...p, lat: e.target.value}))}
              className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm w-28 text-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Longitude</label>
            <input type="number" step="0.01" required placeholder="32.85" value={newSighting.lng} onChange={e => setNewSighting(p => ({...p, lng: e.target.value}))}
              className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm w-28 text-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Pest Type</label>
            <input type="text" required placeholder="Fall Armyworm" value={newSighting.pestType} onChange={e => setNewSighting(p => ({...p, pestType: e.target.value}))}
              className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm w-40 text-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Severity</label>
            <select value={newSighting.severity} onChange={e => setNewSighting(p => ({...p, severity: e.target.value}))}
              className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground">
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Count</label>
            <input type="number" min="1" value={newSighting.count} onChange={e => setNewSighting(p => ({...p, count: e.target.value}))}
              className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm w-20 text-foreground" />
          </div>
          <button type="submit" className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition">
            Add
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Alerts Sidebar */}
        <div className="glass-panel p-4 flex flex-col h-full overflow-hidden">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500 w-5 h-5" /> Active Alerts
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center mt-10">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <div className="text-center mt-10 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm text-emerald-400 font-bold">No active outbreaks</p>
                <p className="text-xs text-muted-foreground">Conditions are stable across monitored regions.</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${
                  alert.type === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      alert.type === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.type}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{alert.region}</span>
                  </div>
                  <p className={`text-sm font-medium mb-1 ${
                    alert.type === 'CRITICAL' ? 'text-red-200' : 'text-amber-200'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <Bug className="w-3 h-3" /> Dominant: {alert.dominant_pest} ({alert.dominant_count})
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-border/30 space-y-1.5">
            <p className="text-xs font-bold text-muted-foreground mb-2">Severity Legend</p>
            <div className="flex items-center gap-2 text-xs text-foreground"><div className="w-3 h-3 rounded-full bg-red-500" /> High</div>
            <div className="flex items-center gap-2 text-xs text-foreground"><div className="w-3 h-3 rounded-full bg-amber-500" /> Medium</div>
            <div className="flex items-center gap-2 text-xs text-foreground"><div className="w-3 h-3 rounded-full bg-blue-500" /> Low</div>
          </div>
        </div>

        {/* REAL Map */}
        <div className="lg:col-span-3 glass-panel relative overflow-hidden rounded-2xl">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <MapContainer
              center={TURKEY_CENTER}
              zoom={TURKEY_ZOOM}
              className="w-full h-full z-0"
              style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              <RecenterButton />

              {filteredSightings.map((s, idx) => {
                const colors = SEVERITY_COLORS[s.severity] || SEVERITY_COLORS.Medium;
                const radius = s.count > 15 ? 14 : s.count > 5 ? 10 : 7;

                return (
                  <CircleMarker
                    key={s.id || idx}
                    center={[s.lat, s.lng || s.lon]}
                    radius={radius}
                    pathOptions={{
                      fillColor: colors.fill,
                      color: colors.stroke,
                      fillOpacity: 0.7,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: 160 }}>
                        <strong style={{ fontSize: 14 }}>{s.pestType}</strong>
                        <br />
                        <span style={{ fontSize: 12, color: '#888' }}>
                          {s.region || 'Unknown Region'} &middot; {s.count} report{s.count > 1 ? 's' : ''}
                        </span>
                        <br />
                        <span style={{ fontSize: 11, color: colors.fill, fontWeight: 600 }}>
                          Severity: {s.severity}
                        </span>
                        <br />
                        <span style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>
                          {s.lat.toFixed(2)}°N, {(s.lng || s.lon).toFixed(2)}°E
                        </span>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}

          {/* Status bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/70 backdrop-blur-md border-t border-border/30 flex justify-between items-center text-xs text-muted-foreground z-[500]">
            <span>Showing {filteredSightings.length} sightings</span>
            <span>Map: CartoDB Dark &middot; Data via API Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
