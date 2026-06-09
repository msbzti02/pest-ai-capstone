import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const PESTS_TO_GENERATE = [
  "Citrus Canker", "Apple Scab", "Grapevine Downy Mildew", "Tomato Late Blight",
  "Wheat Rust", "Coffee Leaf Rust", "Banana Black Sigatoka", "Citrus Greening",
  "Plum Curculio", "Codling Moth", "Spotted Wing Drosophila", "Brown Marmorated Stink Bug",
  "Asian Citrus Psyllid", "Sweetpotato Whitefly", "Western Corn Rootworm",
  "Soybean Cyst Nematode", "Root-knot Nematode", "Colorado Potato Beetle",
  "Emerald Ash Borer", "Gypsy Moth", "Japanese Beetle", "Tarnished Plant Bug",
  "Thrips", "Spider Mites", "Mealybugs", "Scale Insects", "Flea Beetles",
  "Cutworms", "Wireworms", "Armyworms", "Leafhoppers", "Planthoppers",
  "Fruit Flies", "Fungus Gnats", "White Grubs", "Slugs and Snails",
  "Powdery Mildew", "Botrytis Blight", "Fusarium Wilt", "Verticillium Wilt",
  "Anthracnose", "Bacterial Spot", "Fire Blight", "Crown Gall",
  "Mosaic Viruses", "Tomato Spotted Wilt Virus", "Cucumber Mosaic Virus",
  "Barley Yellow Dwarf Virus", "Potato Virus Y", "Citrus Tristeza Virus",
  "Papaya Ringspot Virus", "Cassava Brown Streak Virus", "Maize Lethal Necrosis",
  "Rice Blast", "Wheat Blast", "Soybean Rust", "Corn Smut", "Ergot"
];

async function generatePestData(pestName) {
  const prompt = `
Generate a highly detailed, professional agricultural database entry for the pest/disease: "${pestName}".
Return ONLY valid JSON (no markdown formatting, no code blocks, just raw JSON).
The JSON MUST perfectly match this structure:
{
  "scientific": "Scientific Name",
  "family": "Taxonomic Family",
  "crops": ["Target Crop 1", "Target Crop 2"],
  "severity": "High", // High, Medium, Critical, Low
  "lifecycle": "Number of days/months",
  "description": "2-3 sentences of deep agricultural description.",
  "treatment": [
    { "day": 1, "step": "Title of step", "desc": "Deep description", "method": "Biological/Chemical/Cultural" },
    { "day": 5, "step": "Title of step", "desc": "Deep description", "method": "Biological/Chemical/Cultural" }
  ],
  "treatment_dependencies": [
    "Do not apply X if temperature > 30C",
    "Requires high humidity for biological control to work"
  ],
  "case_studies": [
    { "title": "2021 Outbreak in Region X", "outcome": "Yield saved by applying early biological controls." }
  ],
  "references": [
    "FAO Agricultural Guidelines on ${pestName}",
    "University Extension Office: Managing ${pestName}"
  ]
}
Ensure the treatment has exactly 4 steps.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
    });
    
    let raw = completion.choices[0].message.content.trim();
    // Strip markdown if it returned it
    if (raw.startsWith('```json')) raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    if (raw.startsWith('```')) raw = raw.replace(/```/g, '').trim();
    
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to generate ${pestName}:`, error.message);
    return null;
  }
}

async function run() {
  console.log("Starting Pest Encyclopedia Expansion...");
  const dbPath = path.join(__dirname, 'data', 'pestDatabase.js');
  
  // Create a new file for the expanded database
  let fileContent = `/**\n * PestGuard AI — Pest Knowledge Database\n * Auto-expanded to 80+ Pests using Groq Llama3-70b\n */\n\nexport const PEST_DATABASE = {\n`;
  
  // 1. Read existing database and append its contents first (to avoid losing the original 28)
  // Instead of parsing the JS, we'll just build a brand new JSON object and write it out.
  const newDb = {};
  
  // To avoid circular dependency loading ES modules, we will just generate the new ones
  // and manually merge them into the file later, or we can just replace the whole file.
  // We'll just generate the 58 pests and save them to a JSON file, then we can manually merge it.
  
  const generatedPests = {};
  for (let i = 0; i < PESTS_TO_GENERATE.length; i++) {
    const pest = PESTS_TO_GENERATE[i];
    console.log(`[${i+1}/${PESTS_TO_GENERATE.length}] Generating data for: ${pest}...`);
    const data = await generatePestData(pest);
    if (data) {
      generatedPests[pest] = data;
    }
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }
  
  const jsonPath = path.join(__dirname, 'data', 'expanded_pests.json');
  fs.writeFileSync(jsonPath, JSON.stringify(generatedPests, null, 2));
  console.log("Expansion complete! Saved to expanded_pests.json.");
}

run();
