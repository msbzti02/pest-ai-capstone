/**
 * PestGuard AI — Risk Assessment Engine
 * 
 * Ported from old_version/backend/risk_engine.py (357 lines)
 * 
 * Features:
 *   - 5-factor weighted risk score (0-100)
 *   - Seasonal risk calendar
 *   - Historical trend tracking
 *   - Regional outbreak alerts
 *   - Pest lifecycle visualization data
 */

// ── Pest Base Severity Scores (0-100) ──
export const PEST_BASE_SEVERITY = {
  "Rice Leafhopper": 72, "Fall Armyworm": 85, "Green Peach Aphid": 45,
  "Aphid": 42, "Corn Borer": 65, "Whitefly": 50, "Migratory Locust": 95,
  "Brown Planthopper": 78, "Diamondback Moth": 68, "Cotton Bollworm": 75,
  "Rice Leaf Roller": 60, "Rice Leaf Caterpillar": 62, "Paddy Stem Maggot": 48,
  "Asiatic Rice Borer": 70, "Yellow Rice Borer": 72, "Beet Fly": 35,
  "Beet Armyworm": 65, "Wheat Aphid": 40, "Wheat Midge": 45,
  "Peach Borer": 55, "Cabbage Looper": 48, "Thrips": 42,
  "Colorado Potato Beetle": 70, "Red Spider Mite": 50, "Mole Cricket": 45,
  "Stink Bug": 40, "Spotted Lanternfly": 60, "Citrus Leaf Miner": 38,
};

// ── Seasonal Risk Factors (Northern Hemisphere) ──
const SEASON_RISK = {
  1: 0.3, 2: 0.35, 3: 0.5, 4: 0.7, 5: 0.85, 6: 1.0,
  7: 1.0, 8: 0.95, 9: 0.8, 10: 0.6, 11: 0.4, 12: 0.3,
};

// ── Risk Score Weights ──
const WEIGHTS = {
  pest_severity: 0.30,
  weather: 0.25,
  season: 0.20,
  region: 0.15,
  confidence: 0.10,
};

// ── Pest Lifecycle Data ──
export const PEST_LIFECYCLE = {
  "Fall Armyworm": {
    stages: [
      { name: "Egg", duration_days: "2-4", vulnerability: "High", control: "Trichogramma parasitoids", color: "#fbbf24" },
      { name: "Larva (1-3 instar)", duration_days: "7-10", vulnerability: "Very High", control: "Bt spray most effective", color: "#ef4444" },
      { name: "Larva (4-6 instar)", duration_days: "7-10", vulnerability: "Medium", control: "Chemical control needed", color: "#f97316" },
      { name: "Pupa", duration_days: "8-12", vulnerability: "Low", control: "Soil tillage disrupts pupation", color: "#8b5cf6" },
      { name: "Adult Moth", duration_days: "10-14", vulnerability: "Medium", control: "Pheromone traps, light traps", color: "#3b82f6" },
    ],
    total_days: "30-60",
    critical_window: "Early larval stage (days 3-12) — Bt most effective",
  },
  "Rice Leafhopper": {
    stages: [
      { name: "Egg", duration_days: "5-8", vulnerability: "Low", control: "Egg parasitoids", color: "#fbbf24" },
      { name: "Nymph (1-3 instar)", duration_days: "8-12", vulnerability: "High", control: "Neem oil spray", color: "#ef4444" },
      { name: "Nymph (4-5 instar)", duration_days: "5-8", vulnerability: "Medium", control: "Imidacloprid if needed", color: "#f97316" },
      { name: "Adult", duration_days: "15-20", vulnerability: "Medium", control: "Light traps, sweep nets", color: "#3b82f6" },
    ],
    total_days: "30-40",
    critical_window: "Young nymph stage (days 5-17) — maximum vulnerability",
  },
  "Brown Planthopper": {
    stages: [
      { name: "Egg", duration_days: "5-9", vulnerability: "Low", control: "Resistant rice varieties", color: "#fbbf24" },
      { name: "Nymph", duration_days: "12-18", vulnerability: "High", control: "Pymetrozine spray", color: "#ef4444" },
      { name: "Adult", duration_days: "10-15", vulnerability: "Medium", control: "Light traps, field drainage", color: "#3b82f6" },
    ],
    total_days: "25-35",
    critical_window: "Nymph stage (days 5-25) — drain paddy + selective insecticide",
  },
  "Corn Borer": {
    stages: [
      { name: "Egg Mass", duration_days: "3-7", vulnerability: "Very High", control: "Trichogramma release", color: "#fbbf24" },
      { name: "Young Larva", duration_days: "7-14", vulnerability: "High", control: "Bt granules in whorl", color: "#ef4444" },
      { name: "Boring Larva", duration_days: "14-21", vulnerability: "Low", control: "Systemic insecticide only", color: "#f97316" },
      { name: "Pupa", duration_days: "7-14", vulnerability: "Low", control: "Stalk destruction post-harvest", color: "#8b5cf6" },
      { name: "Adult Moth", duration_days: "5-10", vulnerability: "Medium", control: "Light traps, pheromone traps", color: "#3b82f6" },
    ],
    total_days: "40-65",
    critical_window: "Egg to young larva (days 1-18) — after boring, control is difficult",
  },
  "Cotton Bollworm": {
    stages: [
      { name: "Egg", duration_days: "3-5", vulnerability: "High", control: "Trichogramma parasitoids", color: "#fbbf24" },
      { name: "Young Larva", duration_days: "5-7", vulnerability: "Very High", control: "HaNPV + Bt combo", color: "#ef4444" },
      { name: "Mature Larva", duration_days: "10-15", vulnerability: "Medium", control: "Chlorantraniliprole spray", color: "#f97316" },
      { name: "Pupa (soil)", duration_days: "10-14", vulnerability: "Low", control: "Deep plowing", color: "#8b5cf6" },
      { name: "Adult Moth", duration_days: "7-10", vulnerability: "Medium", control: "Light traps, mating disruption", color: "#3b82f6" },
    ],
    total_days: "30-40",
    critical_window: "Young larva (days 3-10) — before they bore into bolls",
  },
};

