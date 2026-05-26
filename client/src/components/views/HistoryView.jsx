import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, AlertTriangle, CalendarDays, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function HistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/history');
        setHistory(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load history:", err);
        setError("Failed to load diagnostic history from the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
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

  const filteredHistory = history.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Diagnostic History</h2>
          <p className="text-muted-foreground text-sm">Past records of PestAI predictions</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search diseases or locations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 text-foreground w-full md:w-64"
          />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'No results match your search.' : 'No diagnostic history found in the database.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary/40 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Date</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Disease / Pest</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Confidence</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Model Used</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs opacity-70">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {item.label}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.confidence > 0.8 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="font-mono">{(item.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-secondary rounded-md text-xs font-mono text-muted-foreground">
                        {item.modelName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
