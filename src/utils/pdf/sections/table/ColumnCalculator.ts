
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
      10,  // Serial number (smaller)
      22,  // Service name (reduced significantly)
      18,  // Part number (reduced)
      20,  // Description (reduced)
      10,  // Quantity (smaller)
      10,  // Unit (smaller)
      45,  // Unit price (increased significantly for currency)
      50   // Total (increased significantly for currency)
    ];
  } else if (hasPartNumbers && !hasUnits) {
    // S#, Service, Part#, Description, Qty, Unit Price, Total
    columnWidths = [
      10,  // Serial number (smaller)
      24,  // Service name (reduced)
      18,  // Part number (reduced)
      22,  // Description (reduced)
      10,  // Quantity (smaller)
      48,  // Unit price (increased significantly)
      52   // Total (increased significantly)
    ];
  } else if (!hasPartNumbers && hasUnits) {
    // S#, Service, Description, Qty, Unit, Unit Price, Total
    columnWidths = [
      10,  // Serial number (smaller)
      28,  // Service name (reduced)
      24,  // Description (reduced)
      10,  // Quantity (smaller)
      10,  // Unit (smaller)
      48,  // Unit price (increased)
      54   // Total (increased)
    ];
  } else {
    // Basic: S#, Service, Description, Qty, Unit Price, Total
    columnWidths = [
      10,  // Serial number (smaller)
      32,  // Service name (reduced)
      28,  // Description (reduced)
      10,  // Quantity (smaller)
      52,  // Unit price (increased significantly)
      56   // Total (increased significantly)
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