// Default lifecycle for pests without detailed data
const DEFAULT_LIFECYCLE = {
  stages: [
    { name: "Egg", duration_days: "3-7", vulnerability: "Medium", control: "Egg parasitoids or removal", color: "#fbbf24" },
    { name: "Larva/Nymph", duration_days: "10-20", vulnerability: "High", control: "Targeted control most effective", color: "#ef4444" },
    { name: "Pupa/Pre-adult", duration_days: "7-14", vulnerability: "Low", control: "Cultural methods", color: "#8b5cf6" },
    { name: "Adult", duration_days: "10-20", vulnerability: "Medium", control: "Traps and monitoring", color: "#3b82f6" },
  ],
  total_days: "30-60",
  critical_window: "Larval/nymph stage — highest vulnerability to control measures",
};

// ── In-memory Trend Storage ──
const trendData = [];
const MAX_TREND_RECORDS = 500;

/**
 * Calculate multi-factor pest risk score (0-100)
 */
export function calculateRiskScore({ pest_name, confidence = 0.8, temperature = 25, humidity = 60, wind_speed = 10, lat = 39, lon = 35 }) {
  // Factor 1: Pest severity
  const baseSeverity = PEST_BASE_SEVERITY[pest_name] || 50;
  const pestScore = baseSeverity;

  // Factor 2: Weather conditions
  let weatherScore = 10; // Start low! Only add risk if conditions are ideal for pests.
  if (temperature >= 20 && temperature <= 35) weatherScore += 40;
  if (humidity >= 60 && humidity <= 85) weatherScore += 30;
  if (wind_speed < 15) weatherScore += 10;
  if (temperature >= 25 && humidity >= 70) weatherScore += 10; // Hot + humid = pest paradise
  weatherScore = Math.min(100, weatherScore);

  // Factor 3: Season
  const month = new Date().getMonth() + 1;
  const seasonScore = (SEASON_RISK[month] || 0.5) * 100;

  // Factor 4: Region (Turkey agricultural regions)
  let regionScore = 20; // Start low (default for non-agricultural hotspots)
  if (lat >= 36 && lat <= 42 && lon >= 26 && lon <= 45) {
    regionScore = 50; // Turkey mainland — agricultural heartland
    if (lat >= 37 && lat <= 38 && lon >= 32 && lon <= 37) regionScore = 75; // Konya-Aksaray (high agriculture)
    if (lat >= 36 && lat <= 37 && lon >= 34 && lon <= 36) regionScore = 90; // Adana-Mersin (Çukurova)
  }

  // Factor 5: Confidence
  const confidenceScore = confidence * 100;

  // Weighted combination
  const totalScore = Math.round(
    pestScore * WEIGHTS.pest_severity +
    weatherScore * WEIGHTS.weather +
    seasonScore * WEIGHTS.season +
    regionScore * WEIGHTS.region +
    confidenceScore * WEIGHTS.confidence
  );

  // Risk level classification
  let risk_level, color;
  if (totalScore >= 80) { risk_level = "CRITICAL"; color = "#ef4444"; }
  else if (totalScore >= 60) { risk_level = "HIGH"; color = "#f97316"; }
  else if (totalScore >= 40) { risk_level = "MODERATE"; color = "#eab308"; }
  else if (totalScore >= 20) { risk_level = "LOW"; color = "#22c55e"; }
  else { risk_level = "MINIMAL"; color = "#3b82f6"; }

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    risk_level,
    color,
    factors: {
      pest_severity: { score: pestScore, weight: WEIGHTS.pest_severity, label: "Pest Severity" },
      weather: { score: weatherScore, weight: WEIGHTS.weather, label: "Weather Conditions" },
      season: { score: seasonScore, weight: WEIGHTS.season, label: "Seasonal Risk" },
      region: { score: regionScore, weight: WEIGHTS.region, label: "Regional Risk" },
      confidence: { score: Math.round(confidenceScore), weight: WEIGHTS.confidence, label: "Detection Confidence" },
    },
    recommendations: generateRiskRecommendations(totalScore, pest_name),
  };
}

