/**
 * PestGuard AI — Pest Knowledge Database
 * 
 * Complete pest species database with treatment plans.
 * Ported from old_version/backend/main.py PEST_DATABASE + _EXTRA_PESTS
 * 
 * 30+ species from IP-102 dataset with:
 *   - Scientific names & taxonomy
 *   - Target crops & severity ratings
 *   - 4-step treatment protocols
 *   - Lifecycle durations
 */

export const PEST_DATABASE = {
  "Rice Leafhopper": {
    scientific: "Nephotettix virescens", family: "Cicadellidae",
    crops: ["Rice"], severity: "High", lifecycle: "30-40 days",
    description: "Small green leafhoppers that transmit tungro virus to rice plants.",
    treatment: [
      { day: 1, step: "Scout & Identify", desc: "Confirm species via sweep net. Check 20 hills/field.", method: "Inspection" },
      { day: 2, step: "Apply Neem Oil", desc: "Spray 3% neem oil solution at dusk.", method: "Biological" },
      { day: 5, step: "Chemical Control", desc: "Apply imidacloprid if threshold exceeded.", method: "Chemical" },
      { day: 14, step: "Follow-up Monitor", desc: "Re-scout fields. Check for resurgence.", method: "IPM" },
    ]
  },
  "Fall Armyworm": {
    scientific: "Spodoptera frugiperda", family: "Noctuidae",
    crops: ["Corn", "Sorghum", "Rice"], severity: "High", lifecycle: "30-60 days",
    description: "Highly destructive caterpillar that feeds on leaves, stems, and reproductive parts.",
    treatment: [
      { day: 1, step: "Early Detection", desc: "Look for windowpane damage and frass.", method: "Inspection" },
      { day: 2, step: "Bt Spray", desc: "Apply Bacillus thuringiensis on larvae.", method: "Biological" },
      { day: 5, step: "Emamectin Benzoate", desc: "Apply 5% SG if infestation >20%.", method: "Chemical" },
      { day: 10, step: "Pheromone Traps", desc: "Deploy FAW traps for adult monitoring.", method: "IPM" },
    ]
  },
  "Green Peach Aphid": {
    scientific: "Myzus persicae", family: "Aphididae",
    crops: ["Vegetables", "Tobacco", "Peach"], severity: "Medium", lifecycle: "10-14 days",
    description: "Small green aphids that cause leaf curl and transmit plant viruses.",
    treatment: [
      { day: 1, step: "Water Blast", desc: "Strong water spray to dislodge aphids.", method: "Mechanical" },
      { day: 2, step: "Release Ladybugs", desc: "Deploy Coccinellidae at 1500/hectare.", method: "Biological" },
      { day: 4, step: "Insecticidal Soap", desc: "Apply potassium salt fatty acid soap.", method: "Organic" },
      { day: 7, step: "Monitor & Repeat", desc: "Check leaf undersides. Reapply if needed.", method: "IPM" },
    ]
  },
  "Aphid": {
    scientific: "Aphidoidea spp.", family: "Aphididae",
    crops: ["Vegetables", "Cereals", "Fruits"], severity: "Medium", lifecycle: "7-14 days",
    description: "Sap-sucking insects that weaken plants and transmit viral diseases.",
    treatment: [
      { day: 1, step: "Identify Species", desc: "Determine aphid species for targeted control.", method: "Inspection" },
      { day: 2, step: "Neem Oil Spray", desc: "Apply 2-3% neem oil covering undersides.", method: "Organic" },
      { day: 5, step: "Systemic Insecticide", desc: "Use thiamethoxam if biologicals insufficient.", method: "Chemical" },
      { day: 10, step: "Companion Planting", desc: "Plant marigolds as natural deterrents.", method: "Cultural" },
    ]
  },
  "Corn Borer": {
    scientific: "Ostrinia nubilalis", family: "Crambidae",
    crops: ["Corn", "Sorghum", "Cotton"], severity: "Medium", lifecycle: "40-65 days",
    description: "Larvae bore into stalks and ears causing structural damage and yield loss.",
    treatment: [
      { day: 1, step: "Egg Mass Scouting", desc: "Check 50 plants for egg masses.", method: "Inspection" },
      { day: 2, step: "Trichogramma Release", desc: "Release parasitoids at 100k/hectare.", method: "Biological" },
      { day: 4, step: "Bt Application", desc: "Spray Bt on newly hatched larvae.", method: "Biological" },
      { day: 14, step: "Stalk Destruction", desc: "Shred stalks post-harvest to kill larvae.", method: "Cultural" },
    ]
  },
  "Whitefly": {
    scientific: "Bemisia tabaci", family: "Aleyrodidae",
    crops: ["Cotton", "Tomato", "Cucumber"], severity: "Medium", lifecycle: "18-28 days",
    description: "Tiny white flying insects that feed on plant sap and excrete honeydew.",
    treatment: [
      { day: 1, step: "Yellow Sticky Traps", desc: "Deploy traps at canopy level.", method: "Mechanical" },
      { day: 3, step: "Encarsia Wasps", desc: "Release parasitoid wasps.", method: "Biological" },
      { day: 5, step: "Spiromesifen Spray", desc: "Apply growth regulator if needed.", method: "Chemical" },
      { day: 10, step: "Reflective Mulch", desc: "Install silver mulch to repel.", method: "Cultural" },
    ]
  },
  "Migratory Locust": {
    scientific: "Locusta migratoria", family: "Acrididae",
    crops: ["All crops"], severity: "Critical", lifecycle: "2-6 months",
    description: "Swarm-forming grasshoppers capable of devastating entire regions of crops.",
    treatment: [
      { day: 1, step: "Alert Authorities", desc: "Report swarm to plant protection service.", method: "Regulatory" },
      { day: 1, step: "Barrier Treatment", desc: "Apply fipronil barriers around field.", method: "Chemical" },
      { day: 3, step: "Biopesticide", desc: "Apply Metarhizium for sustainable control.", method: "Biological" },
      { day: 7, step: "Harvest Protection", desc: "Priority harvest mature crops.", method: "Mechanical" },
    ]
  },
  "Brown Planthopper": {
    scientific: "Nilaparvata lugens", family: "Delphacidae",
    crops: ["Rice"], severity: "High", lifecycle: "25-35 days",
    description: "Major rice pest causing hopper burn and transmitting grassy stunt virus.",
    treatment: [
      { day: 1, step: "Drain Paddy", desc: "Drain rice paddy for 3-4 days.", method: "Cultural" },
      { day: 2, step: "Reduce Nitrogen", desc: "Avoid excess N which attracts BPH.", method: "Cultural" },
      { day: 4, step: "Pymetrozine Spray", desc: "Apply selective insecticide.", method: "Chemical" },
      { day: 10, step: "Resistant Varieties", desc: "Plan BPH-resistant rice next season.", method: "Genetic" },
    ]
  },
  "Diamondback Moth": {
    scientific: "Plutella xylostella", family: "Plutellidae",
    crops: ["Cabbage", "Broccoli", "Cauliflower"], severity: "High", lifecycle: "14-21 days",
    description: "Small moth whose larvae feed on cruciferous vegetables.",
    treatment: [
      { day: 1, step: "Pheromone Traps", desc: "Deploy traps for adult monitoring.", method: "IPM" },
      { day: 2, step: "Bt kurstaki Spray", desc: "Apply Bt effective against DBM larvae.", method: "Biological" },
      { day: 5, step: "Spinosad Application", desc: "Use if Bt resistance suspected.", method: "Chemical" },
      { day: 10, step: "Crop Rotation", desc: "Rotate with non-cruciferous crops.", method: "Cultural" },
    ]
  },
  "Cotton Bollworm": {
    scientific: "Helicoverpa armigera", family: "Noctuidae",
    crops: ["Cotton", "Tomato", "Corn"], severity: "High", lifecycle: "30-40 days",
    description: "Polyphagous pest that bores into fruits and bolls causing direct damage.",
    treatment: [
      { day: 1, step: "Light Traps", desc: "Deploy UV traps for adult moths.", method: "Mechanical" },
      { day: 2, step: "HaNPV Application", desc: "Apply nuclear polyhedrosis virus.", method: "Biological" },
      { day: 5, step: "Chlorantraniliprole", desc: "Apply diamide insecticide if needed.", method: "Chemical" },
      { day: 12, step: "Refuge Planting", desc: "Maintain non-Bt refuge crops.", method: "Resistance Mgmt" },
    ]
  },
  // ── Extra pests with full treatment data ──
  "Rice Leaf Roller": {
    scientific: "Cnaphalocrocis medinalis", family: "Crambidae",
    crops: ["Rice"], severity: "High", lifecycle: "30-35 days",
    description: "Larvae roll rice leaves and feed inside, causing white streaks and yield loss.",
    treatment: [
      { day: 1, step: "Sweep Net Survey", desc: "Sample 20 hills per field with sweep net.", method: "Inspection" },
      { day: 2, step: "Trichogramma Release", desc: "Release egg parasitoids at 50k/ha.", method: "Biological" },
      { day: 5, step: "Cartap Hydrochloride", desc: "Apply if >2 larvae per hill.", method: "Chemical" },
      { day: 12, step: "Silicon Fertilizer", desc: "Apply silica to harden leaf tissue.", method: "Cultural" },
    ]
  },
  "Rice Leaf Caterpillar": {
    scientific: "Spodoptera mauritia", family: "Noctuidae",
    crops: ["Rice"], severity: "High", lifecycle: "28-35 days",
    description: "Army caterpillars that defoliate rice fields, especially in lowland paddies.",
    treatment: [
      { day: 1, step: "Night Scouting", desc: "Scout at dusk when larvae are active.", method: "Inspection" },
      { day: 2, step: "Bt kurstaki Spray", desc: "Apply Bacillus thuringiensis on young larvae.", method: "Biological" },
      { day: 5, step: "Chlorpyrifos Application", desc: "Foliar spray if defoliation >25%.", method: "Chemical" },
      { day: 10, step: "Light Traps", desc: "Deploy traps to monitor and reduce adult moths.", method: "IPM" },
    ]
  },
  "Paddy Stem Maggot": {
    scientific: "Chlorops oryzae", family: "Chloropidae",
    crops: ["Rice"], severity: "Medium", lifecycle: "21-28 days",
    description: "Maggots bore into rice stems causing deadheart symptoms in seedlings.",
    treatment: [
      { day: 1, step: "Deadheart Count", desc: "Count affected tillers per m².", method: "Inspection" },
      { day: 3, step: "Seed Treatment", desc: "Treat seeds with thiamethoxam before sowing.", method: "Chemical" },
      { day: 7, step: "Water Management", desc: "Maintain 5cm standing water to deter oviposition.", method: "Cultural" },
      { day: 14, step: "Resistant Varieties", desc: "Select stem maggot-tolerant cultivars.", method: "Genetic" },
    ]
  },
  "Asiatic Rice Borer": {
    scientific: "Chilo suppressalis", family: "Crambidae",
    crops: ["Rice"], severity: "High", lifecycle: "35-50 days",
    description: "Stem borer causing whitehead and deadheart damage in rice.",
    treatment: [
      { day: 1, step: "Moth Trapping", desc: "Deploy pheromone traps for adult monitoring.", method: "IPM" },
      { day: 2, step: "Egg Mass Removal", desc: "Hand-collect egg masses from leaves.", method: "Mechanical" },
      { day: 5, step: "Fipronil Granules", desc: "Apply granules in paddy water.", method: "Chemical" },
      { day: 14, step: "Stubble Destruction", desc: "Plow under stubble after harvest.", method: "Cultural" },
    ]
  },
  "Yellow Rice Borer": {
    scientific: "Scirpophaga incertulas", family: "Crambidae",
    crops: ["Rice"], severity: "High", lifecycle: "40-60 days",
    description: "Major rice stem borer causing yield losses up to 30%.",
    treatment: [
      { day: 1, step: "Light Trap Monitoring", desc: "Track adult emergence with light traps.", method: "Inspection" },
      { day: 2, step: "Trichogramma Wasps", desc: "Release parasitoid wasps targeting eggs.", method: "Biological" },
      { day: 5, step: "Carbofuran Granules", desc: "Apply in leaf whorl if >5% deadhearts.", method: "Chemical" },
      { day: 10, step: "Synchronize Planting", desc: "Community-wide synchronized planting dates.", method: "Cultural" },
    ]
  },
  "Beet Fly": {
    scientific: "Pegomya betae", family: "Anthomyiidae",
    crops: ["Beet", "Spinach"], severity: "Medium", lifecycle: "25-35 days",
    description: "Leaf-mining fly whose larvae tunnel through beet leaves.",
    treatment: [
      { day: 1, step: "Mine Inspection", desc: "Check for serpentine mines on leaves.", method: "Inspection" },
      { day: 3, step: "Parasitoid Wasps", desc: "Conserve Opius pallipes natural enemy.", method: "Biological" },
      { day: 6, step: "Spinosad Spray", desc: "Apply targeted insecticide at threshold.", method: "Chemical" },
      { day: 14, step: "Crop Residue Removal", desc: "Remove infected leaves to break cycle.", method: "Cultural" },
    ]
  },
  "Beet Armyworm": {
    scientific: "Spodoptera exigua", family: "Noctuidae",
    crops: ["Beet", "Cotton", "Vegetables"], severity: "High", lifecycle: "24-36 days",
    description: "Polyphagous caterpillar causing severe defoliation in vegetable crops.",
    treatment: [
      { day: 1, step: "Pheromone Monitoring", desc: "Deploy traps to track adult flight.", method: "Inspection" },
      { day: 2, step: "NPV Application", desc: "Apply nuclear polyhedrosis virus on larvae.", method: "Biological" },
      { day: 5, step: "Emamectin Benzoate", desc: "Spray if population exceeds threshold.", method: "Chemical" },
      { day: 10, step: "Intercropping", desc: "Plant trap crops to divert pest.", method: "Cultural" },
    ]
  },
  "Wheat Aphid": {
    scientific: "Sitobion avenae", family: "Aphididae",
    crops: ["Wheat", "Barley"], severity: "Medium", lifecycle: "10-14 days",
    description: "Grain aphid colonizing wheat heads during filling stage.",
    treatment: [
      { day: 1, step: "Head Sampling", desc: "Count aphids per wheat head across 10 tillers.", method: "Inspection" },
      { day: 2, step: "Lacewing Release", desc: "Deploy Chrysoperla larvae as predators.", method: "Biological" },
      { day: 4, step: "Pirimicarb Spray", desc: "Apply selective aphicide if >5 per head.", method: "Chemical" },
      { day: 10, step: "Early Sowing", desc: "Adjust sowing date to avoid peak flight.", method: "Cultural" },
    ]
  },
  "Wheat Midge": {
    scientific: "Sitodiplosis mosellana", family: "Cecidomyiidae",
    crops: ["Wheat"], severity: "Medium", lifecycle: "30-45 days",
    description: "Larvae feed on developing wheat kernels causing shriveled grain.",
    treatment: [
      { day: 1, step: "Emergence Trapping", desc: "Use soil traps to monitor adult emergence.", method: "Inspection" },
      { day: 2, step: "Macroglenes Wasps", desc: "Conserve parasitoid natural enemies.", method: "Biological" },
      { day: 4, step: "Chlorpyrifos Spray", desc: "Apply at heading stage if threshold met.", method: "Chemical" },
      { day: 14, step: "Resistant Cultivars", desc: "Plant Sm1-carrying wheat varieties.", method: "Genetic" },
    ]
  },
  "Peach Borer": {
    scientific: "Synanthedon exitiosa", family: "Sesiidae",
    crops: ["Peach", "Cherry", "Plum"], severity: "High", lifecycle: "365 days",
    description: "Clearwing moth larvae bore into peach tree trunks causing gummosis.",
    treatment: [
      { day: 1, step: "Frass Inspection", desc: "Check trunk base for frass and gummy sap.", method: "Inspection" },
      { day: 3, step: "Nematode Drench", desc: "Apply Steinernema carpocapsae to trunk base.", method: "Biological" },
      { day: 7, step: "Trunk Spray", desc: "Apply chlorpyrifos to lower trunk.", method: "Chemical" },
      { day: 30, step: "Mating Disruption", desc: "Deploy pheromone dispensers.", method: "IPM" },
    ]
  },
  "Cabbage Looper": {
    scientific: "Trichoplusia ni", family: "Noctuidae",
    crops: ["Cabbage", "Broccoli", "Lettuce"], severity: "Medium", lifecycle: "25-33 days",
    description: "Green caterpillar with distinctive looping movement feeding on brassicas.",
    treatment: [
      { day: 1, step: "Leaf Inspection", desc: "Check undersides for eggs and small larvae.", method: "Inspection" },
      { day: 2, step: "Bt Spray", desc: "Apply Bacillus thuringiensis var. kurstaki.", method: "Biological" },
      { day: 5, step: "Spinosad Application", desc: "Use if Bt alone insufficient.", method: "Organic" },
      { day: 10, step: "Row Covers", desc: "Install floating row covers to exclude moths.", method: "Cultural" },
    ]
  },
  "Thrips": {
    scientific: "Thrips tabaci", family: "Thripidae",
    crops: ["Onion", "Cotton", "Vegetables"], severity: "Medium", lifecycle: "15-30 days",
    description: "Tiny rasping insects causing silvery stippling and scarring.",
    treatment: [
      { day: 1, step: "Blue Sticky Traps", desc: "Deploy traps to monitor thrips population.", method: "Inspection" },
      { day: 2, step: "Predatory Mites", desc: "Release Amblyseius cucumeris.", method: "Biological" },
      { day: 5, step: "Spinosad Spray", desc: "Apply organic-certified insecticide.", method: "Organic" },
      { day: 10, step: "Mulching", desc: "Apply reflective mulch to repel adults.", method: "Cultural" },
    ]
  },
  "Colorado Potato Beetle": {
    scientific: "Leptinotarsa decemlineata", family: "Chrysomelidae",
    crops: ["Potato", "Eggplant", "Tomato"], severity: "High", lifecycle: "30-40 days",
    description: "Striped beetle causing severe defoliation of potato crops.",
    treatment: [
      { day: 1, step: "Egg Mass Scouting", desc: "Check leaf undersides for orange egg clusters.", method: "Inspection" },
      { day: 2, step: "Hand Picking", desc: "Remove adults and larvae manually.", method: "Mechanical" },
      { day: 4, step: "Bt tenebrionis", desc: "Apply Bt San Diego strain on young larvae.", method: "Biological" },
      { day: 10, step: "Crop Rotation", desc: "Rotate to non-solanaceous crops.", method: "Cultural" },
    ]
  },
  "Red Spider Mite": {
    scientific: "Tetranychus urticae", family: "Tetranychidae",
    crops: ["Multiple"], severity: "Medium", lifecycle: "10-20 days",
    description: "Two-spotted mite causing bronzing and webbing on leaves.",
    treatment: [
      { day: 1, step: "Leaf Magnification", desc: "Use 10x lens to confirm mite presence.", method: "Inspection" },
      { day: 2, step: "Phytoseiulus Release", desc: "Deploy predatory mites at 2000/ha.", method: "Biological" },
      { day: 5, step: "Abamectin Spray", desc: "Apply miticide if >5 mites per leaf.", method: "Chemical" },
      { day: 10, step: "Humidity Management", desc: "Increase humidity to suppress mites.", method: "Cultural" },
    ]
  },
  "Mole Cricket": {
    scientific: "Gryllotalpa gryllotalpa", family: "Gryllotalpidae",
    crops: ["Turf", "Vegetables", "Cereals"], severity: "Medium", lifecycle: "365 days",
    description: "Subterranean insect damaging roots and creating soil tunnels.",
    treatment: [
      { day: 1, step: "Soap Flush Test", desc: "Apply soapy water to flush crickets.", method: "Inspection" },
      { day: 3, step: "Nematode Application", desc: "Apply Steinernema scapterisci to soil.", method: "Biological" },
      { day: 7, step: "Bait Application", desc: "Apply granular bait in evening.", method: "Chemical" },
      { day: 14, step: "Soil Tillage", desc: "Till soil to destroy tunnels and eggs.", method: "Cultural" },
    ]
  },
  "Stink Bug": {
    scientific: "Halyomorpha halys", family: "Pentatomidae",
    crops: ["Soybean", "Fruit", "Vegetables"], severity: "Medium", lifecycle: "35-45 days",
    description: "Shield-shaped bug causing dimpled, discolored feeding damage.",
    treatment: [
      { day: 1, step: "Beat Sheet Sampling", desc: "Use beat sheet on 10 row-feet sections.", method: "Inspection" },
      { day: 2, step: "Trap Crops", desc: "Plant sunflower borders as trap crop.", method: "Cultural" },
      { day: 5, step: "Bifenthrin Spray", desc: "Apply pyrethroid at economic threshold.", method: "Chemical" },
      { day: 14, step: "Trissolcus Wasps", desc: "Conserve samurai wasp egg parasitoid.", method: "Biological" },
    ]
  },
  "Spotted Lanternfly": {
    scientific: "Lycorma delicatula", family: "Fulgoridae",
    crops: ["Grapes", "Fruit Trees", "Hardwoods"], severity: "High", lifecycle: "365 days",
    description: "Invasive planthopper that feeds on sap and excretes honeydew.",
    treatment: [
      { day: 1, step: "Egg Mass Scraping", desc: "Scrape gray egg masses into alcohol.", method: "Mechanical" },
      { day: 3, step: "Circle Traps", desc: "Wrap sticky bands around tree trunks.", method: "Mechanical" },
      { day: 7, step: "Dinotefuran Drench", desc: "Apply systemic soil drench to trees.", method: "Chemical" },
      { day: 14, step: "Report Sighting", desc: "Notify agricultural extension office.", method: "Regulatory" },
    ]
  },
  "Citrus Leaf Miner": {
    scientific: "Phyllocnistis citrella", family: "Gracillariidae",
    crops: ["Citrus"], severity: "Medium", lifecycle: "15-25 days",
    description: "Tiny moth whose larvae mine through young citrus leaves causing curling.",
    treatment: [
      { day: 1, step: "New Flush Monitoring", desc: "Check young flush leaves for mining trails.", method: "Inspection" },
      { day: 2, step: "Ageniaspis Wasps", desc: "Release parasitoid wasps for biological control.", method: "Biological" },
      { day: 5, step: "Abamectin Spray", desc: "Apply when new flush is expanding.", method: "Chemical" },
      { day: 14, step: "Prune Infected Shoots", desc: "Remove heavily mined flush growth.", method: "Cultural" },
    ]
  },
};

/**
 * Get pest info by exact name or fuzzy match
 */
export function getPestInfo(pestName) {
  let info = PEST_DATABASE[pestName];
  if (!info) {
    // Fuzzy match
    for (const [key, val] of Object.entries(PEST_DATABASE)) {
      if (pestName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(pestName.toLowerCase())) {
        info = val;
        pestName = key;
        break;
      }
    }
  }
  if (info) {
    return { found: true, pest_name: pestName, ...info };
  }
  return { found: false, pest_name: pestName, message: "Pest not in database" };
}

/**
 * Get all pests for the encyclopedia
 */
export function getPestLibrary() {
  const pests = Object.entries(PEST_DATABASE).map(([name, info]) => ({
    pest_name: name,
    ...info,
  }));
  return { pests, total: pests.length };
}

export default PEST_DATABASE;
