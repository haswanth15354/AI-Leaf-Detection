import { SampleLeaf } from '../types/disease';
import tomatoBlightImg from '../assets/images/tomato_blight_leaf_1790153414247.jpg';
import appleRustImg from '../assets/images/apple_rust_leaf_1790153432000.jpg';
import grapeMildewImg from '../assets/images/grape_mildew_leaf_1790153446887.jpg';
import cornRustImg from '../assets/images/corn_rust_leaf_1790153459309.jpg';
import citrusChlorosisImg from '../assets/images/citrus_chlorosis_leaf_1790153471492.jpg';
import healthyPepperImg from '../assets/images/healthy_pepper_leaf_1790153484204.jpg';

export const SAMPLE_LEAVES: SampleLeaf[] = [
  {
    id: 'sample-tomato-blight',
    title: 'Tomato Late Blight',
    plantName: 'Tomato (Solanum lycopersicum)',
    diseaseName: 'Late Blight (Phytophthora infestans)',
    pathogenType: 'Oomycete',
    severity: 'Severe',
    imageUrl: tomatoBlightImg,
    description: 'Dark irregular water-soaked lesions turning brown with yellow halos on tomato foliage.',
    presetDiagnosis: {
      isPlant: true,
      plant: {
        commonName: 'Garden Tomato',
        scientificName: 'Solanum lycopersicum',
        family: 'Solanaceae (Nightshade family)',
        cultivarOrType: 'Indeterminate Slicer Tomato',
      },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Late Blight (Phytophthora infestans)',
        scientificPathogen: 'Phytophthora infestans',
        pathogenType: 'Oomycete',
        severity: 'Severe',
        confidence: 96,
        affectedPercentage: 35,
        contagionRisk: 'Extremely High',
      },
      symptoms: {
        visualSigns: [
          'Large, irregular dark brown water-soaked necrotic lesions on leaf margins and blade',
          'Pale chlorotic halo surrounding expanding necrotic zones',
          'Turgor collapse and curling of distal leaf tips',
        ],
        impactedParts: ['Foliage', 'Petiole', 'Leaf veins'],
        diseaseStage: 'Active Expanding Stage (Sporulation window)',
        chlorosisOrNecrosis: 'Advanced Necrosis with surrounding chlorotic borders',
      },
      detectedRegions: [
        {
          label: 'Primary Necrotic Blight Lesion',
          description: 'Dark water-soaked oomycete lesion with active cell wall breakdown',
          box_2d: [280, 220, 680, 720],
        },
        {
          label: 'Secondary Chlorotic Halo',
          description: 'Expanding margin of cellular chlorosis preceding tissue death',
          box_2d: [210, 160, 740, 810],
        },
      ],
      treatmentPlan: {
        emergencyAction:
          'Immediately isolate the plant and carefully prune out all heavily blighted leaf tissue using sterilized shears (70% isopropyl alcohol). Dispose in sealed bags; never compost blighted nightshades.',
        organicSolutions: [
          {
            treatment: 'Liquid Copper Octanoate (Bio-Fungicide)',
            recipeOrMethod: 'Mix 15 ml per 1 liter of soft water. Thoroughly spray upper and lower leaf surfaces.',
            frequency: 'Every 5 to 7 days during humid or wet weather.',
          },
          {
            treatment: 'Bacillus subtilis / amyloliquefaciens (Serenade Garden)',
            recipeOrMethod: 'Apply as a protective bio-bacterial antagonist spray before spore germination.',
            frequency: 'Every 7 days in rotation with copper sprays.',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Chlorothalonil',
            commercialExample: 'Daconil Fungicide',
            instructions: 'Apply 15-20 ml per gallon of water. Ensure thorough coverage of canopy before rainfall.',
            safetyWarning: 'Do not harvest within 7 days of application. Wear protective goggles and nitrile gloves.',
          },
          {
            activeIngredient: 'Mancozeb / Cymoxanil',
            commercialExample: 'Curzate M68',
            instructions: 'Systemic kickback action for curatively arresting oomycete mycelial growth.',
            safetyWarning: 'Observe strict 14-day pre-harvest interval on edible nightshade crops.',
          },
        ],
        culturalPractices: [
          'Switch strictly to root-level drip irrigation; avoid all overhead foliage wetting',
          'Increase inter-plant spacing to at least 75 cm for maximum airflow and solar penetration',
          'Sterilize pruning shears between each plant cut',
          'Apply 5 cm clean straw mulch beneath plants to prevent soil-splash spore inoculation',
        ],
      },
      prevention: [
        'Plant resistant cultivars carrying Ph-2 and Ph-3 late blight resistance genes',
        'Rotate with non-solanaceous crops (alliums, legumes, brassicas) for a minimum of 3 seasons',
        'Monitor regional botanical blight forecast alerts during cool humid spells (15-22°C with 90%+ RH)',
      ],
      recoveryPrognosis:
        'Fair to Moderate. If emergency pruning and copper protectants are applied within 24 hours, healthy new vine growth can be preserved and crop yield protected.',
      botanistNotes:
        'Phytophthora infestans was the causal pathogen of the historic Great Irish Famine. It spreads rapidly via windborne sporangia in damp, cool environments. Swift sanitation is critical.',
    },
  },
  {
    id: 'sample-apple-spot',
    title: 'Apple Leaf Rust / Blotch',
    plantName: 'Apple (Malus domestica)',
    diseaseName: 'Frogeye Leaf Spot / Rust',
    pathogenType: 'Fungal',
    severity: 'Moderate',
    imageUrl: appleRustImg,
    description: 'Circular brown necrotic spots with distinct concentric rings on mature orchard leaf.',
    presetDiagnosis: {
      isPlant: true,
      plant: {
        commonName: 'Domestic Apple Tree',
        scientificName: 'Malus domestica',
        family: 'Rosaceae (Rose family)',
        cultivarOrType: 'Orchard Fruiting Apple',
      },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Frogeye Leaf Spot / Black Rot (Botryosphaeria obtusa)',
        scientificPathogen: 'Botryosphaeria obtusa / Gymnosporangium juniperi-virginianae',
        pathogenType: 'Fungal',
        severity: 'Moderate',
        confidence: 93,
        affectedPercentage: 18,
        contagionRisk: 'Moderate',
      },
      symptoms: {
        visualSigns: [
          'Distinct circular necrotic lesions with tan centres and dark purple/brown outer rings',
          'Concentric zonations resembling a frog eye pattern on foliar surface',
          'Slight chlorotic halo surrounding discrete focal spots',
        ],
        impactedParts: ['Leaf blade', 'Fruit spur foliage'],
        diseaseStage: 'Established secondary foliar spot stage',
        chlorosisOrNecrosis: 'Necrotic target-shaped circular spots',
      },
      detectedRegions: [
        {
          label: 'Primary Frogeye Necrotic Focus',
          description: 'Concentric ring lesion with distinct purple border and tan interior',
          box_2d: [320, 310, 620, 680],
        },
      ],
      treatmentPlan: {
        emergencyAction:
          'Rake and destroy all infected fallen foliage beneath the orchard drip line. Inspect nearby twigs for black rot cankers and prune them out 10 cm below infected wood.',
        organicSolutions: [
          {
            treatment: 'Sulfur Plant Fungicide (Microthiol Disperss)',
            recipeOrMethod: 'Mix 30g wettable sulfur in 10 liters of water. Spray during calm, overcast mornings.',
            frequency: 'Every 7 to 10 days until dry warm summer weather establishes.',
          },
          {
            treatment: 'Neem Oil Extract (Clarified Hydrophobic Extract)',
            recipeOrMethod: '5 ml per liter of warm water with 2 drops of organic dish soap as an emulsifier.',
            frequency: 'Apply bi-weekly as a protective preventative foliar film.',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Myclobutanil',
            commercialExample: 'Immunox Multi-Purpose Fungicide',
            instructions: 'Apply 10 ml per gallon. Provides translaminar curative and protective action against orchard leaf spots.',
            safetyWarning: 'Do not exceed 8 applications per season. 14-day pre-harvest interval.',
          },
          {
            activeIngredient: 'Captan',
            commercialExample: 'Captan 50WP',
            instructions: 'Broad spectrum multi-site protectant spray applied at petal fall and cover sprays.',
            safetyWarning: 'Wear eye protection. Do not apply within 21 days of an oil spray.',
          },
        ],
        culturalPractices: [
          'Perform annual dormant pruning to open up the canopy center for maximum sunlight and rapid leaf drying',
          'Eliminate nearby wild Eastern red cedar trees or juniper bushes within 200m if cedar-apple rust is present',
          'Collect and burn dead mummified fruits left hanging on the tree',
        ],
      },
      prevention: [
        'Select rust and spot resistant apple rootstocks and scions (e.g. Liberty, Enterprise, Freedom)',
        'Apply dormant liquid lime-sulfur spray before spring bud break to eliminate overwintering fungal spores',
      ],
      recoveryPrognosis:
        'Good. The current leaf damage is localized. Pruning and protective fungicide sprays will protect uninfected spring leaves and subsequent fruit quality.',
      botanistNotes:
        'Frogeye leaf spot is the foliar manifestation of the Black Rot fungus Botryosphaeria obtusa. Removing infected cankers in dead wood is essential to permanently breaking the disease cycle.',
    },
  },
  {
    id: 'sample-grape-mildew',
    title: 'Grape Powdery Mildew',
    plantName: 'Grapevine (Vitis vinifera)',
    diseaseName: 'Powdery Mildew (Erysiphe necator)',
    pathogenType: 'Fungal',
    severity: 'Moderate',
    imageUrl: grapeMildewImg,
    description: 'White-grayish powdery cobweb fungal growth covering the upper leaf blade surface.',
    presetDiagnosis: {
      isPlant: true,
      plant: {
        commonName: 'European Grapevine',
        scientificName: 'Vitis vinifera',
        family: 'Vitaceae (Grape family)',
        cultivarOrType: 'Table / Wine Cultivar',
      },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Grape Powdery Mildew (Erysiphe necator)',
        scientificPathogen: 'Erysiphe necator (Uncinula necator)',
        pathogenType: 'Fungal',
        severity: 'Moderate',
        confidence: 97,
        affectedPercentage: 25,
        contagionRisk: 'High',
      },
      symptoms: {
        visualSigns: [
          'Patches of white-to-grayish talcum powder-like fungal mycelium on the adaxial leaf blade',
          'Distortion and mild upward cupping of young infected leaves',
          'Faint musty odor under severe canopy infestation',
        ],
        impactedParts: ['Upper leaf surface', 'Young shoots', 'Tendrils'],
        diseaseStage: 'Active vegetative epiphytic mycelial expansion',
        chlorosisOrNecrosis: 'Superficial fungal epiphytic growth with underlying chlorosis',
      },
      detectedRegions: [
        {
          label: 'Powdery Mildew Colony',
          description: 'White-gray powdery mycelial mat across upper lamina',
          box_2d: [260, 240, 710, 780],
        },
      ],
      treatmentPlan: {
        emergencyAction:
          'Apply an immediate potassium bicarbonate or horticultural oil spray to eradicate existing visible powdery mildew mycelium on contact without chemical resistance.',
        organicSolutions: [
          {
            treatment: 'Potassium Bicarbonate (MilStop / Armicarb)',
            recipeOrMethod: 'Dissolve 5 grams per liter of water with a botanical surfactant. Knocks down existing mildew spores via osmotic disruption.',
            frequency: 'Repeat every 5 days for 2 applications, then every 10 days.',
          },
          {
            treatment: 'Milk & Whey Spray (10-20% Dilution)',
            recipeOrMethod: 'Mix 100 ml fresh whole milk or whey with 900 ml water. Sunlight induces lactoferrin free radicals that destroy fungal hyphae.',
            frequency: 'Apply in bright direct sunlight every 7 days.',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Azoxystrobin / Difenoconazole',
            commercialExample: 'Quadris Top',
            instructions: 'Apply 10-12 ml per 10 liters of water with thorough foliar wash.',
            safetyWarning: 'Rotate with different FRAC groups to prevent rapid strobilurin resistance.',
          },
        ],
        culturalPractices: [
          'Canopy leaf pulling (desuckering) around the fruit zone to promote continuous air movement and sun exposure',
          'Trellis training to eliminate dense, shaded foliage clusters where humidity stagnates',
          'Maintain clean vine alleys free of tall weed hosts',
        ],
      },
      prevention: [
        'Begin protective sulfur dusting early in the spring when shoots reach 15-20 cm in length',
        'Avoid excessive synthetic nitrogen fertilizer which drives succulent, susceptible vine flushes',
      ],
      recoveryPrognosis:
        'Excellent with prompt potassium bicarbonate or sulfur application. Mildew remains largely superficial if treated before berry cluster infection occurs.',
      botanistNotes:
        'Unlike downy mildew, powdery mildew does not require free standing water to germinate—high ambient humidity and warm shaded canopies (20-27°C) are its prime triggers.',
    },
  },
  {
    id: 'sample-corn-rust',
    title: 'Corn Common Rust',
    plantName: 'Sweet Corn (Zea mays)',
    diseaseName: 'Common Rust (Puccinia sorghi)',
    pathogenType: 'Fungal',
    severity: 'Severe',
    imageUrl: cornRustImg,
    description: 'Cinnamon brown elongated pustules and powdery spore masses across the leaf veins.',
    presetDiagnosis: {
      isPlant: true,
      plant: {
        commonName: 'Sweet Corn / Maize',
        scientificName: 'Zea mays',
        family: 'Poaceae (Grass family)',
        cultivarOrType: 'Agricultural Maize',
      },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Corn Common Rust (Puccinia sorghi)',
        scientificPathogen: 'Puccinia sorghi',
        pathogenType: 'Fungal',
        severity: 'Severe',
        confidence: 95,
        affectedPercentage: 42,
        contagionRisk: 'High',
      },
      symptoms: {
        visualSigns: [
          'Golden to cinnamon-brown raised pustules (uredinia) erupting along parallel leaf veins',
          'Powdery rust-colored spores that easily brush off onto fingertips',
          'Widespread interveinal yellowing and premature foliar senescence',
        ],
        impactedParts: ['Mid-canopy leaf blades', 'Leaf sheaths'],
        diseaseStage: 'Late uredinial spore dissemination stage',
        chlorosisOrNecrosis: 'Extensive chlorosis with epidermal rupture pustules',
      },
      detectedRegions: [
        {
          label: 'Erupting Rust Pustules',
          description: 'Cinnamon uredinia bursting through leaf epidermis along parallel veins',
          box_2d: [190, 200, 780, 810],
        },
      ],
      treatmentPlan: {
        emergencyAction:
          'Assess crop growth stage. If corn is between whorl and silking stages and rust covers >10% of ear leaves, apply a systemic triazole or strobilurin fungicide immediately.',
        organicSolutions: [
          {
            treatment: 'Copper Hydroxide Bio-Protective Spray',
            recipeOrMethod: 'Mix 25g in 10 liters of water. Spray during low wind conditions.',
            frequency: 'Every 7 days during prolonged damp or misty conditions.',
          },
          {
            treatment: 'Bacillus amyloliquefaciens Foliar Inoculant',
            recipeOrMethod: 'Apply as foliar spray to colonize leaf surfaces and outcompete rust germ tubes.',
            frequency: 'Every 10 days.',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Pyraclostrobin + Fluxapyroxad',
            commercialExample: 'Priaxor Fungicide',
            instructions: 'Apply 4-8 fl oz per acre. Provides curative translaminar and long-lasting residual protection.',
            safetyWarning: 'Apply with ground sprayer. 21-day pre-harvest interval on grain, 7 days on sweet corn.',
          },
          {
            activeIngredient: 'Propiconazole',
            commercialExample: 'Tilt 250 EC',
            instructions: 'Apply at first sign of disease onset before rust reaches the primary ear leaf.',
            safetyWarning: 'Wear personal protective equipment (PPE). Avoid drift into aquatic habitats.',
          },
        ],
        culturalPractices: [
          'Maintain balanced soil fertility; avoid excessive nitrogen which delays leaf cuticle hardening',
          'Chop and incorporate corn residue post-harvest to accelerate breakdown of overwintering inoculum',
        ],
      },
      prevention: [
        'Plant hybrid sweet corn varieties carrying specific Rp resistance genes (Rp1-D, Rp1-E)',
        'Early spring planting to ensure corn reaches maturity before peak southern rust spores blow northward',
      ],
      recoveryPrognosis:
        'Moderate. Fungicide application will arrest newly emerging rust pustules on upper ear leaves, preserving grain filling and cob weight.',
      botanistNotes:
        'Puccinia sorghi produces billions of airborne urediniospores that travel on storm fronts. Quick action at pre-tassel stage prevents significant yield penalty.',
    },
  },
  {
    id: 'sample-citrus-chlorosis',
    title: 'Citrus Iron Chlorosis',
    plantName: 'Lemon / Citrus (Citrus limon)',
    diseaseName: 'Interveinal Iron Chlorosis',
    pathogenType: 'Nutritional',
    severity: 'Mild',
    imageUrl: citrusChlorosisImg,
    description: 'Pale yellowing between dark green leaf veins indicating severe micronutrient lockup.',
    presetDiagnosis: {
      isPlant: true,
      plant: {
        commonName: 'Eureka / Meyer Lemon',
        scientificName: 'Citrus limon',
        family: 'Rutaceae (Citrus family)',
        cultivarOrType: 'Fruiting Citrus Tree',
      },
      healthStatus: 'Nutrient Deficiency',
      primaryDiagnosis: {
        name: 'Interveinal Iron & Micronutrient Chlorosis',
        scientificPathogen: 'Abiotic Nutrient Lockout (Fe / Mg Deficiency)',
        pathogenType: 'Nutritional',
        severity: 'Mild',
        confidence: 98,
        affectedPercentage: 30,
        contagionRisk: 'None',
      },
      symptoms: {
        visualSigns: [
          'Pronounced interveinal yellowing (chlorosis) while the primary and secondary veins remain dark green',
          'Symptoms most intense on the newest flushes of growth at shoot terminals',
          'Foliar texture remains smooth with no fungal sporulation, pustules, or insect webbing',
        ],
        impactedParts: ['Terminal young flush leaves', 'Interveinal lamina'],
        diseaseStage: 'Early-to-mid micronutrient deficiency phase',
        chlorosisOrNecrosis: 'Pure metabolic interveinal chlorosis (zero necrosis)',
      },
      detectedRegions: [
        {
          label: 'Interveinal Chlorotic Zones',
          description: 'Yellowing parenchyma tissue between green vascular bundle veins',
          box_2d: [200, 200, 800, 800],
        },
      ],
      treatmentPlan: {
        emergencyAction:
          'Test root zone soil pH immediately. Alkaline soil (>7.5 pH) locks up bioavailable iron. Apply chelated iron (Fe-EDDHA for alkaline soil or Fe-EDTA for neutral soil) as a root drench and foliar spray.',
        organicSolutions: [
          {
            treatment: 'Chelated Iron Foliar Spray (Fe-EDTA)',
            recipeOrMethod: 'Mix 5 grams chelated iron powder in 2 liters of soft water. Add 2 ml organic yucca extract as wetting agent. Mist foliar canopy.',
            frequency: 'Apply every 10 to 14 days until new leaves emerge rich green.',
          },
          {
            treatment: 'Compost Tea with Liquid Kelp & Epsom Salt',
            recipeOrMethod: 'Drench root zone with 20 ml cold-water kelp extract and 10g Epsom salts (magnesium sulfate) per 5 liters water.',
            frequency: 'Apply once every 3 weeks in active spring/summer growing season.',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Iron EDDHA (Sequestrene 138)',
            commercialExample: 'Miller Ferriplus Fe-EDDHA',
            instructions: 'Dissolve 20g in 5 liters water and pour evenly around the root drip line of the tree.',
            safetyWarning: 'Non-toxic nutrient supplement. Stains porous stone, pavers, and concrete surfaces red.',
          },
          {
            activeIngredient: 'Elemental Soil Sulfur (pH amendment)',
            commercialExample: 'Tiger 90CR Sulfur',
            instructions: 'Incorporate 100g granular sulfur into top 5 cm soil around drip line to gradually lower soil pH below 6.5.',
            safetyWarning: 'Avoid placing directly against tree trunk.',
          },
        ],
        culturalPractices: [
          'Allow top 5 cm of soil to dry out between deep waterings; waterlogged, saturated soil severely impairs iron root uptake',
          'Check soil drainage and aerate compacted heavy clay around the root perimeter',
        ],
      },
      prevention: [
        'Maintain rootzone pH between 6.0 and 6.8',
        'Topdress annually with acidic organic matter such as pine needle compost or peat moss',
      ],
      recoveryPrognosis:
        'Excellent. Foliar iron applications produce visible greening within 7-14 days. New flushes will emerge fully green once rootzone pH is corrected.',
      botanistNotes:
        'Because iron is immobile inside plant vascular tissue, symptoms appear first on the youngest terminal leaves. Older lower leaves will stay deep green.',
    },
  },
  {
    id: 'sample-healthy-pepper',
    title: 'Vibrant Healthy Pepper',
    plantName: 'Bell Pepper (Capsicum annuum)',
    diseaseName: 'Healthy Tissue (Zero Pathogens)',
    pathogenType: 'None',
    severity: 'Healthy',
    imageUrl: healthyPepperImg,
    description: 'Pristine turgid deep green foliage with uniform chloroplast density and zero lesion signs.',
    presetDiagnosis: {
      isPlant: true,
      plant: {
        commonName: 'Bell Pepper / Sweet Pepper',
        scientificName: 'Capsicum annuum',
        family: 'Solanaceae (Nightshade family)',
        cultivarOrType: 'Sweet Bell Variety',
      },
      healthStatus: 'Healthy',
      primaryDiagnosis: {
        name: 'Optimal Foliar Health (No Pathogens Detected)',
        scientificPathogen: 'None (Healthy Botanical Specimen)',
        pathogenType: 'None',
        severity: 'None',
        confidence: 99,
        affectedPercentage: 0,
        contagionRisk: 'None',
      },
      symptoms: {
        visualSigns: [
          'Lustrous, uniform dark emerald green leaf pigmentation',
          'Intact cell turgor pressure with crisp margins and unblemished cuticle',
          'Zero necrotic spots, chlorotic halos, fungal hyphae, or pest frass',
        ],
        impactedParts: ['None (All foliage healthy)'],
        diseaseStage: 'Optimal Vegetative Stage',
        chlorosisOrNecrosis: 'Zero (Optimal chlorophyll A & B concentration)',
      },
      detectedRegions: [],
      treatmentPlan: {
        emergencyAction:
          'No emergency interventions required. Continue existing irrigation and fertilization schedule.',
        organicSolutions: [
          {
            treatment: 'Preventative Cold-Pressed Neem Oil Wash',
            recipeOrMethod: '5 ml per liter of water as an occasional monthly maintenance rinse to deter aphids and thrips.',
            frequency: 'Once every 30 days.',
          },
          {
            treatment: 'Fish Hydrolysate & Kelp Foliar Feed',
            recipeOrMethod: '15 ml in 4 liters of water to boost cellular immunity and micronutrient resilience.',
            frequency: 'Every 2 to 3 weeks during flowering.',
          },
        ],
        chemicalSolutions: [],
        culturalPractices: [
          'Maintain regular, deep watering to prevent blossom end rot once fruits set',
          'Provide stake or cage support as peppers develop fruit weight',
          'Mulch around base to conserve soil moisture and moderate root temperatures',
        ],
      },
      prevention: [
        'Inspect leaf undersides weekly for early signs of spider mites or aphids',
        'Avoid wetting foliage late in the evening to discourage damp fungal spore germination',
      ],
      recoveryPrognosis:
        'Prime. Specimen exhibits peak physiological vigour and photosynthetic efficiency.',
      botanistNotes:
        'This leaf represents benchmark botanical specimen health: intact waxy cuticle layer, well-vascularized venation, and optimal stomatal distribution.',
    },
  },
];
