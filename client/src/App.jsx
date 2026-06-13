import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Lock } from 'lucide-react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { useAuth } from './contexts/AuthContext';
import { jsPDF } from 'jspdf';
import { UploadZone } from './components/ui/UploadZone';
import { ResultsPanel } from './components/analysis/ResultsPanel';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/ui/Hero';
import { XAIDashboard } from './components/analysis/XAIDashboard';
import { Chatbot } from './components/Chatbot';
import { AuthModal } from './components/ui/AuthModal';
import AnalyticsView from './components/views/AnalyticsView';
import SpraySafetyView from './components/views/SpraySafetyView';
import HistoryView from './components/views/HistoryView';
import MapView from './components/views/MapView';
import LibraryView from './components/views/LibraryView';
import CompareView from './components/views/CompareView';
import EconomicView from './components/views/EconomicView';
import FeedbackView from './components/views/FeedbackView';
import ApiDocsView from './components/views/ApiDocsView';
import TreatmentView from './components/views/TreatmentView';
import FieldsView from './components/views/FieldsView';
import RiskScoreView from './components/views/RiskScoreView';
import LifecycleView from './components/views/LifecycleView';
import ChatView from './components/views/ChatView';
function App() {
  const { user, setAuthModalOpen } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // App Navigation State
  const [activeView, setActiveView] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Theme Management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // AI Configuration State
  const [modelName, setModelName] = useState('efficientnet');
  const [isQuantized, setIsQuantized] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  
  // XAI Configuration State
  const [limeSamples, setLimeSamples] = useState(100);
  const [limeFeatures, setLimeFeatures] = useState(3);
  const [gradcamOpacity, setGradcamOpacity] = useState(0.5);

  const handleFileChange = (e) => {
    if (!e) {
      setFile(null);
      setPreviewUrl(null);
      setResults(null);
      setError(null);
      return;
    }
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResults(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    formData.append('lime_samples', limeSamples);
    formData.append('lime_features', limeFeatures.toString());
    formData.append('gradcam_opacity', gradcamOpacity.toString());
    formData.append('is_quantized', isQuantized ? 'true' : 'false');

    try {
      const res = await axios.post('/api/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Analysis failed. Make sure the ML service is running.');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = () => {
    if (!results) return;

    const dateStr = new Date().toLocaleString();
    const primaryLabel = results.predictions[0]?.label || 'Unknown';
    const confidence = results.predictions[0]?.confidence || 0;
    
    // Extract contents if they exist
    const treatmentHtml = document.getElementById('treatment-content')?.innerHTML || '<p><em>No treatment protocol generated or still loading.</em></p>';
    const biologyHtml = document.getElementById('biology-content')?.innerHTML || '<p><em>No biological data generated or still loading.</em></p>';
    
    // Build predictions list
    const predictionsHtml = results.predictions.map((p, i) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0;">${i + 1}. ${p.label}</td>
        <td style="padding: 10px 0; text-align: right; font-family: monospace;">${(p.confidence).toFixed(1)}%</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; max-width: 800px; margin: auto; line-height: 1.6; background: white;">
        <div style="border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0 0 10px 0; font-size: 28px;">PestAI Diagnostic Report</h1>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Date: ${dateStr}</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Model: EFFICIENTNET ${isQuantized ? '(INT8 Edge Mode)' : ''}</p>
        </div>
        
        <div style="margin-bottom: 40px;">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Primary Diagnosis</h2>
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border: 1px solid #a7f3d0;">
            <h3 style="margin: 0; color: #047857; font-size: 24px;">${primaryLabel}</h3>
            <p style="margin: 5px 0 0 0; color: #065f46; font-size: 16px;">Confidence: <strong>${confidence.toFixed(1)}%</strong></p>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Detection Probabilities</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
              ${predictionsHtml}
            </tbody>
          </table>
          <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">LIME Samples: ${limeSamples} | Features: ${limeFeatures}</p>
        </div>
        
        <div style="margin-bottom: 40px;">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">AI Treatment Protocol</h2>
          <div style="font-size: 14px; color: #4b5563;">
            ${treatmentHtml}
          </div>
        </div>
        
        <div style="margin-bottom: 40px;">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Biological Information Database</h2>
          <div style="font-size: 14px; color: #4b5563;">
            ${biologyHtml}
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `PestAI_Diagnostic_Report_${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(html).save();
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background text-foreground overflow-hidden">
      <AuthModal />
      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite_alternate]" />
      
      {/* Background Pattern */}
      {theme === 'dark' ? (
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
        />
      ) : (
        <div className="absolute inset-0 pointer-events-none opacity-[0.3]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-2.69 2.69.83.83-3.52 3.52.83.83-4.35 4.35.83.83-5.18 5.18.83.83-6.01 6.01.83.83-6.84 6.84.83.83-7.67 7.67.83.83-8.5 8.5.83.83-9.33 9.33.83.83-10.16 10.16.83.83-10.99 10.99.83.83-11.82 11.82.83.83-12.65 12.65.83.83-13.48 13.48.83.83-14.31 14.31.83.83-15.14 15.14.83.83-15.97 15.97.83.83-16.8 16.8.83.83-17.63 17.63.83.83-18.46 18.46.83.83-19.29 19.29.83.83-20.12 20.12.83.83-20.95 20.95.83.83-21.78 21.78.83.83-22.61 22.61.83.83-23.44 23.44.83.83-24.27 24.27.83.83-25.1 25.1.83.83-25.93 25.93.83.83-26.76 26.76.83.83-27.59 27.59.83.83-28.42 28.42.83.83-29.25 29.25.83.83-30.08 30.08.83.83-30.91 30.91.83.83-31.74 31.74.83.83-32.57 32.57.83.83-33.4 33.4.83.83-34.23 34.23.83.83-35.06 35.06.83.83-35.89 35.89.83.83-36.72 36.72.83.83-37.55 37.55.83.83-38.38 38.38.83.83-39.21 39.21.83.83-40.04 40.04.83.83-40.87 40.87.83.83-41.7 41.7.83.83-42.53 42.53.83.83-43.36 43.36.83.83-44.19 44.19.83.83-45.02 45.02.83.83-45.85 45.85.83.83-46.68 46.68.83.83-47.51 47.51.83.83-48.34 48.34.83.83-49.17 49.17.83.83-50 50.83.83-50.83 50.83.83.83z' fill='%2310b981' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} 
        />
      )}

      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        setActiveView={setActiveView} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Container */}
      <div className="flex flex-1 w-full overflow-hidden z-10 relative">
        
        {/* Settings Sidebar (Desktop) */}
        <div className="hidden md:block w-[320px] shrink-0 overflow-y-auto border-r border-border bg-card/50 backdrop-blur-xl">
          <Sidebar 
            activeView={activeView} setActiveView={setActiveView}
            modelName={modelName} setModelName={setModelName}
            isQuantized={isQuantized} setIsQuantized={setIsQuantized}
            confidenceThreshold={confidenceThreshold} setConfidenceThreshold={setConfidenceThreshold}
            limeSamples={limeSamples} setLimeSamples={setLimeSamples}
            limeFeatures={limeFeatures} setLimeFeatures={setLimeFeatures}
            gradcamOpacity={gradcamOpacity} setGradcamOpacity={setGradcamOpacity}
          />
        </div>

        {/* Settings Sidebar (Mobile Off-Canvas) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-[80vw] max-w-[320px] bg-card border-r border-border z-50 overflow-y-auto shadow-2xl md:hidden flex flex-col"
              >
                <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                  <span className="font-semibold">Menu</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-secondary rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar 
                    activeView={activeView} setActiveView={setActiveView}
                    modelName={modelName} setModelName={setModelName}
                    isQuantized={isQuantized} setIsQuantized={setIsQuantized}
                    confidenceThreshold={confidenceThreshold} setConfidenceThreshold={setConfidenceThreshold}
                    limeSamples={limeSamples} setLimeSamples={setLimeSamples}
                    limeFeatures={limeFeatures} setLimeFeatures={setLimeFeatures}
                    gradcamOpacity={gradcamOpacity} setGradcamOpacity={setGradcamOpacity}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative p-4 md:p-8">
          {activeView === 'dashboard' && (
            <div className={`min-h-full flex flex-col items-center w-full max-w-6xl mx-auto ${!results ? 'justify-center' : ''}`}>
              {!results && (
                <>
                  {!loading && <Hero />}
                  <div className="w-full mt-4">
                    <UploadZone
                      file={file}
                      previewUrl={previewUrl}
                      loading={loading}
                      onFileChange={handleFileChange}
                      onAnalyze={handleAnalyze}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="w-full max-w-2xl mx-auto mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}

              {results && !loading && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 pt-8 md:pt-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Analysis Complete</h2>
                    <button
                      onClick={() => {
                        setResults(null);
                        setFile(null);
                        setPreviewUrl(null);
                      }}
                      className="px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition"
                    >
                      Start New Analysis
                    </button>
                  </div>
                  <ResultsPanel
                    results={results}
                    confidenceThreshold={confidenceThreshold}
                    onExportPdf={exportPdf}
                  />
                  <div className="relative group/xai mt-8">
                    <XAIDashboard images={results.images} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'spray' && <SpraySafetyView />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'map' && <MapView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'compare' && <CompareView />}
          {activeView === 'economic' && <EconomicView />}
          {activeView === 'feedback' && <FeedbackView />}
          {activeView === 'api' && <ApiDocsView />}
          {activeView === 'treatment' && <TreatmentView />}
          {activeView === 'fields' && <FieldsView />}
          {activeView === 'risk' && <RiskScoreView />}
          {activeView === 'lifecycle' && <LifecycleView />}
          {activeView === 'chat' && <ChatView />}
        </main>

        {/* Floating Chatbot Widget */}
        {results && activeView === 'dashboard' && (
          <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
              {isChatOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="mb-4 w-[calc(100vw-2rem)] md:w-[380px] h-[60vh] md:h-[500px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative"
                >
                  <Chatbot pestName={results.predictions[0].label} />
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="w-14 h-14 rounded-full bg-primary hover:bg-emerald-400 text-primary-foreground flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-110"
            >
              {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
