import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  UploadCloud, 
  Activity, 
  Settings, 
  Zap, 
  Download, 
  SlidersHorizontal,
  Bot,
  Bug,
  LayoutDashboard,
  ImageIcon
} from 'lucide-react';
import Chatbot from './Chatbot';
import html2pdf from 'html2pdf.js';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Settings
  const [modelName, setModelName] = useState('efficientnet');
  const [isQuantized, setIsQuantized] = useState(false); // Default to False so Grad-CAM is automatic!
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);
  const [limeSamples, setLimeSamples] = useState(200); // LOWERED FROM 800 TO 200 FOR SPEED
  const [limeFeatures, setLimeFeatures] = useState(5);  // LOWERED FROM 13 TO 5
  const [gradcamOpacity, setGradcamOpacity] = useState(0.75);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResults(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResults(null);

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
      console.error(err);
      setError(err.response?.data?.error || err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    // Create a clone to fix background colors for printing
    const clone = element.cloneNode(true);
    clone.style.padding = '30px';
    clone.style.background = '#022c22'; // Emerald 950
    clone.style.color = '#fff';
    
    const opt = {
      margin:       10,
      filename:     `PestAI_Report_${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#022c22' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(clone).save();
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon"><Bug size={24} color="#fff" /></div>
          <div className="sidebar-title">
            <h1>PestAI</h1>
            <p>Intelligence Platform</p>
          </div>
        </div>

        <div className="sidebar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            <LayoutDashboard size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Configuration</h3>
          </div>

          <div className="setting-group">
            <label>
              AI Architecture
            </label>
            <select value={modelName} onChange={(e) => setModelName(e.target.value)} className="glass-select">
              <option value="efficientnet">EfficientNet-B4</option>
              <option value="vit">Vision Transformer</option>
            </select>
          </div>

          <div className="setting-group" style={{ marginTop: '8px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ margin: 0 }}>Use Quantized Model (Edge)</label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isQuantized}
                onChange={(e) => setIsQuantized(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
              />
            </label>
          </div>

          <div className="setting-group" style={{ marginTop: '8px' }}>
            <label>
              Confidence Threshold
              <span style={{ color: 'var(--accent-primary)' }}>{confidenceThreshold}%</span>
            </label>
            <input 
              type="range" 
              min="1" max="99" step="1" 
              value={confidenceThreshold} 
              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))} 
            />
          </div>

          <div className="setting-group" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              <SlidersHorizontal size={18} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>XAI Parameters</h3>
            </div>
          </div>

          <div className="setting-group">
            <label>
              LIME Samples
              <span style={{ color: 'var(--accent-primary)' }}>{limeSamples}</span>
            </label>
            <input 
              type="range" 
              min="100" max="1500" step="100" 
              value={limeSamples} 
              onChange={(e) => setLimeSamples(parseInt(e.target.value))} 
            />
          </div>

          <div className="setting-group">
            <label>
              LIME Regions
              <span style={{ color: 'var(--accent-primary)' }}>{limeFeatures}</span>
            </label>
            <input 
              type="range" 
              min="3" max="20" step="1" 
              value={limeFeatures} 
              onChange={(e) => setLimeFeatures(parseInt(e.target.value))} 
            />
          </div>

          <div className="setting-group">
            <label>
              Grad-CAM Opacity
              <span style={{ color: 'var(--accent-primary)' }}>{Math.round(gradcamOpacity * 100)}%</span>
            </label>
            <input 
              type="range" 
              min="0.1" max="1.0" step="0.05" 
              value={gradcamOpacity} 
              onChange={(e) => setGradcamOpacity(parseFloat(e.target.value))} 
            />
          </div>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="main-canvas">
        <div className="action-bar">
          {results && (
            <button className="btn-secondary" onClick={exportPdf}>
              <Download size={16} />
              Export PDF Report
            </button>
          )}
        </div>

        {/* State 1: Upload */}
        {!loading && !results && (
          <div 
            className={`upload-container ${previewUrl ? 'drag-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            ) : (
              <div className="upload-content">
                <UploadCloud size={64} className="upload-icon" />
                <h2>Drop a leaf image here</h2>
                <p>Upload a high-resolution image of the affected crop (PNG, JPG)</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* State 1.5: Analyze Button */}
        {!loading && !results && file && (
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={handleAnalyze} style={{ maxWidth: '300px' }}>
              <Activity size={20} />
              Run Diagnostics
            </button>
          </div>
        )}

        {/* State 2: Loading */}
        {loading && (
          <div className="loader-container">
            <div className="scanner"></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Analyzing Image...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Running Deep Learning Inference & Explainable AI modules.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--danger)', marginTop: '24px' }}>
            <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} /> Analysis Failed
            </h3>
            <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{error}</p>
            <button className="btn-secondary" onClick={() => setError(null)} style={{ marginTop: '16px' }}>Dismiss</button>
          </div>
        )}

        {/* State 3: Results */}
        {results && !loading && (
          <div id="report-content" className="results-wrapper">
            <div className="glass-panel">
              <div className="diagnosis-header">
                <div className="diagnosis-title">
                  <Bug size={32} color="var(--accent-primary)" />
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Primary Diagnosis</p>
                    {results.predictions[0].confidence >= confidenceThreshold ? (
                        <h2>{results.predictions[0].label}</h2>
                    ) : (
                        <h2 style={{ color: 'var(--warning)' }}>Unknown (Low Confidence)</h2>
                    )}
                  </div>
                </div>
                <div className="confidence-badge">
                  {results.predictions[0].confidence.toFixed(1)}% Confidence
                </div>
              </div>
              
              <div style={{ padding: '0 24px 24px 24px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.9rem' }}>Alternative Possibilities:</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {results.predictions.slice(1).map((p, i) => (
                    <div key={i} style={{ background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                      <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{p.confidence.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.25rem' }}>
                <ImageIcon size={20} /> Explainable AI (XAI) Visuals
              </h3>
              <div className="xai-gallery">
                <div className="xai-card">
                  <div className="xai-card-header">Original Upload</div>
                  <div className="xai-image-wrapper">
                    <img src={`data:image/jpeg;base64,${results.images.original}`} alt="Original" />
                  </div>
                </div>
                <div className="xai-card">
                  <div className="xai-card-header">Grad-CAM (Heatmap)</div>
                  <div className="xai-image-wrapper">
                    {results.images.gradcam ? 
                      <img src={`data:image/jpeg;base64,${results.images.gradcam}`} alt="GradCAM" /> 
                      : <div className="xai-placeholder">Unavailable</div>}
                  </div>
                </div>
                <div className="xai-card">
                  <div className="xai-card-header">LIME (Superpixels)</div>
                  <div className="xai-image-wrapper">
                    {results.images.lime ? 
                      <img src={`data:image/jpeg;base64,${results.images.lime}`} alt="LIME" /> 
                      : <div className="xai-placeholder">Unavailable</div>}
                  </div>
                </div>
                <div className="xai-card">
                  <div className="xai-card-header">SHAP (Feature Impact)</div>
                  <div className="xai-image-wrapper" style={{ background: '#fff' }}>
                    {results.images.shap ? 
                      <img src={`data:image/jpeg;base64,${results.images.shap}`} alt="SHAP" /> 
                      : <div className="xai-placeholder">Unavailable</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CHATBOT PANEL (Only visible when results exist) */}
      <aside className={`chatbot-panel ${!results ? 'chatbot-hidden' : ''}`}>
        {results && <Chatbot pestName={results.predictions[0].label} />}
      </aside>
    </div>
  );
}
