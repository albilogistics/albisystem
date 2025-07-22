const puppeteer = require('puppeteer');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async generateInvoicePDF(invoiceData) {
    await this.initialize();
    
    const page = await this.browser.newPage();
    
    // Generate modern HTML invoice
    const html = this.generateInvoiceHTML(invoiceData);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      displayHeaderFooter: false
    });
    
    await page.close();
    return pdf;
  }

  generateInvoiceHTML(invoiceData) {
    const today = new Date().toLocaleDateString();
    const dueDate = new Date(invoiceData.dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            background: #000000;
            font-weight: 400;
            min-height: 100vh;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: #000000;
            color: #ffffff;
            min-height: 100vh;
            padding: 0;
          }
          
          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
            padding: 40px;
            text-align: center;
            border-bottom: 1px solid #333333;
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -1px;
            background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .header p {
            font-size: 1rem;
            color: #a0a0a0;
            margin-bottom: 4px;
            font-weight: 400;
          }
          
          .header .contact-info {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
          }
          
          .contact-item {
            text-align: center;
          }
          
          .contact-item strong {
            color: #ffffff;
            font-weight: 600;
          }
          
          .invoice-details {
            padding: 40px;
            background: #0a0a0a;
            border-bottom: 1px solid #333333;
          }
          
          .invoice-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          
          .invoice-info h2 {
            font-size: 1.8rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
          }
          
          .invoice-info p {
            margin-bottom: 12px;
            color: #a0a0a0;
            font-size: 0.95rem;
          }
          
          .invoice-info strong {
            color: #ffffff;
            font-weight: 600;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid;
          }
          
          .status-draft { 
            background: rgba(255, 193, 7, 0.1); 
            color: #ffc107; 
            border-color: #ffc107;
          }
          .status-sent { 
            background: rgba(13, 110, 253, 0.1); 
            color: #0d6efd; 
            border-color: #0d6efd;
          }
          .status-paid { 
            background: rgba(25, 135, 84, 0.1); 
            color: #198754; 
            border-color: #198754;
          }
          .status-overdue { 
            background: rgba(220, 53, 69, 0.1); 
            color: #dc3545; 
            border-color: #dc3545;
          }
          
          .customer-info h3 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 15px;
            letter-spacing: -0.3px;
          }
          
          .customer-info p {
            margin-bottom: 8px;
            color: #a0a0a0;
            font-size: 0.95rem;
          }
          
          .customer-info strong {
            color: #ffffff;
            font-weight: 600;
          }
          
          .items-section {
            padding: 40px;
            background: #0a0a0a;
          }
          
          .section-title {
            font-size: 1.4rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 25px;
            letter-spacing: -0.3px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: #1a1a1a;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #333333;
          }
          
          .items-table th {
            background: #2a2a2a;
            color: #ffffff;
            font-weight: 600;
            text-align: left;
            padding: 20px 16px;
            border-bottom: 1px solid #333333;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table td {
            padding: 20px 16px;
            border-bottom: 1px solid #333333;
            color: #a0a0a0;
            font-size: 0.95rem;
          }
          
          .items-table tr:nth-child(even) {
            background: #1f1f1f;
          }
          
          .items-table tr:hover {
            background: #2a2a2a;
          }
          
          .items-table tr:last-child td {
            border-bottom: none;
          }
          
          .totals-section {
            padding: 0 40px 40px;
            text-align: right;
            background: #0a0a0a;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            font-size: 1rem;
            color: #a0a0a0;
          }
          
          .total-row.grand-total {
            font-size: 1.4rem;
            font-weight: 700;
            color: #ffffff;
            border-top: 2px solid #333333;
            padding-top: 20px;
            margin-top: 20px;
          }
          
          .payment-section {
            padding: 40px;
            background: #1a1a1a;
            border-top: 1px solid #333333;
          }
          
          .payment-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          
          .payment-info h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 20px;
            letter-spacing: -0.3px;
          }
          
          .payment-info p {
            margin-bottom: 8px;
            color: #a0a0a0;
            font-size: 0.9rem;
          }
          
          .payment-info strong {
            color: #ffffff;
            font-weight: 600;
          }
          
          .footer {
            padding: 30px 40px;
            background: #000000;
            color: #666666;
            text-align: center;
            font-size: 0.875rem;
            border-top: 1px solid #333333;
          }
          
          .footer p {
            margin-bottom: 8px;
          }
          
          .footer strong {
            color: #ffffff;
            font-weight: 600;
          }
          
          .company-logo {
            font-size: 1.2rem;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          @media print {
            body { 
              margin: 0; 
              background: #000000;
            }
            .invoice-container { 
              box-shadow: none; 
              border-radius: 0; 
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-logo">ALBI LOGISTICS</div>
            <div class="contact-info">
              <div class="contact-item">
                <strong>Address</strong><br>
                3761 SW 139 PL<br>
                Miami FL 33175
              </div>
              <div class="contact-item">
                <strong>Contact</strong><br>
                info@albilogistics.com<br>
                786-991-5075
              </div>
            </div>
          </div>

          <div class="invoice-details">
            <div class="invoice-grid">
              <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
                <p><strong>Date:</strong> ${today}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${invoiceData.status || 'draft'}">${invoiceData.status || 'draft'}</span></p>
                <p><strong>Terms:</strong> Net 30</p>
              </div>
              <div class="customer-info">
                <h3>Bill To:</h3>
                <p><strong>${invoiceData.customer?.company || 'Company Name'}</strong></p>
                <p>${invoiceData.customer?.contact || 'Contact Person'}</p>
                <p>${invoiceData.customer?.email || 'email@company.com'}</p>
                <p>${invoiceData.customer?.phone || 'Phone Number'}</p>
                <p>${invoiceData.customer?.address || 'Address'}</p>
              </div>
            </div>
          </div>

          <div class="items-section">
            <div class="section-title">Items & Services</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Grade</th>
                  <th>Capacity</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${(invoiceData.items || []).map(item => `
                  <tr>
                    <td><strong>${item.model}</strong></td>
                    <td><span class="status-badge status-draft">${item.grade}</span></td>
                    <td>${item.capacity}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice?.toFixed(2)}</td>
                    <td><strong>$${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-section">
              ${(invoiceData.fees || []).map(fee => `
                <div class="total-row">
                  <span>${fee.label}:</span>
                  <span>$${fee.amount?.toFixed(2)}</span>
                </div>
              `).join('')}
              <div class="total-row grand-total">
                <span>Total Amount:</span>
                <span>$${invoiceData.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="payment-section">
            <div class="section-title">Payment Information</div>
            <div class="payment-grid">
              <div class="payment-info">
                <h3>Bank Transfer</h3>
                <p><strong>Bank:</strong> JP Morgan Chase Bank</p>
                <p><strong>Beneficiary:</strong> ALBI LOGISTICS LLC</p>
                <p><strong>Account #:</strong> 267084131</p>
                <p><strong>Routing:</strong> 021000021</p>
                <p><strong>Address:</strong> 10795 NW 58th St, Miami FL 33178</p>
                <p><strong>Email:</strong> albilogisticsllc@gmail.com</p>
                <p><strong>Reference:</strong> Invoice ${invoiceData.invoiceNumber}</p>
              </div>
              <div class="payment-info">
                <h3>Alternative Payment</h3>
                <p><strong>Zelle:</strong> albilogisticsllc@gmail.com</p>
                <p><strong>PayPal:</strong> pay@albilogistics.com</p>
                <p><strong>Check:</strong> Payable to Albi Logistics LLC</p>
                <p><strong>Mail to:</strong> 3761 SW 139 PL, Miami FL 33175</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Terms:</strong> Net 30</p>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>Payment is due within 30 days of invoice date.</p>
            <p>For questions, contact us at <strong>info@albilogistics.com</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = PDFGenerator; 