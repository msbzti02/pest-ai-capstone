/**
 * PestGuard AI — Economics Engine
 * 
 * Ported from old_version/backend/economics.py (456 lines)
 * 
 * Features:
 *   - 13 crops with regional prices (Turkey 2024-2025)
 *   - Per-pest yield loss at 4 infestation levels
 *   - Treatment costs (10 methods)
 *   - Crop growth stages with vulnerability matrix
 *   - Chemical restrictions per stage
 *   - ROI comparison (IPM vs Chemical vs Organic)
 */

// ── Crop Economics Database ──
export const CROP_ECONOMICS = {
  rice: { name: "Rice", price_per_ton: 850, avg_yield_tons_ha: 6.5, season: "Jun-Nov", currency: "USD" },
  wheat: { name: "Wheat", price_per_ton: 320, avg_yield_tons_ha: 4.2, season: "Oct-Jun", currency: "USD" },
  corn: { name: "Corn", price_per_ton: 250, avg_yield_tons_ha: 8.5, season: "Apr-Sep", currency: "USD" },
  cotton: { name: "Cotton", price_per_ton: 1800, avg_yield_tons_ha: 1.8, season: "Apr-Oct", currency: "USD" },
  soybean: { name: "Soybean", price_per_ton: 500, avg_yield_tons_ha: 2.8, season: "May-Oct", currency: "USD" },
  tomato: { name: "Tomato", price_per_ton: 400, avg_yield_tons_ha: 55.0, season: "Mar-Sep", currency: "USD" },
  potato: { name: "Potato", price_per_ton: 200, avg_yield_tons_ha: 30.0, season: "Mar-Aug", currency: "USD" },
  sunflower: { name: "Sunflower", price_per_ton: 450, avg_yield_tons_ha: 2.5, season: "Apr-Sep", currency: "USD" },
  barley: { name: "Barley", price_per_ton: 280, avg_yield_tons_ha: 3.8, season: "Oct-Jun", currency: "USD" },
  grape: { name: "Grape", price_per_ton: 600, avg_yield_tons_ha: 12.0, season: "Mar-Oct", currency: "USD" },
  olive: { name: "Olive", price_per_ton: 900, avg_yield_tons_ha: 3.0, season: "Year-round", currency: "USD" },
  citrus: { name: "Citrus", price_per_ton: 350, avg_yield_tons_ha: 25.0, season: "Year-round", currency: "USD" },
  cabbage: { name: "Cabbage", price_per_ton: 150, avg_yield_tons_ha: 40.0, season: "Mar-Nov", currency: "USD" },
};

// ── Yield Loss Percentages ──
// pest_key: { light, moderate, severe, critical }
export const PEST_YIELD_LOSS = {
  "Rice Leafhopper": { light: 5, moderate: 15, severe: 30, critical: 50 },
  "Fall Armyworm": { light: 8, moderate: 20, severe: 40, critical: 65 },
  "Green Peach Aphid": { light: 3, moderate: 10, severe: 20, critical: 35 },
  "Aphid": { light: 3, moderate: 10, severe: 22, critical: 38 },
  "Corn Borer": { light: 5, moderate: 15, severe: 30, critical: 50 },
  "Whitefly": { light: 4, moderate: 12, severe: 25, critical: 40 },
  "Migratory Locust": { light: 15, moderate: 40, severe: 70, critical: 95 },
  "Brown Planthopper": { light: 8, moderate: 22, severe: 45, critical: 70 },
  "Diamondback Moth": { light: 5, moderate: 15, severe: 35, critical: 55 },
  "Cotton Bollworm": { light: 7, moderate: 18, severe: 35, critical: 55 },
  "Rice Leaf Roller": { light: 4, moderate: 12, severe: 25, critical: 40 },
  "Beet Armyworm": { light: 5, moderate: 15, severe: 30, critical: 50 },
  "Colorado Potato Beetle": { light: 6, moderate: 18, severe: 35, critical: 60 },
  "Thrips": { light: 3, moderate: 10, severe: 20, critical: 35 },
  "Red Spider Mite": { light: 4, moderate: 12, severe: 25, critical: 40 },
  "Stink Bug": { light: 3, moderate: 10, severe: 20, critical: 35 },
  "Cabbage Looper": { light: 4, moderate: 12, severe: 28, critical: 45 },
  "Citrus Leaf Miner": { light: 3, moderate: 8, severe: 18, critical: 30 },
  "Mole Cricket": { light: 5, moderate: 15, severe: 30, critical: 50 },
  // Default for unknown pests
  _default: { light: 5, moderate: 15, severe: 30, critical: 50 },
};

