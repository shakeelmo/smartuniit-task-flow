
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
      12,  // Serial number (reduced)
      28,  // Service name (reduced)
      20,  // Part number (reduced)
      25,  // Description (reduced)
      12,  // Quantity (reduced)
      12,  // Unit (reduced)
      35,  // Unit price (increased significantly)
      40   // Total (increased significantly)
    ];
  } else if (hasPartNumbers && !hasUnits) {
    // S#, Service, Part#, Description, Qty, Unit Price, Total
    columnWidths = [
      12,  // Serial number (reduced)
      30,  // Service name (reduced)
      20,  // Part number (reduced)
      28,  // Description (reduced)
      12,  // Quantity (reduced)
      38,  // Unit price (increased significantly)
      44   // Total (increased significantly)
    ];
  } else if (!hasPartNumbers && hasUnits) {
    // S#, Service, Description, Qty, Unit, Unit Price, Total
    columnWidths = [
      12,  // Serial number (reduced)
      35,  // Service name (reduced)
      30,  // Description (reduced)
      12,  // Quantity (reduced)
      12,  // Unit (reduced)
      38,  // Unit price (increased)
      45   // Total (increased)
    ];
  } else {
    // Basic: S#, Service, Description, Qty, Unit Price, Total
    columnWidths = [
      12,  // Serial number (reduced)
      40,  // Service name (reduced)
      35,  // Description (reduced)
      12,  // Quantity (reduced)
      42,  // Unit price (increased significantly)
      48   // Total (increased significantly)
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