function generateRiskRecommendations(score, pestName) {
  const recs = [];
  if (score >= 80) {
    recs.push("🚨 Immediate action required. Begin treatment within 24 hours.");
    recs.push("📞 Contact local agricultural extension service.");
    recs.push("🔄 Monitor daily until risk subsides.");
  } else if (score >= 60) {
    recs.push("⚠️ Begin scouting fields within 48 hours.");
    recs.push("🧪 Prepare treatment materials as standby.");
    recs.push("📊 Increase monitoring frequency to every 2-3 days.");
  } else if (score >= 40) {
    recs.push("👁️ Weekly monitoring recommended.");
    recs.push("🌱 Consider preventive cultural measures.");
  } else {
    recs.push("✅ Low risk. Maintain routine monitoring schedule.");
  }
  return recs;
}

/**
 * Record a prediction for trend tracking
 */
export function recordPrediction({ pest_name, confidence, location = null, timestamp = null }) {
  const record = {
    pest_name,
    confidence,
    location,
    timestamp: timestamp || new Date().toISOString(),
    week: getWeekNumber(new Date()),
  };
  trendData.push(record);
  if (trendData.length > MAX_TREND_RECORDS) {
    trendData.shift();
  }
  return record;
}

/**
 * Get historical trend data
 */
export function getTrendData({ pest_name = null, weeks = 8 } = {}) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

  let filtered = trendData.filter(r => new Date(r.timestamp) >= cutoff);
  if (pest_name) {
    filtered = filtered.filter(r => r.pest_name === pest_name);
  }

  // Group by week
  const weeklyGroups = {};
  filtered.forEach(r => {
    const weekKey = r.week;
    if (!weeklyGroups[weekKey]) {
      weeklyGroups[weekKey] = { week: weekKey, count: 0, pests: {} };
    }
    weeklyGroups[weekKey].count++;
    weeklyGroups[weekKey].pests[r.pest_name] = (weeklyGroups[weekKey].pests[r.pest_name] || 0) + 1;
  });

  // Week-over-week comparison
  const weeks_data = Object.values(weeklyGroups).sort((a, b) => a.week - b.week);
  for (let i = 1; i < weeks_data.length; i++) {
    const prev = weeks_data[i - 1].count;
    const curr = weeks_data[i].count;
    weeks_data[i].change = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
    weeks_data[i].trend = curr > prev ? "increasing" : curr < prev ? "decreasing" : "stable";
  }
  if (weeks_data.length > 0) {
    weeks_data[0].change = 0;
    weeks_data[0].trend = "baseline";
  }

  return {
    total_records: filtered.length,
    period_weeks: weeks,
    weekly: weeks_data,
  };
}

/**
 * Check for regional outbreak alerts from sighting/prediction data
 */
export function checkOutbreakAlerts(sightings = []) {
  const alerts = [];
  const regionCounts = {};

  sightings.forEach(s => {
    const regionKey = `${Math.round(s.lat)}_${Math.round(s.lng || s.lon)}`;
    if (!regionCounts[regionKey]) {
      regionCounts[regionKey] = { lat: s.lat, lng: s.lng || s.lon, pests: {}, total: 0 };
    }
    const pest = s.pestType || s.pest_name;
    regionCounts[regionKey].pests[pest] = (regionCounts[regionKey].pests[pest] || 0) + 1;
    regionCounts[regionKey].total++;
  });

  for (const [key, region] of Object.entries(regionCounts)) {
    if (region.total >= 5) {
      const topPest = Object.entries(region.pests).sort((a, b) => b[1] - a[1])[0];
      alerts.push({
        type: region.total >= 10 ? "CRITICAL" : "WARNING",
        region: `${region.lat.toFixed(1)}°N, ${region.lng.toFixed(1)}°E`,
        lat: region.lat,
        lng: region.lng,
        total_reports: region.total,
        dominant_pest: topPest[0],
        dominant_count: topPest[1],
        message: region.total >= 10
          ? `🚨 Critical outbreak: ${topPest[1]} reports of ${topPest[0]} near ${region.lat.toFixed(1)}°N`
          : `⚠️ Elevated activity: ${region.total} pest reports near ${region.lat.toFixed(1)}°N`,
      });
    }
  }

  return alerts.sort((a, b) => b.total_reports - a.total_reports);
}

/**
 * Get pest lifecycle visualization data
 */
export function getPestLifecycle(pest_name) {
  const lifecycle = PEST_LIFECYCLE[pest_name] || DEFAULT_LIFECYCLE;
  return {
    pest_name,
    has_detailed_data: !!PEST_LIFECYCLE[pest_name],
    ...lifecycle,
  };
}

// ── Utility ──
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default {
  calculateRiskScore,
  recordPrediction,
  getTrendData,
  checkOutbreakAlerts,
  getPestLifecycle,
  PEST_BASE_SEVERITY,
  PEST_LIFECYCLE,
};
