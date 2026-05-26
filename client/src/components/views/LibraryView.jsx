import { Search, BookOpen } from 'lucide-react';
import { useState } from 'react';

const PEST_DB = [
  { 
    id: 1, 
    name: 'Rice Leafhopper', 
    scientific: 'Nephotettix virescens',
    risk: 'High', 
    crops: ['Rice'], 
    desc: 'Small green leafhoppers that transmit tungro virus to rice plants.',
    family: 'Cicadellidae',
    duration: '30-40 days',
    treatments: [
      { day: 1, text: 'Scout & Identify' },
      { day: 2, text: 'Apply Neem Oil' },
      { day: 5, text: 'Chemical Control' },
      { day: 14, text: 'Follow-up Monitor' }
    ]
  },
  { 
    id: 2, 
    name: 'Fall Armyworm', 
    scientific: 'Spodoptera frugiperda',
    risk: 'High', 
    crops: ['Corn', 'Sorghum', 'Rice'], 
    desc: 'Highly destructive caterpillar that feeds on leaves, stems, and reproductive parts.',
    family: 'Noctuidae',
    duration: '30-60 days',
    treatments: [
      { day: 1, text: 'Early Detection' },
      { day: 2, text: 'Bt Spray' },
      { day: 5, text: 'Emamectin Benzoate' },
      { day: 10, text: 'Pheromone Traps' }
    ]
  },
  { 
    id: 3, 
    name: 'Green Peach Aphid', 
    scientific: 'Myzus persicae',
    risk: 'Medium', 
    crops: ['Vegetables', 'Tobacco', 'Peach'], 
    desc: 'Small green aphids that cause leaf curl and transmit plant viruses.',
    family: 'Aphididae',
    duration: '10-14 days',
    treatments: [
      { day: 1, text: 'Water Blast' },
      { day: 2, text: 'Release Ladybugs' },
      { day: 4, text: 'Insecticidal Soap' },
      { day: 7, text: 'Monitor & Repeat' }
    ]
  },
  { 
    id: 4, 
    name: 'Aphid', 
    scientific: 'Aphidoidea spp.',
    risk: 'Medium', 
    crops: ['Vegetables', 'Cereals', 'Fruits'], 
    desc: 'Sap-sucking insects that weaken plants and transmit viral diseases.',
    family: 'Aphididae',
    duration: '7-14 days',
    treatments: [
      { day: 1, text: 'Identify Species' },
      { day: 2, text: 'Neem Oil Spray' },
      { day: 5, text: 'Systemic Insecticide' },
      { day: 10, text: 'Companion Planting' }
    ]
  },
  { 
    id: 5, 
    name: 'Corn Borer', 
    scientific: 'Ostrinia nubilalis',
    risk: 'Medium', 
    crops: ['Corn', 'Sorghum', 'Cotton'], 
    desc: 'Larvae bore into stalks and ears causing structural damage and yield loss.',
    family: 'Crambidae',
    duration: '40-65 days',
    treatments: [
      { day: 1, text: 'Egg Mass Scouting' },
      { day: 2, text: 'Trichogramma Release' },
      { day: 4, text: 'Bt Application' },
      { day: 14, text: 'Stalk Destruction' }
    ]
  },
  { 
    id: 6, 
    name: 'Whitefly', 
    scientific: 'Bemisia tabaci',
    risk: 'Medium', 
    crops: ['Cotton', 'Tomato', 'Cucumber'], 
    desc: 'Tiny white flying insects that feed on plant sap and excrete honeydew.',
    family: 'Aleyrodidae',
    duration: '16-28 days',
    treatments: [
      { day: 1, text: 'Yellow Sticky Traps' },
      { day: 3, text: 'Encarsia Wasps' },
      { day: 5, text: 'Spiromesifen Spray' },
      { day: 10, text: 'Reflective Mulch' }
    ]
  },
  { 
    id: 7, 
    name: 'Migratory Locust', 
    scientific: 'Locusta migratoria',
    risk: 'Critical', 
    crops: ['All Crops'], 
    desc: 'Swarm-forming grasshoppers capable of devastating entire regions of crops.',
    family: 'Acrididae',
    duration: '2-3 months',
    treatments: [
      { day: 1, text: 'Satellite Tracking' },
      { day: 2, text: 'Aerial Spraying' },
      { day: 5, text: 'Metarhizium Fungi' },
      { day: 14, text: 'Post-swarm Assess' }
    ]
  },
  { 
    id: 8, 
    name: 'Brown Planthopper', 
    scientific: 'Nilaparvata lugens',
    risk: 'High', 
    crops: ['Rice'], 
    desc: 'Major rice pest causing hopper burn and transmitting grassy stunt virus.',
    family: 'Delphacidae',
    duration: '25-30 days',
    treatments: [
      { day: 1, text: 'Drain Field' },
      { day: 2, text: 'Buprofezin Application' },
      { day: 7, text: 'Duck Pasturing' },
      { day: 14, text: 'Resistant Varieties' }
    ]
  },
  { 
    id: 9, 
    name: 'Diamondback Moth', 
    scientific: 'Plutella xylostella',
    risk: 'High', 
    crops: ['Cabbage', 'Broccoli', 'Canola'], 
    desc: 'Small moth whose larvae feed heavily on cruciferous vegetables.',
    family: 'Plutellidae',
    duration: '14-21 days',
    treatments: [
      { day: 1, text: 'Pheromone Mating Dis.' },
      { day: 2, text: 'Spinosad Spray' },
      { day: 5, text: 'Diadegma Wasps' },
      { day: 10, text: 'Crop Rotation' }
    ]
  }
];

