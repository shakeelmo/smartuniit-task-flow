
export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  // Enhanced column widths for better balance and readability - ALWAYS include Total Price column
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    // S#, Description, Part#, Qty, Unit, Unit Price, Total Price
    columnWidths = [15, 50, 20, 15, 18, 40, 45];
  } else if (hasPartNumbers) {
    // S#, Description, Part#, Qty, Unit Price, Total Price
    columnWidths = [15, 55, 25, 18, 42, 48];
  } else if (hasUnits) {
    // S#, Description, Qty, Unit, Unit Price, Total Price
    columnWidths = [15, 65, 18, 20, 42, 48];
  } else {
    // S#, Description, Qty, Unit Price, Total Price
    columnWidths = [15, 75, 22, 42, 48];
  }

  const columnPositions: number[] = [];
  let currentX = pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  return { columnWidths, columnPositions };
};
