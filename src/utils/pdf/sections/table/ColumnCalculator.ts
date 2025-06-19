
export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  // Enhanced column widths with better spacing and increased Total Price column width
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    // S#, Description, Part#, Qty, Unit, Unit Price, Total Price
    columnWidths = [12, 32, 20, 12, 16, 30, 58]; // Increased Total Price to 58
  } else if (hasPartNumbers) {
    // S#, Description, Part#, Qty, Unit Price, Total Price
    columnWidths = [12, 38, 22, 15, 30, 58]; // Increased Total Price to 58
  } else if (hasUnits) {
    // S#, Description, Qty, Unit, Unit Price, Total Price
    columnWidths = [12, 45, 15, 18, 30, 58]; // Increased Total Price to 58
  } else {
    // S#, Description, Qty, Unit Price, Total Price
    columnWidths = [12, 55, 18, 30, 58]; // Increased Total Price to 58
  }

  const columnPositions: number[] = [];
  let currentX = pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  return { columnWidths, columnPositions };
};
