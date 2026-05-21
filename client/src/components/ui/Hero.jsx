import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative pt-32 pb-16 flex flex-col items-center text-center">
      {/* Animated background glow */}
      <div className="absolute top-0 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-50 -z-10 animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">Powered by Vision Transformers (ViT-B/16)</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground leading-tight">
          Identify Crop Diseases with <br/> 
          <span className="text-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">Human-Level Precision</span>
        </h1>
        
        <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload an image of a leaf. Our multimodal AI engine will diagnose the pest, generate XAI heatmaps, and provide treatment plans instantly.
        </p>
      </motion.div>
    </div>
  );
}
