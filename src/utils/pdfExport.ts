
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuotationData {
  number: string;
  date: string;
  validUntil: string;
  customer: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    crNumber: string;
    vatNumber: string;
  };
  lineItems: Array<{
    service: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
}

export const generateQuotationPDF = async (quotationData: QuotationData) => {
  console.log('Starting PDF generation with data:', quotationData);
  
  try {
    // Create a temporary div for PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '40px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.4';
    tempDiv.style.color = '#000';
    tempDiv.style.boxSizing = 'border-box';

    // Build the HTML content using table-based layout instead of flexbox
    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ff6b35; margin: 0; font-size: 28px; font-weight: bold;">SmartUniit</h1>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">Smart Universe Communication and Information Technology</p>
        <p style="margin: 0; color: #666; font-size: 14px;">Riyadh, Saudi Arabia</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin: 0; font-size: 24px; font-weight: bold;">QUOTATION / عرض سعر</h2>
        <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">${quotationData.number}</p>
      </div>

      <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 20px;">
            <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px; margin-bottom: 15px; margin-top: 0;">Bill To:</h3>
            <div style="line-height: 1.6;">
              <div style="font-weight: bold; margin-bottom: 5px;">${quotationData.customer.companyName || 'N/A'}</div>
              <div style="margin-bottom: 5px;">${quotationData.customer.contactName || 'N/A'}</div>
              <div style="margin-bottom: 5px;">${quotationData.customer.phone || 'N/A'}</div>
              <div style="margin-bottom: 5px;">${quotationData.customer.email || 'N/A'}</div>
              <div style="margin-bottom: 5px;">CR: ${quotationData.customer.crNumber || 'N/A'}</div>
              <div style="margin-bottom: 5px;">VAT: ${quotationData.customer.vatNumber || 'N/A'}</div>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 20px;">
            <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px; margin-bottom: 15px; margin-top: 0;">Quote Details:</h3>
            <div style="line-height: 1.6;">
              <div style="margin-bottom: 5px;"><strong>Date:</strong> ${new Date(quotationData.date).toLocaleDateString()}</div>
              <div style="margin-bottom: 5px;"><strong>Valid Until:</strong> ${new Date(quotationData.validUntil).toLocaleDateString()}</div>
            </div>
          </td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd;">
        <thead>
          <tr style="background-color: #ff6b35; color: white;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-size: 14px;">Service</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd; font-size: 14px;">Description</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd; font-size: 14px;">Qty</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-size: 14px;">Unit Price (SAR)</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-size: 14px;">Total (SAR)</th>
          </tr>
        </thead>
        <tbody>
          ${quotationData.lineItems.map(item => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-size: 13px; vertical-align: top;">${item.service || 'N/A'}</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-size: 13px; vertical-align: top;">${item.description || 'N/A'}</td>
              <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-size: 13px; vertical-align: top;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd; font-size: 13px; vertical-align: top;">﷼ ${item.unitPrice.toLocaleString()}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd; font-size: 13px; vertical-align: top;">﷼ ${(item.quantity * item.unitPrice).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <table style="width: 300px; margin-left: auto; margin-bottom: 30px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: left;">Subtotal:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">﷼ ${quotationData.subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: left;">VAT (15%):</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">﷼ ${quotationData.vat.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-weight: bold; font-size: 18px; border-bottom: 2px solid #ff6b35; text-align: left;">Total:</td>
          <td style="padding: 12px 0; font-weight: bold; font-size: 18px; border-bottom: 2px solid #ff6b35; text-align: right;">﷼ ${quotationData.total.toLocaleString()}</td>
        </tr>
      </table>

      ${quotationData.notes ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px; margin-bottom: 15px;">Notes:</h3>
          <p style="margin: 0; font-size: 13px; line-height: 1.6;">${quotationData.notes}</p>
        </div>
      ` : ''}

      <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px; line-height: 1.5;">
        <p style="margin: 5px 0;">Thank you for your business! / شكراً لثقتكم بنا</p>
        <p style="margin: 5px 0;">This quotation is valid until ${new Date(quotationData.validUntil).toLocaleDateString()}</p>
      </div>
    `;

    document.body.appendChild(tempDiv);
    console.log('Temporary div created and added to DOM');

    // Give the browser more time to render the content
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('About to create canvas from element:', tempDiv);

    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 800,
      height: tempDiv.scrollHeight,
      onclone: (clonedDoc) => {
        console.log('Canvas clone created');
      }
    });

    console.log('Canvas created successfully:', canvas.width, 'x', canvas.height);

    // Remove the temporary div
    document.body.removeChild(tempDiv);

    const imgData = canvas.toDataURL('image/png');
    console.log('Image data created, length:', imgData.length);

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    console.log('Adding first page to PDF');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      console.log('Added additional page to PDF');
    }

    const filename = `quotation_${quotationData.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    console.log('Saving PDF as:', filename);
    pdf.save(filename);
    
    console.log('PDF generation completed successfully');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Clean up temp div if it exists
    const existingDiv = document.querySelector('div[style*="position: absolute"][style*="left: -9999px"]');
    if (existingDiv && existingDiv.parentNode) {
      existingDiv.parentNode.removeChild(existingDiv);
      console.log('Cleaned up temporary div');
    }
    
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
