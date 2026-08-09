// components/InvoiceHelper.ts

export const numberToWords = (num: number) => {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
  if ((num = num.toString() as any).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
  return str.trim();
};

// ==========================================
// 1. GST TAX INVOICE (2 COPIES ON 1 A4 PAGE)
// ==========================================
export const printShopInvoice = (order: any, currentShop: any, items: any[]) => {
  if(!order) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert("Popup blocker is active. Please allow popups to print.");
  
  const date = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN');
  const cName = order.customer_name || order.name || order.full_name || 'Customer';
  const cPhone = order.customer_phone || order.user_phone || order.phone || order.mobile ||'N/A';
  const cState = order.state || '';
  const cDistrict = order.district || '';
  const cBlock = order.block || '';
  const cPincode = order.pincode ? `- ${order.pincode}` : '';
  const cLocation = order.customer_address || order.location || order.address || order.delivery_address || '';

  const sName = currentShop?.name || 'Fixifiy Verified Seller';
  const sPhone = currentShop?.phone || 'N/A';
  const sAddress = currentShop?.address ? `${currentShop.address}, ` : '';
  const sBlock = currentShop?.block ? `${currentShop.block}, ` : '';
  const sDistrict = currentShop?.district ? `${currentShop.district}, ` : '';
  const sState = currentShop?.state || '';
  const sPincode = currentShop?.pincode ? `- ${currentShop.pincode}` : '';
  const fullShopAddress = `${sAddress}${sBlock}${sDistrict}${sState} ${sPincode}`.trim() || 'Address not provided';
  const sGst = currentShop?.gst_number ? currentShop.gst_number : 'URD (Unregistered)';

  const deliveryCharge = Number(order.delivery_charge || order.shipping_charge || order.shipping_fee || 0);

  let calculatedGrandTotal = 0;
  let totalTaxableValue = 0;
  let totalGSTAmount = 0;

  const itemsHtml = items.map((item: any, index: number) => {
    const displayUnit = item.unit || 'Pc';
    const qty = Number(item.quantity || item.qty || 1);
    const gstRate = item.gst_rate ? Number(item.gst_rate) : 18;
    const hsnCode = item.hsn_code || '7326';

    const amountInclusiveTax = Number(item.price || 0); 
    calculatedGrandTotal += amountInclusiveTax;
    const taxableValue = amountInclusiveTax / (1 + (gstRate / 100));
    const gstAmount = amountInclusiveTax - taxableValue;
    
    totalTaxableValue += taxableValue;
    totalGSTAmount += gstAmount;
    const unitTaxablePrice = qty > 0 ? (taxableValue / qty) : 0; 
    
    return `<tr>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 4px;">${index + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 4px;">
          <strong style="color: #0f172a;">${item.name || item.product_name || item.item_name || 'Item'}</strong>
          <br/><span style="font-size:10px; color:#64748b;">HSN: ${hsnCode} | GST: ${gstRate}%</span>
        </td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 4px; font-weight: 600;">${qty} ${displayUnit}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 4px;">₹${unitTaxablePrice.toFixed(2)}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 4px; font-weight: 600;">₹${taxableValue.toFixed(2)}</td>
      </tr>`;
  }).join('');

  calculatedGrandTotal += deliveryCharge; 
  const roundedGrandTotal = Math.round(calculatedGrandTotal);
  const cgst = totalGSTAmount / 2;
  const sgst = totalGSTAmount / 2;

  const rawPaymentMode = order.payment_mode || order.paymentMode || 'Cash';
  const isCOD = rawPaymentMode.toLowerCase().includes('cod') || rawPaymentMode.toLowerCase().includes('cash');
  
  const displayPaymentMode = isCOD ? 'Cash on Delivery' : rawPaymentMode.toUpperCase();
  const displayPaymentStatus = isCOD 
      ? '<div style="color: #ef4444; font-weight: 900; background: #fef2f2; padding: 4px 8px; border: 1px solid #fca5a5; display: inline-block; border-radius: 4px; font-size: 11px;">UNPAID (COLLECT CASH)</div>' 
      : '<div style="color: #16a34a; font-weight: 900; background: #f0fdf4; padding: 4px 8px; border: 1px solid #86efac; display: inline-block; border-radius: 4px; font-size: 11px;">PAID (ONLINE)</div>';

  const getInvoiceHalf = (copyType: string) => `
    <div class="half-page">
      <div class="brand-header">
        <div class="brand-title">FIXIFIY TECHNOLOGY</div>
        <div class="brand-sub">(A Unit of Mahadev Enterprises)</div>
      </div>

      <div class="invoice-top">
        <div>
          <h1 style="margin: 0 0 5px 0; color: #0284c7; font-size: 18px; text-transform: uppercase;">TAX INVOICE</h1>
          <div style="font-size: 10px; color: #0f172a; background: #f1f5f9; display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; border: 1px dashed #94a3b8;">${copyType}</div>
          <div style="margin-top: 5px;">${displayPaymentStatus}</div>
        </div>
        <div class="invoice-meta">
          <strong>Invoice No:</strong> #${order.order_no || order.id || ''}<br/>
          <strong>Date:</strong> ${date}<br/>
          <strong>Supply Place:</strong> ${cState || 'Bihar'}<br/>
          <strong>Payment:</strong> ${displayPaymentMode}
        </div>
      </div>

      <div class="box-container">
        <div class="box">
          <h3>🏢 Billed By (Seller)</h3>
          <p>
            <strong style="font-size: 12px; color:#0f172a;">${sName}</strong><br/>
            ${fullShopAddress}<br/>
            <strong>Ph:</strong> ${sPhone}<br/>
            <strong style="color:#0284c7;">GSTIN:</strong> ${sGst}
          </p>
        </div>
        <div class="box">
          <h3>👤 Billed To (Customer)</h3>
          <p>
            <strong style="font-size: 12px; color:#0f172a;">${cName}</strong><br/>
            ${cLocation}<br/>
            ${cBlock ? cBlock + ', ' : ''}${cDistrict ? cDistrict + ', ' : ''}${cState} ${cPincode}<br/>
            <strong>Ph:</strong> ${cPhone}
          </p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th width="5%" style="text-align: center;">#</th>
            <th width="45%">Item Description</th>
            <th width="15%" style="text-align: center;">Qty</th>
            <th width="15%" style="text-align: right;">Rate <span style="font-size:8px;">(Excl.GST)</span></th>
            <th width="20%" style="text-align: right;">Taxable</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <table class="summary-table">
        <tbody>
          <tr><td>Total Taxable Value</td><td style="text-align: right; font-weight:bold;">₹${totalTaxableValue.toFixed(2)}</td></tr>
          <tr><td>Total CGST & SGST</td><td style="text-align: right;">₹${cgst.toFixed(2)} + ₹${sgst.toFixed(2)}</td></tr>
          ${deliveryCharge > 0 ? `<tr><td>Delivery Charges</td><td style="text-align: right;">₹${deliveryCharge.toFixed(2)}</td></tr>` : ''}
          <tr class="grand-total"><td>GRAND TOTAL</td><td style="text-align: right;">₹${roundedGrandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>
        </tbody>
      </table>
      <div style="margin-top: 5px; font-size: 10px; color: #334155;"><strong>Amount in words:</strong> <i>Rupees ${numberToWords(roundedGrandTotal)} Only.</i></div>
    </div>
  `;

  const html = `<html><head><title>Tax Invoice - #${order.order_no || order.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #fff; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4; margin: 0; }
    .page-wrapper { display: flex; flex-direction: column; justify-content: space-between; height: 100vh; padding: 5mm; box-sizing: border-box; }
    .half-page { height: 48%; box-sizing: border-box; padding: 2mm; position: relative; overflow: hidden; }
    .cut-line { height: 2%; display: flex; align-items: center; justify-content: center; }
    .cut-line span { background:#fff; font-size: 12px; font-weight: bold; color: #64748b; letter-spacing: 2px; }
    
    .brand-header { text-align: center; margin-bottom: 8px; border-bottom: 2px solid #0284c7; padding-bottom: 4px; }
    .brand-title { font-size: 18px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: 1px; }
    .brand-sub { font-size: 9px; font-weight: 600; color: #64748b; margin: 2px 0 0 0; text-transform: uppercase; }
    
    .invoice-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .invoice-meta { text-align: right; font-size: 10px; color: #475569; line-height: 1.4; }
    
    .box-container { display: flex; gap: 10px; margin-bottom: 8px; }
    .box { flex: 1; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; background: #f8fafc; }
    .box h3 { margin: 0 0 4px 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-size: 11px; text-transform: uppercase; }
    .box p { margin:0; line-height: 1.3; font-size: 10px; color: #334155; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th { background: #0f172a; color: white; padding: 4px; text-align: left; font-size: 10px; border: 1px solid #0f172a; }
    td { font-size: 10px; }
    
    .summary-table { width: 45%; margin-left: auto; border: 1px solid #cbd5e1; border-collapse: collapse; }
    .summary-table td { padding: 3px 6px; border-bottom: 1px solid #cbd5e1; font-size: 10px; }
    .summary-table .grand-total td { background: #f1f5f9; color: #0f172a; font-size: 12px; font-weight: 900; border-top: 2px solid #0284c7; }
  </style></head><body onload="setTimeout(() => { window.print(); window.close(); }, 800);">
    <div class="page-wrapper">
      ${getInvoiceHalf('1. Original for Recipient')}
      <div class="cut-line"><span>- - - - - ✂ CUT HERE ✂ - - - - -</span></div>
      ${getInvoiceHalf('2. Duplicate for Seller Record')}
    </div>
  </body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
};

// ==========================================
// 2. LARGE DELIVERY CHALLAN (WITH RTO ADDRESS & QR - NO PHONES)
// ==========================================
export const printDeliveryChallan = (order: any, currentShop: any, items: any[]) => {
  if(!order) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const date = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN');
  const orderId = order.order_no || order.id;
  
  const cName = order.customer_name || order.name || order.full_name || 'Customer';
  const cLocation = order.customer_address || order.location || order.address || order.delivery_address || '';
  const cBlock = order.block ? `${order.block}, ` : '';
  const cDistrict = order.district ? `${order.district}, ` : '';
  const cState = order.state || '';
  const cPincode = order.pincode ? `- ${order.pincode}` : '';

  const sName = currentShop?.name || 'Fixifiy Verified Seller';
  const sAddress = currentShop?.address ? `${currentShop.address}, ` : '';
  const sBlock = currentShop?.block ? `${currentShop.block}, ` : '';
  const sDistrict = currentShop?.district ? `${currentShop.district}, ` : '';
  const sState = currentShop?.state || '';
  const sPincode = currentShop?.pincode ? `- ${currentShop.pincode}` : '';
  const fullShopAddress = `${sAddress}${sBlock}${sDistrict}${sState} ${sPincode}`.trim() || 'Address not provided';

  const deliveryCharge = Number(order.delivery_charge || order.shipping_charge || order.shipping_fee || 0);

  let calculatedGrandTotal = deliveryCharge;
  const itemsHtml = items.map((item: any) => {
    calculatedGrandTotal += Number(item.price || 0);
    return `<tr>
        <td style="padding: 4px; border: 1px solid #94a3b8; font-size: 12px;"><strong>${item.name || item.product_name || item.item_name || 'Item'}</strong></td>
        <td style="padding: 4px; border: 1px solid #94a3b8; text-align: center; font-size: 12px; font-weight: 900;">${Number(item.quantity || item.qty || 1)} ${item.unit || 'Pc'}</td>
      </tr>`;
  }).join('');

  const rawPaymentMode = order.payment_mode || order.paymentMode || 'Cash';
  const isCOD = rawPaymentMode.toLowerCase().includes('cod') || rawPaymentMode.toLowerCase().includes('cash');

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(orderId)}`;

  const getChallanHalf = (copyType: string) => `
    <div class="half-page" style="border: 2px dashed #000; border-radius: 8px; padding: 4mm; position: relative;">
      
      <div style="position: absolute; top: 15px; right: 15px; text-align: center;">
        <img src="${qrCodeUrl}" width="100" height="100" style="border: 2px solid #000; padding: 2px; border-radius: 4px;" alt="QR Code" />
        <div style="font-size: 9px; font-weight: bold; margin-top: 2px;">SCAN TO VERIFY</div>
      </div>
      
      <div class="brand-box" style="width: 70%; text-align: left;">
        <div class="brand" style="font-size: 20px;">FIXIFIY CHALLAN</div>
        <div class="sub-brand">Standard Surface Delivery</div>
      </div>
      
      ${isCOD
         ? `<div class="cod-box" style="width: 60%; margin-top: 8px;">COD: ₹${calculatedGrandTotal.toFixed(2)}</div>`
         : `<div class="prepaid-box" style="width: 60%; margin-top: 8px;">PAID ONLINE <br><span style="font-size:10px;">(DO NOT COLLECT CASH)</span></div>`
      }

      <div class="section" style="margin-top: 10px;"><div class="title">Deliver To:</div><div class="text">
        <strong style="font-size: 16px;">${cName}</strong><br/>
        ${cLocation}<br/>${cBlock}${cDistrict}${cState} ${cPincode}<br/>
      </div></div>

      <!-- RETURN ADDRESS BOX (No Phone Number) -->
      <div class="section" style="border: 1px solid #000; padding: 4px; background: #f8fafc; border-radius: 4px;">
        <div class="title" style="background: #000; color: #fff; display: inline-block; padding: 2px 6px;">If Undelivered, Return To (RTO):</div>
        <div class="text" style="font-size: 11px; margin-top: 4px;">
          <strong>${sName}</strong><br/>${fullShopAddress}
        </div>
      </div>

      <div class="section" style="border: none; padding-bottom: 0;">
        <div style="display: flex; justify-content: space-between;"><div class="title">Order Details:</div><div style="font-size: 10px; font-weight: bold;">Date: ${date}</div></div>
        <div style="font-size: 12px; font-weight: bold;">Tracking ID: #${orderId}</div>
        <div class="items"><table><thead><tr><th width="80%">Product Name</th><th width="20%" style="text-align:center;">Qty</th></tr></thead><tbody>${itemsHtml}</tbody></table></div>
      </div>
      
      <div style="text-align: center; font-size: 11px; font-weight: 900; margin-top: 5px; padding-top: 5px; border-top: 2px solid #000;">*** ${copyType} ***</div>
    </div>
  `;

  const html = `<html><head><title>Large Label - #${orderId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #fff; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
    @page { size: A4; margin: 0; }
    .page-wrapper { display: flex; flex-direction: column; justify-content: space-between; height: 100vh; padding: 5mm; box-sizing: border-box; }
    .half-page { height: 48%; box-sizing: border-box; overflow: hidden; }
    .cut-line { height: 2%; display: flex; align-items: center; justify-content: center; }
    .cut-line span { background:#fff; font-size: 12px; font-weight: bold; color: #64748b; }
    
    .brand-box { border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 6px; }
    .brand { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; line-height: 1; }
    .sub-brand { font-size: 10px; font-weight: bold; color: #475569; margin-top: 2px; }
    .cod-box { background: #000; color: #fff; text-align: center; padding: 8px; font-size: 20px; font-weight: 900; border-radius: 4px; border: 2px solid #000; }
    .prepaid-box { border: 2px solid #000; text-align: center; padding: 6px; font-size: 18px; font-weight: 900; border-radius: 4px; }
    .section { border-bottom: 1px dotted #94a3b8; padding-bottom: 6px; margin-bottom: 6px; }
    .title { font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; background: #f1f5f9; display: inline-block; padding: 1px 4px; }
    .text { font-size: 12px; line-height: 1.3; }
    .items table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    .items th { border: 1px solid #94a3b8; padding: 3px; text-align: left; background: #f8fafc; font-size: 10px; }
  </style></head><body onload="setTimeout(() => { window.print(); window.close(); }, 800);">
    <div class="page-wrapper">
      ${getChallanHalf('1. Shipping Label (Paste Outside)')}
      <div class="cut-line"><span>- - - - - ✂ CUT HERE ✂ - - - - -</span></div>
      ${getChallanHalf('2. Seller Record Copy (Keep Inside)')}
    </div>
  </body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
};

// ==========================================
// 3. 🔥 NEW: MINI BILL + CHALLAN (WITH RTO ADDRESS - NO PHONES ON CHALLAN) 🔥
// Top 2: Carbon Copy GST | Bottom 2: Challan with QR & Return Addr
// ==========================================
export const printMiniChallan = (order: any, currentShop: any, items: any[]) => {
  if(!order) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const date = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN');
  const orderId = order.order_no || order.id;
  
  // Details
  const cName = order.customer_name || order.name || order.full_name || 'Customer';
  const cPhone = order.customer_phone || order.user_phone || order.phone || order.mobile || 'N/A'; // Kept ONLY for inside GST Bill
  const cState = order.state || '';
  const cDistrict = order.district || '';
  const cBlock = order.block || '';
  const cPincode = order.pincode ? `- ${order.pincode}` : '';
  const cLocation = order.customer_address || order.location || order.address || order.delivery_address || '';
  
  const sName = currentShop?.name || 'Fixifiy Verified Seller';
  const sPhone = currentShop?.phone || 'N/A'; // Kept ONLY for inside GST Bill
  const sAddress = currentShop?.address ? `${currentShop.address}, ` : '';
  const sBlock = currentShop?.block ? `${currentShop.block}, ` : '';
  const sDistrict = currentShop?.district ? `${currentShop.district}, ` : '';
  const sState = currentShop?.state || '';
  const sPincode = currentShop?.pincode ? `- ${currentShop.pincode}` : '';
  const fullShopAddress = `${sAddress}${sBlock}${sDistrict}${sState} ${sPincode}`.trim() || 'Address not provided';
  const sGst = currentShop?.gst_number ? currentShop.gst_number : 'URD (Unregistered)';
  
  const deliveryCharge = Number(order.delivery_charge || order.shipping_charge || order.shipping_fee || 0);
  const rawPaymentMode = order.payment_mode || order.paymentMode || 'Cash';
  const isCOD = rawPaymentMode.toLowerCase().includes('cod') || rawPaymentMode.toLowerCase().includes('cash');

  const displayPaymentMode = isCOD ? 'Cash on Delivery' : rawPaymentMode.toUpperCase();
  const displayPaymentStatus = isCOD 
      ? '<span style="color: #ef4444; font-weight: 900; background: #fef2f2; padding: 2px 4px; border: 1px solid #fca5a5; display: inline-block; border-radius: 2px; font-size: 8px;">UNPAID (COLLECT CASH)</span>' 
      : '<span style="color: #16a34a; font-weight: 900; background: #f0fdf4; padding: 2px 4px; border: 1px solid #86efac; display: inline-block; border-radius: 2px; font-size: 8px;">PAID (ONLINE)</span>';

  // --- Calculations for Shrunk GST Bill ---
  let calculatedGrandTotal = 0;
  let totalTaxableValue = 0;
  let totalGSTAmount = 0;

  const gstItemsHtml = items.map((item: any, index: number) => {
    const qty = Number(item.quantity || item.qty || 1);
    const gstRate = item.gst_rate ? Number(item.gst_rate) : 18;
    const hsnCode = item.hsn_code || '7326';

    const amountInclusiveTax = Number(item.price || 0); 
    calculatedGrandTotal += amountInclusiveTax;
    const taxableValue = amountInclusiveTax / (1 + (gstRate / 100));
    const gstAmount = amountInclusiveTax - taxableValue;
    
    totalTaxableValue += taxableValue;
    totalGSTAmount += gstAmount;
    const unitTaxablePrice = qty > 0 ? (taxableValue / qty) : 0; 
    
    return `<tr>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 2px;">${index + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 2px;">
          <strong style="color: #0f172a;">${item.name || item.product_name || item.item_name || 'Item'}</strong>
          <br/><span style="font-size:6px; color:#64748b;">HSN: ${hsnCode} | GST: ${gstRate}%</span>
        </td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 2px; font-weight: 600;">${qty}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 2px;">₹${unitTaxablePrice.toFixed(2)}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 2px; font-weight: 600;">₹${taxableValue.toFixed(2)}</td>
      </tr>`;
  }).join('');

  calculatedGrandTotal += deliveryCharge; 
  const roundedGrandTotal = Math.round(calculatedGrandTotal);
  const cgst = totalGSTAmount / 2;
  const sgst = totalGSTAmount / 2;

  // HTML for Challan Table
  let challanTotal = deliveryCharge;
  const challanItemsHtml = items.map((item: any, idx: number) => {
    challanTotal += Number(item.price || 0);
    return `<tr>
              <td style="border: 1px solid #000; padding: 2px;">${idx + 1}. ${item.name || 'Item'}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold;">${item.quantity || item.qty || 1}</td>
            </tr>`;
  }).join('');

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(orderId)}`;

  // --- TOP 2 QUADRANTS: EXACT SHRUNK COPY OF GST INVOICE (Phones kept for tax records) ---
  const getMiniGSTBill = (copyType: string) => `
    <div class="quarter-page" style="padding: 4mm;">
      <div style="text-align: center; margin-bottom: 4px; border-bottom: 1px solid #0284c7; padding-bottom: 2px;">
        <div style="font-size: 11px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: 0.5px;">FIXIFIY TECHNOLOGY</div>
        <div style="font-size: 6px; font-weight: 600; color: #64748b; margin: 1px 0 0 0; text-transform: uppercase;">(A Unit of Mahadev Enterprises)</div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
        <div>
          <h1 style="margin: 0 0 2px 0; color: #0284c7; font-size: 10px; text-transform: uppercase;">TAX INVOICE</h1>
          <div style="font-size: 6px; color: #0f172a; background: #f1f5f9; display: inline-block; padding: 1px 4px; border-radius: 2px; font-weight: bold; border: 1px dashed #94a3b8;">${copyType}</div>
          <div style="margin-top: 2px;">${displayPaymentStatus}</div>
        </div>
        <div style="text-align: right; font-size: 7px; color: #475569; line-height: 1.2;">
          <strong>Inv No:</strong> #${orderId}<br/>
          <strong>Date:</strong> ${date}<br/>
          <strong>Place:</strong> ${cState || 'Bihar'}<br/>
          <strong>Pay:</strong> ${displayPaymentMode}
        </div>
      </div>

      <div style="display: flex; gap: 4px; margin-bottom: 4px;">
        <div style="flex: 1; border: 1px solid #cbd5e1; padding: 3px 4px; border-radius: 4px; background: #f8fafc;">
          <h3 style="margin: 0 0 2px 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; font-size: 7px; text-transform: uppercase;">🏢 Billed By</h3>
          <p style="margin:0; line-height: 1.2; font-size: 6px; color: #334155;">
            <strong style="font-size: 7px; color:#0f172a;">${sName}</strong><br/>
            ${fullShopAddress}<br/>
            <strong>Ph:</strong> ${sPhone}<br/>
            <strong style="color:#0284c7;">GSTIN:</strong> ${sGst}
          </p>
        </div>
        <div style="flex: 1; border: 1px solid #cbd5e1; padding: 3px 4px; border-radius: 4px; background: #f8fafc;">
          <h3 style="margin: 0 0 2px 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; font-size: 7px; text-transform: uppercase;">👤 Billed To</h3>
          <p style="margin:0; line-height: 1.2; font-size: 6px; color: #334155;">
            <strong style="font-size: 7px; color:#0f172a;">${cName}</strong><br/>
            ${cLocation}<br/>
            ${cBlock ? cBlock + ', ' : ''}${cDistrict ? cDistrict + ', ' : ''}${cState} ${cPincode}<br/>
            <strong>Ph:</strong> ${cPhone}
          </p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 7px;">
        <thead>
          <tr>
            <th width="5%" style="background: #0f172a; color: white; padding: 2px; text-align: center; border: 1px solid #0f172a; font-size: 6px;">#</th>
            <th width="45%" style="background: #0f172a; color: white; padding: 2px; text-align: left; border: 1px solid #0f172a; font-size: 6px;">Item Description</th>
            <th width="12%" style="background: #0f172a; color: white; padding: 2px; text-align: center; border: 1px solid #0f172a; font-size: 6px;">Qty</th>
            <th width="18%" style="background: #0f172a; color: white; padding: 2px; text-align: right; border: 1px solid #0f172a; font-size: 6px;">Rate<br/><span style="font-size:4px;">(Ex.GST)</span></th>
            <th width="20%" style="background: #0f172a; color: white; padding: 2px; text-align: right; border: 1px solid #0f172a; font-size: 6px;">Taxable</th>
          </tr>
        </thead>
        <tbody>${gstItemsHtml}</tbody>
      </table>

      <table style="width: 55%; margin-left: auto; border: 1px solid #cbd5e1; border-collapse: collapse; font-size: 6px;">
        <tbody>
          <tr><td style="padding: 2px; border-bottom: 1px solid #cbd5e1;">Total Taxable</td><td style="padding: 2px; border-bottom: 1px solid #cbd5e1; text-align: right; font-weight:bold;">₹${totalTaxableValue.toFixed(2)}</td></tr>
          <tr><td style="padding: 2px; border-bottom: 1px solid #cbd5e1;">CGST & SGST</td><td style="padding: 2px; border-bottom: 1px solid #cbd5e1; text-align: right;">₹${cgst.toFixed(2)} + ₹${sgst.toFixed(2)}</td></tr>
          ${deliveryCharge > 0 ? `<tr><td style="padding: 2px; border-bottom: 1px solid #cbd5e1;">Delivery</td><td style="padding: 2px; border-bottom: 1px solid #cbd5e1; text-align: right;">₹${deliveryCharge.toFixed(2)}</td></tr>` : ''}
          <tr style="background: #f1f5f9; color: #0f172a; font-size: 8px; font-weight: 900; border-top: 1px solid #0284c7;"><td style="padding: 2px;">GRAND TOTAL</td><td style="padding: 2px; text-align: right;">₹${roundedGrandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>
        </tbody>
      </table>
    </div>
  `;

  // --- BOTTOM 2 QUADRANTS: DELIVERY CHALLAN WITH QR & RTO (NO PHONES) ---
  const getMiniChallan = (copyType: string) => `
    <div class="quarter-page" style="padding: 6mm;">
      
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
        <div>
          <h2 style="margin: 0 0 2px 0; font-size: 16px; font-weight: 900; letter-spacing: 1px;">DELIVERY<br/>CHALLAN</h2>
          <div style="font-size: 8px; font-weight: bold;">FIXIFIY DELIVERY</div>
        </div>
        <div style="text-align: center;">
          <img src="${qrCodeUrl}" width="55" height="55" style="border: 1px solid #000; padding: 2px; border-radius: 4px;" alt="QR" />
          <div style="font-size: 7px; font-weight: bold; margin-top: 2px;">SCAN TO VERIFY</div>
        </div>
      </div>
      
      ${isCOD
         ? `<div style="background:#000; color:#fff; text-align:center; padding:4px; font-size:14px; font-weight:900; margin-bottom:6px; border: 2px solid #000;">COD: ₹${Math.round(challanTotal).toFixed(2)}</div>`
         : `<div style="border:2px solid #000; text-align:center; padding:4px; font-size:14px; font-weight:900; margin-bottom:6px; background: #f1f5f9;">PAID ONLINE</div>`
      }

      <div style="font-size: 10px; margin-bottom: 6px; line-height: 1.3;">
        <div style="background: #e2e8f0; display: inline-block; padding: 2px 4px; font-weight: 900; border: 1px solid #000; margin-bottom: 2px;">Deliver To:</div><br/>
        <strong style="font-size: 14px;">${cName}</strong><br/>
        ${cLocation}<br/>${order.state || ''} ${cPincode}<br/>
      </div>

      <!-- RETURN ADDRESS BOX FOR MINI LABEL (No Phone Number) -->
      <div style="font-size: 7px; border: 1px solid #000; padding: 4px; margin-bottom: 6px; background: #f8fafc;">
        <strong style="background: #000; color: #fff; padding: 1px 3px;">If Undelivered, Return To (RTO):</strong><br/>
        <span style="display:inline-block; margin-top: 2px;">
          <strong>${sName}</strong>, ${fullShopAddress}
        </span>
      </div>

      <div style="font-size: 9px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; margin-bottom: 6px; display: flex; justify-content: space-between;">
        <span><strong>Order:</strong> #${orderId}</span>
        <span><strong>Date:</strong> ${date}</span>
      </div>

      <div style="flex-grow: 1;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 2px; font-size: 9px;">
          <thead>
            <tr>
              <th style="text-align: left; border: 1px solid #000; padding: 3px; background-color: #f1f5f9;">Product</th>
              <th style="text-align: center; width: 40px; border: 1px solid #000; padding: 3px; background-color: #f1f5f9;">Qty</th>
            </tr>
          </thead>
          <tbody>${challanItemsHtml}</tbody>
        </table>
      </div>

      <div style="text-align: center; font-size: 8px; font-weight: bold; padding-top: 4px; border-top: 1px solid #000; margin-top: 4px;">
        *** ${copyType} ***
      </div>
    </div>
  `;

  // Exact A4 Size CSS (210mm x 297mm)
  const html = `<html><head><title>Mini Labels - #${orderId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    body { 
      font-family: 'Inter', sans-serif; 
      margin: 0; padding: 0; 
      background: #fff; color: #000; 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact; 
    }
    @page { size: A4; margin: 0; }
    
    .page-wrapper { 
      display: grid; 
      grid-template-columns: 105mm 105mm; 
      grid-template-rows: 148.5mm 148.5mm; 
      width: 210mm; 
      height: 297mm; 
      box-sizing: border-box; 
    }
    
    .quarter-page { 
      width: 105mm; 
      height: 148.5mm; 
      box-sizing: border-box; 
      overflow: hidden; 
      border-right: 1px dashed #94a3b8; 
      border-bottom: 1px dashed #94a3b8; 
      display: flex; 
      flex-direction: column; 
    }
    
    /* Remove outer borders */
    .quarter-page:nth-child(2n) { border-right: none; }
    .quarter-page:nth-child(n+3) { border-bottom: none; }
  </style></head><body onload="setTimeout(() => { window.print(); window.close(); }, 800);">
    <div class="page-wrapper">
      <!-- Top 2 Quarters: Exact Shrunk GST Invoice -->
      ${getMiniGSTBill('1. Original for Recipient')}
      ${getMiniGSTBill('2. Seller Copy')}
      
      <!-- Bottom 2 Quarters: Delivery Challans with QR Code & RTO -->
      ${getMiniChallan('3. Shipping Label (Paste Outside)')}
      ${getMiniChallan('4. Customer Copy (Keep Inside)')}
    </div>
  </body></html>`;
  
  printWindow.document.write(html);
  printWindow.document.close();
};