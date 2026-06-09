import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PEST_DATABASE } from './data/pestDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mergeDatabases() {
  const jsonPath = path.join(__dirname, 'data', 'expanded_pests.json');
  const dbPath = path.join(__dirname, 'data', 'pestDatabase.js');
  
  if (!fs.existsSync(jsonPath)) {
    console.log("No expanded_pests.json found. Waiting...");
    return;
  }

  const generatedData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Merge dictionaries
  const mergedDb = { ...PEST_DATABASE, ...generatedData };
  
  const fileContent = `/**
 * PestGuard AI — Pest Knowledge Database
 * Auto-expanded to ${Object.keys(mergedDb).length} Pests
 */

export const PEST_DATABASE = ${JSON.stringify(mergedDb, null, 2)};
`;

  fs.writeFileSync(dbPath, fileContent, 'utf8');
  console.log(`Successfully merged database. Total pests: ${Object.keys(mergedDb).length}`);
}

mergeDatabases();
