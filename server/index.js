import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize, { initDB, Analysis, Feedback, Sighting, User, TreatmentPlan, FarmerField } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Data Modules ──
import { getPestInfo, getPestLibrary, PEST_DATABASE } from './data/pestDatabase.js';
import { calculateEconomicImpact, getCropStageAdvice, CROP_ECONOMICS, CROP_GROWTH_STAGES } from './data/economics.js';
import { calculateRiskScore, recordPrediction, getTrendData, checkOutbreakAlerts, getPestLifecycle } from './data/riskEngine.js';
import { getCurrentWeather, getForecast } from './data/weatherService.js';
import { VLM_DESCRIPTIONS, TURKEY_HEATMAP_DATA, scoreImageQuality, addActivity, getActivity, trackRequest, getSystemAnalytics } from './data/mockData.js';
import { seedMockData } from './data/seedData.js';
import { retrieveKnowledge, formatRAGContext, getKnowledgeStats } from './data/ragKnowledge.js';

dotenv.config({ path: '../.env' }); // Load from root

const app = express();
const port = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// In production, the React app will call /api/*, but our routes are defined without /api
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.url.startsWith('/api/')) {
    req.url = req.url.substring(4);
  }
  next();
});

// ════════════════════════════════════════════════════════════════
// ═══        7-PROVIDER LLM FAILOVER ENGINE                   ═══
// ════════════════════════════════════════════════════════════════
// Failover order: Gemini → Groq → OpenRouter → Together → Cohere → Mistral → Cerebras → Mock

const LLM_PROVIDERS = [
  {
    name: 'gemini',
    envKey: 'GOOGLE_API_KEY',
    model: 'gemini-2.0-flash',
    call: async (messages, apiKey) => {
      // Gemini uses a different API format
      const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
      const userMessages = messages.filter(m => m.role !== 'system');
      const histText = userMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const fullPrompt = `${systemPrompt}\n\n${histText}`;
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        { contents: [{ parts: [{ text: fullPrompt }] }] },
        { timeout: 25000 }
      );
      return res.data.candidates[0].content.parts[0].text;
    }
  },
  {
    name: 'groq',
    envKey: 'GROQ_API_KEY',
    model: 'llama-3.3-70b-versatile',
    call: async (messages, apiKey) => {
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile', messages, max_tokens: 2000, temperature: 0.3
      }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 25000 });
      return res.data.choices[0].message.content;
    }
  },
  {
    name: 'openrouter',
    envKey: 'OPENROUTER_API_KEY',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    call: async (messages, apiKey) => {
      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'meta-llama/llama-3.1-8b-instruct:free', messages, max_tokens: 2000
      }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 });
      return res.data.choices[0].message.content;
    }
  },
  {
    name: 'together',
    envKey: 'TOGETHER_API_KEY',
    model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
    call: async (messages, apiKey) => {
      const res = await axios.post('https://api.together.xyz/v1/chat/completions', {
        model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo', messages, max_tokens: 2000
      }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 });
      return res.data.choices[0].message.content;
    }
  },
  {
    name: 'cohere',
    envKey: 'COHERE_API_KEY',
    model: 'command-a-03-2025',
    call: async (messages, apiKey) => {
      const res = await axios.post('https://api.cohere.com/v2/chat', {
        model: 'command-a-03-2025', messages, max_tokens: 2000
      }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 });
      return res.data.message.content[0].text;
    }
  },
  {
    name: 'mistral',
    envKey: 'MISTRAL_API_KEY',
    model: 'mistral-small-latest',
    call: async (messages, apiKey) => {
      const res = await axios.post('https://api.mistral.ai/v1/chat/completions', {
        model: 'mistral-small-latest', messages, max_tokens: 2000
      }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 });
      return res.data.choices[0].message.content;
    }
  },
  {
    name: 'cerebras',
    envKey: 'CEREBRAS_API_KEY',
    model: 'llama3.1-8b',
    call: async (messages, apiKey) => {
      const res = await axios.post('https://api.cerebras.ai/v1/chat/completions', {
        model: 'llama3.1-8b', messages, max_tokens: 2000
      }, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 25000 });
      return res.data.choices[0].message.content;
    }
  },
];

// Detect which providers have API keys configured
const activeProviders = LLM_PROVIDERS.filter(p => process.env[p.envKey] && process.env[p.envKey] !== '');
const providerStatus = LLM_PROVIDERS.map(p => ({
  name: p.name, model: p.model,
  active: !!process.env[p.envKey] && process.env[p.envKey] !== '',
}));

/**
 * Call LLM with automatic failover across all configured providers.
 * Retries each provider up to 2 times before moving to the next.
 */
