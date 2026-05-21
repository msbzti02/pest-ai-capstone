import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';

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
    formData.append('lime_samples', req.body.lime_samples || '800');
    formData.append('lime_features', req.body.lime_features || '13');
    formData.append('gradcam_opacity', req.body.gradcam_opacity || '0.75');
    // NEW: Pass quantized flag
    formData.append('is_quantized', req.body.is_quantized || 'false');

    // Proxy request to Python FastAPI
    const pyResponse = await axios.post('http://127.0.0.1:8000/predict', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

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

app.listen(port, () => {
  console.log(`[PestAI] Node.js API Gateway running on http://localhost:${port}`);
  console.log(`[PestAI] Proxying ML requests to http://localhost:8000`);
});
