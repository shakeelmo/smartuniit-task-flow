
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
    // All columns: S#, Description, Part#, Qty, Unit, Unit Price, Total
    columnWidths = [
      8,   // Serial number (smaller)
      25,  // Description (increased)
      18,  // Part number
      8,   // Quantity (smaller)
      12,  // Unit
      40,  // Unit price (reduced)
      47   // Total (increased)
    ];
  } else if (hasPartNumbers && !hasUnits) {
    // S#, Description, Part#, Qty, Unit Price, Total
    columnWidths = [
      8,   // Serial number (smaller)
      28,  // Description (increased)
      20,  // Part number
      8,   // Quantity (smaller)
      44,  // Unit price
      50   // Total (increased)
    ];
  } else if (!hasPartNumbers && hasUnits) {
    // S#, Description, Qty, Unit, Unit Price, Total
    columnWidths = [
      8,   // Serial number (smaller)
      32,  // Description (increased)
      8,   // Quantity (smaller)
      12,  // Unit
      44,  // Unit price
      54   // Total (increased)
    ];
  } else {
    // Basic: S#, Description, Qty, Unit Price, Total
    columnWidths = [
      8,   // Serial number (smaller)
      36,  // Description (increased)
      8,   // Quantity (smaller)
      48,  // Unit price
      58   // Total (increased)
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
