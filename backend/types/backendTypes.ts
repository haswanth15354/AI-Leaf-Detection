export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  farmName?: string;
  role: 'farmer' | 'agronomist' | 'researcher' | 'student';
  avatarUrl?: string;
  createdAt: string;
}

export interface DiagnoseRequestBody {
  imageBase64: string;
  mimeType?: string;
  plantHint?: string;
  environmentContext?: string;
}

export interface ChatRequestBody {
  message: string;
  history?: Array<{ role: string; text: string }>;
  currentDiagnosis?: any;
}

export interface DosageRequestBody {
  treatmentName: string;
  landArea: number;
  areaUnit: string; // 'sq_meters' | 'acres' | 'hectares' | 'pots'
  cropType: string;
  severity: string;
  waterVolume?: string;
}
