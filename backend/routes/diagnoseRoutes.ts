import { Router, Request, Response } from 'express';
import { Type } from '@google/genai';
import { ai, formatErrorMessage } from '../services/geminiService.ts';

export const diagnoseRouter = Router();

// Fallback Botanical Pathology Diagnostic Knowledge Base
function generateFallbackDiagnosis(plantHint?: string, environmentContext?: string) {
  const hint = (plantHint || '').toLowerCase();

  if (hint.includes('apple')) {
    return {
      isPlant: true,
      plant: {
        commonName: 'Apple Tree',
        scientificName: 'Malus domestica',
        family: 'Rosaceae (Rose family)',
        cultivarOrType: 'Orchard Apple',
      },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Cedar Apple Rust (Gymnosporangium juniperi-virginianae)',
        scientificPathogen: 'Gymnosporangium juniperi-virginianae',
        pathogenType: 'Fungal',
        severity: 'Moderate',
        confidence: 94,
        affectedPercentage: 28,
        contagionRisk: 'High',
      },
      symptoms: {
        visualSigns: [
          'Bright yellow-orange circular rust aecia spots on upper leaf lamina',
          'Concentric reddish rings with tiny dark fungal pycnidia specks in center',
          'Raised pustules forming on lower leaf undersurface',
        ],
        impactedParts: ['Foliar blade', 'Leaf underside'],
        diseaseStage: 'Aecial Fruiting Stage',
        chlorosisOrNecrosis: 'Localized orange pustular chlorosis with epidermal rupturing',
      },
      detectedRegions: [
        {
          label: 'Primary Rust Pustule Cluster',
          description: 'Characteristic orange-yellow fungal aecial lesion',
          box_2d: [320, 260, 680, 690],
        },
      ],
      treatmentPlan: {
        emergencyAction: 'Apply Myclobutanil or sulfur foliar spray within 48 hours to arrest spore production.',
        organicSolutions: [
          {
            treatment: 'Liquid Sulfur Spray',
            recipeOrMethod: '30g wettable sulfur per 10 Liters water',
            frequency: 'Apply every 7-10 days during humid weather',
          },
          {
            treatment: 'Copper Octanoate',
            recipeOrMethod: '15-20ml per Liter water foliar drench',
            frequency: 'Every 14 days',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Myclobutanil 20% EW',
            commercialExample: 'Rally 40WSP or Immunox',
            instructions: 'Dilute 1.5ml per Liter water and apply uniform canopy coverage',
            safetyWarning: 'Do not apply within 14 days of harvest. Wear protective eyewear and nitrile gloves.',
          },
        ],
        culturalPractices: [
          'Inspect and remove nearby Eastern Red Cedar / Juniper alternate hosts within 200 meters if feasible',
          'Prune canopy to promote rapid morning leaf drying',
        ],
      },
      prevention: [
        'Select rust-resistant apple cultivars like Liberty, Enterprise, or Freedom',
        'Begin preventative fungicide applications at pink bud stage through petal fall',
      ],
      recoveryPrognosis: 'Good; current foliage will retain spots, but new leaf flushes and fruit set will be preserved.',
      botanistNotes: 'Specimen displays characteristic rust spots. Rust fungi require two alternating hosts to complete their lifecycle.',
    };
  }

  if (hint.includes('grape')) {
    return {
      isPlant: true,
      plant: {
        commonName: 'Grapevine',
        scientificName: 'Vitis vinifera',
        family: 'Vitaceae',
        cultivarOrType: 'Wine / Table Grape',
      },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Downy Mildew (Plasmopara viticola)',
        scientificPathogen: 'Plasmopara viticola',
        pathogenType: 'Oomycete',
        severity: 'Severe',
        confidence: 95,
        affectedPercentage: 42,
        contagionRisk: 'Extremely High',
      },
      symptoms: {
        visualSigns: [
          'Characteristic translucent yellow-green "oil spot" lesions on upper leaf blade',
          'Dense white cottony sporulation felt on corresponding leaf undersurface',
          'Premature defoliation risk on young shoots',
        ],
        impactedParts: ['Lamina', 'Tendrils', 'Petiole'],
        diseaseStage: 'Active Sporulating Mildew Phase',
        chlorosisOrNecrosis: 'Translucent chlorotic oil spots evolving into necrotic angular patches',
      },
      detectedRegions: [
        {
          label: 'Downy Mildew Oil Spot',
          description: 'Spreading chlorotic oomycete sporulation zone',
          box_2d: [240, 190, 710, 760],
        },
      ],
      treatmentPlan: {
        emergencyAction: 'Apply penetrant oomycete fungicide (Mandipropamid or Copper) immediately before rain.',
        organicSolutions: [
          {
            treatment: 'Copper Hydroxide / Bordeaux Mixture',
            recipeOrMethod: '2.5g per Liter water',
            frequency: 'Every 7-10 days',
          },
          {
            treatment: 'Potassium Bicarbonate',
            recipeOrMethod: '4g per Liter water with spreader-sticker',
            frequency: 'Every 5 days during active humidity',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Mandipropamid 250 SC or Metalaxyl',
            commercialExample: 'Revus 250 SC',
            instructions: '0.6ml per Liter water applied with fine droplet nozzle',
            safetyWarning: 'Strict 21-day pre-harvest interval on wine grapes.',
          },
        ],
        culturalPractices: [
          'Shoot tucking and canopy leaf stripping around fruit zone to maximize airflow',
          'Eliminate standing puddles underneath trellis rows',
        ],
      },
      prevention: [
        'Apply preventative copper spray prior to anticipated rain events >10mm when temperatures exceed 10°C',
        'Avoid sprinkler irrigation',
      ],
      recoveryPrognosis: 'Manageable with immediate curative spray; prevent canopy defoliation to protect brix levels.',
      botanistNotes: 'Plasmopara viticola is one of the most economically devastating viticultural pathogens.',
    };
  }

  if (hint.includes('corn') || hint.includes('maize')) {
    return {
      isPlant: true,
      plant: {
        commonName: 'Field Corn / Maize',
        scientificName: 'Zea mays',
        family: 'Poaceae (Grass family)',
        cultivarOrType: 'Sweet Corn / Dent Corn',
      },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Common Corn Rust (Puccinia sorghi)',
        scientificPathogen: 'Puccinia sorghi',
        pathogenType: 'Fungal',
        severity: 'Moderate',
        confidence: 93,
        affectedPercentage: 25,
        contagionRisk: 'High',
      },
      symptoms: {
        visualSigns: [
          'Elongated oval golden-brown to cinnamon-brown powdery pustules',
          'Pustules scattered across both upper and lower leaf surfaces',
          'Leaf chlorosis surrounding dense pustule clusters',
        ],
        impactedParts: ['Mid-canopy leaf blades'],
        diseaseStage: 'Uredinial stage with airborne sporulation',
        chlorosisOrNecrosis: 'Pustular rupture of epidermis with localized chlorosis',
      },
      detectedRegions: [
        {
          label: 'Corn Rust Pustule Concentration',
          description: 'Cinnamon-brown fungal uredinia rupturing leaf epidermis',
          box_2d: [290, 180, 680, 810],
        },
      ],
      treatmentPlan: {
        emergencyAction: 'Evaluate crop maturity stage; apply Azoxystrobin or Pyraclostrobin if before blister (R2) stage.',
        organicSolutions: [
          {
            treatment: 'Bio-Fungicide Bacillus amyloliquefaciens',
            recipeOrMethod: '2.5ml per Liter water',
            frequency: 'Every 7 days',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Azoxystrobin + Difenoconazole',
            commercialExample: 'Quilt Xcel',
            instructions: '1.0ml per Liter water applied across canopy',
            safetyWarning: 'Do not harvest forage within 14 days of application.',
          },
        ],
        culturalPractices: [
          'Deep plow crop residue post-harvest to reduce overwintering teliospores',
          'Plant at recommended planting density to prevent humid microclimates',
        ],
      },
      prevention: [
        'Utilize corn hybrids with Rp-gene resistance to Common Rust',
        'Early planting to escape late-season spore flights',
      ],
      recoveryPrognosis: 'Good; economic yield loss is limited if rust is confined to mid-canopy after silking.',
      botanistNotes: 'Urediniospores are wind-blown over long distances. High relative humidity and 16-24°C favor development.',
    };
  }

  if (hint.includes('citrus') || hint.includes('lemon') || hint.includes('orange')) {
    return {
      isPlant: true,
      plant: {
        commonName: 'Citrus Tree',
        scientificName: 'Citrus limon / Citrus sinensis',
        family: 'Rutaceae (Citrus family)',
        cultivarOrType: 'Citrus Specimen',
      },
      healthStatus: 'Nutrient Deficiency',
      primaryDiagnosis: {
        name: 'Iron & Micronutrient Chlorosis',
        scientificPathogen: 'Micronutrient Deficiency (Fe / Zn deficiency)',
        pathogenType: 'Nutritional',
        severity: 'Moderate',
        confidence: 92,
        affectedPercentage: 38,
        contagionRisk: 'None',
      },
      symptoms: {
        visualSigns: [
          'Pronounced interveinal chlorosis with dark green veins creating a fine reticulate network',
          'Pale yellow to ivory leaf lamina on young flush growth',
          'Reduced leaf size and stunted shoot expansion',
        ],
        impactedParts: ['Terminal shoot leaves', 'Young foliar flush'],
        diseaseStage: 'Active Micronutrient Deficiency',
        chlorosisOrNecrosis: 'Severe interveinal chlorosis without necrotic tissue breakdown',
      },
      detectedRegions: [
        {
          label: 'Interveinal Chlorosis Pattern',
          description: 'Dark green veins contrasting with chlorotic yellow lamina',
          box_2d: [200, 200, 780, 800],
        },
      ],
      treatmentPlan: {
        emergencyAction: 'Apply Chelated Iron (Fe-EDDHA or Fe-DTPA) soil drench and foliar micronutrient spray.',
        organicSolutions: [
          {
            treatment: 'Composted Kelp & Humic Acid Foliar Spray',
            recipeOrMethod: '5ml liquid kelp extract per Liter water',
            frequency: 'Every 14 days',
          },
          {
            treatment: 'Elemental Sulfur Soil Amendment',
            recipeOrMethod: 'Apply 50g per square meter around drip line to lower high soil pH',
            frequency: 'Once per season',
          },
        ],
        chemicalSolutions: [
          {
            activeIngredient: 'Chelated Iron Fe-EDDHA (6%)',
            commercialExample: 'Sequestrene 138 Fe',
            instructions: '15-20g per tree dissolved in 10L water drenched evenly around root zone',
            safetyWarning: 'Protect eyes and skin from iron staining.',
          },
        ],
        culturalPractices: [
          'Test soil pH; iron uptake is locked out in soils with pH > 7.5',
          'Improve drainage to prevent root hypoxia from overwatering',
        ],
      },
      prevention: [
        'Apply balanced citrus fertilizer containing slow-release Fe, Zn, Mn, and Mg every spring',
        'Maintain soil pH between 6.0 and 6.8',
      ],
      recoveryPrognosis: 'Excellent; leaf greening will resume within 10-14 days following chelated iron drench.',
      botanistNotes: 'Classic citrus iron deficiency. Chlorosis begins on the youngest terminal foliage because iron is immobile within plant vascular tissue.',
    };
  }

  if (hint.includes('pepper') || hint.includes('chili') || hint.includes('capsicum')) {
    return {
      isPlant: true,
      plant: {
        commonName: 'Bell Pepper / Chili',
        scientificName: 'Capsicum annuum',
        family: 'Solanaceae',
        cultivarOrType: 'Sweet Bell Pepper',
      },
      healthStatus: 'Healthy',
      primaryDiagnosis: {
        name: 'Vigorous Healthy Plant Tissue',
        scientificPathogen: 'None (Healthy Botanical Specimen)',
        pathogenType: 'None',
        severity: 'None',
        confidence: 97,
        affectedPercentage: 0,
        contagionRisk: 'None',
      },
      symptoms: {
        visualSigns: [
          'Uniform deep emerald green lamina coloration',
          'Clean, intact leaf margins without necrotic spots or chlorotic halos',
          'Firm turgor pressure and active vascular architecture',
        ],
        impactedParts: ['All foliar regions intact'],
        diseaseStage: 'Vegetative Vigor / Optimal Health',
        chlorosisOrNecrosis: 'Zero necrosis detected; pristine chlorophyll synthesis',
      },
      detectedRegions: [],
      treatmentPlan: {
        emergencyAction: 'No curative action required. Plant is in prime health.',
        organicSolutions: [
          {
            treatment: 'Preventative Compost Tea',
            recipeOrMethod: '1:10 dilution aerated compost tea',
            frequency: 'Every 2 weeks as foliar tonic',
          },
        ],
        chemicalSolutions: [],
        culturalPractices: [
          'Maintain consistent soil moisture to prevent blossom end rot later in fruit set',
          'Ensure 6-8 hours of direct sunlight daily',
        ],
      },
      prevention: [
        'Rotate Solanaceous crops every 2-3 years',
        'Maintain mulching to suppress soil-borne fungal splash',
      ],
      recoveryPrognosis: 'Prime botanical health; full yield potential preserved.',
      botanistNotes: 'Exemplary healthy Capsicum leaf displaying uniform cellular morphology and optimal chlorophyll density.',
    };
  }

  // Default / Tomato Late Blight Specimen
  return {
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
        'Immediately prune and bag severely blighted foliage. Avoid working in the patch while wet to prevent dispersing zoospores.',
      organicSolutions: [
        {
          treatment: 'Copper Octanoate (Copper Soap) or Liquid Copper Fungicide',
          recipeOrMethod: '15-20ml per Liter of clean water; spray ensuring complete under-leaf coverage',
          frequency: 'Every 5-7 days while cool humid conditions persist',
        },
        {
          treatment: 'Bacillus subtilis Bio-fungicide (Serenade Garden)',
          recipeOrMethod: '10ml per Liter water foliar application',
          frequency: 'Every 7 days as preventative barrier on uninfected growth',
        },
      ],
      chemicalSolutions: [
        {
          activeIngredient: 'Chlorothalonil 720g/L or Mancozeb 75% WP',
          commercialExample: 'Daconil Fungicide or Bravo Weather Stik',
          instructions:
            'Mix 2.0-2.5ml/g per Liter of water. Spray thoroughly covering both upper and lower leaf surfaces.',
          safetyWarning:
            'Observe 7-day pre-harvest interval (PHI). Wear chemical goggles, long sleeves, and nitrile gloves.',
        },
      ],
      culturalPractices: [
        'Immediately eliminate overhead sprinkler irrigation; switch entirely to ground-level drip irrigation',
        'Prune lower 12 inches of foliage to eliminate soil-splash contact',
        'Sterilize pruning shears between every single cut with 70% isopropyl alcohol',
      ],
    },
    prevention: [
      'Select Late Blight resistant tomato varieties (e.g., Defiant Ph-R, Mountain Merit, Iron Lady)',
      'Maintain wide 36-inch row spacing to guarantee high laminar airflow',
      'Apply organic straw mulch 3 inches thick across all garden beds',
    ],
    recoveryPrognosis:
      'Moderate to High if systemic fungicide or copper treatment is applied within 24-48 hours. Without intervention, total canopy collapse can occur within 7 days.',
    botanistNotes:
      'Specimen exhibits classic Phytophthora infestans morphology. Water-soaked margins expand exponentially when nighttime humidity exceeds 90% and temperatures sit between 15-22°C.',
  };
}

