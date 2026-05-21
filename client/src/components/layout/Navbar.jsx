import { Leaf, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <nav className="w-full z-50 border-b border-border bg-background/80 backdrop-blur-md shrink-0 h-16">
      <div className="flex h-16 items-center px-6 max-w-[1600px] mx-auto justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            PestAI
          </span>
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
            Enterprise
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6 text-sm font-medium text-muted-foreground"
        >
          <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
            <ShieldCheck className="w-4 h-4" />
            <span>ViT-B/16 Core</span>
          </div>
          <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>99.9% Uptime</span>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
