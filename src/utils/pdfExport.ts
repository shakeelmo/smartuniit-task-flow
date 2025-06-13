
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
  // Create a temporary div for PDF content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm';
  tempDiv.style.padding = '20mm';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';

  tempDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #ff6b35; margin: 0;">SmartUniit</h1>
      <p style="margin: 5px 0; color: #666;">Smart Universe Communication and Information Technology</p>
      <p style="margin: 0; color: #666;">Riyadh, Saudi Arabia</p>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #333; margin: 0;">QUOTATION / عرض سعر</h2>
      <p style="margin: 5px 0;">${quotationData.number}</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div style="width: 48%;">
        <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Bill To:</h3>
        <p><strong>${quotationData.customer.companyName}</strong></p>
        <p>${quotationData.customer.contactName}</p>
        <p>${quotationData.customer.phone}</p>
        <p>${quotationData.customer.email}</p>
        <p>CR: ${quotationData.customer.crNumber}</p>
        <p>VAT: ${quotationData.customer.vatNumber}</p>
      </div>
      <div style="width: 48%;">
        <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Quote Details:</h3>
        <p><strong>Date:</strong> ${new Date(quotationData.date).toLocaleDateString()}</p>
        <p><strong>Valid Until:</strong> ${new Date(quotationData.validUntil).toLocaleDateString()}</p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background-color: #ff6b35; color: white;">
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Service</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
          <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qty</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Unit Price (SAR)</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Total (SAR)</th>
        </tr>
      </thead>
      <tbody>
        ${quotationData.lineItems.map(item => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.service}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.description}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">﷼ ${item.unitPrice.toLocaleString()}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">﷼ ${(item.quantity * item.unitPrice).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="width: 300px; margin-left: auto;">
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
      <div style="margin-top: 30px;">
        <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Notes:</h3>
        <p>${quotationData.notes}</p>
      </div>
    ` : ''}

    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
      <p>Thank you for your business! / شكراً لثقتكم بنا</p>
      <p>This quotation is valid until ${new Date(quotationData.validUntil).toLocaleDateString()}</p>
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

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

    pdf.save(`${quotationData.number}.pdf`);
  } finally {
    document.body.removeChild(tempDiv);
  }
};
