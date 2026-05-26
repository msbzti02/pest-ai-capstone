import { Leaf, ShieldCheck, Zap, Sun, Moon, User, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar({ theme, toggleTheme, setActiveView, isSidebarOpen, setIsSidebarOpen }) {
  const { user, logout, setAuthModalOpen } = useAuth();

  return (
    <nav className="w-full z-50 border-b border-border bg-background/80 backdrop-blur-md shrink-0 h-16">
      <div className="flex h-16 items-center px-6 max-w-[1600px] mx-auto justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button 
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>

          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveView('dashboard')}
          >
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 hidden sm:block">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              PestAI
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6 text-sm font-medium text-muted-foreground"
        >
          <div className="hidden md:flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
            <ShieldCheck className="w-4 h-4" />
            <span>ViT-B/16 Core</span>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <div className="w-px h-4 bg-border mx-2"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full border border-border">
                <User className="w-4 h-4 text-primary" />
                <span className="text-foreground">{user.name}</span>
                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${user.role === 'pro' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'}`}>
                  {user.role}
                </span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <User className="w-4 h-4" />
              <span>Log In / Register</span>
            </button>
          )}
        </motion.div>
      </div>
    </nav>
  );
}
