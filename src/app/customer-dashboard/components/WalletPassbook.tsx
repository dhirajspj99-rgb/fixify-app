"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from './AppContext'; // 🔥 Language fetch karne ke liye

export default function WalletPassbook({ supabase, user, setAppStep }: any) {
  
  // 🔥 Global Language System
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  const t = {
    back: isHindi ? "← वापस" : "← Back",
    walletTitle: isHindi ? "Fixifiy पे वॉलेट" : "Fixifiy Pay Wallet",
    availBal: isHindi ? "उपलब्ध बैलेंस" : "Available Balance",
    addMoney: isHindi ? "➕ पैसे डालें" : "➕ Add Money",
    withdraw: isHindi ? "💸 पैसे निकालें" : "💸 Withdraw",
    historyTitle: isHindi ? "📜 पासबुक हिस्ट्री" : "📜 Passbook History",
    clickToView: isHindi ? "देखने के लिए क्लिक करें" : "Click to View",
    clickToHide: isHindi ? "छिपाने के लिए क्लिक करें" : "Click to Hide",
    loadingTxn: isHindi ? "लेनदेन लोड हो रहा है..." : "Loading transactions...",
    noTxnTitle: isHindi ? "अभी तक कोई लेनदेन नहीं" : "No Transactions Yet",
    noTxnDesc: isHindi ? "पैसे डालें या रिफंड प्राप्त करें, उसकी हिस्ट्री यहाँ दिखेगी।" : "Add money or get refunds to see your history here.",
    moneyAdded: isHindi ? "पैसे डाले गए" : "Money Added",
    moneyWithdrawn: isHindi ? "पैसे निकाले गए" : "Money Withdrawn",
    refundRecv: isHindi ? "रिफंड प्राप्त हुआ" : "Refund Received",
    orderPay: isHindi ? "ऑर्डर का पेमेंट" : "Order Payment",
    pending: isHindi ? "पेंडिंग" : "Pending",
    failed: isHindi ? "विफल (Failed)" : "Failed",
    success: isHindi ? "सफल (Success)" : "Success",
    tapDetails: isHindi ? "▼ विवरण के लिए टैप करें" : "▼ Tap for details",
    tapHide: isHindi ? "▲ छिपाने के लिए टैप करें" : "▲ Tap to hide",
    statusText: isHindi ? "स्थिति" : "Status",
    exactTime: isHindi ? "सटीक समय" : "Exact Time",
    utrRef: isHindi ? "UTR / लेनदेन संदर्भ (Reference)" : "UTR / Transaction Reference",
    loadMore: isHindi ? "और लेनदेन देखें ↓" : "Load More Transactions ↓",
    showLess: isHindi ? "कम दिखाएं ↑" : "Show Less ↑",
    
    // Add Money Modal
    addMoneyTitle: isHindi ? "वॉलेट में पैसे डालें" : "Add Money to Wallet",
    enterAmt: isHindi ? "डालने वाली राशि (Amount) दर्ज करें:" : "Enter amount to add:",
    proceedToPay: (amt: string) => isHindi ? `₹${amt || 0} का पेमेंट करें` : `Proceed to Pay ₹${amt || 0}`,
    scanPay: (amt: string) => isHindi ? `किसी भी ऐप से स्कैन करें और ₹${amt} पे करें` : `Scan & Pay ₹${amt} via any App`,
    upiIdText: isHindi ? "UPI ID:" : "UPI ID:",
    openPhonePe: isHindi ? "📲 PhonePe / GPay खोलने के लिए क्लिक करें" : "📲 Click to Open PhonePe / GPay",
    enterUtrPrompt: isHindi ? "पेमेंट करने के बाद UTR (रेफरेंस नंबर) यहाँ डालें:" : "Payment karne ke baad UTR (Reference No.) daalein:",
    utrPlaceholder: isHindi ? "12-अंकों का UTR नंबर डालें..." : "Enter 12-digit UTR No...",
    reqBtn: isHindi ? "✅ एडमिन को भेजें (Verify करें)" : "✅ Send to Admin (Verify)",
    requesting: isHindi ? "⏳ रिक्वेस्ट भेजी जा रही है..." : "⏳ Requesting...",

    // Withdraw Modal
    withdrawTitle: isHindi ? "UPI पर पैसे निकालें" : "Withdraw to UPI",
    lockedBal: isHindi ? "🔒 लॉक्ड बैलेंस:" : "🔒 Locked Balance:",
    lockedDesc: isHindi 
      ? "(वॉलेट में ₹500 शॉपिंग और ऑर्डर्स के लिए सुरक्षित रखे गए हैं। इसके ऊपर की राशि आप निकाल सकते हैं।)" 
      : "(Wallet mein ₹500 shopping aur orders ke liye secure rakhe gaye hain. Iske upar ka amount aap nikal sakte hain.)",
    withdrawable: isHindi ? "निकालने योग्य बैलेंस:" : "Withdrawable Balance:",
    insuffBal: isHindi ? "आपके पास निकालने के लिए पर्याप्त बैलेंस नहीं है।" : "Aapke paas withdraw karne ke liye paryapt balance nahi hai.",
    withdrawAmtPlaceholder: isHindi ? "राशि दर्ज करें" : "Enter amount",
    sendToUpi: isHindi ? "पैसे आपकी इस UPI पर भेजे जाएंगे:" : "Amount will be sent to your UPI:",
    noUpiProfile: isHindi ? "⚠️ प्रोफाइल में कोई UPI ID नहीं मिली!" : "⚠️ No UPI ID found in Profile!",
    btnWithdraw: (amt: string) => isHindi ? `₹${amt || 0} निकालें` : `Withdraw ₹${amt || 0}`,
    processing: isHindi ? "⏳ प्रोसेस हो रहा है..." : "⏳ Processing...",

    // Alerts
    alertEnterUtr: isHindi ? "कृपया सही UTR / रेफरेंस नंबर डालें।" : "Kripya sahi UTR / Reference Number daalein.",
    alertAddSuccess: (amt: string) => isHindi ? `✅ आपकी रिक्वेस्ट भेज दी गई है! एडमिन वेरीफाई करके जल्द ही ₹${amt} जोड़ देंगे।` : `✅ Aapki request bhej di gayi hai! Admin verify karke jald hi ₹${amt} add kar denge.`,
    alertEnterAmt: isHindi ? "कृपया सही राशि (amount) डालें।" : "Kripya sahi amount daalein.",
    alertMaxLimit: (amt: number) => isHindi ? `आप अधिकतम ₹${amt} निकाल सकते हैं (₹500 लॉक्ड हैं)।` : `Aap max ₹${amt} nikal sakte hain (₹500 locked hain).`,
    alertNoUpi: isHindi ? "पैसे निकालने के लिए आपकी UPI ID लिंक नहीं है। कृपया प्रोफाइल सेक्शन में जाकर अपनी UPI ID अपडेट करें।" : "Withdrawal ke liye aapki UPI ID link nahi hai. Kripya Profile section mein jaakar apni UPI ID update karein.",
    alertWithdrawSuccess: (amt: string, upi: string) => isHindi ? `✅ ₹${amt} की विड्रॉल रिक्वेस्ट भेज दी गई है! एडमिन जल्द ही आपके UPI (${upi}) पर पैसे ट्रांसफर कर देंगे।` : `✅ ₹${amt} ka withdrawal request bhej diya gaya hai! Admin jald hi aapke UPI (${upi}) par paise transfer kar denge.`
  };

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customerUpi, setCustomerUpi] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 Track expanded transaction
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);

  // 🔥 Passbook History Collapse & Limit States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  // Add Money States
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [adminUpi, setAdminUpi] = useState('admin@upi'); 
  
  // Withdraw States
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);

  // ₹500 Lock Logic (Safe Number check ke sath)
  const MIN_LOCKED_BALANCE = 500;
  const safeBalance = Number(balance) || 0;
  const withdrawableBalance = Math.max(0, safeBalance - MIN_LOCKED_BALANCE);

  // 🚀 LIVE UPDATES KE LIYE USEEFFECT (REALTIME SUBSCRIPTION)
  useEffect(() => {
    if (!user?.id) return;

    fetchWalletData();
    fetchAdminSettings();

    // 🔥 SUPABASE REALTIME LISTENER 🔥
    const walletChannel = supabase
      .channel('live-wallet-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallet_transactions', filter: `customer_id=eq.${user.id}` },
        (payload: any) => {
          console.log("Transaction Updated Live!", payload);
          fetchWalletData(); // Background mein data refresh karega
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'customers', filter: `id=eq.${user.id}` },
        (payload: any) => {
          console.log("Customer Record Updated Live!", payload);
          fetchWalletData(); 
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(walletChannel);
    };
  }, [user]);

  const fetchAdminSettings = async () => {
    try {
      const { data } = await supabase.from('app_settings').select('wallet_upi').eq('id', 1).maybeSingle();
      if (data?.wallet_upi) setAdminUpi(data.wallet_upi);
    } catch (e) { console.log("Admin UPI fetch error:", e); }
  };

  const fetchWalletData = async () => {
    try {
      const { data: customerData } = await supabase.from('customers').select('balance, upi_id').eq('id', user.id).single();
      if (customerData) {
        setBalance(Number(customerData.balance) || 0); 
        setCustomerUpi(customerData.upi_id || '');
      }

      const { data: historyData } = await supabase.from('wallet_transactions').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
      if (historyData) setTransactions(historyData);
    } catch (e) { console.error("Error fetching wallet:", e); } 
    finally { setIsLoading(false); }
  };

  const handleRechargeRequest = async () => {
    if (!utrNumber || utrNumber.length < 6) return alert(t.alertEnterUtr);
    
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('wallet_transactions').insert({
        customer_id: user.id,
        amount: Number(addAmount),
        type: 'credit',
        status: 'pending', 
        reason: `Wallet Recharge (UTR: ${utrNumber})`
      });

      if (error) throw error;
      alert(t.alertAddSuccess(addAmount));
      setShowAddMoney(false); setShowQR(false); setAddAmount(''); setUtrNumber('');
      fetchWalletData(); 
    } catch (e: any) { alert("Error: " + e.message); } 
    finally { setIsProcessing(false); }
  };

  const handleWithdrawRequest = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) return alert(t.alertEnterAmt);
    if (amt > withdrawableBalance) return alert(t.alertMaxLimit(withdrawableBalance));
    if (!customerUpi) return alert(t.alertNoUpi);

    setIsProcessing(true);
    try {
      const { error } = await supabase.from('wallet_transactions').insert({
        customer_id: user.id,
        amount: amt,
        type: 'debit',
        status: 'pending', 
        reason: `Withdrawal Request`
      });

      if (error) throw error;
      alert(t.alertWithdrawSuccess(amt.toString(), customerUpi));
      setShowWithdraw(false); setWithdrawAmount('');
      fetchWalletData(); 
    } catch (e: any) { alert("Withdrawal Error: " + e.message); } 
    finally { setIsProcessing(false); }
  };

  const toggleTransactionExpand = (id: string) => {
    setExpandedTxnId(expandedTxnId === id ? null : id);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ background: '#0f172a', padding: '15px 20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setAppStep('home')} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>←</button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{t.walletTitle}</h2>
      </div>

      <div style={{ padding: '20px' }}>
        
        {/* 🔥 WALLET HERO CARD 🔥 */}
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', padding: '25px 20px', color: 'white', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', marginBottom: '25px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '150px', opacity: 0.1 }}>💳</div>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', opacity: 0.9 }}>{t.availBal}</p>
          
          <h1 style={{ margin: 0, fontSize: '42px', fontWeight: '900' }}>
            ₹{safeBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              onClick={() => setShowAddMoney(true)}
              style={{ flex: 1, background: 'white', color: '#059669', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            >
              {t.addMoney}
            </button>
            <button 
              onClick={() => setShowWithdraw(true)}
              style={{ flex: 1, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '12px', borderRadius: '10px', fontWeight: '900', fontSize: '15px', cursor: 'pointer' }}
            >
              {t.withdraw}
            </button>
          </div>
        </div>

        {/* 📜 PASSBOOK HISTORY - Clickable Header */}
        <div 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{t.historyTitle}</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{isHistoryOpen ? t.clickToHide : t.clickToView}</span>
          </div>
          <span style={{ fontSize: '18px', color: '#0284c7', fontWeight: 'bold', transition: 'transform 0.3s', transform: isHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>

        {isHistoryOpen && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            {isLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>{t.loadingTxn}</p>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '40px', opacity: 0.5 }}>📭</span>
                <h4 style={{ margin: '10px 0 5px 0', color: '#334155' }}>{t.noTxnTitle}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{t.noTxnDesc}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {transactions.slice(0, visibleCount).map((txn: any) => {
                  const isCredit = String(txn.type).toLowerCase() === 'credit' || String(txn.type).toLowerCase() === 'add';
                  const isPending = String(txn.status).toLowerCase().includes('pending');
                  const isRejected = String(txn.status).toLowerCase().includes('reject');
                  
                  const isExpanded = expandedTxnId === txn.id;

                  let title = isCredit ? t.moneyAdded : t.moneyWithdrawn;
                  if (String(txn.reason).toLowerCase().includes('refund')) title = t.refundRecv;
                  if (String(txn.reason).toLowerCase().includes('order')) title = t.orderPay;

                  return (
                    <div 
                      key={txn.id} 
                      onClick={() => toggleTransactionExpand(txn.id)}
                      style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', border: isExpanded ? '2px solid #38bdf8' : '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      {/* DEFAULT MINIMIZED VIEW */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: isCredit ? '#dcfce7' : '#fee2e2', color: isCredit ? '#16a34a' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                            {isCredit ? '↙️' : '↗️'}
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 3px 0', fontSize: '15px', color: '#1e293b', fontWeight: 'bold' }}>{title}</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                              {new Date(txn.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • 
                              {isPending ? <span style={{ color: '#ca8a04', fontWeight: 'bold' }}> {t.pending}</span> : isRejected ? <span style={{ color: '#ef4444', fontWeight: 'bold' }}> {t.failed}</span> : <span style={{ color: '#16a34a', fontWeight: 'bold' }}> {t.success}</span>}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: isCredit ? '#16a34a' : '#ef4444' }}>
                            {isCredit ? '+' : '-'} ₹{Number(txn.amount || 0).toLocaleString()}
                          </h3>
                          <span style={{ fontSize: '11px', color: isExpanded ? '#0284c7' : '#94a3b8', fontWeight: '600' }}>
                            {isExpanded ? t.tapHide : t.tapDetails}
                          </span>
                        </div>
                      </div>

                      {/* EXPANDED VIEW */}
                      {isExpanded && (
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1', animation: 'fadeIn 0.25s ease-in-out' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                            <div>
                              <strong style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>{t.statusText}</strong>
                              <span style={{ fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', background: isPending ? '#fef9c3' : isRejected ? '#fee2e2' : '#dcfce7', color: isPending ? '#ca8a04' : isRejected ? '#ef4444' : '#16a34a' }}>
                                {String(txn.status).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <strong style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>{t.exactTime}</strong>
                              <span style={{ color: '#0f172a', fontWeight: '500' }}>{new Date(txn.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                            </div>
                          </div>
                          
                          <div>
                            <strong style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{t.utrRef}</strong>
                            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '13px', fontWeight: '600', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                              {txn.reason}
                            </div>
                          </div>

                          <div style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Ref ID: #{txn.id}</span>
                            <span style={{ color: '#0284c7', cursor: 'pointer' }} onClick={() => setExpandedTxnId(null)}>Minimize ▲</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {transactions.length > 5 && (
                  <button 
                    onClick={() => setVisibleCount(visibleCount === 5 ? 20 : 5)}
                    style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s' }}
                  >
                    {visibleCount === 5 ? t.loadMore : t.showLess}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔥 ADD MONEY MODAL 🔥 */}
      {showAddMoney && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderTopLeftRadius: '25px', borderTopRightRadius: '25px', padding: '30px 20px', animation: 'slideUp 0.3s ease-out' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0f172a' }}>{t.addMoneyTitle}</h2>
              <button onClick={() => { setShowAddMoney(false); setShowQR(false); }} style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer' }}>✖</button>
            </div>

            {!showQR ? (
              <>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>{t.enterAmt}</p>
                <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #38bdf8', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                  <span style={{ fontSize: '24px', color: '#38bdf8', fontWeight: 'bold', marginRight: '10px' }}>₹</span>
                  <input 
                    type="number" 
                    value={addAmount} 
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="0"
                    style={{ border: 'none', fontSize: '28px', outline: 'none', width: '100%', fontWeight: 'bold', color: '#0f172a' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                  {[500, 1000, 2000].map(amt => (
                    <button key={amt} onClick={() => setAddAmount(amt.toString())} style={{ flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                      + ₹{amt}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    if (Number(addAmount) > 0) setShowQR(true);
                    else alert(isHindi ? "कृपया सही राशि दर्ज करें" : "Please enter a valid amount");
                  }} 
                  style={{ width: '100%', padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.3)' }}
                >
                  {t.proceedToPay(addAmount)}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#f0fdf4', border: '1px dashed #16a34a', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#15803d' }}>{t.scanPay(addAmount)}</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${adminUpi}&pn=Fixifiy%20Wallet&am=${addAmount}&cu=INR`} 
                    alt="UPI QR Code" 
                    style={{ width: '180px', height: '180px', borderRadius: '10px' }} 
                  />
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#166534', fontWeight: 'bold' }}>{t.upiIdText} {adminUpi}</p>
                </div>

                <a 
                  href={`upi://pay?pa=${adminUpi}&pn=Fixifiy%20Wallet&am=${addAmount}&cu=INR`}
                  style={{ display: 'block', background: '#38bdf8', color: '#0f172a', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '20px' }}
                >
                  {t.openPhonePe}
                </a>

                <div style={{ textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>{t.enterUtrPrompt}</label>
                  <input 
                    type="text" 
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder={t.utrPlaceholder}
                    style={{ width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                  <button 
                    onClick={handleRechargeRequest}
                    disabled={isProcessing}
                    style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '10px', cursor: isProcessing ? 'wait' : 'pointer' }}
                  >
                    {isProcessing ? t.requesting : t.reqBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔥 WITHDRAW MONEY MODAL 🔥 */}
      {showWithdraw && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderTopLeftRadius: '25px', borderTopRightRadius: '25px', padding: '30px 20px', animation: 'slideUp 0.3s ease-out' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0f172a' }}>{t.withdrawTitle}</h2>
              <button onClick={() => setShowWithdraw(false)} style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ background: '#fef2f2', border: '1px dashed #ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#b91c1c', fontSize: '13px', fontWeight: 'bold' }}>{t.lockedBal} ₹{MIN_LOCKED_BALANCE}</p>
              <p style={{ margin: 0, color: '#ef4444', fontSize: '11px' }}>{t.lockedDesc}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '0 5px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>{t.withdrawable}</span>
              <span style={{ color: '#10b981', fontSize: '16px', fontWeight: '900' }}>₹{withdrawableBalance}</span>
            </div>

            {withdrawableBalance <= 0 ? (
              <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>
                {t.insuffBal}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #10b981', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
                  <span style={{ fontSize: '24px', color: '#10b981', fontWeight: 'bold', marginRight: '10px' }}>₹</span>
                  <input 
                    type="number" 
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={t.withdrawAmtPlaceholder}
                    max={withdrawableBalance}
                    style={{ border: 'none', fontSize: '28px', outline: 'none', width: '100%', fontWeight: 'bold', color: '#0f172a' }}
                  />
                  <button 
                    onClick={() => setWithdrawAmount(withdrawableBalance.toString())}
                    style={{ background: '#dcfce7', color: '#15803d', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    MAX
                  </button>
                </div>

                <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>{t.sendToUpi}</span>
                  {customerUpi ? (
                    <strong style={{ color: '#0f172a' }}>{customerUpi}</strong>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>{t.noUpiProfile}</span>
                  )}
                </div>

                <button 
                  onClick={handleWithdrawRequest} 
                  disabled={isProcessing || withdrawableBalance <= 0 || !customerUpi}
                  style={{ width: '100%', padding: '16px', background: (!customerUpi || withdrawableBalance <= 0) ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '900', cursor: (!customerUpi || withdrawableBalance <= 0 || isProcessing) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.3)' }}
                >
                  {isProcessing ? t.processing : t.btnWithdraw(withdrawAmount)}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}