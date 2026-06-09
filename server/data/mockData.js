/**
 * PestGuard AI — Mock / Fallback Data
 * 
 * Ported from old_version/backend/mock_api.py
 * 
 * Provides:
 *   - VLM pest descriptions (27 species)
 *   - Heatmap seed data (15 Turkish cities)
 *   - Image quality scoring logic
 *   - Activity feed storage
 */

// ── VLM Pest Descriptions (simulated Gemini Vision output) ──
export const VLM_DESCRIPTIONS = {
  "Rice Leafhopper": "The image shows a small, green, wedge-shaped insect approximately 3-5mm long resting on a rice leaf. It has characteristic longitudinal markings along its wings and prominent compound eyes. The body color ranges from pale green to yellowish-green with darker wing veins visible.",
  "Fall Armyworm": "A striped caterpillar approximately 30-35mm long with distinctive inverted 'Y' marking on its head capsule. The body shows alternating light and dark longitudinal stripes with dark dorsal spots. Feeding damage visible on the surrounding corn leaf tissue.",
  "Green Peach Aphid": "Cluster of small, pear-shaped green insects on the underside of a leaf. Individual aphids are approximately 1.5-2.5mm with long antennae and cornicles (tube-like structures) at the rear. Some winged alates visible among wingless nymphs.",
  "Aphid": "Dense colony of small sap-sucking insects aggregated on a young stem. Body color varies from green to yellowish. Honeydew deposits visible as a shiny film on surrounding leaves. Some natural predator damage (lacewing marks) visible nearby.",
  "Corn Borer": "Exit hole visible in corn stalk with frass (sawdust-like excrement) accumulation. Larva partially visible inside the tunnel — creamy white with a brown head capsule, approximately 20-25mm long. Stalk shows discoloration around the bore entrance.",
  "Whitefly": "Cloud of tiny white flying insects (~1.5mm wingspan) on the underside of a tomato leaf. Wings are covered in white waxy powder. Yellowing of leaves (chlorosis) and honeydew droplets visible. Immature stages (nymphs) appear as flattened, scale-like structures.",
  "Migratory Locust": "Large grasshopper approximately 45-55mm in body length, brownish coloring with darker wing markings. Powerful hind legs adapted for jumping. Visible mandibles suitable for chewing plant material. Field context shows significant defoliation in background.",
  "Brown Planthopper": "Small brown insect approximately 4-5mm resting at the base of a rice tiller. Characterized by brownish coloration with a prominent pronotum. Visible feeding damage (hopper burn) with browning of rice tillers in the immediate area.",
  "Diamondback Moth": "Small moth with wingspan of approximately 15mm showing characteristic diamond-shaped pattern when wings are folded. Caterpillar (larva) is small, pale green, about 10mm, and wiggles vigorously when disturbed. Window-pane feeding damage on cabbage leaf.",
  "Cotton Bollworm": "Caterpillar showing significant color variation from green to brown, approximately 35-40mm long. Feeding damage on cotton boll visible with frass at entry point. Distinctive microspines visible on the body surface under magnification.",
  "Rice Leaf Roller": "Rice leaf rolled longitudinally into a tube by a small greenish caterpillar inside. White scraping marks visible on the leaf surface where larva has fed. Characteristic silk threads holding the rolled leaf in shape.",
  "Rice Leaf Caterpillar": "Dark-colored caterpillar on rice leaf, approximately 25-30mm. Evidence of defoliation with ragged leaf edges. Multiple larvae visible on adjacent plants suggesting outbreak conditions.",
  "Paddy Stem Maggot": "Rice tiller showing deadheart symptom — the central leaf has turned brown and can be pulled easily. Tiny yellowish maggot visible at the base of the stem when dissected.",
  "Asiatic Rice Borer": "Whitehead symptom in rice — empty white panicle that failed to fill grain. Bore hole visible at the stem node with fine frass. Larva is pinkish-white with brown head.",
  "Yellow Rice Borer": "Similar to Asiatic rice borer but larvae are yellowish. Egg masses visible as clusters covered with brown hair-like scales on rice leaf surface.",
  "Beet Armyworm": "Green to brownish caterpillar with a distinctive dark spot on the side of the body above the second pair of true legs. Feeding damage shows irregular holes in leaves.",
  "Colorado Potato Beetle": "Distinctive yellow-orange beetle with 10 black longitudinal stripes on wing covers. Round, orange-red eggs in clusters of 10-30 on leaf underside. Larvae are soft-bodied, reddish with black spots.",
  "Thrips": "Extremely small insects (1-2mm) with fringed wings, causing silvery stippling on leaves. Damage appears as silvery-white patches with tiny black fecal spots. Flowers may show distortion.",
  "Cabbage Looper": "Green caterpillar moving in a characteristic looping motion. Three pairs of prolegs visible. Larvae blend well with leaf color. Irregular feeding holes in cabbage leaves.",
  "Red Spider Mite": "Tiny reddish-brown mites barely visible to naked eye. Fine webbing visible on leaf undersides. Leaves show stippling damage — tiny yellow dots where mites have fed on cell contents.",
  "Mole Cricket": "Large, robust insect approximately 30-35mm with powerful front legs adapted for digging. Velvety brown body. Found in soil near surface tunnels. Damage to turf visible as irregular raised ridges.",
  "Stink Bug": "Shield-shaped bug approximately 12-17mm, brownish with marbled wing pattern. Characteristic stink gland openings on thorax. Feeding creates dimpled, discolored spots on fruit or pods.",
  "Spotted Lanternfly": "Distinctive planthopper with spotted gray forewings and red hindwings. Adults approximately 25mm long. Nymphs are black with white spots. Heavy honeydew and sooty mold visible on trunk.",
  "Citrus Leaf Miner": "Silvery serpentine trails visible on young citrus leaves. Tiny larva (2-3mm) visible inside the mine at the terminal end. Leaf curling and distortion from mining damage.",
  "Wheat Aphid": "Green aphids clustered on wheat heads during grain filling. Cornicles dark-tipped. Honeydew deposits attracting ants. Some parasitized mummies (golden-brown swollen aphids) visible.",
  "Peach Borer": "Tree trunk base showing gummosis — amber-colored sap oozing from bore holes. Frass mixed with sap. Bark damage and possible larval cavity visible when outer bark removed.",
  "Wheat Midge": "Tiny orange midges on wheat heads at heading stage. Larvae feed inside developing kernels causing shriveling. Damaged kernels appear shrunken and discolored.",
};

