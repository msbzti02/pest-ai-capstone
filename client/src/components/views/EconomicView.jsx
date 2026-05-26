import { Calculator, DollarSign, TrendingDown } from 'lucide-react';
import { useState } from 'react';

export default function EconomicView() {
  const [acres, setAcres] = useState(100);
  const [yieldPerAcre, setYieldPerAcre] = useState(40); // Tons
  const [pricePerTon, setPricePerTon] = useState(150);
  const [infectionRate, setInfectionRate] = useState(15); // %

  const totalValue = acres * yieldPerAcre * pricePerTon;
  const estimatedLoss = totalValue * (infectionRate / 100);
  const remainingValue = totalValue - estimatedLoss;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-500/20 rounded-xl">
          <Calculator className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Economic Impact Calculator</h2>
          <p className="text-muted-foreground text-sm">Estimate financial loss due to pest outbreaks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold border-b border-border/50 pb-2 mb-4">Farm Variables</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Total Farm Area (Acres)</label>
            <input type="number" value={acres} onChange={(e) => setAcres(Number(e.target.value))} className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-amber-500" />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Expected Yield (Tons/Acre)</label>
            <input type="number" value={yieldPerAcre} onChange={(e) => setYieldPerAcre(Number(e.target.value))} className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Market Price ($/Ton)</label>
            <input type="number" value={pricePerTon} onChange={(e) => setPricePerTon(Number(e.target.value))} className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-amber-500" />
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-amber-500 font-bold">Estimated Infection Rate (%)</label>
            <input type="range" min="0" max="100" value={infectionRate} onChange={(e) => setInfectionRate(Number(e.target.value))} className="w-full accent-amber-500" />
            <div className="text-right text-xs font-mono">{infectionRate}% spread</div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-5">
            <DollarSign className="w-64 h-64" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-sm text-muted-foreground">Potential Total Value (100% Healthy)</p>
              <h3 className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</h3>
            </div>
            
            <div className="border-l-4 border-destructive pl-4 py-1">
              <p className="text-sm text-destructive flex items-center gap-2 font-bold">
                <TrendingDown className="w-4 h-4" />
                Estimated Financial Loss
              </p>
              <h3 className="text-3xl font-bold text-destructive mt-1">-${estimatedLoss.toLocaleString()}</h3>
            </div>

            <div>
              <p className="text-sm text-emerald-500 font-bold">Projected Net Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-400">${remainingValue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
