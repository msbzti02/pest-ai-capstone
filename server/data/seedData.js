/**
 * PestGuard AI — Demo Seed Data
 * 
 * Provides realistic mock data so every page is populated
 * for demo/testing purposes. This can be removed once real
 * predictions start flowing from the ML Service.
 */

export const MOCK_PREDICTIONS = [
  { label: "Fall Armyworm", confidence: 0.94, modelName: "efficientnet", imageFilename: "corn_sample_1.jpg", location: "Adana, Turkey" },
  { label: "Rice Leafhopper", confidence: 0.87, modelName: "efficientnet", imageFilename: "rice_field_2.jpg", location: "Edirne, Turkey" },
  { label: "Cotton Bollworm", confidence: 0.91, modelName: "vit", imageFilename: "cotton_pest_3.jpg", location: "Şanlıurfa, Turkey" },
  { label: "Whitefly", confidence: 0.78, modelName: "efficientnet", imageFilename: "tomato_leaf_4.jpg", location: "Antalya, Turkey" },
  { label: "Brown Planthopper", confidence: 0.89, modelName: "vit", imageFilename: "rice_paddy_5.jpg", location: "Samsun, Turkey" },
  { label: "Aphid", confidence: 0.82, modelName: "efficientnet", imageFilename: "wheat_head_6.jpg", location: "Konya, Turkey" },
  { label: "Corn Borer", confidence: 0.96, modelName: "vit", imageFilename: "corn_stalk_7.jpg", location: "Gaziantep, Turkey" },
  { label: "Diamondback Moth", confidence: 0.73, modelName: "efficientnet", imageFilename: "cabbage_8.jpg", location: "Bursa, Turkey" },
  { label: "Thrips", confidence: 0.85, modelName: "efficientnet", imageFilename: "onion_leaf_9.jpg", location: "İzmir, Turkey" },
  { label: "Colorado Potato Beetle", confidence: 0.92, modelName: "vit", imageFilename: "potato_10.jpg", location: "Ankara, Turkey" },
  { label: "Migratory Locust", confidence: 0.97, modelName: "vit", imageFilename: "field_11.jpg", location: "Diyarbakır, Turkey" },
  { label: "Red Spider Mite", confidence: 0.71, modelName: "efficientnet", imageFilename: "leaf_mite_12.jpg", location: "Denizli, Turkey" },
  { label: "Citrus Leaf Miner", confidence: 0.88, modelName: "efficientnet", imageFilename: "citrus_13.jpg", location: "Mersin, Turkey" },
  { label: "Cabbage Looper", confidence: 0.80, modelName: "vit", imageFilename: "cabbage_14.jpg", location: "Hatay, Turkey" },
  { label: "Stink Bug", confidence: 0.76, modelName: "efficientnet", imageFilename: "soybean_15.jpg", location: "Istanbul, Turkey" },
];

/**
 * Seed the database with mock prediction history
 */
export async function seedMockData(Analysis, Feedback, TreatmentPlan) {
  try {
    // Check if we already have data
    const existingCount = await Analysis.count();
    if (existingCount > 0) {
      console.log(`   📊 ${existingCount} existing analyses found — skipping seed.`);
      return;
    }

    console.log("   🌱 Seeding demo data for testing...");

    // Seed predictions with staggered dates (last 30 days)
    for (let i = 0; i < MOCK_PREDICTIONS.length; i++) {
      const pred = MOCK_PREDICTIONS[i];
      const daysAgo = Math.floor(i * 2) + Math.floor(Math.random() * 2);
      await Analysis.create({
        label: pred.label,
        confidence: pred.confidence,
        modelName: pred.modelName,
        imageFilename: pred.imageFilename,
        location: pred.location,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      });
    }

    // Seed some feedback entries
    const feedbackEntries = [
      { rating: 5, comment: "Correctly identified Fall Armyworm on my corn field!", predictionPest: "Fall Armyworm", actualPest: "Fall Armyworm", isCorrect: true, confidence: 0.94 },
      { rating: 4, comment: "Good detection but treatment advice could be more specific.", predictionPest: "Rice Leafhopper", actualPest: "Rice Leafhopper", isCorrect: true, confidence: 0.87 },
      { rating: 3, comment: "Identified as Whitefly but it was actually Silverleaf Whitefly.", predictionPest: "Whitefly", actualPest: "Silverleaf Whitefly", isCorrect: false, confidence: 0.78 },
      { rating: 5, comment: "Excellent! Fast and accurate detection of locust swarm.", predictionPest: "Migratory Locust", actualPest: "Migratory Locust", isCorrect: true, confidence: 0.97 },
      { rating: 4, comment: "Worked well for identifying aphid colony on wheat.", predictionPest: "Aphid", actualPest: "Aphid", isCorrect: true, confidence: 0.82 },
    ];

    for (const fb of feedbackEntries) {
      await Feedback.create(fb);
    }

    // Seed a treatment plan
    const { PEST_DATABASE } = await import('./pestDatabase.js');
    const armywormTreatment = PEST_DATABASE["Fall Armyworm"]?.treatment || [];
    await TreatmentPlan.create({
      sessionId: 'demo-session',
      pestName: 'Fall Armyworm',
      crop: 'corn',
      fieldSizeHa: 5,
      status: 'active',
      steps: JSON.stringify(armywormTreatment.map((step, idx) => ({
        ...step,
        completed: idx < 2, // First 2 steps already done
        completedAt: idx < 2 ? new Date(Date.now() - (4 - idx) * 24 * 60 * 60 * 1000).toISOString() : null,
      }))),
      progress: 50,
    });

    console.log(`   ✅ Seeded: ${MOCK_PREDICTIONS.length} predictions, ${feedbackEntries.length} feedbacks, 1 treatment plan`);
  } catch (err) {
    console.error("   ⚠️ Seed data error (non-fatal):", err.message);
  }
}

export default { MOCK_PREDICTIONS, seedMockData };
