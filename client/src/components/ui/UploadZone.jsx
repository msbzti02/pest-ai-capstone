import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export function UploadZone({ file, previewUrl, loading, onFileChange, onAnalyze }) {
  const fileInputRef = useRef(null);
  const { user, setAuthModalOpen } = useAuth();
  const [quality, setQuality] = useState(null);
  const [checkingQuality, setCheckingQuality] = useState(false);

  useEffect(() => {
    const checkQuality = async () => {
      if (!file) {
        setQuality(null);
        return;
      }
      setCheckingQuality(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('/api/image-quality', formData);
        setQuality(res.data);
      } catch (err) {
        console.error('Image quality check failed', err);
      } finally {
        setCheckingQuality(false);
      }
    };
    checkQuality();
  }, [file]);

  const handleZoneClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!previewUrl) {
      fileInputRef.current?.click();
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-auto h-[250px] flex flex-col items-center justify-center rounded-2xl glass-panel border-primary/30 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]"
      >
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-foreground">Running Inference...</h3>
        <p className="text-muted-foreground mt-2 text-sm">Computing Grad-CAM and generating explanations.</p>
      </motion.div>
    );
  }

  const handleFileChangeWrapper = (e) => {
    if (!user) {
      setAuthModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    onFileChange(e);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        whileHover={{ scale: previewUrl ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative w-full h-[250px] rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${
          previewUrl ? 'border border-border' : 'border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50'
        }`}
        onClick={handleZoneClick}
        onDrop={(e) => {
          e.preventDefault();
          if (!user) {
            setAuthModalOpen(true);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-6">
              
              {/* Image Quality Overlay */}
              {checkingQuality ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/80 backdrop-blur w-fit px-3 py-1.5 rounded-lg border border-border/50">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking quality...
                </div>
              ) : quality ? (
                <div className={`w-fit px-3 py-2 rounded-lg border backdrop-blur text-xs flex flex-col gap-1 ${
                  quality.score >= 80 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                  quality.score >= 60 ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' :
                  quality.score >= 40 ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
                  'bg-red-500/20 border-red-500/50 text-red-400'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {quality.score >= 60 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    Quality Score: {quality.score}/100 ({quality.grade})
                  </div>
                  {quality.issues?.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {quality.issues.map((iss, i) => <div key={i}>• {iss}</div>)}
                    </div>
                  )}
                </div>
              ) : null}

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                }}
                className="absolute top-4 right-4 bg-background/80 backdrop-blur text-sm px-3 py-1 rounded-md hover:bg-destructive hover:text-destructive-foreground transition"
              >
                Clear
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Drag & Drop Image</h3>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              Supports high-resolution PNG, JPG, or JPEG leaves.
            </p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChangeWrapper}
        />
      </motion.div>

      {previewUrl && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center"
        >
          <button 
            onClick={onAnalyze}
            className="group relative px-8 py-4 bg-foreground text-background font-semibold rounded-xl text-lg overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2 group-hover:text-background">
              <ImageIcon className="w-5 h-5" />
              Analyze with Vision AI
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