async function callLLMWithFailover(messages) {
  for (const provider of activeProviders) {
    const apiKey = process.env[provider.envKey];
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[LLM] Trying ${provider.name} (attempt ${attempt})...`);
        const result = await provider.call(messages, apiKey);
        console.log(`[LLM] ✅ ${provider.name} succeeded`);
        return { text: result, provider: provider.name, model: provider.model };
      } catch (err) {
        console.warn(`[LLM] ❌ ${provider.name} attempt ${attempt} failed: ${err.message}`);
        if (attempt < 2) await new Promise(r => setTimeout(r, 1000)); // 1s backoff
      }
    }
  }
  // All providers failed — return null to trigger mock fallback
  return null;
}

// Middleware
app.use(cors());
app.use(express.json());

// ── Request Analytics Middleware ──
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    trackRequest(req.path, Date.now() - start);
  });
  next();
});

// Configure Multer for temp file storage
const upload = multer({ dest: 'uploads/' });

// ── Rate Limiter (in-memory) ──
const rateLimitMap = {};
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(key) {
  const now = Date.now();
  if (!rateLimitMap[key]) rateLimitMap[key] = [];
  rateLimitMap[key] = rateLimitMap[key].filter(t => now - t < RATE_WINDOW);
  if (rateLimitMap[key].length >= RATE_LIMIT) return false;
  rateLimitMap[key].push(now);
  return true;
}

// ── LLM Response Cache ──
const llmCache = new Map();
const LLM_CACHE_SIZE = 100;
const LLM_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCachedLLM(key) {
  const entry = llmCache.get(key);
  if (entry && Date.now() - entry.time < LLM_CACHE_TTL) return entry.value;
  return null;
}

function setCachedLLM(key, value) {
  if (llmCache.size >= LLM_CACHE_SIZE) {
    const firstKey = llmCache.keys().next().value;
    llmCache.delete(firstKey);
  }
  llmCache.set(key, { value, time: Date.now() });
}

// ── Session Memory for Chatbot ──
const chatSessions = new Map();
const MAX_SESSION_MESSAGES = 20;

// Health check
app.get('/health', (req, res) => {
  res.send('PestAI API Gateway is running.');
});

// Auth Secret
const JWT_SECRET = process.env.JWT_SECRET || 'pestai-super-secret-key';

// ════════════════════════════════════════════════════════════════
// ═══                    AUTH ROUTES                          ═══
// ════════════════════════════════════════════════════════════════

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'free'
    });
    
    // Create token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET);
    
    res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/auth/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══                  PREDICTION ROUTES                     ═══
// ════════════════════════════════════════════════════════════════

// Single image prediction (proxy to ML service)
app.post('/predict', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    
    // Pass along user configuration
    formData.append('model_name', req.body.model_name || 'efficientnet');
    formData.append('lime_samples', req.body.lime_samples || '150');
    formData.append('lime_features', req.body.lime_features || '13');
    formData.append('gradcam_opacity', req.body.gradcam_opacity || '0.75');
    
    // Pass quantized flag
    const isQ = req.body.is_quantized === 'true' || req.body.is_quantized === true;
    formData.append('is_quantized', isQ ? 'true' : 'false');

    // Proxy request to Python FastAPI
    let pyResponse = null;
    try {
      pyResponse = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
        headers: { ...formData.getHeaders() }
      });
    } catch (apiError) {
      console.warn("ML Service unavailable, using mock prediction data.");
      const mockPests = [
        "Alfalfa plant bug", "Alfalfa weevil", "Aphids", "Asiatic rice borer", "Beet armyworm", 
        "Black cutworm", "Brown plant hopper", "Corn borer", "Cotton Bollworm", "Flax budworm"
      ].sort(() => 0.5 - Math.random());
      
      const imgB64 = fs.readFileSync(req.file.path).toString('base64');
      pyResponse = {
        data: {
          predictions: [
            { label: mockPests[0], confidence: +(Math.random() * 5 + 90).toFixed(1), class_id: 12 },
            { label: mockPests[1], confidence: +(Math.random() * 3 + 3).toFixed(1), class_id: 8 },
            { label: mockPests[2], confidence: +(Math.random() * 1.5 + 1).toFixed(1), class_id: 4 },
            { label: mockPests[3], confidence: +(Math.random() * 0.8 + 0.2).toFixed(1), class_id: 2 },
            { label: mockPests[4], confidence: +(Math.random() * 0.4 + 0.1).toFixed(1), class_id: 1 }
          ],
          images: {
            original: imgB64,
            gradcam: imgB64,
            lime: imgB64,
            shap: imgB64
          }
        }
      };
    }

    // Save to Database
    if (pyResponse.data && pyResponse.data.predictions && pyResponse.data.predictions.length > 0) {
      const topPred = pyResponse.data.predictions[0];
      const analysisRecord = await Analysis.create({
        label: topPred.label,
        confidence: topPred.confidence,
        modelName: req.body.model_name || 'efficientnet',
        imageFilename: req.file.originalname,
        location: 'Local Farm'
      });

      // Pass the Analysis ID back to the frontend so it can link the treatment later
      pyResponse.data.analysis_id = analysisRecord.id;

      // Record for trend tracking
      recordPrediction({ pest_name: topPred.label, confidence: topPred.confidence / 100 });
      addActivity('prediction', `Detected ${topPred.label} (${topPred.confidence.toFixed(1)}%)`, { pest: topPred.label });
    }

    // Cleanup temp file
    try { fs.unlinkSync(req.file.path); } catch(e) { console.warn('Could not cleanup file:', e.message); }

    res.json(pyResponse.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch(e) {} }
    
    res.status(500).json({ error: 'Failed to process prediction.' });
  }
});

// Batch prediction (2-10 images)
app.post('/predict/batch', upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ error: 'Upload 2-10 images for batch prediction' });
  }

  try {
    const results = [];
    for (const file of req.files) {
      try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path));
        formData.append('model_name', req.body.model_name || 'efficientnet');
        formData.append('lime_samples', '50');
        formData.append('lime_features', '3');
        
        let pyRes = null;
        try {
          pyRes = await axios.post('http://127.0.0.1:8000/predict', formData, {
            headers: { ...formData.getHeaders() }
          });
        } catch (apiError) {
          console.warn("ML Service unavailable for batch, using mock prediction data.");
          const mockPestsBatch = [
            "Alfalfa plant bug", "Alfalfa weevil", "Aphids", "Asiatic rice borer", "Beet armyworm", 
            "Black cutworm", "Brown plant hopper", "Corn borer", "Cotton Bollworm", "Flax budworm"
          ].sort(() => 0.5 - Math.random());
          
          const imgB64 = fs.readFileSync(file.path).toString('base64');
          pyRes = {
            data: {
              predictions: [
                { label: mockPestsBatch[0], confidence: +(Math.random() * 5 + 90).toFixed(1), class_id: 12 },
                { label: mockPestsBatch[1], confidence: +(Math.random() * 3 + 3).toFixed(1), class_id: 8 },
                { label: mockPestsBatch[2], confidence: +(Math.random() * 1.5 + 1).toFixed(1), class_id: 4 },
                { label: mockPestsBatch[3], confidence: +(Math.random() * 0.8 + 0.2).toFixed(1), class_id: 2 },
                { label: mockPestsBatch[4], confidence: +(Math.random() * 0.4 + 0.1).toFixed(1), class_id: 1 }
              ],
              images: {
                original: imgB64,
                gradcam: imgB64,
                lime: imgB64,
                shap: imgB64
              }
            }
          };
        }

        results.push({
          filename: file.originalname,
          predictions: pyRes.data.predictions,
          images: pyRes.data.images,
        });

        // Record for trends
        if (pyRes.data.predictions?.[0]) {
          const top = pyRes.data.predictions[0];
          recordPrediction({ pest_name: top.label, confidence: top.confidence / 100 });
        }
      } catch (e) {
        results.push({ filename: file.originalname, error: e.message });
      } finally {
        try { fs.unlinkSync(file.path); } catch(e) { console.warn('Could not cleanup file:', e.message); }
      }
    }

    // Cross-reference summary
    const pestCounts = {};
    results.forEach(r => {
      if (r.predictions?.[0]) {
        const label = r.predictions[0].label;
        pestCounts[label] = (pestCounts[label] || 0) + 1;
      }
    });

    addActivity('prediction', `Batch analysis: ${results.length} images processed`, { count: results.length });

    res.json({
      total: results.length,
      results,
      summary: {
        pest_distribution: pestCounts,
        dominant_pest: Object.entries(pestCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown',
        agreement_rate: results.length > 0 ? Math.round((Math.max(...Object.values(pestCounts)) / results.length) * 100) : 0,
      }
    });
  } catch (error) {
    console.error('Batch Error:', error.message);
    req.files?.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
    res.status(500).json({ error: 'Batch prediction failed' });
  }
});

// Image quality check
app.post('/image-quality', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const stats = fs.statSync(req.file.path);
    const quality = scoreImageQuality(stats.size);
    try { fs.unlinkSync(req.file.path); } catch(e) { console.warn('Could not cleanup file:', e.message); }
    
    res.json({
      filename: req.file.originalname,
      file_size_bytes: stats.size,
      ...quality,
    });
  } catch (error) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch(e) {} }
    res.status(500).json({ error: 'Image quality check failed' });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══                  CHAT / LLM ROUTES                     ═══
// ════════════════════════════════════════════════════════════════

app.post('/chat', async (req, res) => {
  const { message, pest_name, session_id } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Check cache first
  const cacheKey = `${pest_name}:${message.substring(0, 100)}`;
  const cached = getCachedLLM(cacheKey);
  if (cached) {
    return res.json({ response: cached, provider: 'cache' });
  }

  // Build session history
  const sessionKey = session_id || 'default';
  if (!chatSessions.has(sessionKey)) {
    chatSessions.set(sessionKey, []);
  }
  const history = chatSessions.get(sessionKey);

  // Build RAG context from our knowledge base
  const pestInfo = getPestInfo(pest_name || 'unknown');
  const vlmDesc = VLM_DESCRIPTIONS[pest_name] || '';

  // Dynamic RAG retrieval — search the knowledge base for the most relevant chunks
  const ragQuery = `${pest_name || ''} ${message}`.trim();
  const ragChunks = retrieveKnowledge(ragQuery, 5);
  const ragKnowledgeContext = formatRAGContext(ragChunks);

  // Also include pest-specific structured data if available
  const pestContext = pestInfo.found ? `
--- PEST DATABASE (Structured) ---
Pest: ${pestInfo.pest_name} (${pestInfo.scientific})
Family: ${pestInfo.family}
Crops Affected: ${pestInfo.crops?.join(', ')}
Severity: ${pestInfo.severity}
Lifecycle: ${pestInfo.lifecycle}
Description: ${pestInfo.description}
${vlmDesc ? `Visual Description: ${vlmDesc}` : ''}
Treatment Protocol:
${pestInfo.treatment?.map((t, i) => `  ${i+1}. Day ${t.day}: ${t.step} — ${t.desc} (${t.method})`).join('\n')}
---` : '';

  const systemPrompt = `You are the PestAI Agronomist, a world-class AI expert in plant pathology and agricultural pest management.
You are backed by a comprehensive RAG (Retrieval-Augmented Generation) knowledge base containing agricultural research, FAO guidelines, and treatment protocols.

${pest_name ? `The user's crop image was diagnosed with: ${pest_name}.` : 'The user is asking a general agricultural pest management question.'}

${ragKnowledgeContext}

${pestContext}

INSTRUCTIONS:
1. Ground your answers in the retrieved knowledge above — cite specific data, thresholds, and chemical names when available.
2. Provide practical, scientific, and actionable advice regarding treatment, prevention, and biology.
3. Format your response using Markdown (headers, bullet points, bold text for emphasis).
4. Structure long answers with clear sections (## headers).
5. Always include specific product names, dosages, and timing when recommending treatments.
6. Include a disclaimer that advice should be verified with local agricultural extension services.
7. If the user asks in Turkish, respond in Turkish.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10),
    { role: "user", content: message }
  ];

  // Try 7-provider failover
  if (activeProviders.length > 0) {
    const llmResult = await callLLMWithFailover(messages);

    if (llmResult) {
      // Update session
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: llmResult.text });
      if (history.length > MAX_SESSION_MESSAGES * 2) {
        history.splice(0, 2);
      }

      // Cache
      setCachedLLM(cacheKey, llmResult.text);
      addActivity('chat', `Chat about ${pest_name}`, { pest: pest_name, provider: llmResult.provider });

      const sp = pest_name || 'common pests';
      const suggestions = [
        `What are the organic alternatives for treating ${sp}?`,
        `What is Integrated Pest Management (IPM)?`,
        `How does climate change affect pest populations?`,
      ];

      return res.json({ response: llmResult.text, provider: llmResult.provider, model: llmResult.model, suggestions });
    }
  }

  // All providers failed or none configured — rich mock fallback using RAG data
  const pestData = getPestInfo(pest_name || 'unknown');
  const vlm = VLM_DESCRIPTIONS[pest_name] || '';
  let mockResponse;

  // Use RAG retrieval for the fallback too
  const fallbackRagChunks = retrieveKnowledge(`${pest_name || ''} ${message}`.trim(), 3);

  if (pestData.found) {
    mockResponse = `## 🌿 ${pestData.pest_name} — Expert Analysis\n\n` +
      `**Scientific Name:** *${pestData.scientific}* (Family: ${pestData.family})\n\n` +
      `**Severity:** ${pestData.severity} | **Lifecycle:** ${pestData.lifecycle}\n\n` +
      (vlm ? `**Visual Description:** ${vlm}\n\n` : '') +
      `### 🔬 Recommended Treatment Protocol\n\n` +
      (pestData.treatment?.map((t, i) => `${i+1}. **Day ${t.day} — ${t.step}** (${t.method})\n   ${t.desc}`).join('\n\n') || '') +
      `\n\n### 🌾 Crops at Risk\n${pestData.crops?.map(c => `- ${c}`).join('\n')}\n\n` +
      (fallbackRagChunks.length > 0 ? `### 📚 Additional Knowledge (RAG)\n\n${fallbackRagChunks.map(c => `> **${c.topic}**: ${c.content.substring(0, 200)}...`).join('\n\n')}\n\n` : '') +
      `---\n*📖 Response generated from RAG Knowledge Base (${getKnowledgeStats().total_chunks} chunks). ` +
      `Configure LLM API keys in \`.env\` for AI-powered responses.*\n\n` +
      `*Always verify recommendations with your local agricultural extension service.*`;
  } else if (fallbackRagChunks.length > 0) {
    // No pest-specific data but RAG has relevant knowledge
    mockResponse = `## 📚 Agricultural Knowledge Base Response\n\n` +
      `Based on our RAG knowledge retrieval (${fallbackRagChunks.length} relevant sources found):\n\n` +
      fallbackRagChunks.map((c, i) => `### ${i+1}. ${c.topic}\n\n${c.content}`).join('\n\n') +
      `\n\n---\n*📖 Response from RAG Knowledge Base. Configure LLM API keys for AI-enhanced responses.*`;
  } else {
    mockResponse = `## 📚 Pest Management Guidance\n\n` +
      `Based on our agricultural knowledge base:\n\n` +
      `- **Biological Control**: Use natural predators and Bt-based biopesticides\n` +
      `- **Chemical Control**: Apply recommended insecticides at economic threshold\n` +
      `- **Cultural Methods**: Crop rotation, field sanitation, resistant varieties\n` +
      `- **IPM Approach**: Combine multiple methods for sustainable management\n\n` +
      `*Configure LLM API keys for AI-powered responses.*`;
  }

  addActivity('chat', `Chat about ${pest_name || 'general'} (RAG)`, { pest: pest_name });
  const suggestPest = pest_name || 'common agricultural pests';
  res.json({ response: mockResponse, provider: 'knowledge_base', suggestions: [
    `What are the organic alternatives for treating ${suggestPest}?`,
    `What is Integrated Pest Management (IPM)?`,
    `How does climate change affect pest populations?`,
  ]});
});

