
export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  // Improved column widths with better spacing to prevent overlapping
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    // S#, Description, Part#, Qty, Unit, Unit Price, Total Price
    columnWidths = [12, 35, 22, 12, 18, 32, 55]; // Increased Part# and reduced Description to prevent overlap
  } else if (hasPartNumbers) {
    // S#, Description, Part#, Qty, Unit Price, Total Price
    columnWidths = [12, 40, 25, 15, 32, 55]; // Increased Part# column width
  } else if (hasUnits) {
    // S#, Description, Qty, Unit, Unit Price, Total Price
    columnWidths = [12, 50, 15, 20, 32, 55]; // Better spacing for units
  } else {
    // S#, Description, Qty, Unit Price, Total Price
    columnWidths = [12, 60, 18, 32, 55]; // Maintain good spacing
  }

  const columnPositions: number[] = [];
  let currentX = pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  return { columnWidths, columnPositions };
};
