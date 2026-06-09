import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Database, Wifi, BookOpen, Zap, Globe, RefreshCw, Sparkles } from 'lucide-react';
import axios from 'axios';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_PROMPTS = [
  { icon: '🌿', text: 'What is Integrated Pest Management according to FAO guidelines?' },
  { icon: '🐛', text: 'How do I treat Fall Armyworm on corn crops?' },
  { icon: '☔', text: 'Is it safe to spray pesticides in rainy weather and what precautions should I take?' },
  { icon: '🌾', text: 'What are the economic thresholds for spraying wheat aphids?' },
  { icon: '🔬', text: 'What biological control agents are effective against whitefly?' },
  { icon: '🇹🇷', text: 'What are the major agricultural pest challenges in Turkey?' },
];

export default function ChatView() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [llmStatus, setLlmStatus] = useState(null);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch LLM provider status on mount
  useEffect(() => {
    axios.get('/api/llm-status').then(r => setLlmStatus(r.data)).catch(() => {});
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customMessage) => {
    const msg = customMessage || input.trim();
    if (!msg) return;

    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('/api/chat', {
        message: msg,
        pest_name: null, // General chat — not tied to a specific prediction
        session_id: 'advisor-main',
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        provider: res.data.provider,
        model: res.data.model,
        suggestions: res.data.suggestions,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ **Connection Error**: Unable to reach the AI service. Please check if the API server is running on port 5000.',
        provider: 'error',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="absolute inset-4 md:inset-8 flex flex-col max-w-5xl mx-auto">

      {/* ── Compact Header Bar ── */}
      <div className="flex items-center justify-between py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">AI Agricultural Advisor</h2>
            <p className="text-muted-foreground text-xs">
              RAG-powered • {llmStatus?.active_count || 0} LLM{(llmStatus?.active_count || 0) !== 1 ? 's' : ''} active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* LLM Status Pill */}
          {llmStatus && llmStatus.active_count > 0 && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <Wifi className="w-3 h-3" /> Online
            </span>
          )}

          {/* Language Toggle */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-2 py-1.5 bg-secondary/50 border border-border/50 rounded-lg text-xs text-foreground cursor-pointer focus:outline-none focus:border-emerald-500/50"
          >
            <option value="en">🇬🇧 EN</option>
            <option value="tr">🇹🇷 TR</option>
          </select>

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            className="p-1.5 hover:bg-secondary/50 rounded-lg transition text-muted-foreground hover:text-foreground"
            title="Clear chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Provider Failover Chain (compact) ── */}
      {llmStatus?.providers && (
        <div className="flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-lg bg-secondary/20 border border-border/20 overflow-x-auto shrink-0">
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap mr-1">Chain:</span>
          {llmStatus.providers.map((p, i) => (
            <span key={p.name} className="flex items-center gap-1 whitespace-nowrap">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.5)]' : 'bg-muted-foreground/30'}`} />
              <span className={`text-[10px] font-medium ${p.active ? 'text-foreground/80' : 'text-muted-foreground/40'}`}>
                {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
              </span>
              {i < llmStatus.providers.length - 1 && <span className="text-muted-foreground/20 mx-0.5">→</span>}
            </span>
          ))}
        </div>
      )}

      {/* ── Chat Messages Area (scrollable, takes remaining space) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar glass-panel p-4 rounded-2xl mb-3">
        {messages.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="space-y-3 mb-6">
              <div className="text-4xl">🌿🤖</div>
              <h3 className="text-base font-bold text-foreground">
                {language === 'tr' ? 'Tarımsal Danışman Asistanınız' : 'Your Agricultural Advisory Assistant'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                {language === 'tr'
                  ? 'Zararlı yönetimi, ilaçlama zamanlaması veya güvenlik önlemleri hakkında soru sorun.'
                  : 'Ask about pest management, treatment timing, or safety precautions. Powered by RAG knowledge retrieval.'}
              </p>
            </div>

            {/* Quick Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full mb-4">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.text)}
                  className="text-left p-2.5 rounded-xl bg-secondary/30 border border-border/30 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-foreground/80 hover:text-foreground group"
                >
                  <span className="mr-1.5">{prompt.icon}</span>
                  <span className="text-xs">{prompt.text}</span>
                </button>
              ))}
            </div>

            {/* Knowledge Base Stats */}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {llmStatus?.rag?.total_chunks || '100+'} Chunks</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {llmStatus?.rag?.source_documents || '30+'} Docs</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 7 Providers</span>
            </div>
          </div>
        ) : (
          /* ── Message List ── */
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}

                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-foreground'
                    : 'bg-secondary/40 border border-border/30 text-foreground'
                }`}>
                  <div
                    className="prose prose-sm prose-invert max-w-none text-sm [&_strong]:text-emerald-400 [&_h2]:text-lg [&_h3]:text-base [&_li]:my-0.5"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || '') }}
                  />

                  {/* Provider badge */}
                  {msg.provider && msg.provider !== 'error' && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        via {msg.provider}{msg.model ? ` (${msg.model})` : ''}
                      </span>
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-border/20">
                      {msg.suggestions.map((s, si) => (
                        <button
                          key={si}
                          onClick={() => handleSend(s)}
                          className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary/40 border border-border/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Area (always pinned at bottom) ── */}
      <div className="flex items-center gap-2.5 p-2.5 glass-panel rounded-2xl shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'tr' ? 'Tarımsal danışmanlık için sorunuzu yazın...' : 'Ask about pest management, treatment, or crop protection...'}
          className="flex-1 px-4 py-2.5 bg-secondary/30 border border-border/30 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 transition"
          disabled={isTyping}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-muted disabled:cursor-not-allowed rounded-xl text-white font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 shrink-0"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </div>
    </div>
  );
}
