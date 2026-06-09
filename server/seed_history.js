import { Analysis } from './db.js';

const pests = [
  'Fall Armyworm', 'Rice Leafhopper', 'Brown Planthopper', 'Cotton Bollworm', 
  'Corn Borer', 'Whitefly', 'Diamondback Moth', 'Colorado Potato Beetle',
  'Aphid', 'Migratory Locust', 'Cabbage Looper', 'Stink Bug', 'Beet Fly'
];

const locations = [
  'Adana, Turkey', 'Mersin, Turkey', 'Konya, Turkey', 'Antalya, Turkey',
  'Bursa, Turkey', 'Izmir, Turkey', 'Sanliurfa, Turkey', 'Aydin, Turkey',
  'Manisa, Turkey', 'Tekirdag, Turkey'
];

const models = ['EfficientNet-B4', 'Vision Transformer (ViT)'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysBack));
  date.setHours(getRandomInt(6, 18));
  date.setMinutes(getRandomInt(0, 59));
  return date;
}

async function seedHistory() {
  try {
    const records = [];
    for (let i = 0; i < 55; i++) {
      records.push({
        label: pests[Math.floor(Math.random() * pests.length)],
        confidence: parseFloat(getRandomFloat(70.0, 80.0)),
        modelName: models[Math.floor(Math.random() * models.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        createdAt: getRandomDate(90),
        updatedAt: new Date()
      });
    }

    // Clear old records first
    await Analysis.destroy({ where: {} });
    await Analysis.bulkCreate(records);
    console.log(`Successfully inserted ${records.length} fake diagnostic records.`);
  } catch (error) {
    console.error('Error seeding history:', error);
  }
}

seedHistory();
