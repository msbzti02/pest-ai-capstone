import { Calculator, DollarSign, TrendingDown, TrendingUp, AlertTriangle, Leaf, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EconomicView() {
  const [crops, setCrops] = useState({});
  const [selectedPest, setSelectedPest] = useState('Fall Armyworm');
  const [selectedCrop, setSelectedCrop] = useState('corn');
  const [fieldSize, setFieldSize] = useState(10);
  const [infestationLevel, setInfestationLevel] = useState('moderate');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Growth stage advice
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [stageAdvice, setStageAdvice] = useState(null);

  const pests = [
    'Fall Armyworm', 'Rice Leafhopper', 'Brown Planthopper', 'Cotton Bollworm',
    'Corn Borer', 'Whitefly', 'Diamondback Moth', 'Colorado Potato Beetle',
    'Aphid', 'Green Peach Aphid', 'Thrips', 'Red Spider Mite',
    'Migratory Locust', 'Cabbage Looper', 'Beet Armyworm', 'Stink Bug',
  ];

  useEffect(() => {
    axios.get('/api/economic-impact/crops').then(r => setCrops(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    axios.get(`/api/crop-stages/${selectedCrop}`).then(r => {
      setStages(r.data.stages || []);
      setSelectedStage(r.data.stages?.[0]?.stage || '');
    }).catch(() => setStages([]));
  }, [selectedCrop]);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/economic-impact', {
        pest_name: selectedPest, crop: selectedCrop,
        field_size_ha: fieldSize, infestation_level: infestationLevel,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStageAdvice = async () => {
    if (!selectedStage) return;
    try {
      const res = await axios.post('/api/crop-stage-advice', {
        pest_name: selectedPest, crop: selectedCrop, growth_stage: selectedStage,
      });
      setStageAdvice(res.data);
    } catch {}
  };

  const urgencyColors = {
    EMERGENCY: 'bg-red-500/10 text-red-500 border-red-500/30',
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    MODERATE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-amber-500/20 rounded-xl">
          <Calculator className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Economic Impact Calculator</h2>
          <p className="text-muted-foreground text-sm">Estimate financial losses from pest infestation — powered by 13 crop profiles & 19+ pest models</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Input Panel ── */}
        <div className="glass-panel p-6 space-y-5">
          <h3 className="text-sm font-bold text-foreground border-b border-border/30 pb-2">Farm Variables</h3>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Pest Species</label>
            <select value={selectedPest} onChange={e => setSelectedPest(e.target.value)}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500 appearance-none">
              {pests.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Crop Type</label>
            <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500 appearance-none">
              {Object.entries(crops).map(([key, val]) => <option key={key} value={key}>{val.name} (${val.price_per_ton}/ton)</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Field Size (Hectares)</label>
            <input type="number" value={fieldSize} onChange={e => setFieldSize(Number(e.target.value))}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-amber-500 font-bold">Infestation Level</label>
            <div className="grid grid-cols-2 gap-2">
              {['light', 'moderate', 'severe', 'critical'].map(level => (
                <button key={level} onClick={() => setInfestationLevel(level)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                    infestationLevel === level
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-secondary/30 border-border/30 text-muted-foreground hover:border-amber-500/30'
                  }`}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button onClick={calculate} disabled={loading}
            className="w-full py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /> : <Calculator className="w-4 h-4" />}
            Calculate Impact
          </button>
        </div>

        {/* ── Results Panel ── */}
        <div className="lg:col-span-2 space-y-4">
          {!result ? (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">Configure farm variables and click Calculate to see results</p>
            </div>
          ) : (
            <>
              {/* Urgency Badge */}
              <div className={`p-3 rounded-xl border-2 text-center font-bold text-sm uppercase tracking-wider ${urgencyColors[result.urgency]}`}>
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {result.urgency} — {result.yield_loss_percent}% yield loss expected
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="glass-panel p-5 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Crop Value</p>
                  <p className="text-2xl font-bold text-foreground">${result.total_value_usd.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{result.total_yield_tons.toFixed(1)} tons</p>
                </div>
                <div className="glass-panel p-5 text-center border-l-4 border-destructive">
                  <p className="text-xs text-destructive font-bold mb-1 flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" />Financial Loss</p>
                  <p className="text-2xl font-bold text-destructive">-${result.financial_loss_usd.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{result.yield_loss_tons.toFixed(1)} tons lost</p>
                </div>
                <div className="glass-panel p-5 text-center">
                  <p className="text-xs text-emerald-500 font-bold mb-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />Net Revenue</p>
                  <p className="text-2xl font-bold text-emerald-400">${result.remaining_value_usd.toLocaleString()}</p>
                </div>
              </div>

              {/* ROI Comparison */}
              <div className="glass-panel p-5">
                <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" /> Treatment ROI Comparison
                </h4>
                <div className="space-y-3">
                  {Object.entries(result.roi_comparison).map(([method, data]) => (
                    <div key={method}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-foreground capitalize">{method} — {data.effectiveness}% effective</span>
                        <span className={data.roi >= 0 ? 'text-emerald-400' : 'text-destructive'}>{data.roi}% ROI</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${data.roi >= 200 ? 'bg-emerald-500' : data.roi >= 100 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, Math.max(5, data.roi / 5))}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Cost: ${result.treatments[method]?.total.toLocaleString()}/field
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Growth Stage Advisor ── */}
      {stages.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" /> Crop Growth Stage Advisor
          </h3>
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Growth Stage</label>
              <select value={selectedStage} onChange={e => setSelectedStage(e.target.value)}
                className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none appearance-none">
                {stages.map(s => <option key={s.stage} value={s.stage}>{s.stage} ({s.days}d)</option>)}
              </select>
            </div>
            <button onClick={getStageAdvice}
              className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition text-sm">
              Get Advice
            </button>
          </div>

          {/* Stage timeline */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
            {stages.map((s, i) => (
              <div key={i} onClick={() => { setSelectedStage(s.stage); }}
                className={`flex-1 min-w-[80px] p-2 rounded-lg text-center cursor-pointer border transition-all text-[10px] ${
                  selectedStage === s.stage ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-secondary/30 border-border/20 hover:border-emerald-500/30'
                }`}>
                <div className="font-bold text-foreground truncate">{s.stage}</div>
                <div className="text-muted-foreground">{s.days}d</div>
                <div className={`mt-1 text-[9px] font-bold ${
                  s.vulnerability === 'Critical' ? 'text-red-500' :
                  s.vulnerability === 'High' ? 'text-rose-400' :
                  s.vulnerability === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                }`}>{s.vulnerability}</div>
              </div>
            ))}
          </div>

          {stageAdvice && !stageAdvice.error && (
            <div className="p-4 bg-secondary/20 rounded-xl border border-border/30 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-foreground">Risk Multiplier:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  stageAdvice.vulnerability.risk_multiplier >= 1.8 ? 'bg-red-500/20 text-red-400' :
                  stageAdvice.vulnerability.risk_multiplier >= 1.3 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>{stageAdvice.vulnerability.risk_multiplier}x</span>
              </div>
              <p className="text-xs text-muted-foreground">{stageAdvice.vulnerability.note}</p>
              {stageAdvice.chemical_restrictions && (
                <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
                  <strong>⚠️ Chemical Restriction:</strong> {stageAdvice.chemical_restrictions.reason}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
