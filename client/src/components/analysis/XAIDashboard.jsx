import { Layers, X, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

function CollapsibleExplanation({ title, isOpen, onToggle, children }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-2 text-sm text-muted-foreground border-t border-border/50 bg-background/50 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function XAIDashboard({ images }) {
  const [selectedImg, setSelectedImg] = useState(null);
  const [openInfo, setOpenInfo] = useState(null); // 'gradcam' | 'lime' | 'shap' | null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-16">
      <div className="flex items-center gap-2 mb-6 text-foreground">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Explainable AI (XAI) Visuals</h3>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item} className="glass-panel overflow-hidden group cursor-pointer" onClick={() => images.original && setSelectedImg(`data:image/jpeg;base64,${images.original}`)}>
          <div className="bg-secondary/50 px-4 py-3 border-b border-border">
            <h4 className="text-sm font-medium text-foreground">Original Image</h4>
          </div>
          <div className="relative aspect-square overflow-hidden bg-background">
            <img src={`data:image/jpeg;base64,${images.original}`} alt="Original" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel overflow-hidden group cursor-pointer" onClick={() => images.gradcam && setSelectedImg(`data:image/jpeg;base64,${images.gradcam}`)}>
          <div className="bg-secondary/50 px-4 py-3 border-b border-border flex justify-between items-center">
            <h4 className="text-sm font-medium text-foreground">Grad-CAM</h4>
          </div>
          <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center">
            {images.gradcam ? (
              <img src={`data:image/jpeg;base64,${images.gradcam}`} alt="GradCAM" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Unavailable in Edge Mode</span>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel overflow-hidden group cursor-pointer" onClick={() => images.lime && setSelectedImg(`data:image/jpeg;base64,${images.lime}`)}>
          <div className="bg-secondary/50 px-4 py-3 border-b border-border">
            <h4 className="text-sm font-medium text-foreground">LIME</h4>
          </div>
          <div className="relative aspect-square overflow-hidden bg-background flex items-center justify-center">
            {images.lime ? (
              <img src={`data:image/jpeg;base64,${images.lime}`} alt="LIME" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Unavailable</span>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel overflow-hidden group cursor-pointer" onClick={() => images.shap && setSelectedImg(`data:image/jpeg;base64,${images.shap}`)}>
          <div className="bg-secondary/50 px-4 py-3 border-b border-border">
            <h4 className="text-sm font-medium text-foreground">SHAP</h4>
          </div>
          <div className="relative aspect-square overflow-hidden bg-white flex items-center justify-center p-2">
            {images.shap ? (
              <img src={`data:image/jpeg;base64,${images.shap}`} alt="SHAP" className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="text-xs text-muted-foreground">Unavailable</span>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Explanations Section */}
      <div className="mt-8 space-y-3">
        <CollapsibleExplanation 
          title="How Grad-CAM Works?" 
          isOpen={openInfo === 'gradcam'} 
          onToggle={() => setOpenInfo(openInfo === 'gradcam' ? null : 'gradcam')}
        >
          <strong>Grad-CAM (Gradient-weighted Class Activation Mapping)</strong> is a heatmap that shows which parts of the leaf the AI focused on while making a diagnosis. 
          Red and yellow areas represent the regions the model weighted most heavily in its decision, while blue areas represent less considered regions.
        </CollapsibleExplanation>

        <CollapsibleExplanation 
          title="How LIME Works?" 
          isOpen={openInfo === 'lime'} 
          onToggle={() => setOpenInfo(openInfo === 'lime' ? null : 'lime')}
        >
          <strong>LIME (Local Interpretable Model-agnostic Explanations)</strong> divides the image into small segments (superpixels). 
          The areas highlighted in green support the current disease diagnosis. 
          The areas highlighted in red contradict that diagnosis (indicating it might be a different disease).
        </CollapsibleExplanation>

        <CollapsibleExplanation 
          title="How SHAP Works?" 
          isOpen={openInfo === 'shap'} 
          onToggle={() => setOpenInfo(openInfo === 'shap' ? null : 'shap')}
        >
          <strong>SHAP (SHapley Additive exPlanations)</strong> is based on game theory. It shows how much each pixel increases or decreases the score when calculating the AI's result. 
          Pink/Red pixels show areas that increase the probability of the prediction (disease symptom), while Blue pixels show areas that decrease the probability (healthy tissue or irrelevant region). The new update preserves the insect or leaf shape organically (inpaint-telea).
        </CollapsibleExplanation>
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 cursor-zoom-out"
            onClick={() => setSelectedImg(null)}
          >
            <button className="absolute top-6 right-6 text-foreground bg-secondary/50 rounded-full p-2 hover:bg-secondary">
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={selectedImg}
              alt="Expanded XAI Visual"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-default bg-white/5"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
