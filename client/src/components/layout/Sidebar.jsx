import { useState } from 'react';
import {
  Settings, Cpu, SlidersHorizontal, Zap, Target, Gauge,
  FlaskConical, Eye, Layers, ChevronDown, ChevronUp,
  Activity, Clock, TrendingUp, Sparkles, Shield, Bolt,
  CircleDot, Brain, Microscope,
  Cloud, MapPin, Share2, ArrowLeftRight, BookOpen, Calculator, ThumbsUp, Terminal,
  CheckCircle2, ShieldAlert, Bug, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const PRESETS = {
  fast: { label: 'Fast', icon: Zap, limeSamples: 100, limeFeatures: 3, gradcamOpacity: 0.5, desc: '~5s' },
  balanced: { label: 'Balanced', icon: Target, limeSamples: 300, limeFeatures: 5, gradcamOpacity: 0.75, desc: '~15s' },
  accurate: { label: 'Accurate', icon: Microscope, limeSamples: 800, limeFeatures: 10, gradcamOpacity: 0.9, desc: '~45s' },
};

const MODELS = [
  {
    value: 'efficientnet',
    label: 'EfficientNet-B4',
    desc: 'Fast & Balanced',
    badge: 'Recommended',
    icon: Zap,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    value: 'vit',
    label: 'Vision Transformer',
    desc: 'High Accuracy (ViT-B)',
    badge: 'Advanced',
    icon: Brain,
    color: 'from-violet-500 to-purple-600'
  },
];

export function Sidebar({ 
  activeView, setActiveView,
  modelName, setModelName, 
  isQuantized, setIsQuantized, 
  confidenceThreshold, setConfidenceThreshold,
  limeSamples, setLimeSamples,
  limeFeatures, setLimeFeatures,
  gradcamOpacity, setGradcamOpacity
}) {
  const [activePreset, setActivePreset] = useState('fast');
  const [xaiExpanded, setXaiExpanded] = useState(true);
  const [modelExpanded, setModelExpanded] = useState(true);

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setActivePreset(key);
    setLimeSamples(p.limeSamples);
    setLimeFeatures(p.limeFeatures);
    setGradcamOpacity(p.gradcamOpacity);
  };

  const detectPreset = () => {
    for (const [key, p] of Object.entries(PRESETS)) {
      if (limeSamples === p.limeSamples && limeFeatures === p.limeFeatures) return key;
    }
    return null;
  };

  const currentPreset = detectPreset();

  const NAV_SECTIONS = [
    {
      title: 'AI ASSISTANT',
      items: [
        { id: 'chat', label: 'AI Advisor', icon: MessageSquare, highlight: true },
      ]
    },
    {
      title: 'ENVIRONMENT',
      items: [
        { id: 'fields', label: 'My Fields', icon: MapPin },
        { id: 'spray', label: 'Spray Safety', icon: Cloud },
        { id: 'map', label: 'Outbreak Map', icon: MapPin },
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { id: 'treatment', label: 'Treatment Tracker', icon: CheckCircle2 },
        { id: 'risk', label: 'Risk Score', icon: ShieldAlert },
        { id: 'analytics', label: 'Analytics', icon: Share2 },
        { id: 'history', label: 'Diagnostic History', icon: Clock },
        { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
        { id: 'library', label: 'Pest Library', icon: BookOpen },
        { id: 'lifecycle', label: 'Lifecycle View', icon: Bug },
        { id: 'economic', label: 'Economic Impact', icon: Calculator },
        { id: 'feedback', label: 'Feedback', icon: ThumbsUp },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'api', label: 'API Docs', icon: Terminal },
      ]
    }
  ];

  const handleNavClick = (id, label) => {
    setActiveView(id);
  };

  return (
    <aside className="flex flex-col h-full">
      {/* ─── Scrollable Content Area ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 pb-12">

        {/* ─── Status Indicator ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 mb-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
            </div>
            <span className="text-xs font-medium text-emerald-400">System Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400/80">Ready</span>
          </div>
        </motion.div>

        {/* ─── Quick Stats ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-2 mb-5"
        >
          {[
            { icon: Gauge, value: '99.2%', label: 'Accuracy', color: 'text-emerald-400' },
            { icon: Clock, value: '<15s', label: 'Avg Time', color: 'text-amber-400' },
            { icon: Shield, value: '7', label: 'Classes', color: 'text-sky-400' },
          ].map((stat, i) => (
            <div
              key={i}
              className="group relative flex flex-col items-center gap-1 p-2.5 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300 cursor-default"
            >
              <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
              <span className="text-xs font-bold text-foreground">{stat.value}</span>
              <span className="text-[9px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ─── Gradient Separator ─── */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-4" />

        {/* ═══════════════════════════════════ */}
        {/*        NAVIGATION MENU              */}
        {/* ═══════════════════════════════════ */}
        <div className="space-y-6 mb-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                {section.title}
              </h4>
              <div className="space-y-0.5">
              {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.label)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                        isActive
                          ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                          : item.highlight
                            ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 border border-transparent hover:border-emerald-500/20"
                            : "text-foreground/80 hover:text-foreground hover:bg-secondary/50 border border-transparent"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-primary" : item.highlight ? "text-emerald-400" : "text-muted-foreground")} />
                      <span>{item.label}</span>
                      {item.highlight && !isActive && (
                        <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">RAG</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Gradient Separator ─── */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-4" />

        {/* ═══════════════════════════════════ */}
        {/*        AI MODEL SECTION             */}
        {/* ═══════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setModelExpanded(!modelExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>AI Model</span>
            </div>
            {modelExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {modelExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {/* Model Cards */}
                <div className="space-y-2 mb-4">
                  {MODELS.map((model) => {
                    const isActive = modelName === model.value;
                    const Icon = model.icon;
                    return (
                      <motion.button
                        key={model.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setModelName(model.value)}
                        className={cn(
                          "w-full relative p-3.5 rounded-xl border text-left transition-all duration-300 group overflow-hidden",
                          isActive
                            ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                            : "border-border/50 bg-secondary/20 hover:border-primary/20 hover:bg-secondary/40"
                        )}
                      >
                        {/* Glow effect for active */}
                        {isActive && (
                          <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                        )}

                        <div className="flex items-start justify-between relative z-10">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-1.5 rounded-lg bg-gradient-to-br",
                              isActive ? model.color : "from-muted to-muted",
                              "transition-all duration-300"
                            )}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className={cn(
                                "text-sm font-semibold transition-colors",
                                isActive ? "text-foreground" : "text-foreground/70"
                              )}>
                                {model.label}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{model.desc}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {model.badge && (
                              <span className={cn(
                                "text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
                                isActive
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {model.badge}
                              </span>
                            )}
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                              isActive ? "border-primary" : "border-muted-foreground/30"
                            )}>
                              {isActive && (
                                <motion.div
                                  layoutId="model-dot"
                                  className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Edge Model Toggle */}
                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border/50 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-md bg-amber-500/10">
                      <Bolt className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Edge Mode</p>
                      <p className="text-[10px] text-muted-foreground">INT8 Quantized</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsQuantized(!isQuantized)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300",
                      isQuantized ? "bg-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-muted"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow ring-0 transition-transform duration-300",
                      isQuantized ? "translate-x-[18px]" : "translate-x-[3px]"
                    )} />
                  </button>
                </div>

                {/* Confidence Threshold */}
                <div className="space-y-2 p-3 bg-secondary/10 rounded-xl border border-border/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-primary/70" />
                      <label className="text-xs font-medium text-foreground">Confidence</label>
                    </div>
                    <span className="text-xs text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                      {confidenceThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1" max="99"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>Lenient</span>
                    <span>Strict</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Gradient Separator ─── */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-5" />

        {/* ═══════════════════════════════════ */}
        {/*       XAI PARAMETERS SECTION        */}
        {/* ═══════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={() => setXaiExpanded(!xaiExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>XAI Parameters</span>
            </div>
            {xaiExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {xaiExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-4"
              >
                {/* ─── Preset Buttons ─── */}
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Presets</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.entries(PRESETS).map(([key, preset]) => {
                      const Icon = preset.icon;
                      const isActive = currentPreset === key;
                      return (
                        <motion.button
                          key={key}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => applyPreset(key)}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2.5 rounded-lg border text-center transition-all duration-300",
                            isActive
                              ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                              : "border-border/40 bg-secondary/20 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-semibold">{preset.label}</span>
                          <span className="text-[8px] opacity-60">{preset.desc}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* ─── LIME Samples Slider ─── */}
                <div className="space-y-2 p-3 bg-secondary/10 rounded-xl border border-border/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-sky-400" />
                      <label className="text-xs font-medium text-foreground">LIME Samples</label>
                    </div>
                    <span className="text-xs text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                      {limeSamples}
                    </span>
                  </div>
                  <input
                    type="range" min="100" max="1500" step="100"
                    value={limeSamples}
                    onChange={(e) => { setLimeSamples(parseInt(e.target.value)); setActivePreset(null); }}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Higher values = more accurate but slower
                  </p>
                </div>

                {/* ─── LIME Regions Slider ─── */}
                <div className="space-y-2 p-3 bg-secondary/10 rounded-xl border border-border/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-violet-400" />
                      <label className="text-xs font-medium text-foreground">LIME Regions</label>
                    </div>
                    <span className="text-xs text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                      {limeFeatures}
                    </span>
                  </div>
                  <input
                    type="range" min="3" max="20" step="1"
                    value={limeFeatures}
                    onChange={(e) => { setLimeFeatures(parseInt(e.target.value)); setActivePreset(null); }}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>Coarse</span>
                    <span>Fine-grained</span>
                  </div>
                </div>

                {/* ─── Grad-CAM Opacity Slider ─── */}
                <div className="space-y-2 p-3 bg-secondary/10 rounded-xl border border-border/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <label className="text-xs font-medium text-foreground">Heatmap Opacity</label>
                    </div>
                    <span className="text-xs text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                      {Math.round(gradcamOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range" min="0.1" max="1.0" step="0.05"
                    value={gradcamOpacity}
                    onChange={(e) => { setGradcamOpacity(parseFloat(e.target.value)); setActivePreset(null); }}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  {/* Opacity preview bar */}
                  <div className="h-1.5 rounded-full overflow-hidden bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500"
                      style={{ width: `${gradcamOpacity * 100}%` }}
                      layout
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Gradient Separator ─── */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-5" />

        {/* ─── Tech Info Footer ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {['PyTorch', 'LIME', 'SHAP', 'Grad-CAM', 'FastAPI', 'React'].map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[9px] font-medium rounded-full bg-secondary/40 border border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="px-5 py-3 border-t border-border/50 bg-card/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>IP201 Capstone © 2026</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
            <span className="font-mono">v2.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
