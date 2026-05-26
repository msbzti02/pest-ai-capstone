import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';
import { marked } from 'marked';
import { motion } from 'framer-motion';

export function Chatbot({ pestName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (pestName && messages.length === 0) {
      setMessages([{
        role: 'system',
        content: `Merhaba! Ben **PestAI Tarım Danışmanınız**. Yapay zeka sistemimiz yüklediğiniz görselde **${pestName}** teşhisi koydu.\n\nBu hastalık/zararlı hakkında sormak istediklerinizi (örneğin: hasada etkisi nedir, hangi organik ilaçları kullanabilirim?) bana danışabilirsiniz.`
      }]);
    }
  }, [pestName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('/api/chat', {
        message: input,
        pest_name: pestName
      });

      setMessages(prev => [...prev, { role: 'system', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Error: AI response failed. Check your API key or model availability.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-card/50 backdrop-blur-xl">
      <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Agronomist</h3>
          <p className="text-xs text-muted-foreground">{pestName} Expert</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth p-4 space-y-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-secondary' : 'bg-primary/20'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-foreground" /> : <Bot className="w-4 h-4 text-primary" />}
            </div>
            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-secondary text-foreground rounded-tr-sm' : 'bg-primary/10 text-foreground border border-primary/20 rounded-tl-sm'}`}>
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
              />
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-1 rounded-tl-sm">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce delay-100">•</span>
              <span className="animate-bounce delay-200">•</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-secondary/30 border-t border-border">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-background border border-border rounded-xl py-3 pl-4 pr-12 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            placeholder="Ask about treatment methods..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center mt-2 text-muted-foreground">
          AI can make mistakes. Consider verifying important agricultural advice.
        </p>
      </div>
    </div>
  );
}
