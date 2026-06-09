import { CalendarCheck, CheckCircle2, Circle, Clock, Play, AlertCircle, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TreatmentView() {
  const [activePlans, setActivePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // New plan state
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPest, setNewPest] = useState('Fall Armyworm');
  const [newCrop, setNewCrop] = useState('corn');
  const [isStarting, setIsStarting] = useState(false);

  const pests = ['Fall Armyworm', 'Rice Leafhopper', 'Brown Planthopper', 'Cotton Bollworm', 'Corn Borer', 'Whitefly'];
  const crops = ['corn', 'rice', 'cotton', 'tomato', 'potato', 'wheat'];

  const fetchPlans = async () => {
    try {
      const sessionId = localStorage.getItem('pestai_session') || 'demo_session';
      localStorage.setItem('pestai_session', sessionId);
      
      const res = await axios.get(`/api/treatment/active/${sessionId}`);
      setActivePlans(res.data);
      if (res.data.length > 0 && !selectedPlan) {
        handleSelectPlan(res.data[0]);
      } else if (res.data.length === 0) {
        setShowNewPlan(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSelectPlan = async (plan) => {
    try {
      const res = await axios.get(`/api/treatment/${plan.id}`);
      setSelectedPlan(res.data);
      setShowNewPlan(false);
    } catch (err) {
      console.error(err);
    }
  };

  const startNewPlan = async (e) => {
    e.preventDefault();
    setIsStarting(true);
    try {
      const sessionId = localStorage.getItem('pestai_session');
      const res = await axios.post('/api/treatment/start', {
        pest_name: newPest,
        crop: newCrop,
        field_size_ha: 1,
        session_id: sessionId
      });
      await fetchPlans();
      handleSelectPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const completeStep = async (planId, stepIndex) => {
    try {
      const res = await axios.post(`/api/treatment/${planId}/complete/${stepIndex}`);
      setSelectedPlan(res.data);
      // Update in active plans list
      setActivePlans(plans => plans.map(p => p.id === planId ? res.data : p));
      
      if (res.data.status === 'completed') {
        setTimeout(() => {
          fetchPlans();
          setSelectedPlan(null);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <CalendarCheck className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Treatment Timeline Tracker</h2>
          <p className="text-muted-foreground text-sm">Step-by-step pest management plans with due dates</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex flex-col shrink-0 gap-4">
          <button 
            onClick={() => setShowNewPlan(true)}
            className="w-full py-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Start New Plan
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Active Plans</h3>
            
            {loading ? (
              <p className="text-sm text-center text-muted-foreground py-4">Loading plans...</p>
            ) : activePlans.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-4">No active treatment plans.</p>
            ) : (
              activePlans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full p-3 rounded-xl border text-left transition ${
                    selectedPlan?.id === plan.id 
                      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                      : 'bg-secondary/30 border-border/30 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-bold text-sm ${selectedPlan?.id === plan.id ? 'text-indigo-400' : 'text-foreground'}`}>
                      {plan.pestName}
                    </p>
                    <span className="text-xs text-muted-foreground">{plan.progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> {plan.crop}
                  </p>
                  
                  {/* Mini progress bar */}
                  <div className="w-full h-1.5 bg-background rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${plan.progress}%` }} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
          
          {showNewPlan ? (
            <div className="p-8 flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-md space-y-6 bg-secondary/20 p-6 rounded-2xl border border-border/30">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarCheck className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Create Treatment Plan</h3>
                  <p className="text-sm text-muted-foreground">Select pest and crop to generate a schedule</p>
                </div>
                
                <form onSubmit={startNewPlan} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Target Pest</label>
                    <select value={newPest} onChange={e => setNewPest(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500 appearance-none">
                      {pests.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Affected Crop</label>
                    <select value={newCrop} onChange={e => setNewCrop(e.target.value)} className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500 appearance-none capitalize">
                      {crops.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <button type="submit" disabled={isStarting} className="w-full py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition disabled:opacity-50 mt-4">
                    {isStarting ? 'Generating Plan...' : 'Generate Timeline'}
                  </button>
                </form>
              </div>
            </div>
          ) : selectedPlan ? (
            <>
              {/* Plan Header */}
              <div className="p-6 border-b border-border/30 shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">{selectedPlan.pestName} Management</h3>
                    <p className="text-sm text-muted-foreground">Started: {new Date(selectedPlan.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-indigo-400">{selectedPlan.progress}%</div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
                  </div>
                </div>
                
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${selectedPlan.progress}%` }} />
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 relative before:absolute before:inset-0 before:ml-[35px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:to-transparent">
                
                {selectedPlan.status === 'completed' && (
                  <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-400 mb-2">Treatment Completed!</h3>
                    <p className="text-muted-foreground max-w-sm">All steps for {selectedPlan.pestName} management have been executed successfully.</p>
                  </div>
                )}
                
                {selectedPlan.steps?.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-6 z-10 group">
                    {/* Timeline Node */}
                    <button 
                      onClick={() => !step.completed && completeStep(selectedPlan.id, idx)}
                      disabled={step.completed}
                      className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 border-background transition-all ${
                        step.completed 
                          ? 'bg-emerald-500 text-white cursor-default' 
                          : step.isOverdue 
                            ? 'bg-rose-500 text-white hover:scale-110 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                            : 'bg-secondary border-border/50 text-muted-foreground hover:border-indigo-500 hover:text-indigo-400 cursor-pointer'
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    
                    {/* Step Content */}
                    <div className={`flex-1 p-5 rounded-xl border transition-all ${
                      step.completed 
                        ? 'bg-secondary/20 border-border/20 opacity-60' 
                        : step.isOverdue 
                          ? 'bg-rose-500/5 border-rose-500/30'
                          : 'bg-secondary/40 border-border/40 hover:border-indigo-500/30'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            Day {step.day}: {step.step}
                          </h4>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-background text-muted-foreground border border-border/50">
                            {step.method}
                          </span>
                        </div>
                        
                        {/* Status Badge */}
                        {step.completed ? (
                          <span className="text-xs text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Done {new Date(step.completedAt).toLocaleDateString()}
                          </span>
                        ) : step.isOverdue ? (
                          <span className="text-xs text-rose-400 font-bold flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded">
                            <AlertCircle className="w-3 h-3" /> Overdue ({Math.abs(step.daysUntilDue)} days)
                          </span>
                        ) : step.isDueToday ? (
                          <span className="text-xs text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" /> Due Today
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due in {step.daysUntilDue} days
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm ${step.completed ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                        {step.desc}
                      </p>
                      
                      {!step.completed && (
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => completeStep(selectedPlan.id, idx)}
                            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Mark as Completed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a plan to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
