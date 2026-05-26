import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sequelize, { initDB, Analysis, Feedback, Sighting, User } from './db.js';

dotenv.config({ path: '../.env' }); // Load from root

const app = express();
const port = 5000;

// Initialize OpenAI (Configured for OpenRouter)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
    'X-Title': 'PestAI', // Required by OpenRouter
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer for temp file storage
const upload = multer({ dest: 'uploads/' });

// Health check
app.get('/', (req, res) => {
  res.send('PestAI API Gateway is running.');
});

// Auth Secret (In production, move to .env)
const JWT_SECRET = process.env.JWT_SECRET || 'pestai-super-secret-key';

// === AUTH ROUTES ===
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
// === END AUTH ROUTES ===

// Proxy route to Python ML Service (Port 8000)
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
    
    // NEW: Pass quantized flag robustly
    const isQ = req.body.is_quantized === 'true' || req.body.is_quantized === true;
    formData.append('is_quantized', isQ ? 'true' : 'false');

    // Proxy request to Python FastAPI
    const pyResponse = await axios.post('http://127.0.0.1:8000/predict', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // Save to Database
    if (pyResponse.data && pyResponse.data.predictions && pyResponse.data.predictions.length > 0) {
      const topPred = pyResponse.data.predictions[0];
      await Analysis.create({
        label: topPred.label,
        confidence: topPred.confidence,
        modelName: req.body.model_name || 'efficientnet',
        imageFilename: req.file.originalname,
        location: 'Local Farm' // Mock location for now
      });
    }

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.json(pyResponse.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    if (req.file) fs.unlinkSync(req.file.path);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to connect to the ML Service. Is Python running on port 8000?' });
    }
  }
});

// OpenAI LLM Chat Route
app.post('/chat', async (req, res) => {
  const { message, pest_name } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  if (!process.env.OPENAI_API_KEY) {
     return res.status(500).json({ error: 'OpenAI API key is missing from .env file.' });
  }

  try {
    const systemPrompt = `You are the PestAI Agronomist, a world-class AI expert in plant pathology and agricultural pest management. 
You are currently advising a user whose crop image was diagnosed with: ${pest_name}.
Provide practical, scientific, and actionable agricultural advice regarding treatment, prevention, and biology.
Format your response using Markdown (bullet points, bold text for emphasis).
Keep it concise, professional, and highly accurate.`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const botReply = response.choices[0].message.content;
    res.json({ response: botReply });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to get response from OpenAI LLM.' });
  }
});

// Treatment recommendation route using LLM
app.post('/treatment', async (req, res) => {
  const { pest_name } = req.body;

  if (!pest_name) {
    return res.status(400).json({ error: 'Pest name is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
     return res.status(500).json({ error: 'OpenAI API key is missing from .env file.' });
  }

  try {
    const prompt = `Aşağıdaki bitki hastalığı/zararlısı için çiftçilere yönelik pratik bir tedavi ve mücadele planı hazırla.

Hastalık/Zararlı Adı: ${pest_name}

Lütfen yanıtını aşağıdaki formata tam uyarak Markdown listeleri şeklinde ver:
### 🧪 Önerilen İlaç / Etken Madde
- [Bu zararlıya karşı kullanılabilecek yaygın kimyasal veya organik ilaç türü/etken maddesi]

### ⏱️ Kullanım Sıklığı ve Dozu
- [İlacın ne sıklıkla ve nasıl uygulanması gerektiğine dair genel tavsiye]

### 🌱 İlaç Dışı Kültürel ve Biyolojik Önlemler
- [Doğal düşmanlar, budama, sulama yöntemleri gibi kimyasal olmayan tavsiyeler]

Lütfen kısa, anlaşılır ve doğrudan bilgi veren paragraflar yerine madde işaretleri (bullet points) kullan. Çiftçiler için rahat okunabilir bir rehber olsun.`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Sen uzman bir Türk ziraat mühendisisin. Çiftçilere net, anlaşılır, kolay okunan ve bilimsel olarak doğru mücadele tavsiyeleri veriyorsun." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 400
    });

    res.json({ recommendation: response.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI Treatment Error:', error);
    res.status(500).json({ error: 'Failed to generate treatment recommendation' });
  }
});

// Biological Database Info Route
app.post('/biology', async (req, res) => {
  const { pest_name } = req.body;

  if (!pest_name) {
    return res.status(400).json({ error: 'Pest name is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
     return res.status(500).json({ error: 'OpenAI API key is missing from .env file.' });
  }

  try {
    const prompt = `Lütfen aşağıdaki bitki hastalığı/zararlısı hakkında detaylı, biyolojik ve tarımsal bir özet bilgi hazırla.

Zararlı Adı: ${pest_name}

Lütfen yanıtını aşağıdaki formata tam uyarak Markdown listeleri şeklinde ver:
### 🧬 Biyolojik Tanım
- [Bu böceğin/hastalığın kökeni, yaşam döngüsü (yumurta, larva, yetişkin) ve genel biyolojik yapısı]

### 🍂 Bitkiye Verdiği Zarar
- [Hangi bitkilere saldırdığı, yaprakta/meyvede nasıl bir tahribat yarattığı ve hasada olan doğrudan etkisi]

Lütfen bilimsel ve anlaşılır bir dil kullan. Çiftçilerin ve öğrencilerin rahat okuyabileceği, gereksiz uzatmalardan kaçınan net bilgiler ver.`;

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
    res.status(500).json({ error: 'Failed to fetch biological info.' });
  }
});

// --- NEW DB ENDPOINTS ---

// Get History
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
    // Basic stats: total count
    const totalAnalyses = await Analysis.count();
    
    // Group by label to see top diseases
    const diseaseStats = await Analysis.findAll({
      attributes: ['label', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['label'],
      order: [[sequelize.col('count'), 'DESC']]
    });

    res.json({
      totalAnalyses,
      diseaseStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Post a Sighting
app.post('/sightings', async (req, res) => {
  try {
    const { lat, lng, pestType } = req.body;
    if (!lat || !lng || !pestType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const sighting = await Sighting.create({ lat, lng, pestType });
    res.json(sighting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save sighting' });
  }
});

// Get all Sightings
app.get('/sightings', async (req, res) => {
  try {
    const sightings = await Sighting.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(sightings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sightings' });
  }
});

// Start Server & Init DB
app.listen(port, async () => {
  await initDB();
  console.log(`[PestAI] Node.js API Gateway running on http://localhost:${port}`);
  console.log(`[PestAI] Proxying ML requests to http://localhost:8000`);
});
