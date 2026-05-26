import { Terminal, Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ApiDocsView() {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `// POST /api/predict
const formData = new FormData();
formData.append('file', imageFile);
formData.append('model_name', 'efficientnet');

fetch('http://localhost:5000/predict', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Terminal className="w-8 h-8 text-primary" />
          API Documentation
        </h2>
        <p className="text-muted-foreground mt-2">Integrate PestAI inference directly into your own agricultural systems.</p>
      </div>

      {/* Endpoint: Predict */}
      <div className="glass-panel overflow-hidden border border-border/50">
        <div className="bg-secondary/40 px-6 py-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded">POST</span>
            <span className="font-mono text-sm text-foreground">/api/predict</span>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground">Uploads an image for AI disease classification using the specified model.</p>
          
          <div>
            <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Parameters (FormData)</h4>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border/20">
                  <th className="pb-2">Field</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                <tr>
                  <td className="py-3 font-mono text-emerald-400">file</td>
                  <td className="py-3 text-muted-foreground">File</td>
                  <td className="py-3 text-foreground/80">The image to analyze (Required)</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-sky-400">model_name</td>
                  <td className="py-3 text-muted-foreground">String</td>
                  <td className="py-3 text-foreground/80">Model to use: 'efficientnet' or 'vit'</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" /> Example Request
              </h4>
              <button onClick={copyToClipboard} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs">
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="bg-background/50 p-4 rounded-xl border border-border/30 overflow-x-auto text-sm font-mono text-sky-300">
              {codeSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
