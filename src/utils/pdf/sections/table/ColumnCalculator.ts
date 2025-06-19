
import { PDF_CONFIG } from '../../constants';

export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  startX: number
): ColumnConfig => {
  const pageWidth = 210; // A4 width in mm
  const availableWidth = pageWidth - 2 * PDF_CONFIG.pageMargin; // Total available width for table
  
  console.log('Calculating column config:', { hasPartNumbers, hasUnits, availableWidth });

  let columnWidths: number[] = [];
  
  if (hasPartNumbers && hasUnits) {
    // All columns: S#, Service, Part#, Description, Qty, Unit, Unit Price, Total
    columnWidths = [
      15,  // Serial number
      35,  // Service name (increased)
      25,  // Part number
      30,  // Description
      15,  // Quantity
      15,  // Unit
      25,  // Unit price
      30   // Total
    ];
  } else if (hasPartNumbers && !hasUnits) {
    // S#, Service, Part#, Description, Qty, Unit Price, Total
    columnWidths = [
      15,  // Serial number
      40,  // Service name (increased)
      25,  // Part number
      35,  // Description (increased)
      15,  // Quantity
      30,  // Unit price (increased)
      30   // Total
    ];
  } else if (!hasPartNumbers && hasUnits) {
    // S#, Service, Description, Qty, Unit, Unit Price, Total
    columnWidths = [
      15,  // Serial number
      45,  // Service name (increased)
      40,  // Description (increased)
      15,  // Quantity
      15,  // Unit
      30,  // Unit price
      30   // Total
    ];
  } else {
    // Basic: S#, Service, Description, Qty, Unit Price, Total
    columnWidths = [
      15,  // Serial number
      50,  // Service name (increased significantly)
      45,  // Description (increased)
      15,  // Quantity
      35,  // Unit price (increased)
      30   // Total
    ];
  }

  // Verify total width doesn't exceed available space
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  console.log('Total calculated width:', totalWidth, 'Available width:', availableWidth);
  
  // If total width exceeds available space, scale down proportionally
  if (totalWidth > availableWidth) {
    const scaleFactor = availableWidth / totalWidth;
    columnWidths = columnWidths.map(width => width * scaleFactor);
    console.log('Scaled column widths:', columnWidths);
  }

  // Calculate column positions
  const columnPositions: number[] = [];
  let currentPosition = startX;
  
  columnWidths.forEach((width) => {
    columnPositions.push(currentPosition);
    currentPosition += width;
  });

  console.log('Final column config:', { columnWidths, columnPositions });

  return {
    columnWidths,
    columnPositions
  };
};
