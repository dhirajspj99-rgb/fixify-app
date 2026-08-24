"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// 🗺️ MAP COMPONENT
const DeliveryMap = ({ destination, coords, type, onClose, t }: { destination: string, coords: {lat: number, lon: number} | null, type: 'Shop' | 'Customer', onClose: () => void, t: any }) => {
  const destEncoded = encodeURIComponent(destination || 'India');
  const mapUrl = coords ? `https://maps.google.com/maps?saddr=${coords.lat},${coords.lon}&daddr=${destEncoded}&output=embed` : `https://maps.google.com/maps?q=${destEncoded}&output=embed`;
  const nativeUrl = coords ? `https://maps.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lon}&destination=${destEncoded}&dir_action=navigate` : `https://maps.google.com/maps/dir/?api=1&destination=${destEncoded}&dir_action=navigate`;

  return (
    <div style={{ marginTop: '10px', padding: '12px', background: type === 'Shop' ? '#fffbeb' : '#f0fdf4', borderRadius: '12px', border: type === 'Shop' ? '1px dashed #f59e0b' : '1px dashed #22c55e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: type === 'Shop' ? '#d97706' : '#16a34a', textTransform: 'uppercase' }}>
          📍 {type === 'Shop' ? t.shopRoute : t.custRoute}
        </div>
        <button onClick={onClose} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
          {t.closeMap}
        </button>
      </div>
      <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
        <iframe width="100%" height="100%" frameBorder="0" src={mapUrl} allowFullScreen></iframe>
      </div>
      <button onClick={() => window.open(nativeUrl, '_blank')} style={{ width: '100%', background: type === 'Shop' ? '#d97706' : '#2563eb', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: '900', fontSize: '15px', cursor: 'pointer' }}>
        {t.startNav}
      </button>
    </div>
  );
};

export default function DeliveryBoyApp() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [deliveryBoy, setDeliveryBoy] = useState<any>(null);
  const [workerCoords, setWorkerCoords] = useState<{lat: number, lon: number} | null>(null);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [activeTab, setActiveTab] = useState<'shop_pickup' | 'deliveries' | 'history' | 'wallet' | 'profile'>('shop_pickup');
  
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [shopsData, setShopsData] = useState<{ [key: string]: any }>({}); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [showMapForOrder, setShowMapForOrder] = useState<Record<number, boolean>>({});

  const [verifyOrder, setVerifyOrder] = useState<any | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [paymentCollected, setPaymentCollected] = useState<Record<string, 'Cash' | 'QR'>>({});
  const [showScannerOrder, setShowScannerOrder] = useState<any>(null);

  const [failOrder, setFailOrder] = useState<any | null>(null);
  const [failReason, setFailReason] = useState('');

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [supportMessage, setSupportMessage] = useState('');
  const [adminOfficePhone, setAdminOfficePhone] = useState('Number Not Set'); 
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const [historyFilterType, setHistoryFilterType] = useState<'quick' | 'custom'>('quick');
  const [quickFilter, setQuickFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [walletFilter, setWalletFilter] = useState<'30days' | '7days' | 'all'>('30days');
  
  const [showWithdrawalHistory, setShowWithdrawalHistory] = useState(false);

  const [adminUpi, setAdminUpi] = useState('admin@ybl'); 
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [perDeliveryFee, setPerDeliveryFee] = useState<number>(30); 
  
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]); 

  const translations = {
    hi: {
      loginTitle: "डिलीवरी पार्टनर लॉगिन", phoneLabel: "मोबाइल नंबर", passLabel: "पासवर्ड", loginBtn: "लॉगिन करें",
      refresh: "रिफ्रेश", callShop: "दुकान को कॉल करें", callCust: "ग्राहक को कॉल करें", receiveFromShop: "✅ दुकान से माल मिल गया",
      verifyDeliver: "✅ वेरीफाई करके डिलीवर करें", failDeliveryBtn: "❌ डिलीवरी नहीं हुई",
      cashInHand: "जमा करने वाला कैश", walletBal: "वॉलेट बैलेंस", withdraw: "पैसे निकालने की रिक्वेस्ट",
      logout: "लॉगआउट करें", changePassword: "पासवर्ड बदलें (Change Password)", shopRoute: "दुकान का रास्ता", custRoute: "ग्राहक का रास्ता",
      closeMap: "❌ मैप बंद करें", startNav: "🧭 मैप्स चालू करें", emptyPickup: "📭 दुकान से लेने के लिए कोई आर्डर नहीं है।",
      emptyDeliver: "📭 डिलीवरी के लिए कोई आर्डर नहीं है।", emptyHistory: "📭 इस फिल्टर के लिए कोई आर्डर नहीं मिला।",
      emptyTransactions: "📭 कोई ट्रांजैक्शन नहीं मिला।", emptyWithdrawals: "📭 निकासी का कोई रिकॉर्ड नहीं है।",
      shopName: "दुकान का नाम:", address: "पूरा पता:", blockDist: "ब्लॉक व जिला:", pincode: "पिनकोड:",
      viewMap: "🗺️ रास्ता देखें", custDetails: "ग्राहक का विवरण:", paymentMode: "पेमेंट मोड:", earning: "आपकी कमाई:", shopDetails: "दुकान का विवरण:",
      searchPlaceholder: "🔍 आर्डर ID या नाम से खोजें...", quickFilter: "⚡ तुरंत फिल्टर", customFilter: "📅 तारीख से चुनें",
      today: "आज", week: "हफ्ता", month: "महीना", all: "सभी", from: "से (From):", to: "तक (To):",
      completedOrders: "पूरे हो चुके आर्डर", hide: "▲ छुपाएं", details: "▼ विवरण", withdrawalHistory: "निकासी का इतिहास (Withdrawals)",
      passbookHistory: "पासबुक (Earnings History)", reqSent: "✅ रिक्वेस्ट भेज दी गई है!", reqFail: "कृपया कारण लिखें!",
      verifyTitle: "अंतिम सुरक्षा जाँच (Final Check)", enterLast6: "ग्राहक के मोबाइल नंबर के आखिरी 6 अंक डालें:",
      cancel: "रद्द करें", confirm: "✅ वेरीफाई करें", failTitle: "❌ डिलीवरी फेल का कारण", failPlaceholder: "कारण लिखें (e.g. Customer not answering)...",
      submitReason: "कारण जमा करें", withdrawTitle: "पैसे निकालने का अनुरोध", availBal: "उपलब्ध बैलेंस:", enterAmt: "रकम डालें (₹)",
      enterUpi: "UPI आईडी डालें", changePassTitle: "सुरक्षित पासवर्ड सेट करें", savePass: "पासवर्ड सेव करें", sendRequest: "रिक्वेस्ट भेजें",
      pickupTab: "🏬 पिकअप", deliverTab: "📦 डिलीवर", historyTab: "📜 इतिहास", profileTab: "👤 प्रोफाइल", walletTab: "💳 वॉलेट",
      oldPass: "पुराना पासवर्ड", newPass: "नया पासवर्ड", confirmPass: "कन्फर्म पासवर्ड",
      wrongOldPass: "❌ पुराना पासवर्ड गलत है!", passMismatch: "❌ नया पासवर्ड और कन्फर्म पासवर्ड मैच नहीं कर रहे!",
      passComplexity: "❌ पासवर्ड में 12 अक्षर, 1 Capital, 1 Small, 1 नंबर और 1 Special Character अनिवार्य है!",
      helpSupport: "सहायता और सपोर्ट (Help Desk)", supportDesc: "अगर आपको कोई समस्या है तो एडमिन को मैसेज या कॉल करें।",
      callOffice: "ऑफिस कॉल करें", writeMessage: "अपनी समस्या या मैसेज यहाँ लिखें...", sendMsg: "मैसेज भेजें", msgSent: "✅ मैसेज भेज दिया गया है!"
    },
    en: {
      loginTitle: "Delivery Partner Login", phoneLabel: "Mobile Number", passLabel: "Password", loginBtn: "LOGIN",
      refresh: "Refresh", callShop: "Call Shop", callCust: "Call Customer", receiveFromShop: "✅ Received from Shop",
      verifyDeliver: "✅ Verify & Deliver", failDeliveryBtn: "❌ Delivery Failed",
      cashInHand: "Cash to Deposit", walletBal: "Wallet Balance", withdraw: "Request UPI Withdrawal",
      logout: "Logout", changePassword: "Change Password", shopRoute: "Shop Route", custRoute: "Customer Route",
      closeMap: "❌ Close Map", startNav: "🧭 Start Navigation", emptyPickup: "📭 No orders to pickup.",
      emptyDeliver: "📭 No orders for delivery.", emptyHistory: "📭 No orders found for this filter.",
      emptyTransactions: "📭 No transactions found.", emptyWithdrawals: "📭 No withdrawal requests found.",
      shopName: "Shop Name:", address: "Address:", blockDist: "Block/District:", pincode: "Pincode:",
      viewMap: "🗺️ View Map", custDetails: "Customer Details:", paymentMode: "Payment Mode:", earning: "Your Earning:", shopDetails: "Shop/Pickup Details:",
      searchPlaceholder: "🔍 Search by Order ID or Name...", quickFilter: "⚡ Quick Filters", customFilter: "📅 Date-to-Date",
      today: "Today", week: "Week", month: "Month", all: "All", from: "From:", to: "To:",
      completedOrders: "Completed Orders", hide: "▲ Hide", details: "▼ Details", withdrawalHistory: "Withdrawal Requests History",
      passbookHistory: "Passbook (Earnings History)", reqSent: "✅ Request sent successfully!", reqFail: "Please enter a reason!",
      verifyTitle: "Final Security Check", enterLast6: "Enter last 6 digits of customer's mobile:",
      cancel: "Cancel", confirm: "✅ Verify", failTitle: "❌ Reason for Failed Delivery", failPlaceholder: "Type reason here...",
      submitReason: "Submit Reason", withdrawTitle: "Withdrawal Request", availBal: "Available Balance:", enterAmt: "Enter Amount (₹)",
      enterUpi: "Enter UPI ID", changePassTitle: "Set Secure Password", savePass: "Save Password", sendRequest: "Send Request",
      pickupTab: "🏬 Pickup", deliverTab: "📦 Deliver", historyTab: "📜 History", profileTab: "👤 Profile", walletTab: "💳 Wallet",
      oldPass: "Old Password", newPass: "New Password", confirmPass: "Confirm New Password",
      wrongOldPass: "❌ Old password is incorrect!", passMismatch: "❌ New password and Confirm password do not match!",
      passComplexity: "❌ Password must be at least 12 characters, including 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special Character!",
      helpSupport: "Help Desk & Support", supportDesc: "If you face any issue, call or message the admin directly.",
      callOffice: "Call Office", writeMessage: "Write your issue or message here...", sendMsg: "Send Message", msgSent: "✅ Message sent!"
    }
  };

  const text = translations[lang] || translations['hi'];

  const bottomNavItems = [
    { id: 'shop_pickup', icon: '🏬', labelHi: 'पिकअप', labelEn: 'Pickup' },
    { id: 'deliveries', icon: '📦', labelHi: 'डिलीवर', labelEn: 'Deliver' },
    { id: 'history', icon: '📜', labelHi: 'इतिहास', labelEn: 'History' },
    { id: 'profile', icon: '👤', labelHi: 'प्रोफाइल', labelEn: 'Profile' }
  ];

  const fetchLiveGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setWorkerCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.warn("GPS Failed", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const { data } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();
      if (data) {
        const upi = data.delivery_boy_upi || data.upi_id || data.upi;
        if (upi) setAdminUpi(upi);
        if (data.delivery_boy_fee) setPerDeliveryFee(Number(data.delivery_boy_fee) || 30);
        
        const officePhone = data.company_phone || data.phone || data.contact_number || data.admin_phone || data.mobile;
        if (officePhone) setAdminOfficePhone(officePhone);
      }
    } catch (e) { console.log("Settings Error:", e); }
  };

  // 🔥 UPDATED: Phone se fetch karne ka logic 🔥
  const fetchMyWalletAndOrders = async (passedBoyId: any, bPhone: string) => {
    try {
      const { data: boyData } = await supabase.from('delivery_boys').select('*').eq('phone', bPhone.trim()).maybeSingle();
      if (!boyData) {
        localStorage.removeItem('fixifiy_delivery_boy');
        setDeliveryBoy(null);
        return;
      }
      
      // Sync latest data to localStorage
      localStorage.setItem('fixifiy_delivery_boy', JSON.stringify(boyData));

      const validBoyId = boyData.id;
      setDeliveryBoy(boyData);
      setWalletBalance(Number(boyData.balance) || 0);
      if (boyData.upi_id) setWithdrawUpi(boyData.upi_id);

      // JSONB Chat Sync
      let msgs = boyData.support_chat || [];
      if (typeof msgs === 'string') { try { msgs = JSON.parse(msgs); } catch(e) { msgs = []; } }
      setChatMessages(Array.isArray(msgs) ? msgs : []);

      try {
        const { data: txData } = await supabase.from('wallet_transactions').select('*').eq('delivery_boy_id', validBoyId).order('created_at', { ascending: false });
        if (txData) setWalletTransactions(txData);
      } catch (e) {}

      try {
        const { data: wdData } = await supabase.from('withdrawal_requests').select('*').eq('delivery_boy_id', validBoyId).order('created_at', { ascending: false });
        if (wdData) setWithdrawalRequests(wdData);
      } catch (e) {}

      try {
        const { data: orders } = await supabase.from('orders').select('*').eq('delivery_boy_id', validBoyId).order('id', { ascending: false });
        if (orders) {
          setAssignedOrders(orders);
          const shopIds = Array.from(new Set(orders.map(o => o.shop_id || o.seller_id || o.store_id).filter(Boolean)));
          if (shopIds.length > 0) {
            const { data: shops } = await supabase.from('shops').select('*').in('id', shopIds);
            if (shops) {
              const shopMap: { [key: string]: any } = {};
              shops.forEach(s => { shopMap[s.id] = s; });
              setShopsData(shopMap);
            }
          }
        }
      } catch (e) {}

    } catch (e) { console.warn("Boy Fetch Error", e); }
  };

  // 🔥 UPDATED: OTP + Password Dono ka check 🔥
  useEffect(() => {
    const checkSession = async () => {
      // 🚀 STEP 1: Pehle LocalStorage Check Karo (OTP Login)
      let phoneNo = '';
      const storedSession = typeof window !== 'undefined' ? localStorage.getItem('fixifiy_delivery_boy') : null;
      if (storedSession) {
        try { phoneNo = JSON.parse(storedSession).phone; } catch(e) {}
      }

      // 🚀 STEP 2: Supabase Session (Password Login) check karo
      const { data: { session } } = await supabase.auth.getSession();
      if (!phoneNo && session?.user) {
          let sessionPhone = session.user.email?.replace('@fixifiy.in', '').replace(/[^0-9]/g, '');
          if (sessionPhone && sessionPhone.startsWith('91') && sessionPhone.length === 12) {
              sessionPhone = sessionPhone.substring(2);
          }
          phoneNo = sessionPhone || '';
      }

      // 🚀 STEP 3: Agar phone mil gaya toh fetch karo
      if (phoneNo) {
          await fetchMyWalletAndOrders(null, phoneNo);
          fetchLiveGPS();
      } else {
          setDeliveryBoy(null);
      }
      setIsCheckingAuth(false);
      fetchAdminSettings();
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    setLoginError('');
    if (!phone || !password) return setLoginError("Phone & Password required.");
    const { data, error } = await supabase.from('delivery_boys').select('*').eq('phone', phone.trim()).eq('password', password.trim()).maybeSingle(); 
    if (error) return setLoginError("Database Error: " + error.message);
    if (!data) return setLoginError("Invalid Login Details.");
    if (data.status === 'Suspended') return setLoginError("Account suspended.");
    
    localStorage.setItem('fixifiy_delivery_boy', JSON.stringify(data));
    setDeliveryBoy(data);
    fetchMyWalletAndOrders(null, data.phone);
  };

  const handleLogout = () => {
    if (!window.confirm(text.logout + "?")) return;
    localStorage.removeItem('fixifiy_delivery_boy');
    setDeliveryBoy(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true); 
    fetchLiveGPS();
    if (deliveryBoy?.phone) await fetchMyWalletAndOrders(null, deliveryBoy.phone);
    fetchAdminSettings();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawUpi) return alert("Kripya apni UPI ID daalein!");
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return alert("Kripya sahi amount daalein!");
    if (amt > walletBalance) return alert("Aapke wallet mein itna balance nahi hai!");

    try {
      const newBal = walletBalance - amt;
      const { error: pErr } = await supabase.from('delivery_boys').update({ upi_id: withdrawUpi, balance: newBal }).eq('id', deliveryBoy.id);
      if(pErr) throw new Error("Profile Balance Update Failed: " + pErr.message);
      
      const { data: newWd, error: wErr } = await supabase.from('withdrawal_requests').insert({ delivery_boy_id: deliveryBoy.id, amount: amt, upi_id: withdrawUpi, status: 'pending' }).select().single();
      if(wErr) throw new Error("Withdrawal Save Failed: " + wErr.message);
      
      const { data: newTx, error: tErr } = await supabase.from('wallet_transactions').insert({ user_type: 'delivery_boy', delivery_boy_id: deliveryBoy.id, amount: amt, type: 'debit', status: 'pending', reason: `UPI Withdrawal Request (UPI: ${withdrawUpi})` }).select().single();
      if(tErr) throw new Error("Wallet History Save Failed: " + tErr.message);

      setWalletBalance(newBal); 
      if(newWd) setWithdrawalRequests(prev => [newWd, ...prev]);
      if(newTx) setWalletTransactions(prev => [newTx, ...prev]);

      alert(text.reqSent);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setShowWithdrawalHistory(true); 
    } catch (e: any) { alert("❌ Database Error: " + e.message); }
  };

  const handleChangePassword = async () => {
    if (oldPassword !== deliveryBoy.password) return alert(text.wrongOldPass);
    if (newPassword !== confirmPassword) return alert(text.passMismatch);

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
    if (!passRegex.test(newPassword)) return alert(text.passComplexity);

    try {
      const { error } = await supabase.from('delivery_boys').update({ password: newPassword }).eq('id', deliveryBoy.id);
      if (error) throw error;
      
      setDeliveryBoy({ ...deliveryBoy, password: newPassword });
      const stored = JSON.parse(localStorage.getItem('fixifiy_delivery_boy') || '{}');
      localStorage.setItem('fixifiy_delivery_boy', JSON.stringify({ ...stored, password: newPassword }));

      alert("✅ Password successfully changed!");
      setShowPasswordModal(false);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) { alert("Error changing password: " + e.message); }
  };

  const handleSendSupportMessage = async () => {
    if (!supportMessage.trim()) return alert(text.reqFail);
    try {
      let currentChat = [...chatMessages];
      const newMsg = {
        sender: 'delivery_boy',
        message: supportMessage.trim(),
        timestamp: new Date().toISOString()
      };
      currentChat.push(newMsg);

      const { error } = await supabase.from('delivery_boys').update({ support_chat: currentChat }).eq('id', deliveryBoy.id);
      if (error) throw error;
      
      setChatMessages(currentChat);
      setSupportMessage('');
      alert(text.msgSent);
    } catch (e: any) {
      alert("Error sending message: " + e.message);
    }
  };

  const submitFailedDelivery = async () => {
    if (!failReason.trim()) return alert(text.reqFail);
    try {
      let currentMsgs = failOrder.messages;
      if (typeof currentMsgs === 'string') { try { currentMsgs = JSON.parse(currentMsgs); } catch(e) { currentMsgs = []; } }
      if (!Array.isArray(currentMsgs)) currentMsgs = [];

      currentMsgs.push({ sender: 'delivery_boy', text: `❌ Delivery Failed: ${failReason}`, timestamp: new Date().toISOString() });

      const { error } = await supabase.from('orders').update({ status: 'Delivery Failed', messages: currentMsgs }).eq('id', failOrder.id);
      if (error) throw new Error("Order fail status update error: " + error.message);

      setAssignedOrders(prev => prev.map(o => o.id === failOrder.id ? { ...o, status: 'Delivery Failed', messages: currentMsgs } : o));
      alert(text.reqSent);
      setFailOrder(null);
      setFailReason('');
    } catch(e: any) { alert("❌ Database Error: " + e.message); }
  };

  const openSecureCall = (phoneNum: string) => phoneNum && phoneNum !== 'Number Not Set' ? window.location.href = `tel:${phoneNum}` : alert("Company Phone Number is missing in Database Settings.");
  const isCodOrder = (order: any) => String(order.payment_mode || '').toLowerCase().includes('cod') || String(order.payment_mode || '').toLowerCase().includes('cash');
  const getAmountToCollect = (order: any) => {
    const mode = String(order.payment_mode || '').toLowerCase();
    const totalAmount = parseFloat(order.total_amount) || 0;
    const deliveryCharge = parseFloat(order.delivery_charge) || 0;
    if (mode.includes('advance transport paid')) return Math.max(0, totalAmount - deliveryCharge);
    return totalAmount;
  };

  const markReceivedFromShop = async (orderId: number) => {
    try {
      const { error } = await supabase.from('orders').update({ status: 'out_for_delivery' }).eq('id', orderId);
      if (error) throw new Error("Status update failed: " + error.message);
      
      setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'out_for_delivery' } : o));
      alert(text.receiveFromShop);
    } catch(e: any) { alert("❌ Error: " + e.message); }
  };

  const confirmDelivery = async () => {
    if (!verifyOrder) return;
    const customerPhone = String(verifyOrder.user_phone || verifyOrder.phone || "");
    const expectedCode = customerPhone.slice(-6);

    if (customerPhone.length >= 6 && verifyCode !== expectedCode) return alert(`❌ Wrong Code!`);

    try {
      let finalPaymentMode = verifyOrder.payment_mode;
      if (isCodOrder(verifyOrder)) {
         finalPaymentMode = `COD - ${paymentCollected[verifyOrder.id] || 'Cash'}`; 
      }

      const myEarning = Number(perDeliveryFee) || 30; 
      const newBal = walletBalance + myEarning;
      
      const { error: orderErr } = await supabase.from('orders').update({ status: 'completed', payment_mode: finalPaymentMode }).eq('id', verifyOrder.id);
      if (orderErr) throw new Error("Order update failed: " + orderErr.message);

      const { error: balErr } = await supabase.from('delivery_boys').update({ balance: newBal }).eq('id', deliveryBoy.id);
      if (balErr) throw new Error("Wallet balance update failed: " + balErr.message);
      
      const { data: newTx, error: txErr } = await supabase.from('wallet_transactions').insert({
          user_type: 'delivery_boy', delivery_boy_id: deliveryBoy.id, amount: myEarning, type: 'credit', status: 'completed', reason: `Delivery Earning (Order #${verifyOrder.id})`
      }).select().single();
      
      if (txErr) throw new Error("Wallet transaction save failed: " + txErr.message);

      setAssignedOrders(prev => prev.map(o => o.id === verifyOrder.id ? { ...o, status: 'completed', payment_mode: finalPaymentMode, updated_at: new Date().toISOString() } : o));
      setWalletBalance(newBal); 
      if (newTx) setWalletTransactions(prev => [newTx, ...prev]);

      alert(`✅ Delivered!\n🎉 ₹${myEarning} added to wallet permanently.`);
      setVerifyOrder(null); setVerifyCode('');

    } catch (e: any) { alert("❌ Delivery Update Error: " + e.message); }
  };

  const downloadExcel = () => {
    if (filteredHistory.length === 0) return alert(text.emptyHistory);
    let csvContent = "data:text/csv;charset=utf-8,Order ID,Customer Name,Amount,Status,Date\n";
    filteredHistory.forEach(o => { csvContent += `"#${o.order_no || o.id}","${o.customer_name}","${o.total_amount}","Completed","${o.updated_at || o.created_at}"\n`; });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivery_history_${deliveryBoy.name}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };
  const downloadPDF = () => window.print();

  const shopPickupOrders = assignedOrders.filter(o => { 
    const st = (o.status || '').toLowerCase(); 
    const isDelivery = st === 'out_for_delivery' || st === 'out for delivery' || st === 'shipped';
    const isCompleted = st === 'completed' || st === 'delivered';
    const isFailed = st.includes('fail') || st.includes('cancel');
    return !isDelivery && !isCompleted && !isFailed; 
  });
  
  const customerDeliveries = assignedOrders.filter(o => { 
    const st = (o.status || '').toLowerCase(); 
    return st === 'out_for_delivery' || st === 'out for delivery' || st === 'shipped'; 
  });
  
  const allCompletedOrders = assignedOrders.filter(o => {
    const st = (o.status || '').toLowerCase();
    return st === 'completed' || st === 'delivered';
  });

  const filteredHistory = allCompletedOrders.filter(o => {
    const orderDate = new Date(o.updated_at || o.created_at);
    const today = new Date();
    const matchesSearch = historySearchQuery === '' || String(o.order_no || o.id).toLowerCase().includes(historySearchQuery.toLowerCase()) || String(o.customer_name || '').toLowerCase().includes(historySearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (historyFilterType === 'quick') {
      if (quickFilter === 'today') return orderDate.toDateString() === today.toDateString();
      if (quickFilter === 'week') { const fDay = new Date(today); fDay.setDate(today.getDate() - today.getDay()); return orderDate >= fDay; }
      if (quickFilter === 'month') return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
      return true;
    } else {
      if (startDate && new Date(startDate) > orderDate) return false;
      if (endDate) { const eDate = new Date(endDate); eDate.setHours(23, 59, 59, 999); if (orderDate > eDate) return false; }
      return true;
    }
  });

  const filteredWalletTransactions = walletTransactions.filter(tx => {
    if (walletFilter === 'all') return true;
    const txDate = new Date(tx.created_at); const now = new Date();
    if (walletFilter === '7days') { const past = new Date(); past.setDate(now.getDate() - 7); return txDate >= past; }
    if (walletFilter === '30days') { const past = new Date(); past.setDate(now.getDate() - 30); return txDate >= past; }
    return true;
  });

  const filteredWithdrawals = withdrawalRequests.filter(wd => {
    if (walletFilter === 'all') return true;
    const wdDate = new Date(wd.created_at); const now = new Date();
    if (walletFilter === '7days') { const past = new Date(); past.setDate(now.getDate() - 7); return wdDate >= past; }
    if (walletFilter === '30days') { const past = new Date(); past.setDate(now.getDate() - 30); return wdDate >= past; }
    return true;
  });

  const totalCashCollected = assignedOrders.filter(o => o.status?.toLowerCase() === 'completed' && isCodOrder(o) && !((o.payment_mode || '').includes('QR'))).reduce((sum, o) => sum + getAmountToCollect(o), 0);

  if (isCheckingAuth) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;

  if (!deliveryBoy) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')} style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{lang === 'hi' ? 'EN' : 'HI'}</button>
          </div>
          <h2 style={{ textAlign: 'center', color: '#0f172a', margin: '0 0 25px 0' }}>{text.loginTitle}</h2>
          {loginError && <div style={{background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', textAlign: 'center'}}>{loginError}</div>}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>{text.phoneLabel}</label>
            <input type="tel" placeholder="Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>{text.passLabel}</label>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={handleLogin} style={{ width: '100%', padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>{text.loginBtn}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f1f5f9', minHeight: '100vh', paddingBottom: '100px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ background: '#0f172a', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '2px solid #38bdf8' }}>🛵</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{deliveryBoy.name}</h2>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Partner (Fee: ₹{perDeliveryFee})</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')} style={{ background: '#334155', color: '#38bdf8', border: 'none', padding: '6px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            {lang === 'hi' ? 'English 🌐' : 'हिंदी 🌐'}
          </button>
          <div onClick={() => setActiveTab('wallet')} style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #bbf7d0', cursor: 'pointer' }}>
             💳 ₹{walletBalance}
          </div>
        </div>
      </div>

      <div style={{ padding: '15px' }}>
        
        {/* TAB 1: SHOP PICKUP */}
        {activeTab === 'shop_pickup' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <h3 style={{ margin: 0, color: '#1e293b', fontSize: '17px', fontWeight: '900' }}>{text.pickupTab} ({shopPickupOrders.length})</h3>
               <button onClick={handleRefresh} style={{ background: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 {text.refresh}</button>
            </div>

            {shopPickupOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontWeight: 'bold', background: 'white', borderRadius: '12px' }}>{text.emptyPickup}</div>
            ) : shopPickupOrders.map(order => {
              const shopId = order.shop_id || order.seller_id || order.store_id;
              const shop = shopsData[shopId] || {}; 
              const shopName = shop.name || shop.shop_name || order.shop_name || 'Hardware Shop';
              const shopAddress = shop.address || shop.shop_address || shop.full_address || shop.location || order.shop_address || order.address || 'N/A';
              const shopBlock = shop.block || shop.shop_block || order.block || order.shop_block || '';
              const shopDistrict = shop.district || shop.shop_district || order.district || 'Samastipur';
              const shopPincode = shop.pincode || shop.pin || shop.postal_code || order.shop_pincode || order.pincode || '';
              const shopPhone = shop.phone || shop.mobile || order.shop_phone || '';
              const isExpanded = expandedOrderId === order.id;
              const showMap = showMapForOrder[order.id] || false;

              return (
              <div key={order.id} style={{ background: 'white', borderRadius: '14px', padding: '15px', marginBottom: '12px', borderLeft: '5px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#d97706', textTransform: 'uppercase' }}>Shop Order #{order.order_no || order.id}</span>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '900' }}>🏬 {shopName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>📍 {shopBlock ? `${shopBlock}, ` : ''}{shopDistrict} {shopPincode ? `- ${shopPincode}` : ''}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>{isExpanded ? text.hide : text.details}</span>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '12px', borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                    <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '13px', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                      <strong>{text.shopName}</strong> {shopName}<br/>
                      <strong>{text.address}</strong> {shopAddress}<br/>
                      <strong>{text.blockDist}</strong> {shopBlock ? `${shopBlock}, ` : ''}{shopDistrict}<br/>
                      <strong>{text.pincode}</strong> {shopPincode || 'N/A'}<br/>
                      {shopPhone && (
                        <button onClick={() => openSecureCall(shopPhone)} style={{ display: 'block', marginTop: '8px', background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>📞 {text.callShop}</button>
                      )}
                    </div>
                    {!showMap ? (
                      <button onClick={() => setShowMapForOrder({...showMapForOrder, [order.id]: true})} style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
                        {text.viewMap}
                      </button>
                    ) : (
                      <DeliveryMap t={text} destination={`${shopAddress}, ${shopBlock}, ${shopDistrict} - ${shopPincode}`} coords={workerCoords} type="Shop" onClose={() => setShowMapForOrder({...showMapForOrder, [order.id]: false})} />
                    )}
                    <button onClick={() => markReceivedFromShop(order.id)} style={{ width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
                      {text.receiveFromShop}
                    </button>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}

        {/* TAB 2: DELIVERIES */}
        {activeTab === 'deliveries' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <h3 style={{ margin: '0', color: '#1e293b', fontSize: '17px', fontWeight: '900' }}>{text.deliverTab} ({customerDeliveries.length})</h3>
               <button onClick={handleRefresh} style={{ background: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 {text.refresh}</button>
            </div>

            {customerDeliveries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontWeight: 'bold', background: 'white', borderRadius: '12px' }}>{text.emptyDeliver}</div>
            ) : customerDeliveries.map(order => {
              const isCod = isCodOrder(order);
              const amountToCollect = getAmountToCollect(order);
              const selectedMode = paymentCollected[order.id];
              const isExpanded = expandedOrderId === order.id;
              const showMap = showMapForOrder[order.id] || false;

              return (
              <div key={order.id} style={{ background: 'white', borderRadius: '14px', padding: '15px 20px', marginBottom: '12px', borderLeft: !isCod ? '5px solid #10b981' : '5px solid #ef4444' }}>
                <div onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>#{order.order_no || order.id}</span>
                    <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: '900' }}>👤 {order.customer_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>📍 {order.block ? `${order.block}, ` : ''}{order.district || 'Location'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a' }}>₹{order.total_amount}</div>
                    <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold' }}>{isExpanded ? text.hide : text.details}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '15px', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
                    <div style={{ background: !isCod ? '#dcfce7' : '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '10px', textAlign: 'center', fontSize: '13px' }}>
                        {!isCod ? <strong>✅ PREPAID</strong> : <strong>⚠️ COLLECT CASH: ₹{amountToCollect}</strong>}
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>{text.custDetails}</div>
                      <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: '700', marginBottom: '8px', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {order.address || order.location || 'N/A'}{order.block ? `, ${order.block}` : ''}{order.pincode ? ` - ${order.pincode}` : ''}
                      </div>
                      {!showMap ? (
                        <button onClick={() => setShowMapForOrder({...showMapForOrder, [order.id]: true})} style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {text.viewMap}
                        </button>
                      ) : (
                        <DeliveryMap t={text} destination={`${order.address || order.location}, ${order.block || ''}, ${order.district || ''} - ${order.pincode || ''}`} coords={workerCoords} type="Customer" onClose={() => setShowMapForOrder({...showMapForOrder, [order.id]: false})} />
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                      <button onClick={() => openSecureCall(order.user_phone || order.phone)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>📞 {text.callCust}</button>
                    </div>

                    {isCod && (
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button onClick={() => setShowScannerOrder(order)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: selectedMode === 'QR' ? '#10b981' : '#e0f2fe', color: selectedMode === 'QR' ? '#fff' : '#0284c7', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>📱 QR Code</button>
                        <button onClick={() => setPaymentCollected({...paymentCollected, [order.id]: 'Cash'})} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: selectedMode === 'Cash' ? '#10b981' : '#ffedd5', color: selectedMode === 'Cash' ? '#fff' : '#d97706', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>💵 Cash</button>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setFailOrder(order)} style={{ flex: 1, padding: '12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                        {text.failDeliveryBtn}
                      </button>
                      <button onClick={() => { if (isCod && !selectedMode) return alert("Select payment method!"); setVerifyOrder(order); }} style={{ flex: 2, padding: '14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>
                        {text.verifyDeliver}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: '0', color: '#1e293b', fontSize: '18px', fontWeight: '900' }}>{text.historyTab}</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={downloadExcel} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📥 Excel</button>
                <button onClick={downloadPDF} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ PDF</button>
              </div>
            </div>

            <input type="text" placeholder={text.searchPlaceholder} value={historySearchQuery} onChange={e => setHistorySearchQuery(e.target.value)} style={{ ...inputStyle, marginBottom: '10px', fontSize: '13px', padding: '10px' }} />

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button onClick={() => setHistoryFilterType('quick')} style={{ flex: 1, padding: '8px', background: historyFilterType === 'quick' ? '#0f172a' : '#e2e8f0', color: historyFilterType === 'quick' ? 'white' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{text.quickFilter}</button>
              <button onClick={() => setHistoryFilterType('custom')} style={{ flex: 1, padding: '8px', background: historyFilterType === 'custom' ? '#0f172a' : '#e2e8f0', color: historyFilterType === 'custom' ? 'white' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{text.customFilter}</button>
            </div>

            {historyFilterType === 'quick' ? (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '15px' }}>
                {(['today', 'week', 'month', 'all'] as const).map(f => (
                  <button key={f} onClick={() => setQuickFilter(f)} style={{ flex: 1, padding: '8px 2px', background: quickFilter === f ? '#2563eb' : '#e2e8f0', color: quickFilter === f ? 'white' : '#475569', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {text[f] || f}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>{text.from}</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>{text.to}</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                </div>
              </div>
            )}

            <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>{text.completedOrders} ({filteredHistory.length})</h4>
            {filteredHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', background: 'white', borderRadius: '12px' }}>{text.emptyHistory}</div>
            ) : filteredHistory.map(order => {
              const isExpanded = expandedHistoryId === order.id;
              const shopId = order.shop_id || order.seller_id || order.store_id;
              const shop = shopsData[shopId] || {};
              const shopName = shop.name || shop.shop_name || 'Hardware Shop';
              const shopAddress = shop.address || shop.shop_address || 'N/A';
              const shopBlock = shop.block || shop.shop_block || order.block || '';
              const shopDistrict = shop.district || shop.shop_district || order.district || 'Samastipur';
              const shopPincode = shop.pincode || shop.pin || order.shop_pincode || '';

              return (
                <div key={order.id} style={{ background: 'white', borderRadius: '12px', padding: '12px 15px', marginBottom: '8px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                  <div onClick={() => setExpandedHistoryId(isExpanded ? null : order.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>#{order.order_no || order.id} - {order.customer_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(order.updated_at || order.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: '#16a34a' }}>₹{order.total_amount}</div>
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold' }}>{isExpanded ? text.hide : text.details}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '12px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px', fontSize: '12px', color: '#334155' }}>
                      <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
                        <p style={{ margin: '2px 0', fontWeight: 'bold', color: '#d97706' }}>🏬 {text.shopDetails}</p>
                        <p style={{ margin: '2px 0' }}><strong>{text.shopName}</strong> {shopName}</p>
                        <p style={{ margin: '2px 0', wordBreak: 'break-word' }}><strong>{text.address}</strong> {shopAddress}</p>
                        <p style={{ margin: '2px 0' }}><strong>{text.blockDist}</strong> {shopBlock ? `${shopBlock}, ` : ''}{shopDistrict}</p>
                        <p style={{ margin: '2px 0' }}><strong>{text.pincode}</strong> {shopPincode || 'N/A'}</p>
                      </div>

                      <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '6px' }}>
                        <p style={{ margin: '2px 0', fontWeight: 'bold', color: '#16a34a' }}>👤 {text.custDetails}</p>
                        <p style={{ margin: '2px 0' }}><strong>Name:</strong> {order.customer_name}</p>
                        <p style={{ margin: '2px 0', wordBreak: 'break-word' }}><strong>{text.address}</strong> {order.address || order.location || 'N/A'}</p>
                        <p style={{ margin: '2px 0' }}><strong>{text.paymentMode}</strong> {order.payment_mode || 'N/A'}</p>
                        <p style={{ margin: '2px 0' }}><strong>{text.earning}</strong> ₹{perDeliveryFee}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: WALLET PASSBOOK */}
        {activeTab === 'wallet' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px', fontWeight: '900' }}>{text.walletTab}</h3>
            
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '20px', color: 'white', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>{text.walletBal}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#4ade80' }}>₹{walletBalance.toLocaleString('en-IN')}</div>
              <button onClick={() => setShowWithdrawModal(true)} style={{ background: '#3b82f6', color: 'white', padding: '14px', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '12px', cursor: 'pointer', width: '100%', fontSize: '15px' }}>{text.withdraw}</button>
            </div>

            <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '14px', padding: '15px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 'bold', textTransform: 'uppercase' }}>{text.cashInHand}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#d97706' }}>₹{totalCashCollected}</div>
            </div>

            <div 
              onClick={() => setShowWithdrawalHistory(!showWithdrawalHistory)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: showWithdrawalHistory ? '#eff6ff' : '#f8fafc', padding: '15px', borderRadius: '12px', cursor: 'pointer', border: '2px solid #bfdbfe' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💸</span>
                <h4 style={{ fontSize: '15px', color: '#0f172a', margin: '0' }}>{text.withdrawalHistory}</h4>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2563eb', backgroundColor: 'white', padding: '4px 10px', borderRadius: '20px', border: '1px solid #bfdbfe' }}>
                {showWithdrawalHistory ? text.hide : text.details}
              </span>
            </div>

            {showWithdrawalHistory && (
              <div style={{ marginBottom: '20px' }}>
                {filteredWithdrawals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', background: 'white', borderRadius: '12px', fontSize: '13px' }}>{text.emptyWithdrawals}</div>
                ) : (
                  filteredWithdrawals.map(wd => {
                    const status = (wd.status || 'pending').toLowerCase();
                    const isPending = status === 'pending';
                    const isRejected = status === 'rejected' || status === 'failed';
                    const isApproved = status === 'approved';
                    
                    let upiText = wd.upi_id || 'Bank';
                    if (wd.reason && wd.reason.includes('UPI:')) {
                       const parts = wd.reason.split('UPI:');
                       if (parts.length > 1) upiText = parts[1].replace(')','').trim();
                    }

                    return (
                      <div key={wd.id} style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', marginBottom: '8px', borderLeft: isPending ? '4px solid #f59e0b' : isRejected ? '4px solid #ef4444' : '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>To: {upiText}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(wd.created_at).toLocaleString()}</div>
                          {/* 🔥 SHOW UTR OR REASON FROM ADMIN HERE 🔥 */}
                          {isApproved && wd.admin_note && <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}><strong>UTR No:</strong> {wd.admin_note}</div>}
                          {isRejected && wd.admin_note && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}><strong>Reason:</strong> {wd.admin_note}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>₹{wd.amount}</div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: isPending ? '#d97706' : isRejected ? '#dc2626' : '#16a34a', background: isPending ? '#fef3c7' : isRejected ? '#fee2e2' : '#dcfce7', padding: '2px 8px', borderRadius: '5px', marginTop: '4px' }}>
                            {isPending ? '⏳ Pending' : isRejected ? '❌ Rejected' : '✅ Approved'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>{text.passbookHistory}</h4>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['7days', '30days', 'all'] as const).map(wf => (
                  <button key={wf} onClick={() => setWalletFilter(wf)} style={{ padding: '4px 8px', background: walletFilter === wf ? '#0f172a' : '#e2e8f0', color: walletFilter === wf ? 'white' : '#475569', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {wf === '7days' ? '7 Days' : wf === '30days' ? '30 Days' : text.all}
                  </button>
                ))}
              </div>
            </div>

            {filteredWalletTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', background: 'white', borderRadius: '12px', fontSize: '13px' }}>{text.emptyTransactions}</div>
            ) : filteredWalletTransactions.map(tx => (
              <div key={tx.id} style={{ background: 'white', padding: '12px 15px', borderRadius: '10px', marginBottom: '8px', borderLeft: tx.type === 'credit' ? '4px solid #10b981' : '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{tx.reason}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(tx.created_at).toLocaleString()}</div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: tx.type === 'credit' ? '#16a34a' : '#dc2626' }}>
                  {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: PROFILE & SUPPORT CHAT */}
        {activeTab === 'profile' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px', fontWeight: '900' }}>{text.profileTab}</h3>
            
            <div onClick={() => setActiveTab('wallet')} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '15px 20px', color: 'white', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{text.walletBal}</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#4ade80' }}>₹{walletBalance.toLocaleString('en-IN')}</div>
              </div>
              <span style={{ background: '#3b82f6', color: 'white', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>{text.walletTab} ➔</span>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>{deliveryBoy.name}</h2>
                <p style={{ color: '#64748b', fontWeight: 'bold', margin: '4px 0' }}>+91 {deliveryBoy.phone}</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '13px', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                <p style={{ margin: '4px 0' }}><strong>{text.address}</strong> {deliveryBoy.address || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}><strong>{text.blockDist}</strong> {deliveryBoy.district || 'N/A'}, {deliveryBoy.state || ''}</p>
                <p style={{ margin: '4px 0' }}><strong>UPI ID:</strong> {deliveryBoy.upi_id || 'Not set'}</p>
              </div>

              <button onClick={() => setShowPasswordModal(true)} style={{ width: '100%', padding: '14px', border: '2px solid #3b82f6', background: '#eff6ff', color: '#2563eb', fontWeight: '900', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px' }}>{text.changePassword}</button>
              <button onClick={handleLogout} style={{ width: '100%', padding: '14px', border: '2px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontWeight: '900', borderRadius: '10px', cursor: 'pointer' }}>{text.logout}</button>
            </div>

            {/* 🔥 HELP & SUPPORT SECTION (JSONB CHAT) 🔥 */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>🎧 {text.helpSupport}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>{text.supportDesc}</p>
              
              <button onClick={() => openSecureCall(adminOfficePhone)} style={{ width: '100%', padding: '12px', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                📞 {text.callOffice} ({adminOfficePhone})
              </button>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', height: '200px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '60px' }}>No previous messages. Start chat with Admin!</div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isAdminMsg = msg.sender === 'admin';
                    return (
                      <div key={idx} style={{ alignSelf: isAdminMsg ? 'flex-start' : 'flex-end', background: isAdminMsg ? '#e2e8f0' : '#2563eb', color: isAdminMsg ? '#0f172a' : 'white', padding: '8px 12px', borderRadius: '10px', maxWidth: '80%', fontSize: '13px', wordBreak: 'break-word' }}>
                        <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>{isAdminMsg ? 'Admin' : 'You'}</div>
                        {msg.message}
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder={text.writeMessage}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendSupportMessage(); }}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
                <button onClick={handleSendSupportMessage} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', background: 'white', display: 'flex', justifyContent: 'space-between', padding: '8px 15px', boxShadow: '0 -4px 15px rgba(0,0,0,0.1)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', zIndex: 1000, boxSizing: 'border-box' }}>
        {bottomNavItems.map(item => {
          const isActive = activeTab === item.id || (item.id === 'profile' && activeTab === 'wallet');
          return (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)}
              style={{
                flex: 1, background: isActive ? '#eff6ff' : 'transparent', border: 'none', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                gap: '4px', padding: '8px 0', borderRadius: '12px', cursor: 'pointer', 
                color: isActive ? '#2563eb' : '#64748b', transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '20px', filter: isActive ? 'none' : 'grayscale(100%) opacity(80%)' }}>{item.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: isActive ? '900' : '600' }}>{lang === 'hi' ? item.labelHi : item.labelEn}</span>
            </button>
          )
        })}
      </div>

      {/* ALL MODALS */}
      {verifyOrder && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>{text.verifyTitle}</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{text.enterLast6}</p>
            <input type="number" placeholder="6 digits..." value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '2px', marginBottom: '15px' }} maxLength={6} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setVerifyOrder(null)} style={{ flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>{text.cancel}</button>
              <button onClick={confirmDelivery} style={{ flex: 2, padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>{text.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {failOrder && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>{text.failTitle}</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{text.failPlaceholder}</p>
            <textarea 
              placeholder={text.failPlaceholder}
              value={failReason} 
              onChange={e => setFailReason(e.target.value)} 
              style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '13px', marginBottom: '15px', boxSizing: 'border-box' }} 
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setFailOrder(null)} style={{ flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>{text.cancel}</button>
              <button onClick={submitFailedDelivery} style={{ flex: 1, padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>{text.submitReason}</button>
            </div>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>{text.withdrawTitle}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>{text.availBal} <strong>₹{walletBalance}</strong></p>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>{text.enterAmt}</label>
            <input type="number" placeholder="0" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>{text.enterUpi}</label>
            <input type="text" placeholder="name@upi" value={withdrawUpi} onChange={(e) => setWithdrawUpi(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => setShowWithdrawModal(false)} style={{ flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{text.cancel}</button>
              <button onClick={handleWithdrawRequest} style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{text.sendRequest}</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginBottom: '15px' }}>{text.changePassTitle}</h3>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>{text.oldPass}</label>
            <input type="password" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>{text.newPass}</label>
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>{text.confirmPass}</label>
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => { setShowPasswordModal(false); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }} style={{ flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{text.cancel}</button>
              <button onClick={handleChangePassword} style={{ flex: 1, padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{text.savePass}</button>
            </div>
          </div>
        </div>
      )}

      {showScannerOrder && (
        <div style={modalOverlay} onClick={() => setShowScannerOrder(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h3>Scan to Pay (Admin UPI)</h3>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${adminUpi}&pn=Admin&am=${getAmountToCollect(showScannerOrder)}&cu=INR`} alt="QR" style={{ width: '200px', height: '200px', margin: '10px auto', display: 'block' }} />
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>UPI ID: {adminUpi}</p>
            <button onClick={() => { setPaymentCollected({...paymentCollected, [showScannerOrder.id]: 'QR'}); setShowScannerOrder(null); }} style={{ width: '100%', padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '10px' }}>Done</button>
          </div>
        </div>
      )}

    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', marginBottom: '10px' };
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' };
const modalContent: React.CSSProperties = { background: 'white', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '380px' };