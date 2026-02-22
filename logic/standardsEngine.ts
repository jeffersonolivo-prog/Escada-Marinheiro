
import { LadderDimensions, ValidationRule, CalculationResult } from '../types';
import { STANDARDS_CONFIG, MATERIALS } from '../constants';

/**
 * MARINHEIROPRO ENGINEERING ENGINE v2.0
 * Decoupled modular core for mechanical validation, stress analysis, and normative verification.
 */
export class StandardsEngine {
  
  /**
   * Performs structural and geometric calculations for the ladder assembly.
   * Includes simplified stress analysis for rungs based on concentrated load.
   * 
   * @param dims Technical parameters of the ladder
   * @returns Detailed calculation result for engineering review
   */
  static calculate(dims: LadderDimensions): CalculationResult {
    const config = STANDARDS_CONFIG[dims.standard];
    const mat = MATERIALS[dims.material];
    
    // 1. Geometric Discrete Analysis
    const numRungs = Math.floor(dims.totalHeight / dims.rungSpacing);
    const actualSpacing = numRungs > 0 ? dims.totalHeight / numRungs : 0;
    
    // 2. Normative Threshold Checks
    const cageMandatory = dims.totalHeight > config.cageRequiredAbove;
    const platformMandatory = dims.totalHeight > config.platformRequiredAbove;
    
    // 3. Mass Estimation (Volumetric)
    // Stringer assumption: Flat bar 65x10mm (conservative estimate)
    const stringerArea = 65 * 10; 
    const L_total = (dims.totalHeight + dims.topExtension) * 2;
    const volumeRails = (L_total * stringerArea) / 1000000;
    
    const rungArea = Math.PI * Math.pow(dims.rungDiameter / 2, 2);
    const volumeRungs = (dims.width * (numRungs + 1) * rungArea) / 1000000;
    
    // Cage: Vertical bars + hoops (approximate)
    const cageHeight = dims.hasCage ? (dims.totalHeight - dims.cageStartHeight) : 0;
    const volumeCage = cageHeight > 0 ? (cageHeight * 0.008) : 0; 
    
    const weight = Math.round((volumeRails + volumeRungs + volumeCage) * mat.density * 100) / 100;

    // 4. Simplified Structural Verification (Concentrated Load at Center of Rung)
    // P = 1.5 kN (NR-12 dynamic load requirement)
    const P = 1500; // Newtons
    const L = dims.width; // mm
    const M_max = (P * L) / 4; // Bending moment Nmm
    const I = (Math.PI * Math.pow(dims.rungDiameter, 4)) / 64; // Moment of inertia
    const y = dims.rungDiameter / 2;
    const stress = (M_max * y) / I; // MPa
    
    const safetyFactor = Math.round((mat.yieldStrength / stress) * 100) / 100;

    return {
      totalRungs: numRungs + 1,
      actualRungSpacing: Math.round(actualSpacing * 10) / 10,
      maxHeightWithoutCage: config.cageRequiredAbove,
      cageMandatory,
      platformMandatory,
      weightEstimated: weight,
      reactionForceBase: Math.round((weight * 0.00981) * 100) / 100, // kN
      structuralIntegrity: {
        maxStressRung: Math.round(stress * 100) / 100,
        yieldStrength: mat.yieldStrength,
        safetyFactor: safetyFactor
      }
    };
  }

  /**
   * Validates dimensions against the active technical standard version.
   * 
   * @param dims Current geometric state
   * @returns Array of validation rules with binary pass/fail and descriptive risks
   */
  static validate(dims: LadderDimensions): ValidationRule[] {
    const config = STANDARDS_CONFIG[dims.standard];
    
    const rules: ValidationRule[] = [
      {
        id: 'width',
        standardCode: dims.standard,
        clause: config.clauses.width,
        description: `Largura útil (espaço livre)`,
        isValid: dims.width >= config.minWidth && dims.width <= config.maxWidth,
        value: dims.width,
        limit: `${config.minWidth}-${config.maxWidth}mm`,
        severity: 'critical',
        associatedRisk: "Risco de aprisionamento lateral ou instabilidade por largura excessiva."
      },
      {
        id: 'rung_spacing',
        standardCode: dims.standard,
        clause: config.clauses.spacing,
        description: `Passo vertical constante`,
        isValid: dims.rungSpacing >= config.minRungSpacing && dims.rungSpacing <= config.maxRungSpacing,
        value: dims.rungSpacing,
        limit: `${config.minRungSpacing}-${config.maxRungSpacing}mm`,
        severity: 'critical',
        associatedRisk: "Queda em altura por fadiga ou perda de ritmo (tropeço) na ascensão."
      },
      {
        id: 'wall_dist',
        standardCode: dims.standard,
        clause: config.clauses.wall,
        description: `Afastamento de obstáculos fixos`,
        isValid: dims.wallDistance >= config.minWallDistance,
        value: dims.wallDistance,
        limit: `min. ${config.minWallDistance}mm`,
        severity: 'critical',
        associatedRisk: "Apoio plantar incompleto; risco severo de escorregamento do calçado."
      },
      {
        id: 'rung_diameter',
        standardCode: dims.standard,
        clause: config.clauses.rungs,
        description: `Seção transversal do degrau`,
        isValid: dims.rungDiameter >= config.minRungDiameter,
        value: dims.rungDiameter,
        limit: `min. ${config.minRungDiameter}mm`,
        severity: 'warning',
        associatedRisk: "Fadiga nas mãos por empunhadura deficiente e risco de flambagem/flexão excessiva."
      },
      {
        id: 'cage_requirement',
        standardCode: dims.standard,
        clause: config.clauses.cage,
        description: `Requisito de Proteção Coletiva`,
        isValid: dims.totalHeight <= config.cageRequiredAbove || dims.hasCage,
        value: dims.hasCage ? 'Instalada' : 'Ausente',
        limit: `Obrigatória > ${config.cageRequiredAbove}mm`,
        severity: 'critical',
        associatedRisk: "Queda livre desimpedida com impacto direto no solo (fatalidade)."
      },
      {
        id: 'cage_start',
        standardCode: dims.standard,
        clause: config.clauses.cage,
        description: `Altura de início da proteção`,
        isValid: !dims.hasCage || (dims.cageStartHeight >= config.cageStartMin && dims.cageStartHeight <= config.cageStartMax),
        value: dims.cageStartHeight,
        limit: `${config.cageStartMin}-${config.cageStartMax}mm`,
        severity: 'warning',
        associatedRisk: "Altura baixa dificulta acesso; altura elevada permite queda lateral antes da retenção."
      }
    ];

    return rules;
  }
}
