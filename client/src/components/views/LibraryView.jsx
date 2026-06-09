import { BookOpen, Search, Leaf, AlertTriangle, ChevronRight, Activity, Sprout } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LibraryView() {
  const [pests, setPests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPest, setSelectedPest] = useState(null);
  const [loading, setLoading] = useState(true);

  // VLM Description state (mock loaded locally for fallback, or could be fetched)
  const [vlmDesc, setVlmDesc] = useState('');
  // Lifecycle state
  const [lifecycle, setLifecycle] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, treatment, lifecycle

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await axios.get('/api/pest-library');
        setPests(res.data.pests);
        if (res.data.pests.length > 0) {
          handleSelectPest(res.data.pests[0]);
        }
      } catch (error) {
        console.error("Failed to load pest library", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const handleSelectPest = async (pest) => {
    setSelectedPest(pest);
    setActiveTab('overview');
    
    // Fetch detailed info
    try {
      const bioRes = await axios.post('/api/biology', { pest_name: pest.pest_name });
      setVlmDesc(bioRes.data.info);
      
      const lifeRes = await axios.get(`/api/pest-lifecycle/${encodeURIComponent(pest.pest_name)}`);
      setLifecycle(lifeRes.data);
    } catch (e) {
      console.error(e);
      setVlmDesc("Detailed biological description unavailable.");
      setLifecycle(null);
    }
  };

  const filteredPests = pests.filter(p => 
    p.pest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.scientific && p.scientific.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-secondary text-muted-foreground border-border/30';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <BookOpen className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pest Encyclopedia</h2>
          <p className="text-muted-foreground text-sm">Comprehensive database of {pests.length} agricultural pests and diseases</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar / Search */}
        <div className="w-full md:w-80 flex flex-col shrink-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or scientific..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar glass-panel p-2 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading library...</div>
            ) : filteredPests.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No pests found.</div>
            ) : (
              filteredPests.map((pest) => (
                <button
                  key={pest.pest_name}
                  onClick={() => handleSelectPest(pest)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${
                    selectedPest?.pest_name === pest.pest_name
                      ? 'bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                      : 'hover:bg-secondary/40 border border-transparent'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className={`text-sm font-bold truncate ${selectedPest?.pest_name === pest.pest_name ? 'text-purple-400' : 'text-foreground'}`}>
                      {pest.pest_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground italic truncate">{pest.scientific}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${selectedPest?.pest_name === pest.pest_name ? 'text-purple-500' : 'text-muted-foreground/30'}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {selectedPest ? (
          <div className="flex-1 glass-panel flex flex-col overflow-hidden">
            {/* Pest Header */}
            <div className="p-6 border-b border-border/30 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-1">{selectedPest.pest_name}</h3>
                  <p className="text-sm text-muted-foreground italic">{selectedPest.scientific} • Family: {selectedPest.family}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${getSeverityBadge(selectedPest.severity)}`}>
                  {selectedPest.severity} SEVERITY
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-border/20">
                {['overview', 'treatment', 'lifecycle'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-bold capitalize transition-colors border-b-2 ${
                      activeTab === tab ? 'text-purple-400 border-purple-500' : 'text-muted-foreground border-transparent hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/20 p-4 rounded-xl border border-border/20">
                      <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1"><Leaf className="w-3 h-3" /> Targeted Crops</p>
                      <p className="text-sm font-medium text-foreground">{(selectedPest.crops || []).join(', ')}</p>
                    </div>
                    <div className="bg-secondary/20 p-4 rounded-xl border border-border/20">
                      <p className="text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Lifecycle Duration</p>
                      <p className="text-sm font-medium text-foreground">{selectedPest.lifecycle}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">Description & Biology</h4>
                    <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed bg-secondary/10 p-5 rounded-xl border border-border/20">
                      {/* Render markdown if VLM desc contains it, else plain text */}
                      {vlmDesc ? (
                        <div dangerouslySetInnerHTML={{ __html: vlmDesc.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      ) : (
                        <p>{selectedPest.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'treatment' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    Recommended 4-Step Standard Treatment Protocol
                  </div>
                  
                  <div className="space-y-4">
                    {selectedPest.treatment?.map((t, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-secondary/20 rounded-xl border border-border/20">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                          D{t.day}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-foreground">{t.step}</h4>
                            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/30">
                              {t.method}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-4 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-white transition rounded-xl text-sm font-bold">
                    Start Treatment Plan in Tracker
                  </button>
                </div>
              )}

              {activeTab === 'lifecycle' && lifecycle && (
                <div className="space-y-6">
                  {lifecycle.has_detailed_data ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm mb-4">
                      Detailed stage-by-stage vulnerability data available for this pest.
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm mb-4">
                      Using generalized lifecycle data. Specific stage durations may vary by region.
                    </div>
                  )}

                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
                    {lifecycle.stages.map((stage, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary/80 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xs font-bold text-foreground">
                          {idx + 1}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/20 bg-secondary/30">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-foreground" style={{ color: stage.color }}>{stage.name}</h4>
                            <span className="text-xs text-muted-foreground">{stage.duration_days} days</span>
                          </div>
                          <div className="mb-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              stage.vulnerability.includes('High') ? 'bg-red-500/20 text-red-400' :
                              stage.vulnerability.includes('Medium') ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {stage.vulnerability} Vuln.
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground"><strong>Control:</strong> {stage.control}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 border border-rose-500/30 bg-rose-500/10 rounded-xl text-center">
                    <p className="text-xs text-rose-400 font-bold uppercase mb-1">Critical Treatment Window</p>
                    <p className="text-sm text-foreground">{lifecycle.critical_window}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 glass-panel flex items-center justify-center text-muted-foreground/50 flex-col">
            <Sprout className="w-16 h-16 mb-4 opacity-50" />
            <p>Select a pest from the library to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
