
// Professional colors matching the sample quotation
export const COLORS = {
  headerBlue: [52, 84, 128] as const,      // Dark blue for header
  tableHeaderBlue: [83, 122, 166] as const, // Medium blue for table header
  yellow: [255, 255, 0] as const,          // Yellow for highlights
  darkBlue: [31, 56, 100] as const,        // Very dark blue for text
  black: [0, 0, 0] as const,               // Black text
  white: [255, 255, 255] as const,         // White background
  lightGray: [240, 240, 240] as const,     // Light gray for alternating rows
  orange: [255, 165, 0] as const,          // Orange for branding
  borderGray: [200, 200, 200] as const,    // Light gray for borders
  headerGray: [220, 220, 220] as const     // Light gray for headers
};

export const PDF_CONFIG = {
  pageMargin: 15,
  logoSize: 25,
  rowHeight: 12, // Increased for better spacing
  lineHeight: 5, // Increased for better text spacing
  fontSize: {
    small: 8,
    normal: 9,
    medium: 10,
    large: 11,
    title: 14
  },
  cellPadding: 3, // New: standard cell padding
  textWrapMargin: 4 // New: margin for text wrapping calculations
};

export const COLUMN_WIDTHS = [20, 60, 25, 35, 40]; // S#, Item, Quantity, Unit Price, Total Price

export const VAT_RATE = 0.15; // 15% VAT rate for Saudi Arabia