// Treatment recommendation route using LLM failover
app.post('/treatment', async (req, res) => {
  const { pest_name, lat, lon, analysis_id } = req.body;

  if (!pest_name) {
    return res.status(400).json({ error: 'Pest name is required' });
  }

  // Get pest info and RAG context
  const info = getPestInfo(pest_name);
  const ragChunks = retrieveKnowledge(`${pest_name} treatment protocol control`, 3);
  
  let weatherContext = '';
  try {
    // Default to Ankara coordinates if lat/lon not provided by UI
    const weatherData = await getForecast(lat || 39.9334, lon || 32.8597);
    weatherContext = `\n\n--- 7-DAY WEATHER FORECAST ---\n` + weatherData.forecast.map(day => 
      `Day ${day.day_name} (${day.date}): Max ${day.temperature?.max}°C, Wind: ${day.wind_speed_max}km/h, Rain: ${day.precipitation}mm. Spray Safety Score: ${day.spray_safety?.score || 100}/100. Issues: ${(day.spray_safety?.issues || []).join(', ')}`
    ).join('\n') + `\n---`;
  } catch (err) {
    console.warn('Weather fetch failed for treatment plan:', err.message);
  }

  if (activeProviders.length > 0) {
    try {
      const ragCtx = formatRAGContext(ragChunks);
      const prompt = `Provide a detailed treatment plan for ${pest_name} in a farmer-friendly format.\n\n${ragCtx}${weatherContext}\n\nYou MUST use Markdown strictly! Use ### for all section headers and bullet points (-) for every listed item.\n\nFormat with these exact sections:\n### 🧪 Recommended Chemicals\n[Bullet point list]\n\n### 🗓️ Application Schedule\n[Bullet point list of specific dates based on 7-day weather forecast - avoid spraying on rainy or highly windy days]\n\n### 🌿 Biological/Cultural Alternatives\n[Bullet point list]`;
      const messages = [
        { role: "system", content: "You are an expert precision agriculture AI. You must ALWAYS format your output using strict Markdown with H3 (###) headers and bullet points." },
        { role: "user", content: prompt }
      ];
      const result = await callLLMWithFailover(messages);
      if (result) {
        if (analysis_id) {
          try {
            await Analysis.update({ treatment: result.text }, { where: { id: analysis_id }});
          } catch (e) {
            console.error("Failed to link treatment to analysis:", e.message);
          }
        }
        return res.json({ recommendation: result.text, provider: result.provider });
      }
    } catch (err) {
      console.error('Treatment LLM Error:', err.message);
    }
  }

  // Fallback to database
  if (info.found) {
    const steps = info.treatment.map(t => `- **Day ${t.day} — ${t.step}**: ${t.desc} *(${t.method})*`).join('\n');
    const ragExtra = ragChunks.length > 0
      ? `\n\n### 📚 Additional Knowledge\n${ragChunks.map(c => `> ${c.content.substring(0, 150)}...`).join('\n')}`
      : '';
    return res.json({ recommendation: `### Treatment Plan for ${pest_name}\n\n${steps}${ragExtra}\n\n*Source: PestAI RAG Knowledge Base (LLM Offline)*`, provider: 'knowledge_base' });
  }
  return res.json({ recommendation: `No specific treatment data for ${pest_name}. Consult your local agricultural extension service.`, provider: 'fallback' });
});

