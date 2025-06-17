
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun, BorderStyle, ShadingType, HeadingLevel } from 'docx';
import { QuotationData } from './pdf/types';

export const generateQuotationWord = async (quotationData: QuotationData): Promise<boolean> => {
  try {
    console.log('Starting Word document generation');

    // Create header paragraphs
    const headerParagraphs = [
      new Paragraph({
        children: [
          new TextRun({
            text: "SmartUniverse Communication and Information Technology",
            bold: true,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "QUOTATION",
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ];

    // Customer details section
    const customerSection = [
      new Paragraph({
        children: [
          new TextRun({
            text: "Customer Details",
            bold: true,
            size: 20,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Company: ${quotationData.customer.companyName}`,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Contact: ${quotationData.customer.contactName || 'N/A'}`,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Quote Number: ${quotationData.number}`,
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Date: ${new Date(quotationData.date).toLocaleDateString()}`,
            size: 20,
          }),
        ],
        spacing: { after: 300 },
      }),
    ];

    // Process sections or line items
    const contentSections: any[] = [];
    
    if (quotationData.sections && quotationData.sections.length > 0) {
      // Handle sectioned data
      quotationData.sections.forEach((section, sectionIndex) => {
        // Section header
        contentSections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.title,
                bold: true,
                size: 22,
              }),
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 300, after: 200 },
          })
        );

        // Create table for this section
        const sectionTable = createItemsTable(section.lineItems, quotationData.currency);
        contentSections.push(sectionTable);
      });
    } else {
      // Handle flat line items (backward compatibility)
      const allItemsTable = createItemsTable(quotationData.lineItems, quotationData.currency);
      contentSections.push(allItemsTable);
    }

    // Totals section
    const totalsTable = createTotalsTable(quotationData);
    contentSections.push(totalsTable);

    // Terms and conditions
    const termsSection = [
      new Paragraph({
        children: [
          new TextRun({
            text: "Terms and Conditions",
            bold: true,
            size: 20,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
    ];

    if (quotationData.customTerms) {
      const termLines = quotationData.customTerms.split('\n');
      termLines.forEach(line => {
        termsSection.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 18,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [
            ...headerParagraphs,
            ...customerSection,
            ...contentSections,
            ...termsSection,
          ],
        },
      ],
    });

    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    const customerName = quotationData.customer.companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `${customerName}_Quotation_${quotationData.number.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Word document generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
};

const createItemsTable = (lineItems: any[], currency: 'SAR' | 'USD') => {
  const hasPartNumbers = lineItems.some(item => item.partNumber && item.partNumber.trim());
  const hasUnits = lineItems.some(item => item.unit && item.unit.trim());

  // Prepare headers
  const headers = ['S#', 'Item Description'];
  if (hasPartNumbers) headers.push('Part Number');
  headers.push('Qty');
  if (hasUnits) headers.push('Unit');
  headers.push(`Unit Price (${currency})`, `Total Price (${currency})`);

  // Create header row
  const headerRow = new TableRow({
    children: headers.map(header => 
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: header,
                bold: true,
                size: 18,
                color: "FFFFFF",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: {
          type: ShadingType.SOLID,
          color: "2F5496",
        },
        width: {
          size: header.includes('Description') ? 35 : 15,
          type: WidthType.PERCENTAGE,
        },
      })
    ),
  });

  // Create data rows
  const dataRows = lineItems.map((item, index) => {
    const cells = [];
    
    // S# column
    cells.push(new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: (index + 1).toString(),
              size: 18,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
      shading: {
        type: ShadingType.SOLID,
        color: index % 2 === 0 ? "FFFFFF" : "F8FAFC",
      },
    }));

    // Description column
    cells.push(new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: item.service || '',
              size: 18,
            }),
          ],
        }),
      ],
      shading: {
        type: ShadingType.SOLID,
        color: index % 2 === 0 ? "FFFFFF" : "F8FAFC",
      },
    }));

    // Part Number column (if applicable)
    if (hasPartNumbers) {
      cells.push(new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: item.partNumber || '-',
                size: 18,
              }),
            ],
          }),
        ],
        shading: {
          type: ShadingType.SOLID,
          color: index % 2 === 0 ? "FFFFFF" : "F8FAFC",
        },
      }));
    }

    // Quantity column
    cells.push(new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: item.quantity.toString(),
              size: 18,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
      shading: {
        type: ShadingType.SOLID,
        color: index % 2 === 0 ? "FFFFFF" : "F8FAFC",
      },
    }));

    // Unit column (if applicable)
    if (hasUnits) {
      cells.push(new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: item.unit || '-',
                size: 18,
              }),
            ],
          }),
        ],
        shading: {
          type: ShadingType.SOLID,
          color: index % 2 === 0 ? "FFFFFF" : "F8FAFC",
        },
      }));
    }

    // Unit Price column
    const unitPriceFormatted = item.unitPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const unitPriceText = currency === 'SAR' ? `${unitPriceFormatted} SR` : `$${unitPriceFormatted}`;
    
    cells.push(new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: unitPriceText,
              size: 18,
            }),
          ],
          alignment: AlignmentType.RIGHT,
        }),
      ],
      shading: {
        type: ShadingType.SOLID,
        color: index % 2 === 0 ? "FFFFFF" : "F8FAFC",
      },
    }));

    // Total Price column
    const totalValue = item.quantity * item.unitPrice;
    const totalFormatted = totalValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const totalText = currency === 'SAR' ? `${totalFormatted} SR` : `$${totalFormatted}`;
    
    cells.push(new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: totalText,
              size: 18,
            }),
          ],
          alignment: AlignmentType.RIGHT,
        }),
      ],
      shading: {
        type: ShadingType.SOLID,
        color: index % 2 === 0 ? "FFFFFF" : "F8FAFC",
      },
    }));

    return new TableRow({ children: cells });
  });

  return new Table({
    rows: [headerRow, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
};

const createTotalsTable = (quotationData: QuotationData) => {
  const currency = quotationData.currency;
  const currencySymbol = currency === 'SAR' ? 'SR' : '$';
  
  const totalsData = [
    ['Subtotal', `${quotationData.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currencySymbol}`],
  ];

  if (quotationData.discount && quotationData.discount > 0) {
    totalsData.push(['Discount', `-${quotationData.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currencySymbol}`]);
  }

  totalsData.push(
    ['VAT 15%', `${quotationData.vat.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currencySymbol}`],
    ['Total', `${quotationData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currencySymbol}`]
  );

  const rows = totalsData.map(([label, value], index) => {
    const isTotal = label === 'Total';
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  bold: isTotal,
                  size: isTotal ? 20 : 18,
                }),
              ],
            }),
          ],
          width: { size: 70, type: WidthType.PERCENTAGE },
          shading: {
            type: ShadingType.SOLID,
            color: isTotal ? "E7E9ED" : "F8FAFC",
          },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: value,
                  bold: isTotal,
                  size: isTotal ? 20 : 18,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: {
            type: ShadingType.SOLID,
            color: isTotal ? "E7E9ED" : "F8FAFC",
          },
        }),
      ],
    });
  });

  return new Table({
    rows,
    width: {
      size: 60,
      type: WidthType.PERCENTAGE,
    },
    alignment: AlignmentType.RIGHT,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
};
