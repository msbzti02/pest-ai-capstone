import { ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

export default function FeedbackView() {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    // In a real app, send to /api/feedback
    setTimeout(() => setSubmitted(true), 500);
  };

  if (submitted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
        <p className="text-muted-foreground">Your feedback helps us train better models and improve the PestAI experience.</p>
        <button onClick={() => {setSubmitted(false); setRating(null); setComment('');}} className="mt-8 px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg text-sm transition">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-foreground">Help Us Improve</h2>
        <p className="text-muted-foreground mt-2">Rate your diagnostic experience and let us know how we can get better.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-8">
        {/* Rating */}
        <div className="space-y-4 text-center">
          <label className="text-sm font-bold text-foreground">How accurate was your last analysis?</label>
          <div className="flex justify-center gap-6">
            <button 
              type="button" 
              onClick={() => setRating('good')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                rating === 'good' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/50 bg-secondary/30 hover:border-emerald-500/50'
              }`}
            >
              <ThumbsUp className={`w-8 h-8 ${rating === 'good' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${rating === 'good' ? 'text-emerald-500' : 'text-muted-foreground'}`}>Spot On</span>
            </button>
            <button 
              type="button" 
              onClick={() => setRating('bad')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                rating === 'bad' ? 'border-destructive bg-destructive/10' : 'border-border/50 bg-secondary/30 hover:border-destructive/50'
              }`}
            >
              <ThumbsDown className={`w-8 h-8 ${rating === 'bad' ? 'text-destructive' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${rating === 'bad' ? 'text-destructive' : 'text-muted-foreground'}`}>Incorrect</span>
            </button>
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Additional Comments
          </label>
          <textarea 
            rows="4" 
            placeholder="Tell us more about the plant, the actual disease, or any app issues..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-secondary/30 border border-border/50 rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground/50"
          />
        </div>

        <button 
          type="submit" 
          disabled={!rating}
          className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

function CheckCircle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
