import { Bug, ArrowRight, ShieldAlert, Clock, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LifecycleView() {
  const [pestName, setPestName] = useState('Fall Armyworm');
  const [lifecycle, setLifecycle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const pests = [
    'Fall Armyworm', 'Rice Leafhopper', 'Brown Planthopper', 'Cotton Bollworm', 
    'Corn Borer', 'Whitefly', 'Diamondback Moth', 'Colorado Potato Beetle'
  ];

  const fetchLifecycle = async (pest) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/pest-lifecycle/${encodeURIComponent(pest)}`);
      setLifecycle(res.data);
      setActiveStage(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLifecycle(pestName);
  }, [pestName]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-fuchsia-500/20 rounded-xl">
          <Bug className="w-6 h-6 text-fuchsia-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pest Lifecycle Visualization</h2>
          <p className="text-muted-foreground text-sm">Interactive biological stages and vulnerability mapping</p>
        </div>
      </div>

      <div className="glass-panel p-6 mb-6">
        <label className="text-sm font-bold text-muted-foreground mr-4">Select Pest:</label>
        <select 
          value={pestName} 
          onChange={e => setPestName(e.target.value)} 
          className="bg-secondary/50 border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-fuchsia-500 appearance-none min-w-[200px]"
        >
          {pests.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading || !lifecycle ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Interactive Flow */}
          <div className="glass-panel p-6 lg:p-10 flex flex-col items-center justify-center relative min-h-[400px]">

            
            <div className="w-full max-w-md relative mt-8">
              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '300px' }}>
                <path d="M 50,50 L 50,250" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" fill="none" className="hidden sm:block" />
              </svg>

              <div className="flex flex-col gap-6 relative z-10 w-full">
                {lifecycle.stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <button 
                      onClick={() => setActiveStage(idx)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all border-4 shrink-0 ${
                        activeStage === idx 
                          ? 'scale-110 shadow-[0_0_20px_rgba(217,70,239,0.4)] border-fuchsia-500 bg-background text-fuchsia-400' 
                          : 'border-background bg-secondary text-muted-foreground hover:border-fuchsia-500/50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                    
                    <div 
                      onClick={() => setActiveStage(idx)}
                      className={`flex-1 p-4 rounded-xl border transition-all cursor-pointer ${
                        activeStage === idx 
                          ? 'bg-fuchsia-500/10 border-fuchsia-500/50' 
                          : 'bg-secondary/30 border-border/30 hover:border-fuchsia-500/30'
                      }`}
                    >
                      <h4 className="font-bold text-foreground" style={{ color: activeStage === idx ? stage.color : '' }}>{stage.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {stage.duration_days} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="flex flex-col gap-6">
            <div className="glass-panel p-8 flex-1">
              {lifecycle.stages[activeStage] && (
                <div className="h-full flex flex-col">
                  <div className="mb-6 pb-6 border-b border-border/30">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Stage {activeStage + 1}</span>
                    <h3 className="text-3xl font-black text-foreground" style={{ color: lifecycle.stages[activeStage].color }}>
                      {lifecycle.stages[activeStage].name}
                    </h3>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1 text-sm bg-secondary px-3 py-1.5 rounded-lg border border-border/50">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold">{lifecycle.stages[activeStage].duration_days}</span> days avg.
                      </div>
                      <div className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border font-bold ${
                        lifecycle.stages[activeStage].vulnerability.includes('High') ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        lifecycle.stages[activeStage].vulnerability.includes('Medium') ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        <ShieldAlert className="w-4 h-4" />
                        {lifecycle.stages[activeStage].vulnerability} Vulnerability
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider text-muted-foreground">Recommended Control Measure</h4>
                    <div className="p-5 bg-secondary/30 rounded-xl border border-border/30 text-foreground leading-relaxed">
                      {lifecycle.stages[activeStage].control}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-between items-center">
                    <button 
                      onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
                      disabled={activeStage === 0}
                      className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
                    >
                      Prev Stage
                    </button>
                    <button 
                      onClick={() => setActiveStage(Math.min(lifecycle.stages.length - 1, activeStage + 1))}
                      disabled={activeStage === lifecycle.stages.length - 1}
                      className="px-4 py-2 text-sm font-bold bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 disabled:opacity-30 transition flex items-center gap-2"
                    >
                      Next Stage <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 bg-rose-500/5 border-rose-500/20">
              <h4 className="text-sm font-bold text-rose-400 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Critical Treatment Window
              </h4>
              <p className="text-sm text-foreground">{lifecycle.critical_window}</p>
            </div>
            
            <div className="glass-panel p-6 bg-secondary/20">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground">Total Lifecycle Duration:</span>
                <span className="text-fuchsia-400 text-lg">{lifecycle.total_days} days</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