// ── Treatment Costs per Hectare (USD) ──
export const TREATMENT_COSTS_PER_HA = {
  inspection: { name: "Inspection/Scouting", cost: 15, recurring: true },
  biological: { name: "Biological Control", cost: 80, recurring: false },
  chemical: { name: "Chemical Pesticide", cost: 120, recurring: true },
  organic: { name: "Organic Pesticide", cost: 65, recurring: true },
  ipm: { name: "Integrated Pest Management", cost: 150, recurring: false },
  cultural: { name: "Cultural Methods", cost: 30, recurring: false },
  mechanical: { name: "Mechanical Removal", cost: 50, recurring: true },
  genetic: { name: "Resistant Varieties", cost: 200, recurring: false },
  regulatory: { name: "Regulatory/Extension", cost: 0, recurring: false },
  resistance_mgmt: { name: "Resistance Management", cost: 40, recurring: false },
};

// ── Crop Growth Stages ──
export const CROP_GROWTH_STAGES = {
  rice: [
    { stage: "Seedling", days: "0-20", vulnerability: "Medium" },
    { stage: "Tillering", days: "20-45", vulnerability: "High" },
    { stage: "Booting", days: "45-65", vulnerability: "High" },
    { stage: "Heading", days: "65-80", vulnerability: "Critical" },
    { stage: "Grain Filling", days: "80-110", vulnerability: "Medium" },
    { stage: "Maturity", days: "110-130", vulnerability: "Low" },
  ],
  corn: [
    { stage: "Emergence", days: "0-10", vulnerability: "Low" },
    { stage: "Vegetative (V1-V6)", days: "10-35", vulnerability: "Medium" },
    { stage: "Vegetative (V7-VT)", days: "35-55", vulnerability: "High" },
    { stage: "Silking (R1)", days: "55-65", vulnerability: "Critical" },
    { stage: "Grain Fill (R2-R4)", days: "65-90", vulnerability: "High" },
    { stage: "Maturity (R5-R6)", days: "90-120", vulnerability: "Low" },
  ],
  wheat: [
    { stage: "Germination", days: "0-15", vulnerability: "Low" },
    { stage: "Tillering", days: "15-60", vulnerability: "Medium" },
    { stage: "Stem Extension", days: "60-90", vulnerability: "High" },
    { stage: "Heading", days: "90-110", vulnerability: "Critical" },
    { stage: "Grain Fill", days: "110-140", vulnerability: "High" },
    { stage: "Maturity", days: "140-170", vulnerability: "Low" },
  ],
  cotton: [
    { stage: "Emergence", days: "0-15", vulnerability: "Low" },
    { stage: "Squaring", days: "35-55", vulnerability: "High" },
    { stage: "Flowering", days: "55-80", vulnerability: "Critical" },
    { stage: "Boll Development", days: "80-120", vulnerability: "High" },
    { stage: "Boll Open", days: "120-160", vulnerability: "Medium" },
  ],
  tomato: [
    { stage: "Transplant", days: "0-14", vulnerability: "Medium" },
    { stage: "Vegetative", days: "14-40", vulnerability: "Medium" },
    { stage: "Flowering", days: "40-60", vulnerability: "High" },
    { stage: "Fruit Set", days: "60-80", vulnerability: "Critical" },
    { stage: "Ripening", days: "80-110", vulnerability: "Medium" },
  ],
  potato: [
    { stage: "Sprouting", days: "0-20", vulnerability: "Low" },
    { stage: "Vegetative", days: "20-40", vulnerability: "Medium" },
    { stage: "Tuber Initiation", days: "40-55", vulnerability: "High" },
    { stage: "Tuber Bulking", days: "55-90", vulnerability: "Critical" },
    { stage: "Maturation", days: "90-120", vulnerability: "Medium" },
  ],
};