export default function LibraryView() {
  const [search, setSearch] = useState('');

  const filteredPests = PEST_DB.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.crops.some(c => c.toLowerCase().includes(search.toLowerCase())) ||
    p.scientific.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">Pest Encyclopedia</h2>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search pests..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary/30 border border-border/50 rounded-md text-sm focus:outline-none focus:border-primary/50 text-foreground w-48"
            />
          </div>
          <select className="bg-secondary/30 border border-border/50 rounded-md px-4 py-2 text-sm text-muted-foreground focus:outline-none appearance-none">
            <option>All Crops</option>
            <option>Rice</option>
            <option>Corn</option>
            <option>Vegetables</option>
          </select>
          <select className="bg-secondary/30 border border-border/50 rounded-md px-4 py-2 text-sm text-muted-foreground focus:outline-none appearance-none">
            <option>All Severity</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPests.map(pest => (
          <div key={pest.id} className="glass-panel p-5 bg-card/60 border border-border/50 rounded-xl hover:border-primary/30 transition-colors flex flex-col h-full">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="text-[15px] font-bold text-foreground">{pest.name}</h3>
                <p className="text-[11px] text-muted-foreground italic">{pest.scientific}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                pest.risk === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                pest.risk === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                {pest.risk}
              </span>
            </div>
            
            <p className="text-[12px] text-foreground/80 mt-3 mb-4 leading-relaxed line-clamp-2">
              {pest.desc}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {pest.crops.map(c => (
                <span key={c} className="px-2 py-0.5 bg-secondary/50 border border-border/30 rounded text-[10px] text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50" /> {pest.family}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50" /> {pest.duration}
              </span>
            </div>

            {/* Treatment Steps */}
            <div className="mt-auto pt-4 border-t border-border/20">
              <h4 className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-foreground/30 flex items-center justify-center text-[7px]">+</span>
                Treatment Steps
              </h4>
              <div className="space-y-1.5">
                {pest.treatments.map(t => (
                  <div key={t.day} className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-secondary rounded text-[9px] text-foreground font-mono w-9 text-center shrink-0">
                      Day {t.day}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
