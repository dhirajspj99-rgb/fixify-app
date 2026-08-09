"use client";
import React, { useState } from 'react';
import { useAppContext } from './AppContext'; // 🔥 Yahan se language aur usko badalne ka function aayega

export default function Header({ 
  appStep, setAppStep, setSelectedCategory, notifications, setLabourCategory, supabase, router,
  pastOrders = [], setFinalInvoice, setOrderTab,
  walletBalance = 0 
}: any) {
  
  // 🔥 Global Language Fetch & Setter
  const { selectedLanguage, setSelectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  const [showDropdown, setShowDropdown] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false); 

  // Translation Text Object
  const t = {
    services: isHindi ? "सेवाएं" : "Services",
    hireMistri: isHindi ? "मिस्त्री बुक करें" : "Hire Mistri",
    orders: isHindi ? "ऑर्डर्स" : "Orders",
    alerts: isHindi ? "अलर्ट्स" : "Alerts",
    profile: isHindi ? "प्रोफाइल" : "Profile",
    logout: isHindi ? "लॉगआउट" : "Logout",
    modalTitle: isHindi ? "⚡ Fixifiy सेवाएं" : "⚡ Fixifiy Services",
    modalSub: isHindi ? "आप क्या खोलना चाहते हैं?" : "What do you want to open?",
    wallet: isHindi ? "मेरा डिजिटल वॉलेट" : "My Digital Wallet",
    recharge: isHindi ? "मोबाइल / बिल रिचार्ज (BBPS)" : "Mobile / Bill Recharge (BBPS)",
    travel: isHindi ? "ट्रेन और बस टिकट बुकिंग" : "Train & Bus Ticket Booking",
    updatesAlerts: isHindi ? "अपडेट्स और अलर्ट्स" : "Updates & Alerts",
    noNotif: isHindi ? "कोई नया अलर्ट नहीं है" : "No new notifications"
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNotifClick = (notif: any) => {
    setShowDropdown(false); 
    
    if (notif.orderId && pastOrders && setFinalInvoice && setOrderTab) {
        const order = pastOrders.find((o: any) => 
            String(o.id) === String(notif.orderId) || String(o.order_no) === String(notif.orderId)
        );
        
        if (order) {
            setFinalInvoice(order); 
            setOrderTab('history'); 
            setAppStep('orders');   
            return;
        }
    }
    setAppStep('orders');
  };

  return (
    <div style={{ 
      background: 'linear-gradient(90deg, #1e3a8a 0%, #2874f0 100%)', 
      padding: '12px 20px', 
      color: 'white', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
      flexWrap: 'wrap', 
      gap: '10px'
    }}>
      
      {/* LOGO SECTION */}
      <div 
        onClick={() => { setAppStep('home'); setSelectedCategory(null); setLabourCategory(''); }} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <div style={{ background: 'white', borderRadius: '8px', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '24px' }}>🏪</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
          <span style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '0.5px' }}>Fixifiy</span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="header-actions-scroll" style={{ display: 'flex', gap: '10px', alignItems: 'center', overflowX: 'auto', paddingBottom: '2px' }}>
        
        {/* 🌐 LANGUAGE SELECTOR (Inside Header) 🔥 */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', 
          borderRadius: '20px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px', backdropFilter: 'blur(5px)'
        }}>
          <span style={{ fontSize: '14px' }}>🌐</span>
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ 
              background: 'transparent', color: 'white', border: 'none', outline: 'none', 
              fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', appearance: 'none', paddingRight: '5px' 
            }}
          >
            <option value="English" style={{ color: 'black' }}>English</option>
            <option value="Hindi" style={{ color: 'black' }}>हिंदी</option>
          </select>
        </div>

        {/* 🔥 UNIFIED WALLET & SERVICES BUTTON 🔥 */}
        <button 
          onClick={() => setShowServicesModal(true)}
          title="Click for Wallet, Recharge & Travel"
          style={{
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', border: '1px solid #34d399',
            padding: '8px 14px', borderRadius: '20px', color: 'white', fontSize: '14px', fontWeight: '900',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
            whiteSpace: 'nowrap', transition: '0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span>💳 ₹{Number(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.5)', height: '14px' }}></span>
          <span>⚡ {t.services}</span>
        </button>

        {/* 👷‍♂️ HIRE MISTRI BUTTON */}
        <button 
          onClick={() => setAppStep('hire_labour')}
          style={{
            background: 'linear-gradient(90deg, #fb641b 0%, #f97316 100%)', border: 'none',
            padding: '8px 16px', borderRadius: '20px', color: 'white', fontSize: '13px', fontWeight: '800',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(251,100,27,0.4)',
            whiteSpace: 'nowrap'
          }}
        >
          <span>👷‍♂️</span> <span className="hide-mobile">{t.hireMistri}</span>
        </button>

        {/* 📦 ORDERS BUTTON */}
        <button 
          onClick={() => setAppStep('orders')}
          style={{
            background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '8px 14px', borderRadius: '20px', color: 'white', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(5px)'
          }}
        >
          <span>📦</span> <span className="hide-mobile">{t.orders}</span>
        </button>

        {/* 🔔 ALERTS BUTTON */}
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: showDropdown ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '8px 14px', borderRadius: '20px', color: 'white', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(5px)', position: 'relative'
          }}
        >
          <span>🔔</span> <span className="hide-mobile">{t.alerts}</span>
          {notifications?.length > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(239, 68, 68, 0.5)' }}>
              {notifications.length}
            </span>
          )}
        </button>

        {/* 👤 PROFILE BUTTON */}
        <button 
          onClick={() => setAppStep('profile')}
          style={{
            background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '8px 14px', borderRadius: '20px', color: 'white', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(5px)'
          }}
        >
          <span>👤</span> <span className="hide-mobile">{t.profile}</span>
        </button>
        
        {/* ⏻ LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '8px 14px', borderRadius: '20px', color: '#fecaca', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(5px)'
          }}
        >
          <span>⏻</span> <span className="hide-mobile">{t.logout}</span>
        </button>
      </div>

      {/* 🔥 UNIFIED MODAL FOR WALLET, RECHARGE & TRAVEL 🔥 */}
      {showServicesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '400px', borderRadius: '16px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', textAlign: 'center', position: 'relative' }}>
            <span onClick={() => setShowServicesModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}>✖</span>
            
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px', fontWeight: '900' }}>{t.modalTitle}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px' }}>{t.modalSub}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Option 1: Digital Wallet */}
              <button 
                onClick={() => { setShowServicesModal(false); setAppStep('wallet_passbook'); }}
                style={{ background: '#ecfdf5', border: '2px solid #10b981', color: '#047857', padding: '14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <span>💳</span> {t.wallet} (₹{walletBalance})
              </button>

              {/* Option 2: Mobile Recharge */}
              <button 
                onClick={() => { setShowServicesModal(false); setAppStep('recharge'); }}
                style={{ background: '#fffbeb', border: '2px solid #f59e0b', color: '#b45309', padding: '14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <span>📱⚡</span> {t.recharge}
              </button>

              {/* Option 3: Travel Booking */}
              <button 
                onClick={() => { setShowServicesModal(false); setAppStep('travel'); }}
                style={{ background: '#eff6ff', border: '2px solid #2874f0', color: '#1d4ed8', padding: '14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <span>🚆🚌</span> {t.travel}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* 🔥 PREMIUM NOTIFICATION DROPDOWN 🔥 */}
      {showDropdown && (
        <>
          <div 
            onClick={() => setShowDropdown(false)} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998 }} 
          />
          
          <div style={{ 
            position: 'absolute', top: '70px', right: '20px', width: '320px', 
            background: '#ffffff', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', 
            overflow: 'hidden', zIndex: 9999, border: '1px solid #e2e8f0'
          }}>
            <div style={{ background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '15px', fontWeight: '800' }}>{t.updatesAlerts}</h4>
              <span onClick={() => setShowDropdown(false)} style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '18px', fontWeight: 'bold' }}>✖</span>
            </div>
            
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {notifications && notifications.length > 0 ? (
                notifications.map((notif: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => handleNotifClick(notif)} 
                    style={{ 
                      padding: '16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', 
                      background: idx === 0 ? '#f0f9ff' : '#ffffff', transition: '0.2s', display: 'flex', gap: '12px', alignItems: 'flex-start'
                    }}
                  >
                    <div style={{ background: idx === 0 ? '#bae6fd' : '#e2e8f0', padding: '8px', borderRadius: '50%', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }}>
                      {notif.orderId ? '💬' : '🔔'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold' }}>
                        {notif.title}
                      </h5>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{t.noNotif}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile Responsive CSS Trick */}
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none; }
        }
        .header-actions-scroll::-webkit-scrollbar { display: none; }
        .header-actions-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}