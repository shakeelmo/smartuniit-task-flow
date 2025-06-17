
export interface ColumnConfig {
  columnWidths: number[];
  columnPositions: number[];
}

export const calculateColumnConfig = (
  hasPartNumbers: boolean,
  hasUnits: boolean,
  pageMargin: number
): ColumnConfig => {
  // Improved column widths with better distribution
  let columnWidths: number[];
  if (hasPartNumbers && hasUnits) {
    columnWidths = [12, 45, 18, 15, 15, 35, 35];
  } else if (hasPartNumbers) {
    columnWidths = [12, 55, 25, 20, 40, 45];
  } else if (hasUnits) {
    columnWidths = [12, 65, 18, 15, 40, 45];
  } else {
    columnWidths = [12, 75, 25, 40, 45];
  }

  const columnPositions: number[] = [];
  let currentX = pageMargin;
  columnWidths.forEach((width, index) => {
    columnPositions[index] = currentX;
    currentX += width;
  });

  return { columnWidths, columnPositions };
};
