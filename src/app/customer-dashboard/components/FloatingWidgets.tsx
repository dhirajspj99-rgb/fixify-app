"use client";
import React from 'react';
import ChatModel from './ChatModel';
import PermanentFreeCall from '@/components/PermanentFreeCall';
import { useAppContext } from './AppContext'; // 🔥 Language ke liye import

export default function FloatingWidgets({
  appStep, mainCart, setAppStep, activeCall, setActiveCall, 
  userProfile, isHelpdeskOpen, setIsHelpdeskOpen
}: any) {
  
  // 🔥 Global Language System
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  const t = {
    connecting: isHindi ? "कॉल कनेक्ट हो रही है..." : "Connecting Call...",
    endCall: isHindi ? "कॉल काटें और बंद करें" : "End Call & Close",
    viewCart: isHindi ? `कार्ट देखें (${mainCart.length})` : `View Cart (${mainCart.length})`,
    helpdesk: isHindi ? "Fixifiy एडमिन हेल्पडेस्क" : "Fixifiy Admin Helpdesk"
  };

  return (
    <>
      {/* 🔥 ACTIVE CALL OVERLAY MODAL 🔥 */}
      {activeCall && (
        <div className="modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10005, background: 'rgba(15,23,42,0.9)' }}>
          <div className="modal-box" style={{ background: '#ffffff', textAlign: 'center', padding: '30px', borderRadius: '20px', maxWidth: '350px', width: '100%' }}>
             <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{t.connecting}</h3>
             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>{activeCall.title}</p>
             
             <div style={{ height: '300px', background: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                <PermanentFreeCall roomID={activeCall.roomId} customerName={userProfile?.name || "Customer"} />
             </div>
             
             <button onClick={() => setActiveCall(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', width: '100%', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                {t.endCall}
             </button>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {mainCart.length > 0 && appStep !== 'cart_checkout' && (
        <button onClick={() => setAppStep('cart_checkout')} className="no-print" style={{ position: 'fixed', bottom: '110px', right: '30px', background: '#fb641b', color: 'white', border: 'none', padding: '15px 25px', borderRadius: '30px', fontWeight: '900', fontSize: '16px', boxShadow: '0 6px 20px rgba(251,100,27,0.4)', cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🛒</span> {t.viewCart}
        </button>
      )}

      {/* Floating Helpdesk Button */}
      <button onClick={() => setIsHelpdeskOpen(!isHelpdeskOpen)} className="no-print" style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', background: '#2874f0', color: 'white', border: 'none', fontSize: '28px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isHelpdeskOpen ? '✖' : '🎧'}
      </button>
      
      {/* Helpdesk Chat Box */}
      {isHelpdeskOpen && (
        <div className="no-print" style={{ position: 'fixed', bottom: '100px', right: '30px', width: '350px', height: '550px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#2874f0', padding: '15px', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>{t.helpdesk}</span><span onClick={() => setIsHelpdeskOpen(false)} style={{cursor: 'pointer'}}>✖</span>
          </div>

          <div style={{ padding: '15px', background: '#f0fdf4', borderBottom: '2px solid #bbf7d0' }}>
            <PermanentFreeCall roomID="fixify_support_room_1" customerName={userProfile?.name || "Customer"} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', background: '#f9f9f9' }}>
            {/* 🔥 ChatModel ko selectedLanguage pass kar rahe hain */}
            <ChatModel userProfile={userProfile} selectedLanguage={selectedLanguage} />
          </div>
        </div>
      )}
    </>
  );
}