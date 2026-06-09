import { Activity, Clock, Server, CheckCircle2, TrendingUp, Cpu, Network, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnalyticsView() {
  const [dbStats, setDbStats] = useState(null);
  const [sysStats, setSysStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dbRes, sysRes] = await Promise.all([
          axios.get('/api/analytics'),
          axios.get('/api/analytics/system')
        ]);
        setDbStats(dbRes.data);
        setSysStats(sysRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
    
    // Refresh system stats every 10 seconds
    const interval = setInterval(async () => {
      try {
        const sysRes = await axios.get('/api/analytics/system');
        setSysStats(sysRes.data);
      } catch (e) {}
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Calculate some aggregate metrics
  const endpoints = sysStats?.endpoints || {};
  const sortedEndpoints = Object.entries(endpoints).sort((a, b) => b[1].count - a[1].count);
  const avgResponseTime = Object.values(endpoints).reduce((acc, curr) => acc + curr.avgTime, 0) / (Object.keys(endpoints).length || 1);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <Activity className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Analytics</h2>
          <p className="text-muted-foreground text-sm">Real-time health, performance, and usage metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">System Uptime</p>
          <p className="text-3xl font-black text-foreground">{sysStats?.uptime_formatted || '0h 0m'}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Online & Stable
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Network className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Total Requests</p>
          <p className="text-3xl font-black text-foreground">{sysStats?.total_requests || 0}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-blue-400">
            <TrendingUp className="w-3 h-3" /> Gateway Traffic
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Server className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Avg Latency</p>
          <p className="text-3xl font-black text-foreground">{Math.round(avgResponseTime)}<span className="text-lg text-muted-foreground ml-1">ms</span></p>
          <div className="mt-3 flex items-center gap-1 text-xs text-amber-400">
            <Activity className="w-3 h-3" /> Across all endpoints
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Database className="w-16 h-16 text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Analyses Stored</p>
          <p className="text-3xl font-black text-foreground">{dbStats?.totalAnalyses || 0}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-purple-400">
            <Database className="w-3 h-3" /> Persistent Storage
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Endpoint Performance ── */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 border-b border-border/30 pb-2">API Endpoint Performance</h3>
          
          <div className="space-y-4">
            {sortedEndpoints.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No API traffic recorded yet.</p>
            ) : (
              sortedEndpoints.map(([path, data]) => (
                <div key={path} className="flex items-center gap-4">
                  <div className="w-32 truncate text-xs font-mono text-muted-foreground" title={path}>{path}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">{data.count} hits</span>
                      <span className={data.avgTime > 1000 ? 'text-rose-400' : data.avgTime > 500 ? 'text-amber-400' : 'text-emerald-400'}>
                        {data.avgTime}ms avg
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${data.avgTime > 1000 ? 'bg-rose-500' : data.avgTime > 500 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(100, (data.count / sysStats.total_requests) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── System Memory & Health ── */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 border-b border-border/30 pb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" /> Gateway Resources
            </h3>
            
            {sysStats?.memory ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Heap Used</span>
                    <span className="font-bold text-foreground">{sysStats.memory.heap_used_mb} MB / {sysStats.memory.heap_total_mb} MB</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${(sysStats.memory.heap_used_mb / sysStats.memory.heap_total_mb) * 100}%` }} 
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Node.js Memory Usage (V8 Heap)</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Memory stats unavailable</p>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 border-b border-border/30 pb-2 flex items-center gap-2">
              <Bug className="w-4 h-4 text-purple-500" /> Top Detections
            </h3>
            
            <div className="space-y-3">
              {dbStats?.diseaseStats?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No analyses yet.</p>
              ) : (
                dbStats?.diseaseStats?.slice(0, 5).map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-foreground truncate pr-2">{stat.label}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-secondary rounded-lg border border-border/50 text-muted-foreground">
                      {stat.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Ensure Bug is imported
import { Bug } from 'lucide-react';
