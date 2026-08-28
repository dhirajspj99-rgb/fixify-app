"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { useRouter } from 'next/navigation'; 
import OrdersTab from './components/OrdersTab';
import InventoryTab from './components/InventoryTab';
import SalesAndStockTab from './components/SalesAndStockTab';
import CustomerSupportTab from './components/CustomerSupportTab'; 
import ShopWalletPassbook from './components/ShopWalletPassbook';

// 🔥 Naya Profile Component Import Karein 🔥
import ShopProfile from './components/ShopProfile';

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

export default function ShopOwnerDashboard() {
  const router = useRouter();  
  const [activeTab, setActiveTab] = useState('orders');
  
  const [currentShop, setCurrentShop] = useState<any>(null); 
  const [products, setProducts] = useState<any[]>([]); 
  const [orders, setOrders] = useState<any[]>([]); 
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); 
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false); 
  
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Notice Board & Help Desk Chat
  const [notices, setNotices] = useState<any[]>([]);
  
  // 🔥 CHAT LOGIC: Default 'false' (Band rahega). Naya message aane par true hoga!
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  // UPI Settings States
  const [idCardUpi, setIdCardUpi] = useState('admin@upi');
  const [premiumUpi, setPremiumUpi] = useState('admin@upi');
  const [registrationUpi, setRegistrationUpi] = useState('admin@upi');

  useEffect(() => { 
    fetchAuthAndData(); 
    
    // Realtime Orders Setup
    const ordersSubscription = supabase.channel('realtime-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => { 
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedOrder = payload.new;

            if (updatedOrder.type === 'Labour Booking') return; 
            if (currentShop?.id && String(updatedOrder.shop_id) !== String(currentShop.id)) return; 

            let parsedMsgs = updatedOrder.messages;
            if (typeof parsedMsgs === 'string') { try { parsedMsgs = JSON.parse(parsedMsgs); } catch(e) { parsedMsgs = []; } }
            if (!Array.isArray(parsedMsgs)) parsedMsgs = [];
            updatedOrder.messages = parsedMsgs;

            setOrders(prevOrders => {
                const exists = prevOrders.find(o => o.id === updatedOrder.id);
                if (exists) return prevOrders.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o);
                else return [updatedOrder, ...prevOrders];
            });

            if (parsedMsgs.length > 0) {
                const lastMsg = parsedMsgs[parsedMsgs.length - 1];
                if (lastMsg.sender === 'customer') {
                   setUnreadNotifications(prev => prev + 1);
                   // 🔥 JAISE HI CUSTOMER KA MESSAGE AAYEGA, CHAT OPEN HO JAYEGI!
                   setIsChatOpen(true); 
                }
            }
        }
    }).subscribe();
    
    const chatSubscription = supabase.channel('realtime-chats').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'helpdesk_chats' }, (payload) => { 
      const newChat = payload.new;
      setChatHistory(prev => [...prev, newChat]); 
      
      // 🔥 JAISE HI ADMIN KA MESSAGE AAYEGA, HELP DESK POPUP OPEN HOGA!
      if(newChat.sender !== 'shop' && String(newChat.shop_id) === String(currentShop?.id)) {
         setIsChatOpen(true);
      }
    }).subscribe();

    return () => { 
      supabase.removeChannel(ordersSubscription); 
      supabase.removeChannel(chatSubscription);
    };
  }, [currentShop?.id]); 

  const fetchAuthAndData = async () => {
    // ⚙️ Settings Fetch
    const { data: settingsData } = await supabase.from('app_settings').select('*').maybeSingle();
    if (settingsData) {
      if (settingsData.idCardUpi) setIdCardUpi(settingsData.idCardUpi);
      if (settingsData.premiumUpi) setPremiumUpi(settingsData.premiumUpi);
      if (settingsData.registrationUpi) setRegistrationUpi(settingsData.registrationUpi); 
    }

    let phoneNo = '';
    const savedShopData = localStorage.getItem('fixifiy_shop');
    if (savedShopData) {
       try { phoneNo = JSON.parse(savedShopData).phone; } catch(e) {}
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!phoneNo && session?.user) {
        let sessionPhone = session.user.email?.replace('@fixifiy.in', '').replace(/[^0-9]/g, '');
        if (sessionPhone && sessionPhone.startsWith('91') && sessionPhone.length === 12) {
            sessionPhone = sessionPhone.substring(2);
        }
        phoneNo = sessionPhone || '';
    }

    let shopData = null;

    if (phoneNo) {
        const { data } = await supabase.from('shops').select('*').eq('phone', phoneNo).maybeSingle();
        if (data) {
            shopData = data;
            setCurrentShop(data);
            localStorage.setItem('fixifiy_shop', JSON.stringify(data)); 
        }
    } else {
        router.push('/login');
        return;
    }
    
    fetchProducts(); 
    if(shopData?.id) {
       fetchOrders(shopData.id); 
       fetchChatHistory(shopData.id); 
    }
    fetchNotices(); 
  };

  const fetchNotices = async () => {
    const { data } = await supabase.from('notices').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (data) setNotices(data);
  };

  const fetchChatHistory = async (shopId: string | number) => {
    const { data } = await supabase.from('helpdesk_chats').select('*').eq('shop_id', String(shopId)).order('created_at', { ascending: true });
    if (data) setChatHistory(data);
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !currentShop?.id) return;
    const newMessage = { shop_id: String(currentShop.id), message: chatMessage, sender: 'shop' };
    setChatMessage(''); 
    const { error } = await supabase.from('helpdesk_chats').insert([newMessage]);
    if (error) alert("Error: " + error.message);
  };

  const fetchProducts = async () => { const { data } = await supabase.from('products').select('*'); if (data) setProducts(data); };
  
  const fetchOrders = async (shopIdToFetch?: string | number) => {
    const sid = shopIdToFetch !== undefined ? shopIdToFetch : currentShop?.id;
    if (!sid) return; 

    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }); 
      
    if (!error) {
      const parsedOrders = (data || []).map(order => {
        let parsedMsgs = order.messages;
        if (typeof parsedMsgs === 'string') { try { parsedMsgs = JSON.parse(parsedMsgs); } catch(e) { parsedMsgs = []; } }
        if (!Array.isArray(parsedMsgs)) parsedMsgs = [];
        return { ...order, messages: parsedMsgs };
      });

      const finalOrders = parsedOrders.filter(o => {
        const oShopId = String(o.shop_id || '').trim();
        const myShopId = String(sid).trim();
        if (String(o.type || '').trim() === 'Labour Booking') return false; 
        if (oShopId === myShopId) return true;
        return false; 
      });

      setOrders(finalOrders);
    }
  };

  const handleLogout = async () => { 
      if (window.confirm("Logout karein?")) { 
          localStorage.removeItem('fixifiy_shop'); 
          localStorage.removeItem('shop_login_time'); // 🔥 Securing auto-logout state
          await supabase.auth.signOut(); 
          router.push('/'); 
      } 
  };

  const handleConfirmPrimePayment = async () => {
    alert("✅ Welcome to Fixifiy Prime! Payment of ₹999 recorded.");
    if(currentShop?.id) {
       const { error } = await supabase.from('shops').update({ is_prime: true }).eq('id', currentShop.id);
       if (!error) setCurrentShop({...currentShop, is_prime: true});
    }
    setIsPrimeModalOpen(false);
  };

  return (
    // 🔥 MOBILE ADAPTIVE WRAPPER (width 100%, overflow hidden fixed) 🔥
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', width: '100%', boxSizing: 'border-box', padding: '15px', color: 'white', fontFamily: 'sans-serif', position: 'relative', overflowX: 'hidden' }}>
      
      {/* 📢 NOTICE BOARD SECTION 📢 */}
      {notices.length > 0 && (
        <div style={{ backgroundColor: '#fef3c7', borderLeft: '5px solid #f59e0b', padding: '10px', borderRadius: '8px', marginBottom: '20px', color: '#b45309', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
          <strong style={{ fontSize: '16px', marginRight: '10px', whiteSpace: 'nowrap' }}>📢 NOTICE:</strong>
          <marquee behavior="scroll" direction="left" scrollamount="6" style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {notices.map((n, i) => <span key={i} style={{ marginRight: '40px' }}>⭐ {n.message}</span>)}
          </marquee>
        </div>
      )}

      {/* ⚠️ CRITICAL WARNING IF PROFILE IS NOT SAVED */}
      {currentShop && !currentShop.id && (
        <div style={{ backgroundColor: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', color: 'white', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
            ⚠️ ALERT: Aapne abhi tak apni Shop ka Profile save nahi kiya hai!
          </div>
          <button onClick={() => setIsProfileModalOpen(true)} style={{ backgroundColor: '#fff', color: '#ef4444', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', width: '100%' }}>
            ⚙️ Save Profile Now
          </button>
        </div>
      )}

      {/* HEADER SECTION (Responsive Flex Wrap) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentShop?.profile_pic ? <img src={currentShop.profile_pic} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: currentShop?.is_prime ? '3px solid #facc15' : 'none' }} /> : <div style={{ fontSize: '35px' }}>🏪</div>}
          <div>
            <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              Shop Dashboard
              {currentShop?.is_prime && <span style={{fontSize: '11px', background: '#facc15', color: 'black', padding: '2px 6px', borderRadius: '12px'}}>PRIME</span>}
            </h1>
            <p style={{ color: '#94a3b8', margin: '3px 0 0 0', fontSize: '13px' }}><strong>{currentShop?.name || 'New Shop'}</strong></p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {unreadNotifications > 0 && <div style={{ backgroundColor: '#f43f5e', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' }}>🔔 {unreadNotifications}</div>}
          
          {!currentShop?.is_prime && (
            <button onClick={() => setIsPrimeModalOpen(true)} style={{...editBtn, backgroundColor: '#f59e0b', color: '#000'}}>👑 Prime</button>
          )}

          <button onClick={() => setIsProfileModalOpen(true)} style={{...editBtn, backgroundColor: '#3b82f6'}}>⚙️ Profile</button>
          <button onClick={handleLogout} style={{...editBtn, backgroundColor: '#ef4444'}}>🚪 Logout</button>
        </div>
      </div>

      {/* TABS BUTTONS (Scrollable on Mobile) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '5px', WebkitOverflowScrolling: 'touch' }}>
        <button onClick={() => setActiveTab('orders')} style={tabBtn(activeTab === 'orders')}>🛒 Orders</button>
        <button onClick={() => setActiveTab('inventory')} style={tabBtn(activeTab === 'inventory')}>📦 Inventory</button>
        <button onClick={() => setActiveTab('wallet')} style={tabBtn(activeTab === 'wallet')}>💳 Wallet</button>
        <button onClick={() => setActiveTab('sales')} style={tabBtn(activeTab === 'sales')}>📈 Sales</button>
        <button onClick={() => setActiveTab('stock')} style={tabBtn(activeTab === 'stock')}>📊 Stock</button>
        <button onClick={() => setActiveTab('support')} style={tabBtn(activeTab === 'support')}>🎧 Customer Chats</button>
      </div>

      {/* TABS CONTENT WRAPPER */}
      <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', width: '100%', boxSizing: 'border-box' }}>
        {activeTab === 'orders' && <OrdersTab orders={orders} setOrders={setOrders} products={products} currentShop={currentShop} fetchOrders={fetchOrders} fetchProducts={fetchProducts} setUnreadNotifications={setUnreadNotifications} />}
        {activeTab === 'inventory' && <InventoryTab products={products} fetchProducts={fetchProducts} currentShop={currentShop} />}
        
        {activeTab === 'wallet' && (
          <ShopWalletPassbook supabase={supabase} shopUser={currentShop} setAppStep={() => setActiveTab('orders')} />
        )}
        
        {(activeTab === 'sales' || activeTab === 'stock') && <SalesAndStockTab activeTab={activeTab} orders={orders} currentShop={currentShop} products={products} fetchProducts={fetchProducts} fetchOrders={fetchOrders} />}
        {activeTab === 'support' && <CustomerSupportTab currentShop={currentShop} orders={orders} fetchOrders={fetchOrders} />}
      </div>

      {/* SHOP PROFILE */}
      {isProfileModalOpen && (
        <ShopProfile 
          currentShop={currentShop} 
          setCurrentShop={setCurrentShop} 
          onClose={() => setIsProfileModalOpen(false)} 
          fetchAuthAndData={fetchAuthAndData} 
          idCardUpi={idCardUpi} 
          registrationUpi={registrationUpi} 
        />
      )}

      {/* PRIME SUBSCRIPTION MODAL */}
      {isPrimeModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle, textAlign: 'center', border: '2px solid #facc15', backgroundColor: '#0f172a'}}>
            <h2 style={{color: '#facc15', fontSize: '24px', margin: '0 0 10px 0'}}>👑 Fixifiy Prime</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '20px', fontSize: '14px' }}>Upgrade to Prime for ₹999/year and skyrocket your sales!</p>
            
            <div style={{ textAlign: 'left', background: '#1e293b', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px' }}>
              <p style={{margin: '5px 0'}}>✅ <strong>Top Listing:</strong> Apki shop sabse upar dikhegi.</p>
              <p style={{margin: '5px 0'}}>✅ <strong>0% Commission:</strong> Order par koi charge nahi.</p>
              <p style={{margin: '5px 0'}}>✅ <strong>Premium Badge:</strong> Customer trust badhayega.</p>
              <p style={{margin: '5px 0'}}>✅ <strong>Priority Support:</strong> 24/7 Admin chat access.</p>
            </div>

            <div style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${premiumUpi}&pn=Fixifiy&am=999&cu=INR&tn=Prime_Subscription`} alt="Admin QR ₹999" style={{width: '150px', height: '150px'}} />
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>* Scan and Pay ₹999</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsPrimeModalOpen(false)} style={{padding: '10px', borderRadius: '8px', color: 'white', fontWeight: 'bold', backgroundColor: '#334155', flex: 1, border: 'none', cursor: 'pointer'}}>❌ Cancel</button>
              <button onClick={handleConfirmPrimePayment} style={{padding: '10px', borderRadius: '8px', color: '#000', fontWeight: 'bold', backgroundColor: '#f59e0b', flex: 1, border: 'none', cursor: 'pointer'}}>✅ Paid? Upgrade</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 FLOATING HELP DESK (Mobile Adjusted width) 🔥 */}
      <div style={{ position: 'fixed', bottom: '15px', right: '15px', zIndex: 9999 }}>
        {isChatOpen ? (
          <div style={{ width: '90vw', maxWidth: '320px', height: '400px', backgroundColor: '#1e293b', border: '2px solid #38bdf8', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ backgroundColor: '#0284c7', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <strong style={{ fontSize: '14px' }}>🎧 Help Desk & Orders</strong>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>✖</button>
            </div>

            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatHistory.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '50px' }}>Chat empty. We will reply shortly!</p>
              ) : (
                chatHistory.map((chat, idx) => (
                  <div key={idx} style={{ alignSelf: chat.sender === 'shop' ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: chat.sender === 'shop' ? '#10b981' : '#334155', padding: '8px 12px', borderRadius: chat.sender === 'shop' ? '12px 12px 0 12px' : '12px 12px 12px 0', color: 'white', fontSize: '13px' }}>
                    {chat.message}
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '10px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Type message..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none', fontSize: '13px' }} />
              <button onClick={sendChatMessage} style={{ backgroundColor: '#38bdf8', border: 'none', borderRadius: '50%', width: '38px', height: '38px', color: '#0f172a', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>➤</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsChatOpen(true)} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '50px', padding: '12px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            💬 Chat
            {unreadNotifications > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px' }}>{unreadNotifications}</span>}
          </button>
        )}
      </div>

    </div>
  );
}

// 🎨 CSS Update: Tabs ko responsive banaya gaya hai
const tabBtn = (active: boolean): React.CSSProperties => ({ 
  padding: '10px 15px', 
  backgroundColor: active ? '#38bdf8' : '#334155', 
  border: 'none', 
  borderRadius: '8px', 
  color: active ? '#0f172a' : 'white', 
  cursor: 'pointer', 
  fontWeight: 'bold', 
  fontSize: '13px',
  flex: '1 0 auto', 
  textAlign: 'center'
});
const editBtn: React.CSSProperties = { padding: '6px 12px', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' };