// ── Stage Vulnerability Matrix ──
export const STAGE_VULNERABILITY = [
  { pest: "Fall Armyworm", crop: "corn", stage: "Vegetative (V1-V6)", risk_multiplier: 1.5, note: "Larvae prefer young whorls" },
  { pest: "Fall Armyworm", crop: "corn", stage: "Silking (R1)", risk_multiplier: 2.0, note: "Can attack ear directly" },
  { pest: "Rice Leafhopper", crop: "rice", stage: "Tillering", risk_multiplier: 1.8, note: "Peak feeding damage" },
  { pest: "Rice Leafhopper", crop: "rice", stage: "Heading", risk_multiplier: 2.0, note: "Tungro virus maximum impact" },
  { pest: "Brown Planthopper", crop: "rice", stage: "Booting", risk_multiplier: 1.6, note: "Hopper burn risk increases" },
  { pest: "Brown Planthopper", crop: "rice", stage: "Heading", risk_multiplier: 2.0, note: "Maximum vulnerability" },
  { pest: "Cotton Bollworm", crop: "cotton", stage: "Flowering", risk_multiplier: 2.0, note: "Targets squares and flowers" },
  { pest: "Cotton Bollworm", crop: "cotton", stage: "Boll Development", risk_multiplier: 1.8, note: "Direct boll damage" },
  { pest: "Corn Borer", crop: "corn", stage: "Vegetative (V7-VT)", risk_multiplier: 1.5, note: "Larvae bore into stalks" },
  { pest: "Corn Borer", crop: "corn", stage: "Silking (R1)", risk_multiplier: 1.8, note: "Ear and shank tunneling" },
  { pest: "Whitefly", crop: "tomato", stage: "Flowering", risk_multiplier: 1.5, note: "Virus transmission risk" },
  { pest: "Whitefly", crop: "tomato", stage: "Fruit Set", risk_multiplier: 1.8, note: "Honeydew reduces fruit quality" },
  { pest: "Colorado Potato Beetle", crop: "potato", stage: "Vegetative", risk_multiplier: 1.5, note: "Rapid defoliation" },
  { pest: "Colorado Potato Beetle", crop: "potato", stage: "Tuber Bulking", risk_multiplier: 2.0, note: "Defoliation reduces tuber size" },
  { pest: "Diamondback Moth", crop: "cabbage", stage: "Vegetative", risk_multiplier: 1.5, note: "Seedling destruction" },
  { pest: "Aphid", crop: "wheat", stage: "Heading", risk_multiplier: 1.8, note: "Grain filling disruption" },
  { pest: "Thrips", crop: "cotton", stage: "Squaring", risk_multiplier: 1.6, note: "Square shedding" },
  { pest: "Cabbage Looper", crop: "cabbage", stage: "Vegetative", risk_multiplier: 1.5, note: "Defoliation of wrapper leaves" },
];

// ── Chemical Restrictions by Growth Stage ──
export const CHEMICAL_RESTRICTIONS = {
  heading: {
    restricted: ["organophosphate", "carbamate"],
    reason: "Pre-harvest interval not met",
    allowed: ["Bt", "spinosad", "neem"],
  },
  grain_filling: {
    restricted: ["all_systemic"],
    reason: "Residue risk in harvested grain",
    allowed: ["biological_only"],
  },
  flowering: {
    restricted: ["neonicotinoid", "organophosphate"],
    reason: "Pollinator protection during flowering",
    allowed: ["Bt", "spinosad", "selective_insecticide"],
  },
  ripening: {
    restricted: ["all_chemical"],
    reason: "Pre-harvest interval violation risk",
    allowed: ["mechanical", "cultural"],
  },
};

/**
 * Calculate economic impact of pest infestation
 */
