import { Activity, ShieldAlert, Target, ScanSearch, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function RiskScoreView() {
  const [pestName, setPestName] = useState('Beet Fly');
  const [lat, setLat] = useState('36.53'); // Death Valley (Hostile)
  const [lon, setLon] = useState('-116.93');
  const [confidence, setConfidence] = useState('0.00');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pests = [
    'Beet Fly', 'Fall Armyworm', 'Rice Leafhopper', 'Brown Planthopper', 'Cotton Bollworm', 
    'Corn Borer', 'Whitefly', 'Diamondback Moth', 'Colorado Potato Beetle',
    'Aphid', 'Migratory Locust', 'Cabbage Looper', 'Stink Bug'
  ];

  const calculateRisk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/risk-score', {
        pest_name: pestName,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        confidence: parseFloat(confidence)
      });
      // Add a slight delay to show off the powerful scanning animation
      setTimeout(() => {
        setResult(res.data);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getRiskIcon = (level) => {
    if (level === 'CRITICAL' || level === 'HIGH') return <AlertOctagon className="w-8 h-8 text-white" />;
    if (level === 'MODERATE') return <AlertTriangle className="w-8 h-8 text-white" />;
    return <CheckCircle2 className="w-8 h-8 text-white" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <ShieldAlert className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Pest Threat AI Scanner</h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Smart analysis using live weather, farm location, and pest data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="glass-panel p-6 border-indigo-500/10 shadow-lg relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />
          
          <form onSubmit={calculateRisk} className="space-y-6 relative z-10">
            <div className="border-b border-border/50 pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" /> Farm Details
              </h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Which Pest?</label>
              <div className="relative">
                <select value={pestName} onChange={e => setPestName(e.target.value)} className="w-full bg-secondary/80 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-all cursor-pointer">
                  {pests.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">▼</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">GPS Latitude</label>
                <input type="number" step="0.0001" value={lat} onChange={e => setLat(e.target.value)} className="w-full bg-secondary/80 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">GPS Longitude</label>
                <input type="number" step="0.0001" value={lon} onChange={e => setLon(e.target.value)} className="w-full bg-secondary/80 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex justify-between">
                <span>AI Photo Certainty</span>
                <span className="text-indigo-400">{Math.round(confidence * 100)}% Sure</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={confidence} onChange={e => setConfidence(e.target.value)} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              <p className="text-[11px] text-muted-foreground mt-1">How confident is the AI that this pest is correctly identified?</p>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 mt-4 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]">
              {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <ScanSearch className="w-5 h-5" />}
              {loading ? 'Scanning Farm Data...' : 'Analyze Threat Level'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {!loading && !result && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-12 h-full flex flex-col items-center justify-center text-center border-dashed border-2 border-border/50 min-h-[500px]"
              >
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <ScanSearch className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground max-w-md">Fill out your farm details on the left and click "Analyze" to see how dangerous this pest is right now.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-12 h-full flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]"
              >
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative w-48 h-48 rounded-full border-4 border-indigo-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                  <div className="absolute inset-0 rounded-full border border-indigo-500/40 animate-ping" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(99,102,241,0.5) 100%)' }}
                  />
                  <div className="w-32 h-32 rounded-full bg-secondary/80 backdrop-blur-md flex items-center justify-center z-10 border border-indigo-500/30">
                    <Activity className="w-10 h-10 text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-indigo-400 mt-8 tracking-widest uppercase">Processing Data</h3>
                <p className="text-muted-foreground font-mono mt-2 text-sm">Checking weather systems & regional patterns...</p>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Score Gauge */}
                <div className="glass-panel p-8 text-center relative overflow-hidden border-t-4" style={{ borderTopColor: result.color }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-[80px] pointer-events-none opacity-20" style={{ backgroundColor: result.color }} />
                  
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="p-3 rounded-full shadow-lg" style={{ backgroundColor: result.color }}>
                      {getRiskIcon(result.risk_level)}
                    </div>
                    <h3 className="text-2xl font-black text-foreground">Overall Threat Level</h3>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center relative w-56 h-56 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90 absolute inset-0 drop-shadow-xl" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
                      <motion.circle 
                        initial={{ strokeDasharray: "0 264" }}
                        animate={{ strokeDasharray: `${result.score * 2.64} 264` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50" cy="50" r="42" 
                        fill="transparent" 
                        stroke={result.color} 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-full m-2 border border-white/5 shadow-inner">
                      <motion.span 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-6xl font-black drop-shadow-lg" 
                        style={{ color: result.color }}
                      >
                        {result.score}
                      </motion.span>
                      <span className="text-sm font-bold uppercase tracking-widest mt-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border border-white/10" style={{ color: result.color }}>
                        {result.risk_level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Factor Breakdown */}
                  <div className="glass-panel p-6 border-white/5 shadow-xl">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/5">
                      <Info className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-bold text-foreground">Why did we give this score?</h4>
                    </div>
                    <div className="space-y-5">
                      {Object.values(result.factors).map((factor, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-foreground/80">{factor.label === "Detection Confidence" ? "AI Photo Certainty" : factor.label}</span>
                            <span className="font-bold text-foreground">{factor.score}% Bad</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${factor.score}%` }}
                              transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                              className="h-full rounded-full" 
                              style={{ backgroundColor: result.color, opacity: 0.6 + (factor.score/200) }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="glass-panel p-6 border-white/5 shadow-xl">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/5">
                      <AlertOctagon className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-bold text-foreground">What you should do next</h4>
                    </div>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, idx) => (
                        <motion.li 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + (idx * 0.1) }}
                          key={idx} 
                          className="text-sm text-foreground/90 bg-secondary/50 p-4 rounded-xl border border-white/5 flex items-start gap-3 shadow-sm hover:bg-secondary/80 transition-colors"
                        >
                          <span className="text-xl leading-none mt-0.5">{rec.charAt(0)}</span>
                          <span className="leading-snug">{rec.substring(2)}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
