import { useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Hero } from './components/ui/Hero';
import { UploadZone } from './components/ui/UploadZone';
import { ResultsPanel } from './components/analysis/ResultsPanel';
import { XAIDashboard } from './components/analysis/XAIDashboard';
import { Chatbot } from './components/Chatbot';

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Settings State
  const [modelName, setModelName] = useState('efficientnet');
  const [isQuantized, setIsQuantized] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);
  const [limeSamples, setLimeSamples] = useState(200);
  const [limeFeatures, setLimeFeatures] = useState(5);
  const [gradcamOpacity, setGradcamOpacity] = useState(0.75);

  const handleFileChange = (e) => {
    if (!e) {
      setFile(null);
      setPreviewUrl(null);
      setResults(null);
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
    formData.append('is_quantized', isQuantized ? 'true' : 'false');
    formData.append('lime_samples', limeSamples);
    formData.append('lime_features', limeFeatures);
    formData.append('gradcam_opacity', gradcamOpacity);

    try {
      const res = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during inference.');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    const clone = element.cloneNode(true);
    clone.style.padding = '40px';
    clone.style.background = '#09090b';
    clone.style.color = '#fff';
    
    const opt = {
      margin:       10,
      filename:     `PestAI_Enterprise_Report_${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#09090b' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(clone).save();
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background text-foreground overflow-hidden">
      {/* Ambient Orb - top left only */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[150px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" />
      
      {/* 2. Hexagonal / Tech Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
      />

      <Navbar />

      {/* Main Container - Automatically fills remaining height after Navbar */}
      <div className="flex flex-1 w-full overflow-hidden z-10 relative">
        
        {/* Settings Sidebar */}
        <div className="w-[320px] shrink-0 overflow-y-auto border-r border-border bg-card/50 backdrop-blur-xl">
          <Sidebar 
            modelName={modelName} setModelName={setModelName}
            isQuantized={isQuantized} setIsQuantized={setIsQuantized}
            confidenceThreshold={confidenceThreshold} setConfidenceThreshold={setConfidenceThreshold}
            limeSamples={limeSamples} setLimeSamples={setLimeSamples}
            limeFeatures={limeFeatures} setLimeFeatures={setLimeFeatures}
            gradcamOpacity={gradcamOpacity} setGradcamOpacity={setGradcamOpacity}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative">
          <div className={`min-h-full flex flex-col items-center w-full max-w-6xl mx-auto px-8 py-4 ${!results ? 'justify-center' : ''}`}>
            
            {/* Show Hero and Upload when there are NO results */}
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

            {/* Show Results when inference is done */}
            {results && !loading && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Analysis Complete</h2>
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
                <XAIDashboard images={results.images} />
              </div>
            )}

          </div>
        </main>

        {/* Chatbot Sidebar (Slides in when results are ready) */}
        {results && (
          <div className="w-[400px] shrink-0 overflow-hidden flex flex-col bg-card/80 backdrop-blur-xl border-l border-border shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <Chatbot pestName={results.predictions[0].label} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
