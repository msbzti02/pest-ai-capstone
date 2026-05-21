import { Bug, Activity, ShieldAlert, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export function ResultsPanel({ results, confidenceThreshold, onExportPdf }) {
  const primary = results.predictions[0];
  const isHighConfidence = primary.confidence >= confidenceThreshold;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mt-8"
      id="report-content"
    >
      <div className="flex justify-end mb-4">
        <button 
          onClick={onExportPdf}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition bg-secondary/30 px-4 py-2 rounded-lg border border-border hover:border-muted-foreground/30"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="glass-panel overflow-hidden border-t-4" style={{ borderTopColor: isHighConfidence ? 'var(--primary)' : 'var(--warning)' }}>
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${isHighConfidence ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
                {isHighConfidence ? <Bug className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
              </div>
              <div>
                <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                  Primary Diagnosis
                </p>
                <h2 className="text-3xl font-bold text-foreground">
                  {isHighConfidence ? primary.label : 'Inconclusive'}
                </h2>
                {!isHighConfidence && (
                  <p className="text-sm text-warning mt-1">Confidence is below the required {confidenceThreshold}% threshold.</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-4xl font-light tracking-tighter" style={{ color: isHighConfidence ? 'var(--primary)' : 'var(--warning)' }}>
                {primary.confidence.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Confidence Score</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-4">Alternative Possibilities</p>
            <div className="grid grid-cols-2 gap-4">
              {results.predictions.slice(1).map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-border">
                  <span className="text-sm text-foreground">{p.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40" style={{ width: `${p.confidence}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-10 text-right">{p.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
