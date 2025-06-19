
import { PDF_CONFIG } from '../../constants';

export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  const pageWidth = 210; // A4 width in mm
  const tableWidth = pageWidth - 2 * pageMargin;
  
  let columnWidths: number[];
  
  if (hasPartNumbers && hasUnits) {
    // Enhanced column distribution for better space utilization
    columnWidths = [
      15,  // Serial Number - compact but visible
      75,  // Description - larger for better readability
      30,  // Part Number - adequate space
      12,  // Quantity - minimal needed space
      18,  // Unit - compact
      25,  // Unit Price - sufficient for currency display
      30   // Total - emphasis on final amount
    ];
  } else if (hasPartNumbers && !hasUnits) {
    columnWidths = [
      15,  // Serial Number
      85,  // Description - more space when no units
      35,  // Part Number
      15,  // Quantity
      25,  // Unit Price
      30   // Total
    ];
  } else if (!hasPartNumbers && hasUnits) {
    columnWidths = [
      15,  // Serial Number
      95,  // Description - maximum space utilization
      15,  // Quantity
      20,  // Unit
      25,  // Unit Price
      35   // Total
    ];
  } else {
    // No part numbers, no units
    columnWidths = [
      15,  // Serial Number
      105, // Description - maximum available space
      18,  // Quantity
      30,  // Unit Price
      37   // Total
    ];
  }

  // Ensure total width matches table width exactly
  const totalCalculatedWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const scaleFactor = tableWidth / totalCalculatedWidth;
  columnWidths = columnWidths.map(width => width * scaleFactor);

  // Calculate column positions based on optimized widths
  const columnPositions: number[] = [];
  let currentPosition = pageMargin;
  
  columnWidths.forEach(width => {
    columnPositions.push(currentPosition);
    currentPosition += width;
  });

  return { columnWidths, columnPositions };
};
