"use client";
import React, { useState } from 'react';
import { useAppContext } from './AppContext'; 
import { supabase } from '@/supabase'; 

export default function OrderView(props: any) {
  const { deliveryCharge } = useAppContext(); 

  const {
    appStep, setAppStep, finalInvoice, setFinalInvoice, orderTab, setOrderTab,
    pastOrders, savedDrafts, visibleOrdersCount, setVisibleOrdersCount, userProfile,
    isOrderChatOpen, setIsOrderChatOpen, chatMessage, setChatMessage, isChatUploading,
    resumeDraft, handleChatImageUpload, handleSendMessage,
    setActiveCall, handleDeleteOrder, selectedLanguage = 'English' 
  } = props;

  const isHindi = selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी');

  const t = {
    myOrders: isHindi ? "📦 मेरे ऑर्डर्स" : "📦 My Orders",
    backToDash: isHindi ? "← डैशबोर्ड पर वापस" : "← Back to Dashboard",
    continueShopping: isHindi ? "🛍️ और शॉपिंग करें (Continue Shopping)" : "🛍️ CONTINUE SHOPPING",
    orderHistory: isHindi ? "ऑर्डर हिस्ट्री" : "Order History",
    savedDrafts: isHindi ? "सेव किए गए ड्राफ्ट्स" : "Saved Drafts",
    searchPlaceholder: isHindi ? "🔍 ऑर्डर ID या नाम से खोजें..." : "🔍 Search by Order ID or Name...",
    date: isHindi ? "तारीख:" : "Date:",
    scheduled: isHindi ? "⏳ निर्धारित:" : "⏳ Scheduled:",
    labourBooking: isHindi ? "🛠️ मज़दूर बुकिंग" : "🛠️ Labour Booking",
    shopOrder: isHindi ? "🛒 शॉप ऑर्डर" : "🛒 Shop Order",
    viewDetails: isHindi ? "📄 डिटेल्स देखें" : "📄 View Details",
    downloadGst: isHindi ? "🧾 GST बिल डाउनलोड करें" : "🧾 Download GST Bill",
    seeMore: isHindi ? "और हिस्ट्री देखें ▼" : "See More History ▼",
    noOrders: isHindi ? "कोई ऑर्डर नहीं मिला" : "No Orders Found",
    draftSavedDate: isHindi ? "सेव की गई तारीख:" : "Date Saved:",
    openChatBook: isHindi ? "💬 चैट खोलें और बुक करें" : "💬 OPEN CHAT & BOOK",
    deleteDraft: isHindi ? "🗑️ ड्राफ्ट डिलीट करें" : "🗑️ Delete Draft",
    noDrafts: isHindi ? "कोई ड्राफ्ट सेव नहीं है" : "No Drafts Saved",
    billedTo: isHindi ? "बिल प्राप्तकर्ता" : "Billed To",
    paymentInfo: isHindi ? "पेमेंट जानकारी" : "Payment Info",
    mistriDetailsTitle: isHindi ? "मिस्त्री / सर्विस डिटेल्स" : "Mistri / Service Details",
    itemDetailsTitle: isHindi ? "आइटम डिटेल्स" : "Item Details",
    amount: isHindi ? "राशि (Amount)" : "Amount",
    transportCharge: isHindi ? "ट्रांसपोर्ट चार्ज:" : "Transport Charge:",
    deliveryChargeTxt: isHindi ? "डिलीवरी चार्ज:" : "Delivery Charge:",
    grandTotal: isHindi ? "कुल राशि (Grand Total):" : "Grand Total:",
    free: isHindi ? "₹0 (मुफ्त)" : "₹0 (FREE)",
    trackOrder: (type: string) => isHindi ? `📦 अपनी ${type} ट्रैक करें` : `📦 Track Your ${type}`,
    cancelBtn: (type: string) => isHindi ? `❌ ${type} कैंसल करें` : `❌ Cancel ${type}`,
    cancelPromptTitle: isHindi ? "क्या आप वाकई कैंसल करना चाहते हैं?" : "Are you sure you want to cancel?",
    cancelPlaceholder: isHindi ? "कैंसलेशन का कारण (Reason) लिखें..." : "Cancellation ka reason (Karan) likhein...",
    confirmCancel: isHindi ? "कैंसल कन्फर्म करें" : "Confirm Cancel",
    cancelling: isHindi ? "कैंसल हो रहा है..." : "Cancelling...",
    goBack: isHindi ? "वापस जाएं" : "Go Back",
    returnPolicy: isHindi ? "रिटर्न पॉलिसी" : "Return Policy",
    requestReturn: isHindi ? "📦 रिटर्न रिक्वेस्ट करें" : "📦 Request Return",
    reasonForReturn: isHindi ? "रिटर्न का कारण?" : "Reason for Return?",
    returnPlaceholder: isHindi ? "प्रोडक्ट में क्या समस्या है? लिखकर बताएं..." : "Product mein kya problem hai? Likh kar batayein...",
    submitRequest: isHindi ? "रिक्वेस्ट सबमिट करें" : "Submit Request",
    submitting: isHindi ? "सबमिट हो रहा है..." : "Submitting...",
    cancel: isHindi ? "रद्द करें" : "Cancel",
    pickupProof: isHindi ? "📸 रिटर्न पिकअप वेरीफाइड फोटो" : "📸 Return Pickup Verified Image",
    chatWith: (type: string) => isHindi ? `💬 ${type} से चैट करें` : `💬 Chat with ${type}`,
    closeChat: isHindi ? "▲ चैट बंद करें" : "▲ Close Chat",
    openChat: isHindi ? "▼ चैट खोलें" : "▼ Open Chat",
    freeCall: (type: string) => isHindi ? `📞 फ्री इंटरनेट कॉल (${type})` : `📞 Free Internet Call (Calling ${type})`,
    typeMessage: isHindi ? "अपना मैसेज यहाँ टाइप करें..." : "Type your message here...",
    send: isHindi ? "भेजें" : "Send",
    proceedToBooking: isHindi ? "✅ बुकिंग के लिए आगे बढ़ें" : "✅ PROCEED TO BOOKING",
    backToDrafts: isHindi ? "ड्राफ्ट्स पर वापस जाएँ" : "BACK TO DRAFTS",
    printNormalBill: isHindi ? "🖨️ नॉर्मल बिल प्रिंट करें" : "🖨️ PRINT NORMAL BILL",
    backToHistory: isHindi ? "हिस्ट्री पर वापस जाएँ" : "BACK TO HISTORY",
    mistriConfirmed: isHindi ? "✅ मिस्त्री कन्फर्म हो गया!" : "✅ Mistri Confirmed!",
    scheduledWorkDate: isHindi ? "📅 काम की तारीख:" : "📅 Scheduled Work Date:",
    mistriMessage: isHindi ? "मिस्त्री का मैसेज:" : "Mistri's Message:",
    returnDate: isHindi ? "📅 रिटर्न की तारीख:" : "📅 Return Date:",
    estDelivery: isHindi ? "📅 संभावित डिलीवरी:" : "📅 Estimated Delivery:",
    notAssigned: isHindi ? "अभी तय नहीं" : "Not Assigned Yet",
    liveLocation: isHindi ? "📍 लाइव लोकेशन अपडेट:" : "📍 Live Location Update:",
    returnNotAllowed: isHindi ? "🚫 इस आइटम पर रिटर्न उपलब्ध नहीं है" : "🚫 Return Not Allowed on this item",
    return7Days: isHindi ? "🔄 7 दिनों का रिटर्न उपलब्ध" : "🔄 7 Days Return Available",
    return7Closed: isHindi ? "⌛ रिटर्न का समय समाप्त (7 दिन पूरे)" : "⌛ Return Window Closed (7 Days Over)",
    return24Hours: isHindi ? "🔄 24 घंटे का रिटर्न उपलब्ध" : "🔄 24 Hours Return Available",
    return24Closed: isHindi ? "⌛ रिटर्न का समय समाप्त (24 घंटे पूरे)" : "⌛ Return Window Closed (24 Hours Over)",
    pendingReturnAuth: isHindi ? "⏳ यह प्रोडक्ट डिलीवरी के बाद रिटर्न किया जा सकेगा" : "⏳ Return will be active after delivery",
    orderLimitMsg: isHindi ? "आप केवल पिछले 20 ऑर्डर्स देख सकते हैं।" : "You can only view your last 20 orders."
  };

  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  // Delivery charge parsing
  const uiDelivery = Number(finalInvoice?.delivery_charge || finalInvoice?.transport_charge || finalInvoice?.deliveryCharge || deliveryCharge || 0);
  const uiTotal = Number(finalInvoice?.totalAmount || finalInvoice?.total_amount || 0);
  
  const uiName = finalInvoice?.customer_name || finalInvoice?.customerName || userProfile?.name || 'Customer';
  const uiPhone = finalInvoice?.phone || finalInvoice?.customerPhone || userProfile?.phone;

  let uiAddressParts = [];
  if (finalInvoice?.address) uiAddressParts.push(finalInvoice.address);
  else uiAddressParts.push('Address not provided');
  if (finalInvoice?.block) uiAddressParts.push(finalInvoice.block);
  if (finalInvoice?.district) uiAddressParts.push(finalInvoice.district);
  if (finalInvoice?.state) uiAddressParts.push(finalInvoice.state);
  if (finalInvoice?.pincode) uiAddressParts.push(`PIN: ${finalInvoice.pincode}`);
  const fullAddressText = uiAddressParts.join(', ');

  const isLabourBooking = (finalInvoice?.type || '').toLowerCase().includes('labour') || !finalInvoice?.items || finalInvoice.items.length === 0;
  const mistriCategory = finalInvoice?.category || finalInvoice?.labour_type || 'Expert Mistri';
  const mistriDetails = finalInvoice?.work_note || 'General Booking';

  const isOrderDelivered = ['complete', 'completed', 'delivered', 'work completed'].includes((finalInvoice?.status || '').toLowerCase());
  const isReturnFlow = ['return requested', 'return accepted', 'return picked up', 'refunded', 'returned'].includes((finalInvoice?.status || '').toLowerCase());

  // STRICT RETURN LOGIC
  const checkReturnValidity = (order: any) => {
    if (!order) return { type: 'hidden' };

    let savedPolicy = order.return_policy || (order.items && order.items.length > 0 ? order.items[0].return_policy : '') || 'No Return';

    if (order.return_window === '7_days') savedPolicy = '7 Days Return';
    if (order.return_window === '24_hours') savedPolicy = '24 Hours Return';

    const isNoReturn = String(savedPolicy).toLowerCase().includes('no return') || String(savedPolicy).trim() === '';

    if (isNoReturn) return { type: 'hidden' };

    const status = String(order.status || '').toLowerCase().trim();
    
    if (!['completed', 'complete', 'delivered'].includes(status)) {
      return { type: 'pending', message: `${t.pendingReturnAuth} (${savedPolicy})` }; 
    }

    const deliveryDate = new Date(order.updated_at || order.created_at);
    const now = new Date();
    const diffInHours = (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60);

    if (savedPolicy.includes('7 Days') || savedPolicy.includes('7')) {
      if (diffInHours <= (7 * 24)) return { type: 'active', message: t.return7Days };
      else return { type: 'error', message: t.return7Closed };
    } else if (savedPolicy.includes('24 Hours') || savedPolicy.includes('24')) {
      if (diffInHours <= 24) return { type: 'active', message: t.return24Hours };
      else return { type: 'error', message: t.return24Closed };
    } else {
      return { type: 'hidden' };
    }
  };

  const handleInitiateCall = () => {
    if (isLabourBooking) {
      setActiveCall({
        roomId: `mistri_${finalInvoice.labour_phone || finalInvoice.id}`,
        title: `Calling Mistri (Booking #${finalInvoice.order_no || finalInvoice.id})`
      });
    } else {
      setActiveCall({
        roomId: `shop_${finalInvoice.shop_id || 'general'}`,
        title: `Calling Shop Owner (Order #${finalInvoice.id})`
      });
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return alert(isHindi ? "कृपया कैंसल करने का कारण लिखें!" : "Please write a cancellation reason!");
    setIsCancelling(true);

    const tableName = isLabourBooking ? 'labour_bookings' : 'orders';
    
    let currentMsgs = finalInvoice.messages;
    if (typeof currentMsgs === 'string') { try { currentMsgs = JSON.parse(currentMsgs); } catch(e) { currentMsgs = []; } }
    if (!Array.isArray(currentMsgs)) currentMsgs = [];

    const cancelMsg = { sender: 'customer', text: `❌ ORDER CANCELLED BY CUSTOMER.\nReason: ${cancelReason}`, timestamp: new Date().toISOString() };
    const updatedMessages = [...currentMsgs, cancelMsg];

    try {
      const { error } = await supabase.from(tableName).update({ status: 'Cancelled', messages: updatedMessages }).eq('id', finalInvoice.id);
      if (error) throw error;
      alert(isHindi ? "आपका ऑर्डर सफलतापूर्वक कैंसल हो गया है।" : "Your order has been cancelled successfully.");
      setFinalInvoice({ ...finalInvoice, status: 'Cancelled', messages: updatedMessages });
      setShowCancelPrompt(false);
    } catch (error: any) { alert("Cancellation Failed: " + error.message); } finally { setIsCancelling(false); }
  };

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) return alert(isHindi ? "कृपया रिटर्न का कारण लिखें!" : "Please write a reason for return!");
    setIsReturning(true);

    const tableName = 'orders'; 
    let currentMsgs = finalInvoice.messages;
    if (typeof currentMsgs === 'string') { try { currentMsgs = JSON.parse(currentMsgs); } catch(e) { currentMsgs = []; } }
    if (!Array.isArray(currentMsgs)) currentMsgs = [];

    const returnMsg = { 
        sender: 'customer', 
        text: `📦 RETURN REQUESTED BY CUSTOMER.\nReason: ${returnReason}\n(Note: Delivery charge is non-refundable)`, 
        timestamp: new Date().toISOString() 
    };
    
    const updatedMessages = [...currentMsgs, returnMsg];

    try {
      const { error } = await supabase.from(tableName).update({ 
          status: 'Return Requested',
          messages: updatedMessages 
      }).eq('id', finalInvoice.id);

      if (error) throw error;

      alert(isHindi ? "आपकी रिटर्न रिक्वेस्ट भेज दी गई है। दुकानदार जल्द ही इसे चेक करेंगे।" : "Your Return Request has been sent. Shop Owner will review it shortly.");
      setFinalInvoice({ ...finalInvoice, status: 'Return Requested', messages: updatedMessages });
      setShowReturnPrompt(false);
    } catch (error: any) {
      alert("Return Request Failed: " + error.message);
    } finally {
      setIsReturning(false);
    }
  };

  const handlePrintBill = () => {
    if (!finalInvoice) return;
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) return;
    
    const ordShopName = finalInvoice.shop_name || 'Verified Retail Partner';

    const returnImageHtml = finalInvoice.return_image_url ? 
      `<div style="text-align: center; margin-top: 20px;"><h4 style="color: #b45309;">📸 Return Pickup Proof</h4><img src="${finalInvoice.return_image_url}" style="max-width: 300px; border-radius: 8px; border: 2px solid #cbd5e1;" /></div>` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${finalInvoice.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
            .bill-container { border: 1px solid #cbd5e1; padding: 40px; border-radius: 12px; max-width: 750px; margin: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.05); position: relative; }
            .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; color: #1e3a8a; font-weight: 900; }
            .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
            .customer-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; padding: 12px 15px; text-align: left; font-size: 13px; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            td { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: bold; }
            .total-section { margin-top: 30px; border-top: 2px solid #1e3a8a; padding-top: 20px; text-align: right; }
            .total-row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 10px; font-size: 15px; color: #475569; }
            .grand-total { display: flex; justify-content: flex-end; gap: 40px; font-size: 22px; font-weight: 900; color: #1e3a8a; margin-top: 10px; }
            .watermark { position: absolute; top: 30%; left: 15%; font-size: 100px; color: #ef4444; opacity: 0.1; transform: rotate(-45deg); font-weight: 900; letter-spacing: 5px; z-index: -1; }
          </style>
        </head>
        <body>
          <div class="bill-container">
            ${(finalInvoice.status || '').toLowerCase() === 'cancelled' ? '<div class="watermark">CANCELLED</div>' : ''}
            ${(finalInvoice.status || '').toLowerCase() === 'refunded' ? '<div class="watermark" style="color: #f59e0b;">REFUNDED</div>' : ''}
            <div class="header"><h1>FIXIFIY</h1><p>E-Commerce & Service Platform (India)</p></div>
            <div class="customer-info">
              <div>
                <p style="margin:0; font-size:12px; color:#64748b; text-transform:uppercase;">Billed To:</p>
                <h3 style="margin:5px 0; color:#0f172a;">${uiName}</h3>
                <p style="margin:0; font-size:14px;">Ph: +91 ${uiPhone}</p>
                <p style="margin:5px 0 0 0; font-size:13px; color:#475569;">${fullAddressText}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin:0; font-size:12px; color:#64748b; text-transform:uppercase;">Sold By / Partner:</p>
                <h3 style="margin:5px 0; color:#0f172a;">${ordShopName}</h3>
                <p style="margin:0; font-size:12px; color:#64748b; text-transform:uppercase; margin-top: 10px;">${isLabourBooking ? 'Booking ID' : 'Bill No / Invoice'}:</p>
                <p style="margin:0; font-size:14px; font-weight:bold;">${finalInvoice.invoiceNo || finalInvoice.id}</p>
                <p style="margin:5px 0 0 0; font-size:14px; font-weight:bold; color:${['cancelled', 'return requested'].includes((finalInvoice.status||'').toLowerCase()) ? '#ef4444' : '#16a34a'};">${(finalInvoice.status||'').toUpperCase() === 'CANCELLED' ? 'CANCELLED' : (finalInvoice.paymentMode || finalInvoice.payment_mode || 'PAID')}</p>
              </div>
            </div>
            <table>
              <thead><tr><th>${isLabourBooking ? 'Mistri / Service Details' : 'Item Details'}</th><th style="text-align: right;">Amount</th></tr></thead>
              <tbody>
                ${(finalInvoice.items && finalInvoice.items.length > 0) ? 
                  finalInvoice.items.map((item: any) => `<tr><td>${item.name}</td><td style="text-align: right;">₹${item.price?.toLocaleString('en-IN')}</td></tr>`).join('') 
                : `<tr><td><strong style="font-size: 18px;">👷‍♂️ ${mistriCategory}</strong><br/><span style="font-size: 13px; color: #475569; font-weight: normal; display: inline-block; margin-top: 5px;">📌 <b>Details:</b> ${mistriDetails}</span></td><td style="text-align: right;">₹${(finalInvoice.charge || finalInvoice.total_amount || 0).toLocaleString('en-IN')}</td></tr>`}
              </tbody>
            </table>
            <div class="total-section">
              <div class="total-row"><span>${isLabourBooking ? 'Transport Charge' : 'Delivery Charge'}:</span><span style="width: 120px; font-weight: bold;">₹${uiDelivery.toLocaleString('en-IN')}</span></div>
              <div class="grand-total"><span>GRAND TOTAL:</span><span style="width: 120px;">₹${uiTotal.toLocaleString('en-IN')}</span></div>
            </div>
            ${returnImageHtml}
            <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8;"><p>Thank you for choosing Fixifiy!</p></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  const handleDownloadGSTBill = (invoiceObj: any = finalInvoice) => {
    if (!invoiceObj) return;

    const status = (invoiceObj.status || '').toLowerCase();
    if (!['completed', 'complete', 'delivered', 'return requested', 'returned', 'refunded', 'work completed'].includes(status)) {
        alert("⚠️ GST Bill tabhi generate hoga jab order 'Delivered' ya 'Completed' mark ho jayega!");
        return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) return;

    const ordDelivery = Number(invoiceObj.delivery_charge || invoiceObj.transport_charge || invoiceObj.deliveryCharge || deliveryCharge || 0);
    const ordTotal = parseFloat(invoiceObj.totalAmount || invoiceObj.total_amount || 0);
    const ordName = invoiceObj.customer_name || invoiceObj.customerName || userProfile?.name || 'Customer';
    const ordPhone = invoiceObj.phone || invoiceObj.customerPhone || userProfile?.phone;
    
    // Shop Name aur GST IN fetch kar rahe hain
    const ordShopName = invoiceObj.shop_name || 'Verified Retail Partner';
    const ordShopGst = invoiceObj.shop_gstin || 'Unregistered / Exempted';

    const baseAmount = (ordTotal / 1.18).toFixed(2);
    const totalGst = (ordTotal - parseFloat(baseAmount)).toFixed(2);
    const halfGst = (parseFloat(totalGst) / 2).toFixed(2);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Verified GST Invoice - ${invoiceObj.id}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 0; color: #000; margin: 0; }
            .page { padding: 40px; min-height: 100vh; box-sizing: border-box; position: relative; }
            .bill-container { border: 2px solid #000; padding: 30px; margin: auto; position: relative; max-width: 800px; }
            .header-top { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 32px; font-weight: 900; font-style: italic; color: #1e3a8a; }
            .tax-title { font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px; }
            .seller-buyer-box { display: flex; justify-content: space-between; margin-bottom: 25px; background: #f8fafc; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #000; }
            th, td { padding: 10px; border: 1px solid #000; font-size: 14px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .total-section { margin-top: 20px; display: flex; justify-content: flex-end; }
            .total-box { width: 350px; border: 1px solid #000; padding: 15px; background: #f8fafc; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .grand-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; margin-top: 10px; border-top: 2px solid #000; padding-top: 10px; }
            .stamp { position: absolute; bottom: 80px; left: 50px; border: 5px solid #16a34a; color: #16a34a; font-size: 28px; font-weight: 900; padding: 15px 30px; border-radius: 12px; transform: rotate(-15deg); letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.9); z-index: 10; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="bill-container">
              
              <div class="header-top">
                <div>
                  <div class="logo">FIXIFIY</div>
                  <p style="margin: 5px 0 0 0; font-size: 12px; font-weight:bold; color: #64748b;">Platform Invoice</p>
                </div>
                <div style="text-align: right;">
                  <div class="tax-title">TAX INVOICE</div>
                  <p style="margin: 5px 0 0 0; font-size: 14px;"><b>Invoice No:</b> ${invoiceObj.invoiceNo || invoiceObj.id}</p>
                  <p style="margin: 2px 0 0 0; font-size: 14px;"><b>Date:</b> ${invoiceObj.date}</p>
                </div>
              </div>

              <div class="seller-buyer-box">
                <div>
                  <p style="margin:0; font-weight:bold; font-size:12px; text-transform:uppercase; color:#64748b;">Sold By (Seller):</p>
                  <p style="margin:5px 0 0 0; font-size:18px; font-weight:bold;">${ordShopName}</p>
                  <p style="margin:2px 0; font-size:14px;">GSTIN: ${ordShopGst}</p>
                </div>
                <div style="text-align:right;">
                  <p style="margin:0; font-weight:bold; font-size:12px; text-transform:uppercase; color:#64748b;">Billed To (Buyer):</p>
                  <p style="margin:5px 0 0 0; font-size:16px; font-weight:bold;">${ordName}</p>
                  <p style="margin:2px 0; font-size:14px;">Ph: +91 ${ordPhone}</p>
                  <p style="margin:0; font-size:13px; max-width: 250px;">${fullAddressText}</p>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <p style="margin:0; font-size:14px;"><b>Payment Mode:</b> ${invoiceObj.paymentMode || invoiceObj.payment_mode || 'Online'}</p>
                <p style="margin:0; font-size:14px;"><b>Status:</b> ${isLabourBooking ? 'COMPLETED' : 'DELIVERED'}</p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 5%">S.No</th>
                    <th style="width: 55%">Product Description</th>
                    <th style="width: 10%">Qty</th>
                    <th style="width: 15%">Rate (Inc. GST)</th>
                    <th style="width: 15%; text-align: right;">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${(invoiceObj.items && invoiceObj.items.length > 0) ? 
                    invoiceObj.items.map((item: any, idx: number) => `<tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.quantity || 1}</td><td>₹${item.ratePerUnit?.toLocaleString('en-IN') || item.price?.toLocaleString('en-IN')}</td><td style="text-align: right;">₹${item.price?.toLocaleString('en-IN')}</td></tr>`).join('') 
                  : `<tr><td colspan="5" style="text-align:center;">Item details missing</td></tr>`}
                  <tr>
                    <td colspan="4" style="text-align: right;"><b>${isLabourBooking ? 'Transport Charge' : 'Delivery Charge'}</b></td>
                    <td style="text-align: right;">₹${ordDelivery.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-box">
                  <div class="total-row"><span>Taxable Value:</span><span>₹${baseAmount}</span></div>
                  <div class="total-row"><span>CGST (9%):</span><span>₹${halfGst}</span></div>
                  <div class="total-row"><span>SGST (9%):</span><span>₹${halfGst}</span></div>
                  <div class="grand-total"><span>Invoice Total:</span><span>₹${ordTotal.toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              <div class="stamp">✔️ FIXIFIY VERIFIED</div>
              <div style="margin-top: 60px; border-top: 1px dashed #000; padding-top: 10px; font-size: 11px; text-align: center;">
                This is a computer generated original tax invoice representing the service partner's bill.
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 800);
  };

  const isOrderCancellable = finalInvoice && finalInvoice.status !== 'Draft' && !['delivered', 'completed', 'complete', 'work completed', 'cancelled', 'rejected', 'out for delivery', 'out_for_delivery', 'return requested', 'return picked up', 'refunded'].includes((finalInvoice.status || '').toLowerCase());

  const filteredPastOrders = pastOrders.filter((order: any) => 
     orderSearchTerm === "" || 
     String(order.id).toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
     String(order.customer_name).toLowerCase().includes(orderSearchTerm.toLowerCase())
  ).slice(0, 20); 

  return (
    <>
      {!finalInvoice ? (
        <div className="glass-card no-print" style={{ maxWidth: '800px', margin: '40px auto' }}>
          
          {/* Top Return to Dashboard Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
             <button onClick={() => setAppStep('home')} style={{ background: 'transparent', border: 'none', color: '#2874f0', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>{t.backToDash}</button>
          </div>
          
          {/* 🔥 HIGHLIGHTED CONTINUE SHOPPING BUTTON 🔥 */}
          <button 
             onClick={() => setAppStep('shop_items')} 
             style={{ width: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
             {t.continueShopping}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2874f0', paddingBottom: '10px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>{t.myOrders}</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setOrderTab('history')} style={{ padding: '8px 16px', background: orderTab === 'history' ? '#2874f0' : '#e0e0e0', color: orderTab === 'history' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{t.orderHistory}</button>
              <button onClick={() => setOrderTab('drafts')} style={{ padding: '8px 16px', background: orderTab === 'drafts' ? '#2874f0' : '#e0e0e0', color: orderTab === 'drafts' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{t.savedDrafts}</button>
            </div>
          </div>

          {orderTab === 'history' && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <input 
                   type="text" 
                   placeholder={t.searchPlaceholder} 
                   value={orderSearchTerm}
                   onChange={(e) => setOrderSearchTerm(e.target.value)}
                   style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px', textAlign: 'right' }}>
                {t.orderLimitMsg}
              </div>
            </>
          )}

          {orderTab === 'history' && (
              filteredPastOrders.length > 0 ? (
                <>
                {filteredPastOrders.slice(0, visibleOrdersCount).map((order: any, idx: number) => {
                  const isItemProduct = !(order.type || '').toLowerCase().includes('labour');
                  const orderStatusLower = (order.status || '').toLowerCase();
                  const isDeliveredMark = ['complete', 'completed', 'delivered', 'work completed'].includes(orderStatusLower);
                  const isReturnMark = ['return requested', 'return accepted', 'return picked up', 'refunded', 'returned'].includes(orderStatusLower);
                  
                  return (
                  <div key={idx} style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', marginBottom: '15px', transition: 'box-shadow 0.2s' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                    <div onClick={() => setFinalInvoice(order)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{order.id}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{t.date} {order.date}</div>
                        
                        {(order.delivery_date || order.estimated_delivery) && !isReturnMark && (
                          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', marginTop: '4px' }}>
                              {t.scheduled} {order.delivery_date || order.estimated_delivery}
                          </div>
                        )}

                        <div style={{ marginTop: '6px' }}>
                          <span style={{ fontSize: '11px', background: !isItemProduct ? '#fff3cd' : '#e3f2fd', color: !isItemProduct ? '#856404' : '#0d47a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{!isItemProduct ? t.labourBooking : t.shopOrder}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '1 1 150px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>₹{order.total_amount?.toLocaleString('en-IN')}</div>
                        
                        <div style={{ 
                           color: orderStatusLower === 'cancelled' ? '#ef4444' : 
                                  isReturnMark ? '#b45309' :
                                  (isDeliveredMark ? '#16a34a' : '#f59e0b'), 
                           fontWeight: 'bold', fontSize: '13px', margin: '4px 0',
                           background: isReturnMark ? '#fef3c7' : 'transparent',
                           padding: isReturnMark ? '2px 8px' : '0',
                           borderRadius: '4px'
                        }}>
                          {(order.status || '').toUpperCase()}
                        </div>
                        
                        <div style={{ fontSize: '12px', color: '#2874f0', fontWeight: 'bold', marginTop: '5px' }}>{t.viewDetails}</div>
                      </div>
                    </div>
                  </div>
                )})}
                {visibleOrdersCount < filteredPastOrders.length && (
                    <button onClick={() => setVisibleOrdersCount((prev: number) => prev + 5)} style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#2874f0', marginTop: '5px' }}>{t.seeMore}</button>
                )}
                </>
              ) : ( <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}><h3>{t.noOrders}</h3></div> )
          )}

          {orderTab === 'drafts' && (
              savedDrafts.length > 0 ? (
                savedDrafts.map((draft: any, idx: number) => (
                  <div key={idx} style={{ padding: '15px', border: '1px dashed #fb641b', background: '#fff9f6', borderRadius: '8px', marginBottom: '15px' }}>
                    <div onClick={() => setFinalInvoice(draft)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fb641b' }}>{draft.id} (Draft)</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{t.draftSavedDate} {draft.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#212121', marginBottom: '8px' }}>₹{draft.total_amount?.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '12px', color: '#2874f0', fontWeight: 'bold' }}>{t.openChatBook}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '15px', textAlign: 'right', borderTop: '1px solid #fed7aa', paddingTop: '10px' }}>
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleDeleteOrder(draft.id, draft.type); }} 
                         style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        {t.deleteDraft}
                      </button>
                    </div>
                  </div>
                ))
              ) : ( <div style={{ textAlign: 'center', padding: '50px 20px', color: '#878787' }}><h3>{t.noDrafts}</h3></div> )
          )}
        </div>
      ) : (
        <div className="invoice-box print-bill-container" style={{ position: 'relative' }}>
          
          {(finalInvoice.status || '').toLowerCase() === 'cancelled' && (
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '80px', color: 'red', opacity: 0.1, pointerEvents: 'none', fontWeight: 900, zIndex: 0 }}>CANCELLED</div>
          )}

          {isOrderDelivered && (
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '80px', color: 'green', opacity: 0.1, pointerEvents: 'none', fontWeight: 900, zIndex: 0 }}>DELIVERED</div>
          )}
          
          {isReturnFlow && (
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '80px', color: '#d97706', opacity: 0.1, pointerEvents: 'none', fontWeight: 900, zIndex: 0 }}>RETURNED</div>
          )}

          <div className="invoice-header" style={{ position: 'relative', zIndex: 1 }}>
            <div>
              <h1 className="invoice-title">FIXIFIY</h1>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>E-Commerce & Service Platform (India)</p>
            </div>
            <div className="invoice-meta">
              <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', color: (finalInvoice.status||'').toLowerCase() === 'cancelled' ? 'red' : (isReturnFlow ? '#d97706' : (isOrderDelivered ? '#16a34a' : '#333')) }}>
                {finalInvoice.status === 'Draft' ? 'ESTIMATE / DRAFT' : ((finalInvoice.status||'').toLowerCase() === 'cancelled' ? 'CANCELLED ORDER' : 'TAX INVOICE')}
              </h2>
              <p style={{ margin: '2px 0', fontSize: '14px' }}><strong>{isLabourBooking ? 'Booking ID' : 'Bill No'}:</strong> {finalInvoice.invoiceNo || finalInvoice.id}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', flex: '1 1 250px' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>{t.billedTo}</h5>
              <p style={{ margin: '2px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{uiName}</p>
              <p style={{ margin: '4px 0 2px 0', fontSize: '14px', color: '#333' }}>Ph: +91 {uiPhone}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{fullAddressText}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', flex: '1 1 250px', textAlign: 'right' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>{t.paymentInfo}</h5>
              <p style={{ margin: '2px 0', fontSize: '15px', fontWeight: 'bold', color: finalInvoice.status === 'Draft' ? '#f59e0b' : ((finalInvoice.status||'').toLowerCase() === 'cancelled' ? '#ef4444' : '#16a34a') }}>
                {finalInvoice.status === 'Draft' ? 'PENDING (DRAFT)' : ((finalInvoice.status||'').toLowerCase() === 'cancelled' ? 'CANCELLED' : (finalInvoice.paymentMode || finalInvoice.payment_mode || 'Online'))}
              </p>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>{t.date} {finalInvoice.date}</div>
            </div>
          </div>

          <div style={{ marginBottom: '30px', border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', position: 'relative', zIndex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 15px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>{isLabourBooking ? t.mistriDetailsTitle : t.itemDetailsTitle}</th>
                  <th style={{ padding: '12px 15px', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>{t.amount}</th>
                </tr>
              </thead>
              
              <tbody>
                {finalInvoice.items && finalInvoice.items.length > 0 ? (
                  finalInvoice.items.map((item: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                      <td style={{ padding: '15px', fontSize: '15px', color: '#0f172a', fontWeight: 'bold' }}>{item.name}</td>
                      <td style={{ padding: '15px', fontSize: '15px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right' }}>₹{item.price?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : ( 
                  <tr style={{ background: 'white' }}>
                    <td style={{ padding: '15px', fontSize: '15px', color: '#0f172a', fontWeight: 'bold' }}>
                      👷‍♂️ <span style={{ fontSize: '18px' }}>{mistriCategory}</span> 
                      <div style={{fontSize:'13px', color:'#475569', fontWeight:'normal', marginTop:'6px'}}>📌 <b>Details:</b> {mistriDetails}</div>
                    </td>
                    <td style={{ padding: '15px', fontSize: '15px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right' }}>
                      ₹{(finalInvoice.charge || finalInvoice.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr> 
                )}
              </tbody>
            </table>
            
            <div style={{ background: '#f8fafc', padding: '15px', textAlign: 'right', borderTop: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '5px', fontSize: '14px', color: '#475569' }}>
                <span>{isLabourBooking ? t.transportCharge : t.deliveryChargeTxt}</span>
                <span style={{ width: '100px' }}>{uiDelivery === 0 ? <span style={{color: '#16a34a', fontWeight: 'bold'}}>{t.free}</span> : `₹${uiDelivery.toLocaleString('en-IN')}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '10px', fontSize: '20px', color: '#1e3a8a', fontWeight: '900' }}>
                <span>{t.grandTotal}</span>
                <span style={{ width: '100px' }}>₹{uiTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          {finalInvoice.status !== 'Draft' && (finalInvoice.status||'').toLowerCase() !== 'cancelled' && (
            <div className="no-print" style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: '0', fontSize: '16px', color: '#1e293b' }}>{t.trackOrder(isLabourBooking ? 'Booking' : (isReturnFlow ? 'Return' : 'Order'))}</h3>
                
                {isOrderCancellable && (
                  <button onClick={() => setShowCancelPrompt(true)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {t.cancelBtn(isLabourBooking ? 'Booking' : 'Order')}
                  </button>
                )}
              </div>

              {showCancelPrompt && (
                <div style={{ background: '#fef2f2', border: '1px dashed #ef4444', padding: '15px', borderRadius: '8px', marginTop: '15px', marginBottom: '20px' }}>
                  <h4 style={{ color: '#b91c1c', margin: '0 0 10px 0' }}>{t.cancelPromptTitle}</h4>
                  <input type="text" placeholder={t.cancelPlaceholder} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #fca5a5', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleCancelOrder} disabled={isCancelling} style={{ flex: 1, background: '#ef4444', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isCancelling ? 'not-allowed' : 'pointer' }}>{isCancelling ? t.cancelling : t.confirmCancel}</button>
                    <button onClick={() => setShowCancelPrompt(false)} style={{ flex: 1, background: '#e2e8f0', color: '#0f172a', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{t.goBack}</button>
                  </div>
                </div>
              )}

              {/* DYNAMIC TRACKING BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '25px', paddingBottom: '10px' }}>
                {(() => {
                  let steps: string[] = [];
                  let currentIndex = 0;
                  const normalizedStatus = (finalInvoice.status || 'New Order').trim().toLowerCase();

                  if (isReturnFlow) {
                      steps = ['Return Requested', 'Boy Assigned', 'Picked Up', 'Refunded'];
                      if (normalizedStatus === 'refunded' || normalizedStatus === 'returned') currentIndex = 3;
                      else if (normalizedStatus === 'return picked up') currentIndex = 2;
                      else if (normalizedStatus === 'return accepted') currentIndex = 1;
                      else currentIndex = 0; 
                  } else if (isLabourBooking) {
                      steps = ['New Booking', 'Mistri Assigned', 'Work Started', 'Completed'];
                      if (['completed', 'complete', 'work completed'].includes(normalizedStatus)) currentIndex = 3;
                      else if (['work started', 'in progress', 'started'].includes(normalizedStatus)) currentIndex = 2;
                      else if (['worker assigned', 'assigned', 'accepted', 'confirmed'].includes(normalizedStatus)) currentIndex = 1;
                      else currentIndex = 0; 
                  } else {
                      steps = ['New Order', 'Accepted', 'Out for Delivery', 'Delivered'];
                      if (['completed', 'complete', 'delivered'].includes(normalizedStatus)) currentIndex = 3;
                      else if (normalizedStatus.includes('out') || normalizedStatus.includes('transit')) currentIndex = 2;
                      else if (['accepted', 'confirmed', 'processing'].includes(normalizedStatus)) currentIndex = 1;
                      else currentIndex = 0; 
                  }

                  const progressWidth = (currentIndex / (steps.length - 1)) * 100;
                  const activeColor = isReturnFlow ? '#d97706' : '#16a34a';

                  return (
                    <>
                      <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '4px', background: '#cbd5e1', zIndex: 0, borderRadius: '4px' }}></div>
                      <div style={{ position: 'absolute', top: '15px', left: '10%', width: `${progressWidth}%`, height: '4px', background: activeColor, zIndex: 0, borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}></div>
                      {steps.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        return (
                          <div key={index} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: isCompleted ? activeColor : 'white', color: isCompleted ? 'white' : '#94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', border: isCurrent ? `4px solid ${isReturnFlow ? '#fde68a' : '#bbf7d0'}` : (isCompleted ? '4px solid white' : '4px solid #cbd5e1'), boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: isCurrent ? 'bold' : 'normal', color: isCompleted ? activeColor : '#64748b', marginTop: '8px', textAlign: 'center' }}>
                              {(step === 'Delivered' || step === 'Completed') && isCompleted ? `${step} 🎉` : step}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>

              {/* MISTRI SPECIFIC DETAILS */}
              {isLabourBooking && ['worker assigned', 'work started', 'completed', 'work completed'].includes((finalInvoice.status || '').toLowerCase()) && finalInvoice.scheduled_date && (
                <div style={{ background: '#ecfdf5', border: '1px dashed #10b981', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#047857', fontSize: '15px' }}>{t.mistriConfirmed}</h4>
                  <p style={{ margin: 0, color: '#065f46', fontSize: '14px', fontWeight: 'bold' }}>
                    {t.scheduledWorkDate} {new Date(finalInvoice.scheduled_date).toLocaleDateString('en-IN')}
                  </p>
                  
                  {(() => {
                    let msgs = finalInvoice.messages;
                    if (typeof msgs === 'string') { try { msgs = JSON.parse(msgs); } catch(e) { msgs = []; } }
                    if (Array.isArray(msgs) && msgs.length > 0) {
                      const lastMsg = msgs.find((m:any) => m.text && m.text.includes('Maine yeh kaam accept kar liya hai'));
                      if (lastMsg) {
                        return (
                          <div style={{ marginTop: '10px', fontSize: '13px', color: '#166534', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                            <strong>{t.mistriMessage}</strong> {lastMsg.text}
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Estimated Delivery / Live Location */}
              {(!isLabourBooking || !finalInvoice.scheduled_date) && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#eff6ff', borderRadius: '6px', fontSize: '13px', color: '#1e3a8a', border: '1px dashed #93c5fd' }}>
                  <div style={{ marginBottom: '6px' }}><strong>{isReturnFlow ? t.returnDate : t.estDelivery}</strong> {finalInvoice.delivery_date || finalInvoice.estimated_delivery || t.notAssigned}</div>
                  {finalInvoice.current_location && (
                    <div><strong>{t.liveLocation}</strong> {finalInvoice.current_location}</div>
                  )}
                </div>
              )}

              {/* STRICT RETURN POLICY UI */}
              {!isLabourBooking && !isReturnFlow && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  
                  {(() => {
                    let displayPolicy = finalInvoice.return_policy || (finalInvoice.items && finalInvoice.items.length > 0 ? finalInvoice.items[0].return_policy : '') || 'No Return';
                    if (finalInvoice.return_window === '7_days') displayPolicy = '7 Days Return';
                    if (finalInvoice.return_window === '24_hours') displayPolicy = '24 Hours Return';

                    return (
                      <h4 style={{ margin: '0', color: '#b45309', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <span>🔄</span> {t.returnPolicy} : 
                        <span style={{ fontWeight: '900', color: '#92400e', marginLeft: '5px', background: '#fde68a', padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>
                          {displayPolicy}
                        </span>
                      </h4>
                    );
                  })()}
                  
                  {(() => {
                     const returnInfo = checkReturnValidity(finalInvoice);

                     if (returnInfo.type === 'hidden') return null; 
                     
                     if (returnInfo.type === 'active') {
                       return (
                         <div style={{ marginTop: '15px' }}>
                           <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px', fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                             <li>{isHindi ? 'आपका ऑर्डर इस रिटर्न विंडो के अंदर योग्य है:' : 'Your order is eligible within this return window:'} <strong>{returnInfo.message}</strong></li>
                             <li>{isHindi ? 'डिलीवरी चार्ज रिफंडेबल नहीं है।' : 'Delivery charge is non-refundable.'}</li>
                           </ul>
                           <button 
                             onClick={() => setShowReturnPrompt(true)} 
                             className="primary-btn" 
                             style={{ background: '#f59e0b', color: 'white', padding: '8px 15px', width: 'auto', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>
                             {t.requestReturn}
                           </button>
                         </div>
                       )
                     } else if (returnInfo.type === 'pending') {
                       return (
                         <div style={{ marginTop: '15px', fontSize: '13px', color: '#047857', fontWeight: 'bold', background: '#d1fae5', padding: '8px 12px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                           {returnInfo.message}
                         </div>
                       )
                     } else if (returnInfo.type === 'error') {
                       return (
                         <div style={{ marginTop: '15px', fontSize: '13px', color: '#dc2626', fontWeight: 'bold', background: '#fef2f2', padding: '8px 12px', borderRadius: '4px', border: '1px solid #fecaca' }}>
                           {returnInfo.message}
                         </div>
                       )
                     }
                  })()}

                  {showReturnPrompt && (
                    <div style={{ background: '#fffbeb', border: '1px dashed #f59e0b', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                      <h4 style={{ color: '#b45309', margin: '0 0 10px 0' }}>{t.reasonForReturn}</h4>
                      <input type="text" placeholder={t.returnPlaceholder} value={returnReason} onChange={(e) => setReturnReason(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #fcd34d', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' }}/>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleReturnRequest} disabled={isReturning} style={{ flex: 1, background: '#f59e0b', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isReturning ? 'not-allowed' : 'pointer' }}>{isReturning ? t.submitting : t.submitRequest}</button>
                        <button onClick={() => setShowReturnPrompt(false)} style={{ flex: 1, background: '#fde68a', color: '#92400e', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{t.cancel}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {finalInvoice.return_image_url && (
                 <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                   <h4 style={{ color: '#334155', margin: '0 0 10px 0' }}>{t.pickupProof}</h4>
                   <img src={finalInvoice.return_image_url} alt="Return Proof" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px' }} />
                 </div>
              )}

            </div>
          )}

          <div className="no-print" style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 onClick={() => setIsOrderChatOpen(!isOrderChatOpen)} style={{ margin: 0, fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>💬</span> {t.chatWith(isLabourBooking ? 'Mistri' : 'Shop')}</div>
              <span style={{ color: '#2874f0' }}>{isOrderChatOpen ? t.closeChat : t.openChat}</span>
            </h3>
            
            {isOrderChatOpen && (
              <div style={{ marginTop: '15px' }}>
                <button 
                  onClick={handleInitiateCall}
                  style={{ width: '100%', padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginBottom: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  {t.freeCall(isLabourBooking ? 'Mistri' : 'Shop Owner')}
                </button>

                <div style={{ height: '250px', overflowY: 'auto', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(() => {
                    let displayMsgs = finalInvoice.messages;
                    if (typeof displayMsgs === 'string') { try { displayMsgs = JSON.parse(displayMsgs); } catch(e) { displayMsgs = []; } }
                    if (!Array.isArray(displayMsgs) || displayMsgs.length === 0) displayMsgs = [{ sender: 'admin', text: 'Welcome.' }];
                    
                    return displayMsgs.map((msg: any, idx: number) => (
                      <div key={idx} style={{ alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start', background: msg.sender === 'customer' ? '#2874f0' : 'white', color: msg.sender === 'customer' ? 'white' : 'black', padding: '10px 12px', borderRadius: '8px', maxWidth: '75%', fontSize: '13px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        <div>{msg.text}</div>
                        {msg.imageUrl && <a href={msg.imageUrl} target="_blank" rel="noreferrer"><img src={msg.imageUrl} alt="attachment" loading="lazy" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', marginTop: '8px', border: '1px solid #e2e8f0', objectFit: 'cover' }} /></a>}
                      </div>
                    ));
                  })()}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ cursor: isChatUploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', width: '45px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '20px' }}>{isChatUploading ? '⏳' : '📎'}</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChatImageUpload} disabled={isChatUploading} />
                  </label>
                  <input type="text" className="input-pill" placeholder={t.typeMessage} value={chatMessage} onChange={(e: any) => setChatMessage(e.target.value)} style={{ flex: 1 }} onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }} />
                  <button onClick={handleSendMessage} className="primary-btn btn-blue" style={{ width: '80px', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} disabled={isChatUploading}>{t.send}</button>
                </div>
              </div>
            )}
          </div>

          <div className="no-print" style={{ display: 'flex', gap: '15px', marginTop: '40px', flexWrap: 'wrap' }}>
            {finalInvoice.status === 'Draft' ? (
               <>
                  <button onClick={() => resumeDraft(finalInvoice)} className="primary-btn btn-blue" style={{ flex: 1, minWidth: '180px', background: '#10b981' }}>{t.proceedToBooking}</button>
                  <button onClick={() => { setFinalInvoice(null); setAppStep('orders'); setOrderTab('drafts'); }} className="primary-btn" style={{ flex: 1, minWidth: '180px', background: '#e2e8f0', color: '#0f172a' }}>{t.backToDrafts}</button>
               </>
            ) : (
               <>
                  <button onClick={handlePrintBill} className="primary-btn btn-blue" style={{ flex: 1, minWidth: '150px' }}>{t.printNormalBill}</button>
                  
                  {/* 🔥 GST BUTTON FIX 🔥 */}
                  {!isLabourBooking && (isOrderDelivered || isReturnFlow) && (finalInvoice?.has_gst === true || String(finalInvoice?.has_gst) === 'true') && (
                    <button 
                      onClick={() => handleDownloadGSTBill(finalInvoice)} 
                      className="primary-btn" 
                      style={{ flex: 1, minWidth: '150px', background: '#0f172a', color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                    >
                      {t.downloadGst}
                    </button>
                  )}

                  {/* 🔥 HIGHLIGHTED CONTINUE SHOPPING BUTTON FOR DETAILS VIEW 🔥 */}
                  <button onClick={() => { setFinalInvoice(null); setAppStep('shop_items'); }} className="primary-btn" style={{ flex: 1, minWidth: '150px', background: '#f59e0b', color: 'white', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}>{t.continueShopping}</button>
                  
                  <button onClick={() => { setFinalInvoice(null); setAppStep('orders'); setOrderTab('history'); }} className="primary-btn" style={{ flex: 1, minWidth: '150px', background: '#e2e8f0', color: '#0f172a' }}>{t.backToHistory}</button>
               </>
            )}
          </div>
        </div>
      )}
    </>
  );
}