// ── Heatmap Seed Data (15 Turkish Cities) ──
export const TURKEY_HEATMAP_DATA = [
  { city: "Adana", lat: 37.00, lng: 35.32, pest: "Cotton Bollworm", count: 23, severity: "High" },
  { city: "Ankara", lat: 39.93, lng: 32.86, pest: "Wheat Aphid", count: 15, severity: "Medium" },
  { city: "Antalya", lat: 36.90, lng: 30.70, pest: "Citrus Leaf Miner", count: 18, severity: "Medium" },
  { city: "Bursa", lat: 40.18, lng: 29.06, pest: "Green Peach Aphid", count: 12, severity: "Low" },
  { city: "Denizli", lat: 37.77, lng: 29.09, pest: "Red Spider Mite", count: 9, severity: "Low" },
  { city: "Diyarbakır", lat: 37.92, lng: 40.23, pest: "Wheat Midge", count: 14, severity: "Medium" },
  { city: "Edirne", lat: 41.67, lng: 26.56, pest: "Rice Leafhopper", count: 20, severity: "High" },
  { city: "Gaziantep", lat: 37.07, lng: 36.24, pest: "Cotton Bollworm", count: 17, severity: "Medium" },
  { city: "Hatay", lat: 36.40, lng: 36.35, pest: "Whitefly", count: 22, severity: "High" },
  { city: "Istanbul", lat: 41.01, lng: 28.98, pest: "Aphid", count: 8, severity: "Low" },
  { city: "İzmir", lat: 38.42, lng: 27.14, pest: "Thrips", count: 16, severity: "Medium" },
  { city: "Konya", lat: 37.87, lng: 32.48, pest: "Wheat Aphid", count: 21, severity: "High" },
  { city: "Mersin", lat: 36.80, lng: 34.63, pest: "Citrus Leaf Miner", count: 19, severity: "Medium" },
  { city: "Samsun", lat: 41.29, lng: 36.33, pest: "Corn Borer", count: 11, severity: "Medium" },
  { city: "Şanlıurfa", lat: 37.17, lng: 38.79, pest: "Fall Armyworm", count: 25, severity: "High" },
];

