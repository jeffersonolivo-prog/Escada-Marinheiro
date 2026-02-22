
export type TechnicalStandard = 'NR12' | 'NBR14718' | 'ISO14122_4' | 'OSHA1910_27';
export type InstallationType = 'Parede' | 'Estrutura metálica' | 'Torre';
export type Environment = 'Interno' | 'Externo' | 'Corrosivo';
export type MaterialType = 'Aço carbono' | 'Aço galvanizado' | 'Aço inox' | 'Alumínio' | 'FRP';
export type AppMode = 'projeto' | 'auditoria';
export type AppTheme = 'light' | 'dark';

export interface BOMItem {
  part: string;
  specification: string;
  quantity: number;
  unit: string;
  totalLength?: number;
}

export interface LadderDimensions {
  mode: AppMode;
  standard: TechnicalStandard;
  installationType: InstallationType;
  environment: Environment;
  totalHeight: number; 
  width: number; 
  rungSpacing: number; 
  rungDiameter: number; 
  wallDistance: number; 
  cageStartHeight: number; 
  cageDiameter: number; 
  topExtension: number; 
  handrailHeight: number; 
  hasCage: boolean;
  hasPlatform: boolean;
  material: MaterialType;
  theme: AppTheme;
}

export interface ValidationRule {
  id: string;
  standardCode: string;
  clause: string;
  description: string;
  isValid: boolean;
  value: any;
  limit: string;
  severity: 'critical' | 'warning' | 'info';
  explanation?: string;
  associatedRisk?: string;
}

export interface CalculationResult {
  totalRungs: number;
  actualRungSpacing: number;
  maxHeightWithoutCage: number;
  cageMandatory: boolean;
  platformMandatory: boolean;
  weightEstimated: number; 
  reactionForceBase: number; 
  structuralIntegrity?: {
    maxStressRung: number;
    yieldStrength: number;
    safetyFactor: number;
  };
  bom?: BOMItem[];
}
