import { Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export function XAIDashboard({ images }) {
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="glass-panel overflow-hidden group">
          <div className="bg-secondary/50 px-4 py-3 border-b border-border">
            <h4 className="text-sm font-medium text-foreground">Original Image</h4>
          </div>
          <div className="relative aspect-square overflow-hidden bg-background">
            <img src={`data:image/jpeg;base64,${images.original}`} alt="Original" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel overflow-hidden group">
          <div className="bg-secondary/50 px-4 py-3 border-b border-border flex justify-between items-center">
            <h4 className="text-sm font-medium text-foreground">Grad-CAM (Heatmap)</h4>
          </div>
          <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center">
            {images.gradcam ? (
              <img src={`data:image/jpeg;base64,${images.gradcam}`} alt="GradCAM" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="text-sm text-muted-foreground">Unavailable in Edge Mode</span>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel overflow-hidden group">
          <div className="bg-secondary/50 px-4 py-3 border-b border-border">
            <h4 className="text-sm font-medium text-foreground">LIME (Superpixels)</h4>
          </div>
          <div className="relative aspect-square overflow-hidden bg-background flex items-center justify-center">
            {images.lime ? (
              <img src={`data:image/jpeg;base64,${images.lime}`} alt="LIME" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="text-sm text-muted-foreground">Unavailable</span>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* SHAP at the bottom full width */}
      <motion.div variants={item} initial="hidden" animate="show" className="mt-6 glass-panel overflow-hidden group">
        <div className="bg-secondary/50 px-4 py-3 border-b border-border">
          <h4 className="text-sm font-medium text-foreground">SHAP (Feature Impact)</h4>
        </div>
        <div className="w-full overflow-hidden bg-white flex items-center justify-center p-4">
          {images.shap ? (
            <img src={`data:image/jpeg;base64,${images.shap}`} alt="SHAP" className="max-w-full h-auto object-contain" />
          ) : (
            <div className="py-12"><span className="text-sm text-muted-foreground">Unavailable</span></div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
