import { Bug, Activity, ShieldAlert, Download, FlaskConical, Loader2, Info, BookOpen, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export function ResultsPanel({ results, confidenceThreshold, onExportPdf }) {
  const primary = results.predictions[0];
  const isHighConfidence = primary.confidence >= confidenceThreshold;
  const [treatment, setTreatment] = useState(null);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const [treatmentError, setTreatmentError] = useState(null);

  const [biologyInfo, setBiologyInfo] = useState(null);
  const [loadingBiology, setLoadingBiology] = useState(false);
  const [biologyError, setBiologyError] = useState(null);

  const [isTracked, setIsTracked] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    async function fetchTreatment() {
      if (!isHighConfidence) return;
      
      setLoadingTreatment(true);
      setTreatmentError(null);
      try {
        let lat = null;
        let lon = null;
        
        // Attempt to get location for weather-aware treatment
        if (navigator.geolocation) {
          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;
          } catch (geoErr) {
            console.warn('Geolocation failed or denied, using default location.');
          }
        }

        const response = await axios.post('/api/treatment', { 
          pest_name: primary.label,
          lat: lat,
          lon: lon,
          analysis_id: results.analysis_id
        });
        setTreatment(response.data.recommendation);
      } catch (err) {
        setTreatmentError('Could not retrieve treatment recommendation.');
      } finally {
        setLoadingTreatment(false);
      }
    }

    fetchTreatment();
  }, [primary.label, isHighConfidence]);

  const handleBiologyFetch = async () => {
    setLoadingBiology(true);
    setBiologyError(null);
    try {
      const res = await axios.post('/api/biology', { pest_name: primary.label });
      setBiologyInfo(res.data.info);
    } catch (err) {
      setBiologyError('Failed to fetch biological information from database.');
      console.error(err);
    } finally {
      setLoadingBiology(false);
    }
  };

  const handleTrackTreatment = async () => {
    setIsTracking(true);
    try {
      const sessionId = localStorage.getItem('pestai_session') || 'demo_session';
      await axios.post('/api/treatment/start', {
        pest_name: primary.label,
        crop: 'corn', // Defaulting to corn
        field_size_ha: 1,
        session_id: sessionId,
        custom_protocol: treatment
      });
      setIsTracked(true);
    } catch (err) {
      console.error('Failed to start tracking:', err);
    } finally {
      setIsTracking(false);
    }
  };

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

      {/* Treatment Recommendation Card */}
      {isHighConfidence && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 glass-panel overflow-hidden border-t-4 border-t-blue-500"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FlaskConical className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Nexus Weather-Aware Protocol</h3>
                  <p className="text-sm text-muted-foreground">Dynamic, real-time treatment guidelines fused with meteorology</p>
                </div>
              </div>
              <button 
                onClick={handleTrackTreatment}
                disabled={isTracked || isTracking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${
                  isTracked 
                    ? 'bg-blue-500/20 text-blue-400 cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                {isTracking ? 'Saving...' : isTracked ? 'Added to Tracker' : 'Save to Tracker'}
              </button>
            </div>

            <div className="min-h-[100px] relative">
              {loadingTreatment ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm animate-pulse">Analyzing laboratory data...</p>
                </div>
              ) : treatmentError ? (
                <div className="flex items-center gap-2 text-warning p-4 bg-warning/10 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                  <p className="text-sm">{treatmentError}</p>
                </div>
              ) : treatment ? (
                <div id="treatment-content" className="prose prose-invert prose-blue max-w-none prose-sm sm:prose-base
                              prose-headings:text-blue-400 prose-headings:font-semibold
                              prose-strong:text-blue-300 prose-p:text-muted-foreground
                              prose-li:text-muted-foreground prose-ul:my-2">
                  <ReactMarkdown>{treatment}</ReactMarkdown>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}

      {/* Biological Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 glass-panel overflow-hidden border-t-4 border-t-emerald-500"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <BookOpen className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Biological Information Database</h3>
                <p className="text-sm text-muted-foreground">Encyclopedic information about this pest</p>
              </div>
            </div>
            {!biologyInfo && !loadingBiology && (
              <button 
                onClick={handleBiologyFetch}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-500/20"
              >
                Fetch Information
              </button>
            )}
          </div>

          <div className="relative">
            {loadingBiology ? (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-sm animate-pulse">Scanning encyclopedia...</p>
              </div>
            ) : biologyError ? (
              <div className="flex items-center gap-2 text-warning p-4 bg-warning/10 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
                <p className="text-sm">{biologyError}</p>
              </div>
            ) : biologyInfo ? (
              <div id="biology-content" className="prose prose-invert prose-emerald max-w-none prose-sm sm:prose-base
                              prose-headings:text-emerald-400 prose-headings:font-semibold
                              prose-strong:text-emerald-300 prose-p:text-muted-foreground
                              prose-li:text-muted-foreground prose-ul:my-2">
                <ReactMarkdown>{biologyInfo}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                You can click the "Fetch Information" button to retrieve data from the scientific database regarding the anatomy, life cycle, and crop damage mechanism of the pest detected by PestAI.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
