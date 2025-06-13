
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

    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ff6b35; margin: 0; font-size: 28px;">SmartUniit</h1>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">Smart Universe Communication and Information Technology</p>
        <p style="margin: 0; color: #666; font-size: 14px;">Riyadh, Saudi Arabia</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin: 0; font-size: 24px;">QUOTATION / عرض سعر</h2>
        <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">${quotationData.number}</p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
          <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px; margin-bottom: 15px;">Bill To:</h3>
          <p style="margin: 5px 0; font-weight: bold;">${quotationData.customer.companyName || 'N/A'}</p>
          <p style="margin: 5px 0;">${quotationData.customer.contactName || 'N/A'}</p>
          <p style="margin: 5px 0;">${quotationData.customer.phone || 'N/A'}</p>
          <p style="margin: 5px 0;">${quotationData.customer.email || 'N/A'}</p>
          <p style="margin: 5px 0;">CR: ${quotationData.customer.crNumber || 'N/A'}</p>
          <p style="margin: 5px 0;">VAT: ${quotationData.customer.vatNumber || 'N/A'}</p>
        </div>
        <div style="width: 48%;">
          <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px; margin-bottom: 15px;">Quote Details:</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(quotationData.date).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${new Date(quotationData.validUntil).toLocaleDateString()}</p>
        </div>
      </div>

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
              <td style="padding: 10px; border: 1px solid #ddd; font-size: 13px;">${item.service || 'N/A'}</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-size: 13px;">${item.description || 'N/A'}</td>
              <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-size: 13px;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd; font-size: 13px;">﷼ ${item.unitPrice.toLocaleString()}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd; font-size: 13px;">﷼ ${(item.quantity * item.unitPrice).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="width: 300px; margin-left: auto; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span>Subtotal:</span>
          <span>﷼ ${quotationData.subtotal.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span>VAT (15%):</span>
          <span>﷼ ${quotationData.vat.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; font-size: 18px; border-bottom: 2px solid #ff6b35;">
          <span>Total:</span>
          <span>﷼ ${quotationData.total.toLocaleString()}</span>
        </div>
      </div>

      ${quotationData.notes ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px; margin-bottom: 15px;">Notes:</h3>
          <p style="margin: 0; font-size: 13px;">${quotationData.notes}</p>
        </div>
      ` : ''}

      <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
        <p>Thank you for your business! / شكراً لثقتكم بنا</p>
        <p>This quotation is valid until ${new Date(quotationData.validUntil).toLocaleDateString()}</p>
      </div>
    `;

    document.body.appendChild(tempDiv);
    console.log('Temporary div created and added to DOM');

    // Give the browser time to render
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true
    });

    console.log('Canvas created:', canvas.width, 'x', canvas.height);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `${quotationData.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(filename);
    
    console.log('PDF saved successfully as:', filename);
    document.body.removeChild(tempDiv);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Clean up temp div if it exists
    const existingDiv = document.querySelector('div[style*="position: absolute"][style*="left: -9999px"]');
    if (existingDiv) {
      document.body.removeChild(existingDiv);
    }
    
    throw error;
  }
};