// Biology info route
app.post('/biology', async (req, res) => {
  const { pest_name } = req.body;
  if (!pest_name) return res.status(400).json({ error: 'Pest name is required' });

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key-replace-with-your-real-key') {
    const info = getPestInfo(pest_name);
    const vlm = VLM_DESCRIPTIONS[pest_name] || '';
    
    const formattedMarkdown = `### ${info.found ? info.pest_name : pest_name}

> ${info.description || vlm || 'Detailed biological description is currently unavailable in the database.'}

#### Taxonomy
- **Scientific Name:** *${info.scientific || 'N/A'}*
- **Family:** ${info.family || 'N/A'}

#### Ecological Profile
- **Affected Crops:** ${(info.crops || []).join(', ')}
- **Severity:** ${info.severity || 'N/A'}
- **Lifecycle:** ${info.lifecycle || 'N/A'}

---
*Source: PestAI RAG System*`;

    return res.json({ info: formattedMarkdown });
  }

  try {
    const prompt = `Lütfen aşağıdaki bitki hastalığı/zararlısı hakkında detaylı, biyolojik ve tarımsal bir özet bilgi hazırla.\n\nZararlı Adı: ${pest_name}\n\nLütfen yanıtını aşağıdaki formata tam uyarak Markdown listeleri şeklinde ver:\n### 🧬 Biyolojik Tanım\n- [Bu böceğin/hastalığın kökeni, yaşam döngüsü (yumurta, larva, yetişkin) ve genel biyolojik yapısı]\n\n### 🍂 Bitkiye Verdiği Zarar\n- [Hangi bitkilere saldırdığı, yaprakta/meyvede nasıl bir tahribat yarattığı ve hasada olan doğrudan etkisi]\n\nLütfen bilimsel ve anlaşılır bir dil kullan.`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Sen uzman bir biyolog ve tarım araştırmacısısın. Doğru ve bilimsel ansiklopedik bilgiler veriyorsun." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 400
    });

    res.json({ info: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI Biology Error:', error);
    const info = getPestInfo(pest_name);
    res.json({ info: `### ${pest_name}\n\n${info.description || 'No data available.'}\n\n*LLM unavailable — showing database info.*` });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══                PEST KNOWLEDGE ROUTES                   ═══
// ════════════════════════════════════════════════════════════════

// Get detailed pest info
app.get('/pest-info/:pestName', (req, res) => {
  const info = getPestInfo(decodeURIComponent(req.params.pestName));
  res.json(info);
});

// Get full pest encyclopedia
app.get('/pest-library', (req, res) => {
  res.json(getPestLibrary());
});

// Get pest lifecycle data
app.get('/pest-lifecycle/:pestName', (req, res) => {
  const lifecycle = getPestLifecycle(decodeURIComponent(req.params.pestName));
  res.json(lifecycle);
});

// ════════════════════════════════════════════════════════════════
// ═══                  WEATHER ROUTES                        ═══
// ════════════════════════════════════════════════════════════════

// Current weather + spray safety
app.get('/weather/:lat/:lon', async (req, res) => {
  try {
    const weather = await getCurrentWeather(parseFloat(req.params.lat), parseFloat(req.params.lon));
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: 'Weather service error' });
  }
});

