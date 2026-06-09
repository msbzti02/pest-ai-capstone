import { Map, Leaf, Plus, Trash2, CloudSun, AlertTriangle, Bug } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FieldsView() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLon, setNewLon] = useState('');
  const [newCrop, setNewCrop] = useState('wheat');
  const [newArea, setNewArea] = useState('10');

  const crops = ['wheat', 'corn', 'cotton', 'rice', 'tomato', 'potato'];

  const fetchFields = async () => {
    try {
      // In a real app we'd pass auth token. Assuming local dev auth for now.
      const res = await axios.get('/api/fields');
      setFields(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleAddField = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/fields', {
        name: newName,
        lat: parseFloat(newLat),
        lon: parseFloat(newLon),
        crop: newCrop,
        areaHa: parseFloat(newArea),
      });
      setShowAdd(false);
      setNewName('');
      setNewLat('');
      setNewLon('');
      fetchFields();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    try {
      await axios.delete(`/api/fields/${id}`);
      fetchFields();
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskColor = (sightings) => {
    if (sightings >= 5) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (sightings >= 2) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 rounded-xl">
            <Map className="w-6 h-6 text-teal-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Fields Dashboard</h2>
            <p className="text-muted-foreground text-sm">Monitor weather and pest risk across your registered locations</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-teal-500 text-black font-bold rounded-xl hover:bg-teal-400 transition flex items-center gap-2"
        >
          {showAdd ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Field</>}
        </button>
      </div>

      {showAdd && (
        <div className="glass-panel p-6 mb-6 border-teal-500/30">
          <h3 className="font-bold text-foreground mb-4">Register New Field</h3>
          <form onSubmit={handleAddField} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground">Field Name</label>
              <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. North Sector Corn" className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Crop</label>
              <select value={newCrop} onChange={e => setNewCrop(e.target.value)} className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground capitalize focus:outline-none focus:border-teal-500 appearance-none">
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Latitude</label>
              <input type="number" step="0.0001" required value={newLat} onChange={e => setNewLat(e.target.value)} placeholder="39.92" className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Longitude</label>
              <input type="number" step="0.0001" required value={newLon} onChange={e => setNewLon(e.target.value)} placeholder="32.85" className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-teal-500" />
            </div>
            <div className="md:col-span-5 flex justify-end mt-2">
              <button type="submit" className="px-6 py-2 bg-teal-500 text-black font-bold rounded-lg hover:bg-teal-400 transition">Save Field</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      ) : fields.length === 0 ? (
        <div className="glass-panel p-12 text-center text-muted-foreground">
          <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No fields registered yet. Add a field to start monitoring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fields.map(field => (
            <div key={field.id} className="glass-panel p-0 overflow-hidden flex flex-col group">
              <div className="p-5 flex justify-between items-start border-b border-border/30">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {field.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1 capitalize"><Leaf className="w-3 h-3 text-emerald-500" /> {field.crop}</span>
                    <span>•</span>
                    <span>{field.areaHa} Hectares</span>
                    <span>•</span>
                    <span className="font-mono">{field.lat.toFixed(2)}, {field.lon.toFixed(2)}</span>
                  </p>
                </div>
                <button onClick={() => handleDelete(field.id)} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 flex-1">
                {/* Weather Data */}
                <div className="p-5 border-r border-border/30 flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-1">
                    <CloudSun className="w-3 h-3 text-blue-400" /> Live Weather
                  </h4>
                  {field.weather ? (
                    <div className="space-y-3">
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-foreground">{field.weather.temperature}°C</span>
                        <span className="text-sm text-muted-foreground pb-1">{field.weather.humidity}% Hum</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          field.spraySafety?.is_safe ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          SPRAY: {field.spraySafety?.status || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Weather data unavailable</p>
                  )}
                </div>

                {/* Pest Risk Data */}
                <div className="p-5 flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-1">
                    <Bug className="w-3 h-3 text-rose-400" /> Regional Risk
                  </h4>
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${getRiskColor(field.nearbySightings)}`}>
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm mb-1">
                        {field.nearbySightings >= 5 ? 'High Alert' : field.nearbySightings >= 2 ? 'Moderate Risk' : 'Low Risk'}
                      </p>
                      <p className="text-xs opacity-80">
                        {field.nearbySightings} pest sightings reported within 50km radius.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
