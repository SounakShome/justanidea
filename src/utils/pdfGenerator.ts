import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable properties
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PDFOrder {
  id: string;
  orderNumber?: string;
  date: Date;
  status: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  company?: {
    name: string;
    address?: string;
    gstin?: string;
    phone?: string;
    email?: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku?: string;
    quantity: number;
    sellingPrice: number;
    description?: string;
  }>;
  billDiscounts?: Array<{
    id: string;
    name: string;
    type: 'percentage' | 'amount';
    value: number;
  }>;
  taxConfig?: {
    isIGST: boolean;
    igstRate?: number;
    cgstRate?: number;
    sgstRate?: number;
  };
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  finalAmount: number;
}

export const generateOrderPDF = (order: PDFOrder): void => {
  try {
    const doc = new jsPDF();
    
    // Set up document properties
    doc.setProperties({
      title: `Invoice - ${order.orderNumber || order.id}`,
      subject: 'Order Invoice',
      author: order.company?.name || 'Your Company',
      creator: 'Order Management System'
    });

    let yPosition = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const centerX = pageWidth / 2;

    // Add border around the entire document
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Main Header - INVOICE
    yPosition = 25;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', centerX, yPosition, { align: 'center' });

    // Company Information Section (Left) and Invoice Details (Right)
    yPosition = 40;
    
    // Left side - Company details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(order.company?.name || 'YOUR COMPANY NAME', margin + 5, yPosition);
    
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    if (order.company?.address) {
      const addressLines = order.company.address.split('\n');
      addressLines.forEach(line => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
    } else {
      doc.text('Company Address Line 1', margin + 5, yPosition);
      yPosition += 4;
      doc.text('Company Address Line 2', margin + 5, yPosition);
      yPosition += 4;
    }
    
    if (order.company?.gstin) {
      doc.text(`GSTIN: ${order.company.gstin}`, margin + 5, yPosition);
      yPosition += 4;
    }
    
    if (order.company?.phone) {
      doc.text(`Phone: ${order.company.phone}`, margin + 5, yPosition);
      yPosition += 4;
    }
    
    if (order.company?.email) {
      doc.text(`Email: ${order.company.email}`, margin + 5, yPosition);
    }

    // Right side - Invoice details
    const rightColumnX = pageWidth - margin - 60;
    yPosition = 40;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', rightColumnX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(order.orderNumber || order.id, rightColumnX + 25, yPosition);
    
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', rightColumnX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(order.date).toLocaleDateString('en-IN'), rightColumnX + 25, yPosition);
    
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', rightColumnX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(order.status.toUpperCase(), rightColumnX + 25, yPosition);

    // Horizontal line separator
    yPosition = 80;
    doc.setLineWidth(0.3);
    doc.line(margin + 2, yPosition, pageWidth - margin - 2, yPosition);

    // Bill To Section
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin + 5, yPosition);
    
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    if (order.customer?.name) {
      doc.text(order.customer.name, margin + 5, yPosition);
      yPosition += 4;
    }
    
    if (order.customer?.address) {
      const customerAddressLines = order.customer.address.split('\n');
      customerAddressLines.forEach(line => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
    }
    
    if (order.customer?.phone) {
      doc.text(`Phone: ${order.customer.phone}`, margin + 5, yPosition);
      yPosition += 4;
    }
    
    if (order.customer?.email) {
      doc.text(`Email: ${order.customer.email}`, margin + 5, yPosition);
    }

    // Items Table
    yPosition = Math.max(yPosition + 10, 120);
    
    const tableStartY = yPosition;
    const tableColumns = [
      { header: 'S.No.', dataKey: 'sno', width: 15 },
      { header: 'Description of Goods/Services', dataKey: 'description', width: 70 },
      { header: 'HSN/SAC', dataKey: 'sku', width: 20 },
      { header: 'Qty', dataKey: 'quantity', width: 15 },
      { header: 'Rate', dataKey: 'rate', width: 25 },
      { header: 'Amount', dataKey: 'amount', width: 25 }
    ];

    const tableRows = order.items.map((item, index) => ({
      sno: (index + 1).toString(),
      description: item.name + (item.description && item.description !== item.name ? `\n${item.description}` : ''),
      sku: item.sku || '-',
      quantity: item.quantity.toString(),
      rate: item.sellingPrice.toFixed(2),
      amount: (item.quantity * item.sellingPrice).toFixed(2)
    }));

    autoTable(doc, {
      startY: tableStartY,
      head: [tableColumns.map(col => col.header)],
      body: tableRows.map(row => tableColumns.map(col => row[col.dataKey as keyof typeof row])),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // S.No.
        1: { halign: 'left', cellWidth: 70 },   // Description
        2: { halign: 'center', cellWidth: 20 }, // HSN/SAC
        3: { halign: 'center', cellWidth: 15 }, // Qty
        4: { halign: 'right', cellWidth: 25 },  // Rate
        5: { halign: 'right', cellWidth: 25 },  // Amount
      },
      margin: { left: margin + 2, right: margin + 2 },
    });

    // Get final Y position after table
    yPosition = doc.lastAutoTable.finalY + 5;

    // Summary Section - Right aligned
    const summaryStartX = pageWidth - 80;
    const labelX = summaryStartX;
    const valueX = pageWidth - margin - 5;

    // Calculate totals
    const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);
    let totalDiscount = 0;
    
    if (order.billDiscounts && order.billDiscounts.length > 0) {
      totalDiscount = order.billDiscounts.reduce((sum, discount) => {
        return sum + (discount.type === 'percentage' 
          ? (subtotal * discount.value) / 100 
          : discount.value);
      }, 0);
    }

    const taxableAmount = subtotal - totalDiscount;
    let totalTax = 0;
    
    if (order.taxConfig) {
      if (order.taxConfig.isIGST && order.taxConfig.igstRate) {
        totalTax = (taxableAmount * order.taxConfig.igstRate) / 100;
      } else {
        const cgstAmount = order.taxConfig.cgstRate ? (taxableAmount * order.taxConfig.cgstRate) / 100 : 0;
        const sgstAmount = order.taxConfig.sgstRate ? (taxableAmount * order.taxConfig.sgstRate) / 100 : 0;
        totalTax = cgstAmount + sgstAmount;
      }
    }

    const finalAmount = taxableAmount + totalTax;

    // Draw summary box
    const summaryBoxY = yPosition;
    const summaryBoxHeight = 35;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(summaryStartX - 5, summaryBoxY, 85, summaryBoxHeight);

    yPosition += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    // Subtotal
    doc.text('Subtotal:', labelX, yPosition);
    doc.text(`₹${subtotal.toFixed(2)}`, valueX, yPosition, { align: 'right' });
    yPosition += 4;

    // Discounts
    if (order.billDiscounts && order.billDiscounts.length > 0) {
      order.billDiscounts.forEach(discount => {
        const discountText = discount.type === 'percentage' 
          ? `Discount (${discount.value}%):` 
          : `Discount:`;
        doc.text(discountText, labelX, yPosition);
        
        const discountAmount = discount.type === 'percentage'
          ? (subtotal * discount.value) / 100
          : discount.value;
        
        doc.text(`-₹${discountAmount.toFixed(2)}`, valueX, yPosition, { align: 'right' });
        yPosition += 4;
      });
    }

    // Taxable Amount
    doc.text('Taxable Amount:', labelX, yPosition);
    doc.text(`₹${taxableAmount.toFixed(2)}`, valueX, yPosition, { align: 'right' });
    yPosition += 4;

    // Tax Details
    if (order.taxConfig && totalTax > 0) {
      if (order.taxConfig.isIGST && order.taxConfig.igstRate) {
        doc.text(`IGST (${order.taxConfig.igstRate}%):`, labelX, yPosition);
        doc.text(`₹${totalTax.toFixed(2)}`, valueX, yPosition, { align: 'right' });
        yPosition += 4;
      } else {
        if (order.taxConfig.cgstRate) {
          const cgstAmount = (taxableAmount * order.taxConfig.cgstRate) / 100;
          doc.text(`CGST (${order.taxConfig.cgstRate}%):`, labelX, yPosition);
          doc.text(`₹${cgstAmount.toFixed(2)}`, valueX, yPosition, { align: 'right' });
          yPosition += 4;
        }
        
        if (order.taxConfig.sgstRate) {
          const sgstAmount = (taxableAmount * order.taxConfig.sgstRate) / 100;
          doc.text(`SGST (${order.taxConfig.sgstRate}%):`, labelX, yPosition);
          doc.text(`₹${sgstAmount.toFixed(2)}`, valueX, yPosition, { align: 'right' });
          yPosition += 4;
        }
      }
    }

    // Final Total with emphasis
    yPosition += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total Amount:', labelX, yPosition);
    doc.text(`₹${finalAmount.toFixed(2)}`, valueX, yPosition, { align: 'right' });

    // Amount in words
    yPosition += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Amount in Words:', margin + 5, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'italic');
    doc.text(`${convertNumberToWords(Math.round(finalAmount))} Rupees Only`, margin + 5, yPosition);

    // Terms and Conditions
    yPosition += 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', margin + 5, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    doc.text('1. Payment is due within 30 days of invoice date.', margin + 5, yPosition);
    yPosition += 3;
    doc.text('2. All disputes subject to local jurisdiction only.', margin + 5, yPosition);

    // Signature section
    yPosition = pageHeight - 40;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Company signature (right side)
    const signatureX = pageWidth - 80;
    doc.text('For ' + (order.company?.name || 'Your Company'), signatureX, yPosition);
    yPosition += 15;
    doc.text('Authorized Signatory', signatureX, yPosition);

    // Footer
    yPosition = pageHeight - 15;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, centerX, yPosition, { align: 'center' });

    // Save the PDF
    const fileName = `Invoice_${order.orderNumber || order.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF invoice');
  }
};

// Helper function to convert numbers to words (basic implementation)
const convertNumberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertNumberToWords(num % 100) : '');
  if (num < 100000) return convertNumberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convertNumberToWords(num % 1000) : '');
  if (num < 10000000) return convertNumberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convertNumberToWords(num % 100000) : '');
  
  return convertNumberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convertNumberToWords(num % 10000000) : '');
};

export default generateOrderPDF;
