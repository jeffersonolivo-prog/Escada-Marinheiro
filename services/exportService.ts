
import { LadderDimensions, BOMItem } from '../types';

/**
 * Calculates a simplified Bill of Materials based on ladder dimensions
 */
export function calculateBOM(dims: LadderDimensions): BOMItem[] {
  const items: BOMItem[] = [];
  const numRungs = Math.floor(dims.totalHeight / dims.rungSpacing) + 1;
  const stringerHeight = dims.totalHeight + dims.topExtension;
  const materialSuffix = dims.material === 'FRP' ? ' (Perfil Pultrudado)' : ' (Perfil Metálico)';

  // 1. Stringers (Montantes)
  items.push({
    part: 'Montante Lateral',
    specification: `Barra chata ou perfil U em ${dims.material}${materialSuffix}`,
    quantity: 2,
    unit: 'un',
    totalLength: (stringerHeight * 2) / 1000 // meters
  });

  // 2. Rungs (Degraus)
  items.push({
    part: 'Degrau',
    specification: `Barra redonda Ø${dims.rungDiameter}mm em ${dims.material}`,
    quantity: numRungs,
    unit: 'un',
    totalLength: (numRungs * dims.width) / 1000 // meters
  });

  // 3. Cage (Gaiola)
  if (dims.hasCage) {
    const cageHeight = dims.totalHeight - dims.cageStartHeight;
    const numHoops = Math.ceil(cageHeight / 1000) + 1; // Hoop every 1m
    const hoopCircumference = Math.PI * dims.cageDiameter;
    
    items.push({
      part: 'Aro da Gaiola',
      specification: `Barra chata em ${dims.material}`,
      quantity: numHoops,
      unit: 'un',
      totalLength: (numHoops * hoopCircumference) / 1000
    });

    items.push({
      part: 'Barra Vertical Gaiola',
      specification: `Barra chata ou redonda em ${dims.material}`,
      quantity: 5, // Simplified: usually 5 to 7 vertical bars
      unit: 'un',
      totalLength: (5 * cageHeight) / 1000
    });
  }

  // 4. Fixings (Fixações)
  const numBrackets = Math.ceil(dims.totalHeight / 1500) * 2; // Bracket every 1.5m, both sides
  items.push({
    part: 'Suporte de Fixação',
    specification: `Cantoneira ou suporte custom ${dims.installationType}`,
    quantity: numBrackets,
    unit: 'un'
  });

  items.push({
    part: 'Chumbadores / Parafusos',
    specification: 'Parabolt ou Parafuso Sextavado Gr.5',
    quantity: numBrackets * 2,
    unit: 'un'
  });

  return items;
}

/**
 * Generates a simplified DXF file string
 */
export function generateDXF(dims: LadderDimensions): string {
  let dxf = "0\nSECTION\n2\nENTITIES\n";

  const addLine = (x1: number, y1: number, x2: number, y2: number, layer = "0") => {
    dxf += `0\nLINE\n8\n${layer}\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
  };

  const h = dims.totalHeight;
  const w = dims.width;
  const e = dims.topExtension;

  // Front View Logic
  // Left Stringer
  addLine(0, 0, 0, h + e, "LADDER_FRONT");
  // Right Stringer
  addLine(w, 0, w, h + e, "LADDER_FRONT");
  
  // Rungs
  const numRungs = Math.floor(h / dims.rungSpacing);
  for (let i = 0; i <= numRungs; i++) {
    const y = i * dims.rungSpacing;
    addLine(0, y, w, y, "LADDER_FRONT");
  }

  // Top Extension Arc (Simplified as straight lines)
  addLine(0, h+e, w, h+e, "LADDER_FRONT");

  // Cage (Side View - Offset)
  if (dims.hasCage) {
    const offsetX = w + 500;
    const h1 = dims.cageStartHeight;
    const D = dims.cageDiameter;
    const d_wall = dims.wallDistance;

    // Stringer side
    addLine(offsetX + d_wall, 0, offsetX + d_wall, h + e, "LADDER_SIDE");
    // Outer Cage line
    addLine(offsetX + d_wall + D, h1, offsetX + d_wall + D, h, "LADDER_SIDE");
    // Top Arc line
    addLine(offsetX + d_wall, h, offsetX + d_wall + D, h, "LADDER_SIDE");
  }

  dxf += "0\nENDSEC\n0\nEOF\n";
  return dxf;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
