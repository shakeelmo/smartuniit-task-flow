
export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  // Improved column widths with much more space for Total Price column and better balance
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    // S#, Description, Part#, Qty, Unit, Unit Price, Total Price
    columnWidths = [12, 40, 18, 12, 15, 30, 60]; // Increased Total Price from 50 to 60
  } else if (hasPartNumbers) {
    // S#, Description, Part#, Qty, Unit Price, Total Price
    columnWidths = [12, 45, 22, 15, 30, 60]; // Increased Total Price from 50 to 60
  } else if (hasUnits) {
    // S#, Description, Qty, Unit, Unit Price, Total Price
    columnWidths = [12, 55, 15, 18, 30, 60]; // Increased Total Price from 50 to 60
  } else {
    // S#, Description, Qty, Unit Price, Total Price
    columnWidths = [12, 65, 18, 30, 60]; // Increased Total Price from 50 to 60
  }

  const columnPositions: number[] = [];
  let currentX = pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  return { columnWidths, columnPositions };
};
