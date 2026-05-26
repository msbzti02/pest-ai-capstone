import { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudRain, Wind, Thermometer, Droplets, CheckCircle2, AlertTriangle, XCircle, MapPin, Save, Cloud } from 'lucide-react';

export default function SpraySafetyView() {
  const [weather, setWeather] = useState(null);
  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Inputs
  const [lat, setLat] = useState('41.0');
  const [lng, setLng] = useState('29.0');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Fetch current and daily (7-day) forecast
      const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover&daily=temperature_2m_max,wind_speed_10m_max,precipitation_sum&timezone=auto`);
      setWeather(res.data.current);
      setDaily(res.data.daily);
      setError(null);
    } catch (err) {
      console.error("Weather API Error:", err);
      setError("Failed to fetch live weather data. Check coordinates.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  if (loading && !weather) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Current safety logic
  let isCurrentSafe = false;
  if (weather) {
    const temp = weather.temperature_2m;
    const wind = weather.wind_speed_10m;
    const rain = weather.precipitation;
    isCurrentSafe = temp >= 10 && temp <= 25 && wind <= 15 && rain === 0;
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Cloud className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">Weather & Spray Safety</h2>
      </div>

      {/* Top Search Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-end gap-4 border border-border/50 bg-secondary/20">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground ml-1">Latitude</label>
          <input 
            type="text" 
            value={lat} 
            onChange={(e) => setLat(e.target.value)}
            className="bg-background/50 border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-sky-500 w-32"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground ml-1">Longitude</label>
          <input 
            type="text" 
            value={lng} 
            onChange={(e) => setLng(e.target.value)}
            className="bg-background/50 border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-sky-500 w-32"
          />
        </div>
        
        <button onClick={handleCheck} className="px-5 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition flex items-center gap-2 text-sm h-[38px]">
          Search
        </button>
        <button className="px-4 py-2 bg-secondary text-muted-foreground font-medium rounded-lg hover:bg-secondary/80 transition flex items-center gap-2 text-sm h-[38px]">
          <MapPin className="w-4 h-4" /> My Location
        </button>
        <button className="px-4 py-2 border border-sky-500/30 text-sky-500 font-medium rounded-lg hover:bg-sky-500/10 transition flex items-center gap-2 text-sm h-[38px] ml-auto">
          <Save className="w-4 h-4" /> Save
        </button>
        <span className="text-xs text-muted-foreground ml-4 mb-2">Auto-refresh in 4:56</span>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-center">
          {error}
        </div>
      )}

      {weather && (
        <>
          {/* Main Status */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className={`px-6 py-2 rounded-full border-2 flex items-center gap-2 font-bold tracking-wide uppercase ${
              isCurrentSafe ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-rose-500/10 border-rose-500 text-rose-500'
            }`}>
              {isCurrentSafe ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {isCurrentSafe ? 'SAFE TO SPRAY' : 'UNSAFE TO SPRAY'}
            </div>
            {/* Cloud icon decorative */}
            <div className="mt-6 p-4 rounded-3xl bg-gradient-to-b from-sky-100 to-white shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <Cloud className="w-10 h-10 text-sky-500 fill-sky-200" />
            </div>
          </div>

          {/* Current Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-6 flex flex-col items-center text-center justify-center relative overflow-hidden group">
              <Thermometer className="w-8 h-8 text-rose-400 mb-3" />
              <span className="text-3xl font-bold text-foreground">{weather.temperature_2m}°C</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-2">TEMP</span>
            </div>
            <div className="glass-panel p-6 flex flex-col items-center text-center justify-center">
              <Droplets className="w-8 h-8 text-sky-400 mb-3" />
              <span className="text-3xl font-bold text-foreground">{weather.relative_humidity_2m}%</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-2">HUMIDITY</span>
            </div>
            <div className="glass-panel p-6 flex flex-col items-center text-center justify-center">
              <Wind className="w-8 h-8 text-slate-300 mb-3" />
              <span className="text-3xl font-bold text-foreground">{weather.wind_speed_10m}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-2">WIND km/h</span>
            </div>
            <div className="glass-panel p-6 flex flex-col items-center text-center justify-center">
              <CloudRain className="w-8 h-8 text-indigo-400 mb-3" />
              <span className="text-3xl font-bold text-foreground">{weather.precipitation}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-2">RAIN mm</span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Weather data reflects broad regional forecasts. Actual field conditions (fog, local frost, microclimates) may differ. Always verify conditions on-site before applying pesticides.
          </div>

          {/* 7-Day Calendar */}
          {daily && (
            <div className="glass-panel p-5 border border-border/50">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <CloudRain className="w-4 h-4" /> 7-Day Spray Calendar
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                {daily.time.map((time, idx) => {
                  const date = new Date(time);
                  const isToday = idx === 0;
                  const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  
                  const dTemp = daily.temperature_2m_max[idx];
                  const dWind = daily.wind_speed_10m_max[idx];
                  const dRain = daily.precipitation_sum[idx];
                  
                  const isSafe = dTemp >= 10 && dTemp <= 25 && dWind <= 15 && dRain === 0;

                  return (
                    <div key={time} className={`p-4 rounded-xl flex flex-col items-center text-center border transition-colors ${
                      isSafe ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/20'
                    }`}>
                      <span className="text-xs font-bold text-foreground mb-1">{dayName}</span>
                      <span className="text-[9px] text-muted-foreground mb-3">{dateString}</span>
                      
                      <div className={`p-1.5 rounded-md mb-2 ${isSafe ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                        {isSafe ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      
                      <span className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isSafe ? 'SAFE' : 'UNSAFE'}
                      </span>
                      
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-auto">
                        <Thermometer className="w-2.5 h-2.5" /> {dTemp}°C
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                        <Wind className="w-2.5 h-2.5" /> {dWind} km/h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
