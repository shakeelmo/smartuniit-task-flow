
export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  // Enhanced column widths for better balance and readability
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    // S#, Description, Part#, Qty, Unit, Unit Price, Total Price
    columnWidths = [18, 55, 25, 18, 22, 45, 50];
  } else if (hasPartNumbers) {
    // S#, Description, Part#, Qty, Unit Price, Total Price
    columnWidths = [18, 65, 28, 22, 48, 52];
  } else if (hasUnits) {
    // S#, Description, Qty, Unit, Unit Price, Total Price
    columnWidths = [18, 75, 18, 22, 48, 52];
  } else {
    // S#, Description, Quantity, Unit Price, Total Price
    columnWidths = [18, 85, 25, 48, 52];
  }

  const columnPositions: number[] = [];
  let currentX = pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  return { columnWidths, columnPositions };
};
