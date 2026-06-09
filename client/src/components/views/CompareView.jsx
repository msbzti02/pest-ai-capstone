import { ArrowLeftRight, Check, X } from 'lucide-react';

export default function CompareView() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
          <ArrowLeftRight className="w-8 h-8 text-primary" />
          Model Comparison
        </h2>
        <p className="text-muted-foreground mt-2">Compare AI models to choose the best fit for your hardware</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model 1 */}
        <div className="glass-panel p-6 border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl" />
          <h3 className="text-xl font-bold text-emerald-400 mb-1">EfficientNet-B4</h3>
          <p className="text-sm text-muted-foreground mb-6">Standard edge-device deployment</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Base Accuracy</span>
              <span className="font-mono font-bold text-emerald-400">99.2%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Inference Speed</span>
              <span className="font-mono font-bold text-foreground">~45ms</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Memory Footprint</span>
              <span className="font-mono font-bold text-foreground">18 MB</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Recommended CPU</span>
              <span className="font-mono font-bold text-foreground">ARM Cortex-A / Snapdragon</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">GPU Acceleration</span>
              <span className="font-mono font-bold text-emerald-400">Optional (NPU Supported)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Est. Power Draw</span>
              <span className="font-mono font-bold text-foreground text-emerald-400">~2-5W (Mobile/Edge)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Mobile Ready</span>
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          
          <button className="w-full mt-6 py-2 bg-emerald-500/20 text-emerald-500 rounded-lg text-sm font-bold hover:bg-emerald-500/30 transition">
            Active Default
          </button>
        </div>

        {/* Model 2 */}
        <div className="glass-panel p-6 border-violet-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-3xl" />
          <h3 className="text-xl font-bold text-violet-400 mb-1">Vision Transformer (ViT)</h3>
          <p className="text-sm text-muted-foreground mb-6">Cloud-based heavy computation</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Base Accuracy</span>
              <span className="font-mono font-bold text-violet-400">99.8%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Inference Speed</span>
              <span className="font-mono font-bold text-foreground">~850ms</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Memory Footprint</span>
              <span className="font-mono font-bold text-foreground">340 MB</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Recommended CPU</span>
              <span className="font-mono font-bold text-foreground">8-Core Intel/AMD</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">GPU Acceleration</span>
              <span className="font-mono font-bold text-violet-400">Required (NVIDIA)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Est. Power Draw</span>
              <span className="font-mono font-bold text-foreground text-red-400">~250W (Desktop)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/50">
              <span className="text-sm text-foreground/80">Mobile Ready</span>
              <X className="w-4 h-4 text-destructive" />
            </div>
          </div>
          
          <button className="w-full mt-6 py-2 bg-secondary text-foreground rounded-lg text-sm font-bold hover:bg-secondary/80 transition">
            Switch to ViT
          </button>
        </div>
      </div>
    </div>
  );
}
