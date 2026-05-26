import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AnalyticsView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/analytics');
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Failed to load analytics data from the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Database Error</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const { totalAnalyses, diseaseStats } = stats;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Diagnostic Analytics</h2>
          <p className="text-muted-foreground text-sm">Real-time statistics from the PestAI database</p>
        </div>
        <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Scans Card */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Diagnostics</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{totalAnalyses}</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active system</span>
          </div>
        </div>

        {/* Most Common Card */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="overflow-hidden">
              <p className="text-sm text-muted-foreground font-medium">Most Common Pest</p>
              <h3 className="text-xl font-bold text-foreground mt-1 truncate">
                {diseaseStats.length > 0 ? diseaseStats[0].label : 'N/A'}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {diseaseStats.length > 0 ? `${diseaseStats[0].count} occurrences recorded` : 'No data yet'}
          </p>
        </div>
      </div>

      {/* Disease Breakdown Table */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Disease Distribution</h3>
        {diseaseStats.length === 0 ? (
          <p className="text-muted-foreground text-sm">No analysis data available yet.</p>
        ) : (
          <div className="space-y-4">
            {diseaseStats.map((stat, idx) => {
              const percentage = ((stat.count / totalAnalyses) * 100).toFixed(1);
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground">{stat.label}</span>
                    <span className="text-muted-foreground">{stat.count} cases ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
