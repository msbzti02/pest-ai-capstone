import { Activity, ShieldAlert, Thermometer, Wind, Target } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function RiskScoreView() {
  const [pestName, setPestName] = useState('Fall Armyworm');
  const [lat, setLat] = useState('37.00'); // Adana
  const [lon, setLon] = useState('35.32');
  const [confidence, setConfidence] = useState('0.85');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pests = [
    'Fall Armyworm', 'Rice Leafhopper', 'Brown Planthopper', 'Cotton Bollworm', 
    'Corn Borer', 'Whitefly', 'Diamondback Moth', 'Colorado Potato Beetle',
    'Aphid', 'Migratory Locust', 'Cabbage Looper', 'Stink Bug'
  ];

  const calculateRisk = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/risk-score', {
        pest_name: pestName,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        confidence: parseFloat(confidence)
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-500/20 rounded-xl">
          <ShieldAlert className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pest Risk Assessment Engine</h2>
          <p className="text-muted-foreground text-sm">Multi-factor risk score combining pest severity, live weather, and regional data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="glass-panel p-6">
          <form onSubmit={calculateRisk} className="space-y-4">
            <h3 className="font-bold text-foreground mb-4">Assessment Parameters</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Pest Species</label>
              <select value={pestName} onChange={e => setPestName(e.target.value)} className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-red-500 appearance-none">
                {pests.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Latitude</label>
                <input type="number" step="0.0001" value={lat} onChange={e => setLat(e.target.value)} className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-red-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Longitude</label>
                <input type="number" step="0.0001" value={lon} onChange={e => setLon(e.target.value)} className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-red-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Detection Confidence (0.0 - 1.0)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="1" step="0.05" value={confidence} onChange={e => setConfidence(e.target.value)} className="w-full accent-red-500" />
                <span className="text-sm font-mono text-foreground w-10 text-right">{confidence}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50 mt-4 flex justify-center items-center gap-2">
              {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Activity className="w-4 h-4" />}
              Assess Risk
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {!result ? (
            <div className="glass-panel p-12 h-full flex flex-col items-center justify-center text-center border-dashed">
              <Target className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Configure parameters to generate a risk assessment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Score Gauge */}
              <div className="glass-panel p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${result.color} 0%, transparent 70%)` }} />
                
                <h3 className="text-xl font-bold text-foreground mb-6">Aggregate Risk Score</h3>
                
                <div className="flex flex-col items-center justify-center relative w-48 h-48 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke={result.color} strokeWidth="8" strokeDasharray={`${result.score * 2.51} 251`} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black" style={{ color: result.color }}>{result.score}</span>
                    <span className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: result.color }}>{result.risk_level}</span>
                  </div>
                </div>
              </div>

              {/* Factor Breakdown & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="glass-panel p-6">
                  <h4 className="font-bold text-sm text-foreground mb-4 border-b border-border/30 pb-2">Factor Breakdown</h4>
                  <div className="space-y-4">
                    {Object.values(result.factors).map((factor, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{factor.label} (w: {factor.weight})</span>
                          <span className="font-bold text-foreground">{factor.score}/100</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${factor.score}%`, backgroundColor: result.color, opacity: 0.5 + (factor.score/200) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h4 className="font-bold text-sm text-foreground mb-4 border-b border-border/30 pb-2">Actionable Recommendations</h4>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/30 flex items-start gap-2">
                        <span>{rec.charAt(0)}</span>
                        <span className="mt-0.5">{rec.substring(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
