export interface DetectedRegion {
  label: string;
  description?: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 scale
}

export interface OrganicSolution {
  treatment: string;
  recipeOrMethod: string;
  frequency: string;
}

export interface ChemicalSolution {
  activeIngredient: string;
  commercialExample?: string;
  instructions: string;
  safetyWarning?: string;
}

export interface DiagnosisResult {
  isPlant: boolean;
  plant: {
    commonName: string;
    scientificName: string;
    family: string;
    cultivarOrType?: string;
  };
  healthStatus: 'Healthy' | 'Diseased' | 'Pest Infestation' | 'Nutrient Deficiency' | 'Abiotic / Environmental Stress';
  primaryDiagnosis: {
    name: string;
    scientificPathogen?: string;
    pathogenType: 'Fungal' | 'Oomycete' | 'Bacterial' | 'Viral' | 'Insect/Mite Pest' | 'Nutritional' | 'Environmental' | 'None';
    severity: 'None' | 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    confidence: number;
    affectedPercentage: number;
    contagionRisk: 'None' | 'Low' | 'Moderate' | 'High' | 'Extremely High';
  };
  symptoms: {
    visualSigns: string[];
    impactedParts: string[];
    diseaseStage: string;
    chlorosisOrNecrosis?: string;
  };
  detectedRegions?: DetectedRegion[];
  treatmentPlan: {
    emergencyAction: string;
    organicSolutions: OrganicSolution[];
    chemicalSolutions: ChemicalSolution[];
    culturalPractices: string[];
  };
  prevention: string[];
  recoveryPrognosis: string;
  botanistNotes?: string;
}

export interface ScanHistoryRecord {
  id: string;
  timestamp: number;
  imageUrl: string;
  diagnosis: DiagnosisResult;
  notes?: string;
  status: 'Needs Action' | 'Treated' | 'Monitoring' | 'Resolved';
  customTag?: string;
}

export interface SampleLeaf {
  id: string;
  title: string;
  plantName: string;
  diseaseName: string;
  pathogenType: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Healthy';
  imageUrl: string;
  description: string;
  presetDiagnosis?: DiagnosisResult;
}

export interface DiseaseAtlasEntry {
  id: string;
  name: string;
  scientificName: string;
  type: 'Fungal' | 'Bacterial' | 'Viral' | 'Oomycete' | 'Pest' | 'Nutritional';
  vulnerableCrops: string[];
  symptoms: string[];
  favorableConditions: string;
  organicTreatments: string[];
  chemicalTreatments: string[];
  preventionTips: string[];
}
