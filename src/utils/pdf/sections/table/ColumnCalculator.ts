
export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  // Enhanced column widths with better spacing and increased Part Number column width
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    // S#, Description, Part#, Qty, Unit, Unit Price, Total Price
    columnWidths = [12, 28, 26, 12, 16, 30, 56]; // Increased Part Number to 26, adjusted Description
  } else if (hasPartNumbers) {
    // S#, Description, Part#, Qty, Unit Price, Total Price
    columnWidths = [12, 34, 28, 15, 30, 56]; // Increased Part Number to 28, adjusted Description
  } else if (hasUnits) {
    // S#, Description, Qty, Unit, Unit Price, Total Price
    columnWidths = [12, 45, 15, 18, 30, 58]; // No Part Number column
  } else {
    // S#, Description, Qty, Unit Price, Total Price
    columnWidths = [12, 55, 18, 30, 58]; // No Part Number column
  }

  const columnPositions: number[] = [];
  let currentX = pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  return { columnWidths, columnPositions };
};
