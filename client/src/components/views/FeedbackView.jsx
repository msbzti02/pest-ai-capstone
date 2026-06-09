import { ThumbsUp, ThumbsDown, MessageSquare, BarChart2, PieChart, Activity, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FeedbackView() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [predictionPest, setPredictionPest] = useState('');
  const [actualPest, setActualPest] = useState('');
  const [isCorrect, setIsCorrect] = useState(true);
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/feedback/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/feedback', {
        rating,
        comment,
        predictionPest: predictionPest || null,
        actualPest: actualPest || null,
        isCorrect,
        confidence: null // We'd pass this from the prediction context ideally
      });
      setSubmitted(true);
      fetchAnalytics(); // Refresh data
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Convert per_pest object to array and sort by total
  const perPestArray = analytics?.per_pest 
    ? Object.entries(analytics.per_pest)
        .map(([pest, data]) => ({ pest, ...data }))
        .sort((a, b) => b.total - a.total)
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-pink-500/20 rounded-xl">
          <MessageSquare className="w-6 h-6 text-pink-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Model Feedback & Diagnostics</h2>
          <p className="text-muted-foreground text-sm">Help improve AI accuracy by reporting misclassifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ── Submit Feedback Form ── */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Submit Correction</h3>
          
          {submitted ? (
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-emerald-400 font-bold">Thank you for your feedback!</p>
              <p className="text-sm text-emerald-500/70">Your data helps improve the model's accuracy.</p>
              <button 
                onClick={() => { setSubmitted(false); setComment(''); setPredictionPest(''); setActualPest(''); setIsCorrect(true); setRating(0); }}
                className="mt-2 text-xs font-bold text-emerald-400 underline"
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Was the prediction correct?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setIsCorrect(true)} className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition ${
                    isCorrect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold' : 'bg-secondary/50 border-border/50 text-muted-foreground'
                  }`}>
                    <ThumbsUp className="w-4 h-4" /> Yes, it was accurate
                  </button>
                  <button type="button" onClick={() => setIsCorrect(false)} className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition ${
                    !isCorrect ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold' : 'bg-secondary/50 border-border/50 text-muted-foreground'
                  }`}>
                    <ThumbsDown className="w-4 h-4" /> No, it was wrong
                  </button>
                </div>
              </div>

              {!isCorrect && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">What did the model predict?</label>
                    <input 
                      type="text" 
                      value={predictionPest} onChange={e => setPredictionPest(e.target.value)}
                      placeholder="e.g., Fall Armyworm"
                      className="w-full bg-secondary/80 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-rose-400">What was the actual pest? (Correction)</label>
                    <input 
                      type="text" 
                      value={actualPest} onChange={e => setActualPest(e.target.value)}
                      placeholder="e.g., Corn Borer" required
                      className="w-full bg-secondary/80 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Additional Comments / Image Quality Notes</label>
                <textarea 
                  value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="E.g., The image was a bit blurry, or the lighting was poor."
                  rows={3}
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : 'Submit Feedback'}
                </button>
              </div>

            </form>
          )}
        </div>

        {/* ── Analytics Dashboard ── */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-500" /> Overall System Accuracy
            </h3>
            
            {!analytics ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">Loading analytics...</div>
            ) : analytics.total_feedback === 0 ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No feedback data available yet.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-end gap-4">
                  <div className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600">
                    {analytics.accuracy_percent}%
                  </div>
                  <div className="pb-1">
                    <p className="text-sm text-muted-foreground">User-reported Accuracy</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Based on {analytics.total_feedback} feedback entries</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(analytics.correct / analytics.total_feedback) * 100}%` }} />
                  <div className="bg-rose-500 h-full" style={{ width: `${(analytics.incorrect / analytics.total_feedback) * 100}%` }} />
                  <div className="bg-slate-500 h-full" style={{ width: `${(analytics.unreported / analytics.total_feedback) * 100}%` }} />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> {analytics.correct} Correct</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> {analytics.incorrect} Incorrect</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-500" /> {analytics.unreported} Unrated</span>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-pink-500" /> Per-Pest Breakdown
            </h3>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {!analytics?.per_pest || perPestArray.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No specific pest data reported yet.</p>
              ) : (
                perPestArray.map(item => {
                  const accuracy = Math.round((item.correct / item.total) * 100) || 0;
                  return (
                    <div key={item.pest} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground">{item.pest}</span>
                        <span className={accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                          {accuracy}% ({item.total})
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${accuracy >= 80 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${accuracy}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {analytics?.confusions?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/30">
                <h4 className="text-xs font-bold text-rose-400 mb-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Common Confusions
                </h4>
                <div className="space-y-2">
                  {analytics.confusions.slice(0, 3).map((conf, idx) => (
                    <div key={idx} className="text-xs bg-rose-500/5 p-2 rounded border border-rose-500/10 text-muted-foreground">
                      Predicted <strong className="text-foreground">{conf.predicted}</strong> but was actually <strong className="text-foreground">{conf.actual}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