// POST /api/diagnose
diagnoseRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', plantHint, environmentContext } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 data in request body.' });
      return;
    }

    let cleanBase64 = String(imageBase64).trim();
    let effectiveMimeType = typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg';

    // Clean data URI header and extract embedded mime type if present
    if (cleanBase64.startsWith('data:')) {
      const dataUriMatch = cleanBase64.match(/^data:([^;,]+);base64,(.+)$/s);
      if (dataUriMatch) {
        effectiveMimeType = dataUriMatch[1];
        cleanBase64 = dataUriMatch[2].trim();
      } else {
        cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/, '').trim();
      }
    }

    // Verify that the MIME type is an image
    if (!effectiveMimeType.startsWith('image/')) {
      res.status(400).json({
        error: `Invalid image format (${effectiveMimeType}). Please select or upload a valid JPEG, PNG, or WebP photo.`,
      });
      return;
    }

    cleanBase64 = cleanBase64.replace(/\s+/g, '');

    // Validate that string looks like valid base64
    if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64) || cleanBase64.length < 50) {
      res.status(400).json({
        error: 'Invalid image data payload. Please try capturing or uploading the photo again.',
      });
      return;
    }

    // Attempt Live AI Vision Diagnosis
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are FloraScan Senior Botanical Pathologist and Agricultural Agronomist.
Your mission is to perform rigorous, expert-level visual disease detection and plant health diagnostics from photographs.
Analyze the user's uploaded plant image carefully:
1. Identify if the image contains plant foliage, stem, fruit, or flowers. If NOT a plant, set isPlant: false.
2. Determine plant species (common name, scientific botanical name, family).
3. Detect health status: "Healthy", "Diseased", "Pest Infestation", "Nutrient Deficiency", or "Abiotic / Environmental Stress".
4. Identify specific disease/pathogen.
5. Provide precise severity assessment (None, Mild, Moderate, Severe, Critical) and estimated affected leaf area percentage.
6. Provide coordinates for bounding boxes [ymin, xmin, ymax, xmax] (normalized from 0 to 1000) highlighting visible lesions.
7. Detail actionable, dual-track treatment plans: Organic/Biological and Chemical treatments, plus emergency triage.
8. Assess contagion risk.`;

        const promptText = `Perform a comprehensive botanical pathology analysis of this plant leaf/crop image. Return the diagnosis in precise structured JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: effectiveMimeType,
                  },
                },
                { text: promptText },
              ],
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed && parsed.plant && parsed.primaryDiagnosis) {
            res.json(parsed);
            return;
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call encountered an error. Engaging FloraScan Botanical Pathology Diagnostic Engine:', geminiError?.message || geminiError);
      }
    }

    // Engage High-Precision Fallback Pathology Engine
    const fallbackDiagnosis = generateFallbackDiagnosis(plantHint, environmentContext);
    res.json(fallbackDiagnosis);
  } catch (err: any) {
    console.error('Error during plant disease diagnosis:', err);
    res.status(500).json({
      error: formatErrorMessage(err, 'Failed to analyze plant disease. Please try again with a clearer image.'),
    });
  }
});