export function calculateEconomicImpact({ pest_name, crop, field_size_ha = 1, infestation_level = "moderate" }) {
  const cropData = CROP_ECONOMICS[crop.toLowerCase()] || CROP_ECONOMICS.rice;
  const yieldLoss = PEST_YIELD_LOSS[pest_name] || PEST_YIELD_LOSS._default;
  const lossPercent = yieldLoss[infestation_level] || yieldLoss.moderate;

  const totalYield = cropData.avg_yield_tons_ha * field_size_ha;
  const totalValue = totalYield * cropData.price_per_ton;
  const yieldLossAmount = totalYield * (lossPercent / 100);
  const financialLoss = totalValue * (lossPercent / 100);
  const remainingValue = totalValue - financialLoss;

  // Treatment cost analysis
  const treatments = {
    ipm: { ...TREATMENT_COSTS_PER_HA.ipm, total: TREATMENT_COSTS_PER_HA.ipm.cost * field_size_ha },
    chemical: { ...TREATMENT_COSTS_PER_HA.chemical, total: TREATMENT_COSTS_PER_HA.chemical.cost * field_size_ha },
    organic: { ...TREATMENT_COSTS_PER_HA.organic, total: TREATMENT_COSTS_PER_HA.organic.cost * field_size_ha },
    biological: { ...TREATMENT_COSTS_PER_HA.biological, total: TREATMENT_COSTS_PER_HA.biological.cost * field_size_ha },
  };

  // ROI: (saved value - treatment cost) / treatment cost * 100
  const calcROI = (saved_pct, treatment_cost) => {
    const saved = totalValue * (saved_pct / 100);
    return treatment_cost > 0 ? Math.round(((saved - treatment_cost) / treatment_cost) * 100) : 0;
  };

  const roi = {
    ipm: { effectiveness: 75, roi: calcROI(lossPercent * 0.75, treatments.ipm.total) },
    chemical: { effectiveness: 85, roi: calcROI(lossPercent * 0.85, treatments.chemical.total) },
    organic: { effectiveness: 60, roi: calcROI(lossPercent * 0.60, treatments.organic.total) },
  };

  // Urgency classification
  let urgency = "LOW";
  if (lossPercent >= 50) urgency = "EMERGENCY";
  else if (lossPercent >= 30) urgency = "HIGH";
  else if (lossPercent >= 15) urgency = "MODERATE";

  return {
    crop: cropData,
    pest_name,
    field_size_ha,
    infestation_level,
    yield_loss_percent: lossPercent,
    total_yield_tons: totalYield,
    yield_loss_tons: yieldLossAmount,
    total_value_usd: totalValue,
    financial_loss_usd: financialLoss,
    remaining_value_usd: remainingValue,
    treatments,
    roi_comparison: roi,
    urgency,
  };
}

/**
 * Get crop growth stage advice for pest management
 */
export function getCropStageAdvice({ pest_name, crop, growth_stage }) {
  const stages = CROP_GROWTH_STAGES[crop.toLowerCase()];
  if (!stages) {
    return { error: `Crop '${crop}' not found in growth stage database` };
  }

  const stageInfo = stages.find(s => s.stage.toLowerCase() === growth_stage.toLowerCase());
  if (!stageInfo) {
    return { error: `Stage '${growth_stage}' not found for ${crop}`, available_stages: stages.map(s => s.stage) };
  }

  // Find vulnerability modifiers
  const vulnEntries = STAGE_VULNERABILITY.filter(
    v => v.pest.toLowerCase() === pest_name.toLowerCase() && v.crop.toLowerCase() === crop.toLowerCase()
  );

  const matchedVuln = vulnEntries.find(v => v.stage === growth_stage);

  // Check chemical restrictions
  const stageKey = growth_stage.toLowerCase().replace(/\s+/g, '_');
  const restrictions = CHEMICAL_RESTRICTIONS[stageKey] || null;

  return {
    pest_name,
    crop,
    stage: stageInfo,
    vulnerability: matchedVuln || { risk_multiplier: 1.0, note: "No specific vulnerability data" },
    chemical_restrictions: restrictions,
    all_stages: stages,
  };
}

export default { CROP_ECONOMICS, PEST_YIELD_LOSS, TREATMENT_COSTS_PER_HA, CROP_GROWTH_STAGES };
