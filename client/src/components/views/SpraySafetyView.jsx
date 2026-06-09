import { CloudRain, Wind, Thermometer, AlertCircle, MapPin, Calendar, CheckCircle2, ShieldAlert, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SpraySafetyView() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 39.9208, lon: 32.8541 }); // Default Ankara
  const [locInput, setLocInput] = useState('39.9208, 32.8541');
  const [error, setError] = useState('');
  
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('custom');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchFields = async () => {
    try {
      const res = await axios.get('/api/fields');
      const data = res.data;
      setFields(data);
      if (data && data.length > 0) {
        const first = data[0];
        setSelectedField(first.id.toString());
        setLocation({ lat: first.lat, lon: first.lon });
        setLocInput(`${first.lat}, ${first.lon}`);
      }
    } catch (err) {
      console.error("Failed to fetch fields", err);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`/api/weather/${location.lat}/${location.lon}`),
        axios.get(`/api/weather/forecast/${location.lat}/${location.lon}`)
      ]);
      setWeather(weatherRes.data);
      setForecast(forecastRes.data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    const parts = locInput.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lon = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lon)) {
        setLocation({ lat, lon });
        return;
      }
    }
    setError('Invalid coordinate format. Use: lat, lon (e.g., 39.9208, 32.8541)');
  };

  const getSafetyBadge = (status) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ACCEPTABLE': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'MARGINAL': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <CloudRain className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Spray Safety & Weather</h2>
            <p className="text-muted-foreground text-sm">FAO/WHO compliant spray condition assessment</p>
          </div>
        </div>
        
        {/* Location Input & Fields Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <select 
            value={selectedField}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedField(val);
              if (val !== 'custom') {
                const field = fields.find(f => f.id === val);
                if (field) {
                  setLocation({ lat: field.lat, lon: field.lon });
                  setLocInput(`${field.lat}, ${field.lon}`);
                }
              }
            }}
            className="px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500 appearance-none min-w-[200px]"
          >
            <option value="custom">Custom Coordinates</option>
            {fields.map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.lat.toFixed(2)}, {f.lon.toFixed(2)})</option>
            ))}
          </select>

          {selectedField === 'custom' && (
            <form onSubmit={handleLocationSubmit} className="flex items-center gap-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  value={locInput} 
                  onChange={(e) => setLocInput(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:border-blue-500 w-48"
                  placeholder="Lat, Lon"
                />
              </div>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition disabled:opacity-50 text-sm">
                Update
              </button>
            </form>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading && !weather ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : weather && forecast ? (
        <div className="space-y-6">
          {/* Current Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Safety Assessment Card */}
            <div className="lg:col-span-2 glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldAlert className="w-32 h-32" />
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Current Spray Safety</h3>
                  {weather.region && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {weather.region.region.replace('_', ' ').toUpperCase()} Region
                    </p>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-xl border-2 font-bold tracking-wider ${getSafetyBadge(weather.spray_safety.status)}`}>
                  {weather.spray_safety.status} ({weather.spray_safety.score}/100)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/20">
                  <Thermometer className="w-5 h-5 mx-auto mb-2 text-rose-400" />
                  <p className="text-2xl font-bold text-foreground">{weather.current.temperature}°C</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Temperature</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/20">
                  <Wind className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
                  <p className="text-2xl font-bold text-foreground">{weather.current.wind_speed}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">km/h Wind</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/20">
                  <CloudRain className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold text-foreground">{weather.current.precipitation}mm</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rainfall</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/20">
                  <CloudRain className="w-5 h-5 mx-auto mb-2 text-emerald-400 opacity-60" />
                  <p className="text-2xl font-bold text-foreground">{weather.current.humidity}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Humidity</p>
                </div>
              </div>

              {/* Safety Issues List */}
              {weather.spray_safety.issues.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Assessment Flags
                  </h4>
                  {weather.spray_safety.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-200">
                      <span>•</span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Conditions are optimal for chemical application. Proceed with normal precautions.</span>
                </div>
              )}
              
              {weather.region && (
                <div className="mt-4 text-xs text-muted-foreground p-3 bg-secondary/20 rounded-lg">
                  <strong>Regional Note:</strong> {weather.region.risk_note}
                </div>
              )}
            </div>

            {/* Recommendations / Sidebar */}
            <div className="glass-panel p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> 7-Day Outlook
                </h3>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg border border-border/20">
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">{forecast.summary.safe_days}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Safe Days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-400">{forecast.summary.unsafe_days}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Unsafe Days</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Best Upcoming Day</h3>
                {forecast.summary.best_day ? (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center">
                    <p className="text-lg font-bold text-emerald-400 mb-1">{forecast.summary.best_day.day_name}, {new Date(forecast.summary.best_day.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Score: {forecast.summary.best_day.spray_safety.score}/100</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No safe days found in forecast.</p>
                )}
              </div>
              <button 
                onClick={async () => {
                  try {
                    await axios.post('/api/fields', {
                      name: `New Field (${location.lat.toFixed(2)}, ${location.lon.toFixed(2)})`,
                      lat: location.lat,
                      lon: location.lon,
                      crop: 'wheat',
                      areaHa: 10
                    });
                    setSaveSuccess(true);
                    fetchFields();
                    setTimeout(() => setSaveSuccess(false), 3000);
                  } catch (err) {
                    console.error(err);
                    setError('Failed to save field');
                  }
                }}
                disabled={saveSuccess || selectedField !== 'custom'}
                className="w-full py-3 flex justify-center items-center gap-2 bg-secondary hover:bg-secondary/80 border border-border/50 text-foreground text-sm font-bold rounded-xl transition disabled:opacity-50"
              >
                {saveSuccess ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved to Fields!</> : '+ Save to My Fields'}
              </button>
            </div>
          </div>

          {/* 7-Day Forecast Grid */}
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">Detailed 7-Day Forecast</h3>
            <div className="overflow-x-auto">
              <div className="min-w-[800px] grid grid-cols-7 gap-3">
                {forecast.forecast.map((day, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center text-center ${
                    day.spray_safety.is_safe ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                  }`}>
                    <p className="font-bold text-foreground text-sm mb-1">{day.day_name}</p>
                    <p className="text-[10px] text-muted-foreground mb-3">{new Date(day.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                    
                    <div className="space-y-2 w-full">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Max Temp</span>
                        <span className="font-medium">{day.temperature.max}°C</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Wind</span>
                        <span className="font-medium">{day.wind_speed_max} km/h</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Rain</span>
                        <span className="font-medium">{day.precipitation}mm</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/30 w-full">
                      <span className={`text-xs font-bold px-2 py-1 rounded w-full block ${
                        day.spray_safety.is_safe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {day.spray_safety.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      ) : null}
    </div>
  );
}
