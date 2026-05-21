import { Settings, Cpu, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ 
  modelName, setModelName, 
  isQuantized, setIsQuantized, 
  confidenceThreshold, setConfidenceThreshold,
  limeSamples, setLimeSamples,
  limeFeatures, setLimeFeatures,
  gradcamOpacity, setGradcamOpacity
}) {
  return (
    <aside className="flex flex-col">
      <div className="p-6 pt-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-6">
          <Settings className="w-4 h-4" /> Model Settings
        </h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Architecture</label>
            <div className="relative">
              <select 
                value={modelName} 
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              >
                <option value="efficientnet">EfficientNet-B4</option>
                <option value="vit">Vision Transformer</option>
              </select>
              <Cpu className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Edge Model</p>
              <p className="text-xs text-muted-foreground mt-0.5">Quantized (INT8)</p>
            </div>
            <button 
              onClick={() => setIsQuantized(!isQuantized)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                isQuantized ? "bg-primary" : "bg-muted"
              )}
            >
              <span className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                isQuantized ? "translate-x-2" : "-translate-x-2"
              )} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">Confidence Threshold</label>
              <span className="text-xs text-primary font-mono">{confidenceThreshold}%</span>
            </div>
            <input 
              type="range" 
              min="1" max="99" 
              value={confidenceThreshold} 
              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        <div className="mt-10 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> XAI Parameters
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-foreground">LIME Samples</label>
              <span className="text-xs text-primary font-mono">{limeSamples}</span>
            </div>
            <input 
              type="range" min="100" max="1500" step="100"
              value={limeSamples} 
              onChange={(e) => setLimeSamples(parseInt(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-foreground">LIME Regions</label>
              <span className="text-xs text-primary font-mono">{limeFeatures}</span>
            </div>
            <input 
              type="range" min="3" max="20" step="1"
              value={limeFeatures} 
              onChange={(e) => setLimeFeatures(parseInt(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-foreground">Heatmap Opacity</label>
              <span className="text-xs text-primary font-mono">{Math.round(gradcamOpacity * 100)}%</span>
            </div>
            <input 
              type="range" min="0.1" max="1.0" step="0.05"
              value={gradcamOpacity} 
              onChange={(e) => setGradcamOpacity(parseFloat(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
