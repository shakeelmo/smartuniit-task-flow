
export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  // Enhanced column widths with better spacing - ensure S# column is visible
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    // S#, Description, Part#, Qty, Unit, Unit Price, Total Price
    columnWidths = [15, 25, 26, 12, 16, 30, 56]; // Increased S# to 15mm
  } else if (hasPartNumbers) {
    // S#, Description, Part#, Qty, Unit Price, Total Price
    columnWidths = [15, 31, 28, 15, 30, 56]; // Increased S# to 15mm
  } else if (hasUnits) {
    // S#, Description, Qty, Unit, Unit Price, Total Price
    columnWidths = [15, 42, 15, 18, 30, 58]; // Increased S# to 15mm
  } else {
    // S#, Description, Qty, Unit Price, Total Price
    columnWidths = [15, 52, 18, 30, 58]; // Increased S# to 15mm
  }

  const columnPositions: number[] = [];
  let currentX = pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  return { columnWidths, columnPositions };
};
