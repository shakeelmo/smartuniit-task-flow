
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
    // Optimized column distribution to prevent header overlap
    columnWidths = [
      12,  // Serial Number - compact
      70,  // Description - adequate space for content
      25,  // Part Number - sufficient space
      12,  // Quantity - minimal needed space
      15,  // Unit - compact but readable
      28,  // Unit Price - sufficient for currency display
      33   // Total - emphasis on final amount
    ];
  } else if (hasPartNumbers && !hasUnits) {
    columnWidths = [
      12,  // Serial Number
      80,  // Description - more space when no units
      30,  // Part Number
      15,  // Quantity
      28,  // Unit Price
      35   // Total
    ];
  } else if (!hasPartNumbers && hasUnits) {
    columnWidths = [
      12,  // Serial Number
      90,  // Description - maximum space utilization
      15,  // Quantity
      18,  // Unit
      30,  // Unit Price
      35   // Total
    ];
  } else {
    // No part numbers, no units
    columnWidths = [
      12,  // Serial Number
      100, // Description - maximum available space
      18,  // Quantity
      32,  // Unit Price
      38   // Total
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