// ── Image Quality Scoring ──
export function scoreImageQuality(fileSize, width = null, height = null) {
  let score = 100;
  const issues = [];
  const suggestions = [];

  // File size check
  if (fileSize < 10 * 1024) { // < 10KB
    score -= 40;
    issues.push("File size very small (<10KB) — likely low resolution");
    suggestions.push("Use a higher resolution camera setting");
  } else if (fileSize < 50 * 1024) { // < 50KB
    score -= 20;
    issues.push("File size small (<50KB) — may lack detail");
    suggestions.push("Capture at higher quality/resolution");
  } else if (fileSize > 20 * 1024 * 1024) { // > 20MB
    score -= 10;
    issues.push("File very large (>20MB) — processing may be slower");
    suggestions.push("Consider reducing resolution to 1920x1080 or lower");
  }

  // Dimension check
  if (width !== null && height !== null) {
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    const ratio = maxDim / minDim;

    if (minDim < 100) {
      score -= 30;
      issues.push(`Image too small (${width}x${height}px)`);
      suggestions.push("Minimum recommended: 224x224px");
    } else if (minDim < 224) {
      score -= 15;
      issues.push(`Below optimal input size (${width}x${height}px)`);
      suggestions.push("Model input is 224x224px — upscaling may lose detail");
    }

    if (ratio > 4) {
      score -= 10;
      issues.push("Extreme aspect ratio — important regions may be cropped");
      suggestions.push("Use a more square crop of the pest/leaf");
    }
  }

  score = Math.max(0, Math.min(100, score));

  let grade;
  if (score >= 80) grade = "Excellent";
  else if (score >= 60) grade = "Good";
  else if (score >= 40) grade = "Fair";
  else if (score >= 20) grade = "Poor";
  else grade = "Unusable";

  return { score, grade, issues, suggestions };
}

// ── Activity Feed (in-memory) ──
const activityFeed = [];
const MAX_ACTIVITY = 50;

export function addActivity(type, description, metadata = {}) {
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    type,  // "prediction", "feedback", "sighting", "treatment", "field", "chat"
    description,
    metadata,
    timestamp: new Date().toISOString(),
  };
  activityFeed.unshift(entry);
  if (activityFeed.length > MAX_ACTIVITY) activityFeed.pop();
  return entry;
}

export function getActivity(limit = 10) {
  return activityFeed.slice(0, limit);
}

// ── System Analytics (in-memory) ──
const endpointStats = {};
let totalRequests = 0;
const startTime = Date.now();

export function trackRequest(endpoint, responseTimeMs) {
  totalRequests++;
  if (!endpointStats[endpoint]) {
    endpointStats[endpoint] = { count: 0, totalTime: 0, avgTime: 0 };
  }
  endpointStats[endpoint].count++;
  endpointStats[endpoint].totalTime += responseTimeMs;
  endpointStats[endpoint].avgTime = Math.round(endpointStats[endpoint].totalTime / endpointStats[endpoint].count);
}

export function getSystemAnalytics() {
  const uptime = Math.round((Date.now() - startTime) / 1000);
  return {
    uptime_seconds: uptime,
    uptime_formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
    total_requests: totalRequests,
    endpoints: endpointStats,
    memory: process.memoryUsage ? {
      heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    } : null,
  };
}

export default {
  VLM_DESCRIPTIONS,
  TURKEY_HEATMAP_DATA,
  scoreImageQuality,
  addActivity,
  getActivity,
  trackRequest,
  getSystemAnalytics,
};
