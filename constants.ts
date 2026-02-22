
/**
 * MARINHEIROPRO ENGINEERING CONSTANTS
 * Centralized normative data and material properties.
 * Versioning allows for historical compliance audits.
 */

export const STANDARDS_CONFIG = {
  NR12: {
    name: 'NR-12 - Segurança no Trabalho em Máquinas e Equipamentos',
    version: '2019 (Atualizada Portaria SEPRT 916)',
    lastUpdate: '2019-07-30',
    minWidth: 400,
    maxWidth: 600,
    minRungSpacing: 250,
    maxRungSpacing: 300,
    minRungDiameter: 25,
    minWallDistance: 150,
    cageRequiredAbove: 3500,
    cageStartMin: 2200,
    cageStartMax: 3000,
    cageDiameterMin: 650,
    cageDiameterMax: 800,
    platformRequiredAbove: 6000,
    defaultWidth: 450,
    defaultRungSpacing: 300,
    defaultRungDiameter: 25,
    defaultWallDistance: 200,
    clauses: {
      width: 'Anexo III - 12.12.1 (a)',
      rungs: 'Anexo III - 12.12.1 (b)',
      spacing: 'Anexo III - 12.12.1 (c)',
      wall: 'Anexo III - 12.12.1 (d)',
      cage: 'Anexo III - 12.12.1 (e)',
      platform: 'Anexo III - 12.12.1 (h)'
    }
  },
  NBR14718: {
    name: 'ABNT NBR 15708-4 / NBR 14718 equivalent',
    version: '2015',
    lastUpdate: '2015-12-01',
    minWidth: 400,
    maxWidth: 500,
    minRungSpacing: 250,
    maxRungSpacing: 300,
    minRungDiameter: 25,
    minWallDistance: 150,
    cageRequiredAbove: 2000,
    cageStartMin: 2100,
    cageStartMax: 2400,
    cageDiameterMin: 650,
    cageDiameterMax: 750,
    platformRequiredAbove: 4000,
    defaultWidth: 400,
    defaultRungSpacing: 300,
    defaultRungDiameter: 25,
    defaultWallDistance: 150,
    clauses: {
      width: 'Cláusula 4.2',
      rungs: 'Cláusula 4.3',
      spacing: 'Cláusula 4.4',
      wall: 'Cláusula 4.5',
      cage: 'Cláusula 5.1',
      platform: 'Cláusula 5.3'
    }
  },
  ISO14122_4: {
    name: 'ISO 14122-4 - Safety of machinery - Fixed ladders',
    version: '2016',
    lastUpdate: '2016-06-01',
    minWidth: 400,
    maxWidth: 600,
    minRungSpacing: 225,
    maxRungSpacing: 300,
    minRungDiameter: 20,
    minWallDistance: 150,
    cageRequiredAbove: 3000,
    cageStartMin: 2200,
    cageStartMax: 3000,
    cageDiameterMin: 650,
    cageDiameterMax: 800,
    platformRequiredAbove: 6000,
    defaultWidth: 500,
    defaultRungSpacing: 250,
    defaultRungDiameter: 30,
    defaultWallDistance: 200,
    clauses: {
      width: 'ISO 14122-4:4.4.1.2',
      rungs: 'ISO 14122-4:4.4.1.1',
      spacing: 'ISO 14122-4:4.4.1.1',
      wall: 'ISO 14122-4:4.4.1.3',
      cage: 'ISO 14122-4:4.5',
      platform: 'ISO 14122-4:4.6'
    }
  },
  OSHA1910_27: {
    name: 'OSHA 1910.27 - Fixed Ladders',
    version: '1910 Subpart D',
    lastUpdate: '2017-01-17',
    minWidth: 406,
    maxWidth: 610,
    minRungSpacing: 254,
    maxRungSpacing: 305,
    minRungDiameter: 19,
    minWallDistance: 178,
    cageRequiredAbove: 7315,
    cageStartMin: 2133,
    cageStartMax: 2438,
    cageDiameterMin: 685,
    cageDiameterMax: 762,
    platformRequiredAbove: 9144,
    defaultWidth: 457,
    defaultRungSpacing: 305,
    defaultRungDiameter: 25,
    defaultWallDistance: 178,
    clauses: {
      width: '1910.27(b)(1)',
      rungs: '1910.27(b)(1)',
      spacing: '1910.27(b)(1)',
      wall: '1910.27(c)(4)',
      cage: '1910.27(d)(1)',
      platform: '1910.27(d)(2)'
    }
  }
};

export const MATERIALS = {
  'Aço carbono': { 
    density: 7850, 
    yieldStrength: 250, // MPa (ASTM A36 equivalent)
    youngsModulus: 210000, 
    thermalExpansion: 12e-6 
  },
  'Aço galvanizado': { 
    density: 7850, 
    yieldStrength: 250, 
    youngsModulus: 210000, 
    thermalExpansion: 12e-6 
  },
  'Aço inox': { 
    density: 8000, 
    yieldStrength: 210, // MPa (AISI 304)
    youngsModulus: 193000, 
    thermalExpansion: 17.3e-6 
  },
  'Alumínio': { 
    density: 2700, 
    yieldStrength: 145, // MPa (6061-T6 approx)
    youngsModulus: 70000, 
    thermalExpansion: 23e-6 
  },
  'FRP': { 
    density: 1800, 
    yieldStrength: 150, // MPa (Pultruded Profile)
    youngsModulus: 25000, 
    thermalExpansion: 8e-6 
  },
};

export const INSTALLATION_TYPES = ['Parede', 'Estrutura metálica', 'Torre'];
export const ENVIRONMENTS = ['Interno', 'Externo', 'Corrosivo'];