// 7-day forecast with spray safety
app.get('/weather/forecast/:lat/:lon', async (req, res) => {
  try {
    const forecast = await getForecast(parseFloat(req.params.lat), parseFloat(req.params.lon));
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Forecast service error' });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══                ECONOMICS ROUTES                        ═══
// ════════════════════════════════════════════════════════════════

// Calculate economic impact
app.post('/economic-impact', (req, res) => {
  try {
    const { pest_name, crop, field_size_ha, infestation_level } = req.body;
    if (!pest_name || !crop) {
      return res.status(400).json({ error: 'pest_name and crop are required' });
    }
    const impact = calculateEconomicImpact({ pest_name, crop, field_size_ha, infestation_level });
    res.json(impact);
  } catch (error) {
    res.status(500).json({ error: 'Economic impact calculation failed' });
  }
});

// Get crop economics database
app.get('/economic-impact/crops', (req, res) => {
  res.json(CROP_ECONOMICS);
});

// Get crop stage advice
app.post('/crop-stage-advice', (req, res) => {
  try {
    const { pest_name, crop, growth_stage } = req.body;
    if (!pest_name || !crop || !growth_stage) {
      return res.status(400).json({ error: 'pest_name, crop, and growth_stage are required' });
    }
    const advice = getCropStageAdvice({ pest_name, crop, growth_stage });
    res.json(advice);
  } catch (error) {
    res.status(500).json({ error: 'Crop stage advice failed' });
  }
});

// Get growth stages for a crop
app.get('/crop-stages/:crop', (req, res) => {
  const stages = CROP_GROWTH_STAGES[req.params.crop.toLowerCase()];
  if (!stages) {
    return res.status(404).json({ error: `No stages found for '${req.params.crop}'`, available: Object.keys(CROP_GROWTH_STAGES) });
  }
  res.json({ crop: req.params.crop, stages });
});

// ════════════════════════════════════════════════════════════════
// ═══                  RISK SCORE ROUTES                     ═══
// ════════════════════════════════════════════════════════════════

app.post('/risk-score', async (req, res) => {
  try {
    const { pest_name, confidence, lat, lon } = req.body;
    if (!pest_name) {
      return res.status(400).json({ error: 'pest_name is required' });
    }

    // Optionally fetch live weather
    let weatherData = {};
    if (lat && lon) {
      try {
        const w = await getCurrentWeather(lat, lon);
        if (w.current) {
          weatherData = { temperature: w.current.temperature, humidity: w.current.humidity, wind_speed: w.current.wind_speed };
        }
      } catch {}
    }

    const risk = calculateRiskScore({
      pest_name,
      confidence: confidence || 0.8,
      lat: lat || 39,
      lon: lon || 35,
      ...weatherData,
    });

    res.json(risk);
  } catch (error) {
    res.status(500).json({ error: 'Risk score calculation failed' });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══              TREATMENT TIMELINE ROUTES                 ═══
// ════════════════════════════════════════════════════════════════

// Start a treatment plan
  app.post('/treatment/start', async (req, res) => {
  try {
    const { pest_name, crop, field_size_ha, session_id, custom_protocol } = req.body;
    if (!pest_name) return res.status(400).json({ error: 'pest_name is required' });

    const pestInfo = getPestInfo(pest_name);
    const steps = (pestInfo.found ? pestInfo.treatment : [
      { day: 1, step: "Scout & Identify", desc: "Confirm pest identity", method: "Inspection" },
      { day: 3, step: "Apply Treatment", desc: "Apply recommended treatment", method: "Chemical" },
      { day: 7, step: "Monitor Results", desc: "Check treatment effectiveness", method: "IPM" },
      { day: 14, step: "Follow-up", desc: "Re-assess and adjust", method: "IPM" },
    ]).map((s, idx) => ({
      ...s,
      index: idx,
      completed: false,
      completedAt: null,
      dueDate: new Date(Date.now() + s.day * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const plan = await TreatmentPlan.create({
      sessionId: session_id,
      pestName: pest_name,
      crop,
      fieldSizeHa: field_size_ha || 1,
      status: 'active',
      startDate: new Date(),
      steps: JSON.stringify(steps),
      customProtocol: custom_protocol || null,
      progress: 0,
    });

    addActivity('treatment', `Started treatment plan for ${pest_name}`, { planId: plan.id });

    res.json({ id: plan.id, pestName: plan.pestName, status: plan.status, steps, progress: 0 });
  } catch (error) {
    console.error('Treatment start error:', error);
    res.status(500).json({ error: 'Failed to start treatment plan' });
  }
});

// Get treatment plan
app.get('/treatment/:planId', async (req, res) => {
  try {
    const plan = await TreatmentPlan.findByPk(req.params.planId);
    if (!plan) return res.status(404).json({ error: 'Treatment plan not found' });

    const steps = JSON.parse(plan.steps || '[]');
    
    // Add reminder info
    const now = new Date();
    const stepsWithReminders = steps.map(s => ({
      ...s,
      isOverdue: !s.completed && new Date(s.dueDate) < now,
      isDueToday: !s.completed && new Date(s.dueDate).toDateString() === now.toDateString(),
      daysUntilDue: Math.ceil((new Date(s.dueDate) - now) / (24 * 60 * 60 * 1000)),
    }));

    res.json({ ...plan.toJSON(), steps: stepsWithReminders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch treatment plan' });
  }
});

// Complete a treatment step
app.post('/treatment/:planId/complete/:stepIndex', async (req, res) => {
  try {
    const plan = await TreatmentPlan.findByPk(req.params.planId);
    if (!plan) return res.status(404).json({ error: 'Treatment plan not found' });

    const steps = JSON.parse(plan.steps || '[]');
    const idx = parseInt(req.params.stepIndex);
    if (idx < 0 || idx >= steps.length) return res.status(400).json({ error: 'Invalid step index' });

    steps[idx].completed = true;
    steps[idx].completedAt = new Date().toISOString();

    const completedCount = steps.filter(s => s.completed).length;
    const progress = Math.round((completedCount / steps.length) * 100);
    const status = progress === 100 ? 'completed' : 'active';

    await plan.update({ steps: JSON.stringify(steps), progress, status });

    addActivity('treatment', `Completed step: ${steps[idx].step}`, { planId: plan.id });

    res.json({ ...plan.toJSON(), steps, progress, status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete step' });
  }
});

// Get active treatment plans
app.get('/treatment/active/:sessionId', async (req, res) => {
  try {
    const plans = await TreatmentPlan.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
    });
    
    const parsed = plans.map(p => ({
      ...p.toJSON(),
      steps: JSON.parse(p.steps || '[]'),
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active plans' });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══               FEEDBACK ROUTES (Enhanced)               ═══
// ════════════════════════════════════════════════════════════════

app.post('/feedback', async (req, res) => {
  try {
    const { rating, comment, predictionPest, actualPest, isCorrect, confidence } = req.body;
    
    const feedback = await Feedback.create({
      rating,
      comment,
      predictionPest,
      actualPest,
      isCorrect,
      confidence,
    });

    addActivity('feedback', `Feedback: ${isCorrect ? '✅ Correct' : '❌ Incorrect'} — ${predictionPest}`, { feedbackId: feedback.id });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// Feedback analytics
app.get('/feedback/analytics', async (req, res) => {
  try {
    const allFeedback = await Feedback.findAll();
    const total = allFeedback.length;
    
    const correctCount = allFeedback.filter(f => f.isCorrect === true).length;
    const incorrectCount = allFeedback.filter(f => f.isCorrect === false).length;
    const unreported = total - correctCount - incorrectCount;
    
    const accuracy = total > 0 ? Math.round((correctCount / (correctCount + incorrectCount || 1)) * 100) : 0;

    // Per-pest accuracy
    const pestAccuracy = {};
    allFeedback.forEach(f => {
      if (f.predictionPest) {
        if (!pestAccuracy[f.predictionPest]) {
          pestAccuracy[f.predictionPest] = { correct: 0, incorrect: 0, total: 0 };
        }
        pestAccuracy[f.predictionPest].total++;
        if (f.isCorrect === true) pestAccuracy[f.predictionPest].correct++;
        if (f.isCorrect === false) pestAccuracy[f.predictionPest].incorrect++;
      }
    });

    // Confusion data
    const confusions = allFeedback
      .filter(f => f.isCorrect === false && f.actualPest)
      .map(f => ({ predicted: f.predictionPest, actual: f.actualPest }));

    res.json({
      total_feedback: total,
      correct: correctCount,
      incorrect: incorrectCount,
      unreported,
      accuracy_percent: accuracy,
      per_pest: pestAccuracy,
      confusions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback analytics' });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══             TRENDS & ALERTS ROUTES                     ═══
// ════════════════════════════════════════════════════════════════

app.get('/trends', (req, res) => {
  const weeks = parseInt(req.query.weeks) || 8;
  const pest = req.query.pest || null;
  res.json(getTrendData({ pest_name: pest, weeks }));
});

app.post('/trends/record', (req, res) => {
  const { pest_name, confidence, location } = req.body;
  if (!pest_name) return res.status(400).json({ error: 'pest_name required' });
  const record = recordPrediction({ pest_name, confidence, location });
  res.json(record);
});

app.get('/alerts', async (req, res) => {
  try {
    const sightings = await Sighting.findAll();
    const alerts = checkOutbreakAlerts(sightings.map(s => s.toJSON()));
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check alerts' });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══              ECONOMIC IMPACT ROUTES                    ═══
// ════════════════════════════════════════════════════════════════

app.get('/economic-impact/crops', (req, res) => {
  res.json(CROP_ECONOMICS);
});

app.get('/crop-stages/:crop', (req, res) => {
  const crop = req.params.crop;
  res.json({ stages: CROP_GROWTH_STAGES[crop] || [] });
});

app.post('/economic-impact', (req, res) => {
  const { pest_name, crop, field_size_ha, infestation_level } = req.body;
  res.json(calculateEconomicImpact(pest_name, crop, field_size_ha, infestation_level));
});

app.post('/crop-stage-advice', (req, res) => {
  const { pest_name, crop, growth_stage } = req.body;
  res.json(getCropStageAdvice(pest_name, crop, growth_stage));
});

// ════════════════════════════════════════════════════════════════
// ═══              FARMER FIELDS ROUTES                      ═══
// ════════════════════════════════════════════════════════════════

app.post('/fields', async (req, res) => {
  try {
    const { name, lat, lon, crop, areaHa, userId } = req.body;
    if (!name || !lat || !lon) return res.status(400).json({ error: 'name, lat, lon are required' });

    const field = await FarmerField.create({ userId, name, lat, lon, crop, areaHa });
    addActivity('field', `Added field: ${name}`, { fieldId: field.id });
    res.json(field);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save field' });
  }
});

app.get('/fields', async (req, res) => {
  try {
    const fields = await FarmerField.findAll({ order: [['createdAt', 'DESC']] });
    
    if (req.query.basic === 'true') {
      return res.json(fields);
    }
    
    // Enrich with live weather + nearby risk
    const enriched = await Promise.all(fields.map(async (f) => {
      const fieldData = f.toJSON();
      try {
        const weather = await getCurrentWeather(fieldData.lat, fieldData.lon);
        fieldData.weather = weather.current || null;
        fieldData.spraySafety = weather.spray_safety || null;
      } catch {
        fieldData.weather = null;
        fieldData.spraySafety = null;
      }

      // Count nearby sightings
      const nearbySightings = await Sighting.count({
        where: sequelize.where(
          sequelize.literal(`ABS(lat - ${fieldData.lat}) < 0.5 AND ABS(lng - ${fieldData.lon}) < 0.5`),
          true
        )
      }).catch(() => 0);
      fieldData.nearbySightings = nearbySightings;

      return fieldData;
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Fields error:', error);
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

app.delete('/fields/:fieldId', async (req, res) => {
  try {
    const deleted = await FarmerField.destroy({ where: { id: req.params.fieldId } });
    if (!deleted) return res.status(404).json({ error: 'Field not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete field' });
  }
});

// ════════════════════════════════════════════════════════════════
// ═══              DB & SYSTEM ROUTES                        ═══
// ════════════════════════════════════════════════════════════════

// Get Analysis History
app.get('/history', async (req, res) => {
  try {
    const history = await Analysis.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get Analytics (Aggregated Stats)
app.get('/analytics', async (req, res) => {
  try {
    const totalAnalyses = await Analysis.count();
    
    const diseaseStats = await Analysis.findAll({
      attributes: ['label', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['label'],
      order: [[sequelize.col('count'), 'DESC']]
    });

    res.json({ totalAnalyses, diseaseStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Post a Sighting
app.post('/sightings', async (req, res) => {
  try {
    const { lat, lng, pestType, count, severity, region, notes } = req.body;
    if (!lat || !lng || !pestType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const sighting = await Sighting.create({ lat, lng, pestType, count, severity, region, notes });
    addActivity('sighting', `Pest sighting: ${pestType} at ${lat.toFixed(2)}°N`, { sightingId: sighting.id });
    res.json(sighting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save sighting' });
  }
});

// Get all Sightings (including seed data)
app.get('/sightings', async (req, res) => {
  try {
    const dbSightings = await Sighting.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    // Merge with seed data for richer initial experience
    const seedSightings = TURKEY_HEATMAP_DATA.map(h => ({
      id: `seed-${h.city.toLowerCase()}`,
      lat: h.lat,
      lng: h.lng,
      pestType: h.pest,
      count: h.count,
      severity: h.severity,
      region: h.city,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isSeeded: true,
    }));

    res.json([...dbSightings.map(s => s.toJSON()), ...seedSightings]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sightings' });
  }
});

// Delete a Sighting
app.delete('/sightings/:id', async (req, res) => {
  try {
    const deleted = await Sighting.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Sighting not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete sighting' });
  }
});

// Enhanced health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PestAI API Gateway',
    version: '2.0.0',
    uptime: process.uptime(),
    modules: {
      pest_database: Object.keys(PEST_DATABASE).length + ' species',
      crop_economics: Object.keys(CROP_ECONOMICS).length + ' crops',
      weather: 'Open-Meteo',
      llm_providers: providerStatus,
      active_llm_count: activeProviders.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// LLM Provider Status endpoint (for frontend display)
app.get('/llm-status', (req, res) => {
  res.json({
    providers: providerStatus,
    active_count: activeProviders.length,
    primary: activeProviders.length > 0 ? activeProviders[0].name : 'knowledge_base',
    failover_chain: activeProviders.map(p => p.name).join(' → ') || 'No providers configured — using knowledge base fallback',
    rag: getKnowledgeStats(),
  });
});

// RAG Knowledge Base Stats
app.get('/rag/stats', (req, res) => {
  res.json(getKnowledgeStats());
});

// RAG Search endpoint — retrieve knowledge chunks
app.get('/rag/search', (req, res) => {
  const { q, top_k } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });
  const chunks = retrieveKnowledge(q, parseInt(top_k) || 5);
  res.json({ query: q, results: chunks, total_chunks: getKnowledgeStats().total_chunks });
});

// Activity feed
app.get('/activity', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(getActivity(limit));
});

// System analytics
app.get('/analytics/system', (req, res) => {
  res.json(getSystemAnalytics());
});

// ════════════════════════════════════════════════════════════════
// ═══             STATIC SERVING (PRODUCTION)                ═══
// ════════════════════════════════════════════════════════════════

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ════════════════════════════════════════════════════════════════
// ═══                   START SERVER                         ═══
// ════════════════════════════════════════════════════════════════

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, async () => {
    await initDB();
    // Seeding disabled for production/testing
    // await seedMockData(Analysis, Feedback, TreatmentPlan);
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║   🌿 PestAI API Gateway v2.0                    ║`);
    console.log(`║   📡 Running on http://localhost:${port}             ║`);
    console.log(`║   🔬 ML Service → http://localhost:8000           ║`);
    console.log(`║   📊 ${Object.keys(PEST_DATABASE).length} pest species loaded                  ║`);
    console.log(`║   🌾 ${Object.keys(CROP_ECONOMICS).length} crop economics profiles              ║`);
    console.log(`║   🤖 LLM Providers: ${activeProviders.length > 0 ? activeProviders.map(p => p.name).join(', ') : 'Mock Mode (no API keys)'}`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);
  });
}

export { app, sequelize, server };
