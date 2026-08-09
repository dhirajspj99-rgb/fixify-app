"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 

import OrderManager from './OrderManager';
import WalletManager from './WalletManager';
import LabourManager from './LabourManager';
import ShopManager from './ShopManager';
import SubAdminManager from './SubAdminManager';
import LocationManager from './LocationManager';
import FeedbackManager from './FeedbackManager';
import ChatManager from './ChatManager';
import SettingsManager from './SettingsManager';
import CustomerManager from './CustomerManager';
import DeliveryBoyManager from './DeliveryBoyManager';

const TABS_CONFIG = [
  { id: 'dashboard', label: 'DASHBOARD', icon: '📊' }, 
  { id: 'orders', label: 'ORDERS & REFUNDS', icon: '📦' },
  { id: 'wallets', label: 'WALLET LEDGER', icon: '💳' }, 
  { id: 'labour', label: 'LABOURS & RATES', icon: '👷' },
  { id: 'shop_owners', label: 'SHOP OWNERS', icon: '🏪' },
  { id: 'delivery_boys', label: 'DELIVERY PARTNERS', icon: '🚚' },
  { id: 'customers', label: 'CUSTOMERS', icon: '👥' },
  { id: 'sub_admins', label: 'SUB ADMINS & ZONES', icon: '🛠️' },
  { id: 'locations', label: 'SERVICE AREAS', icon: '📍' },
  { id: 'feedback', label: 'RATINGS & REVIEWS', icon: '⭐' },
  { id: 'chats', label: 'LIVE SUPPORT CHAT', icon: '💬' },
  { id: 'settings', label: 'SETTINGS & GST', icon: '⚙️' }
];

const indiaLocationData = {
  "Bihar": { "Patna": ["Patna Sadar", "Danapur", "Barh", "Masaurhi"], "Begusarai": ["Begusarai Sadar", "Barauni"] },
  "Uttar Pradesh": { "Lucknow": ["Gomti Nagar", "Alambagh"] },
  "Delhi": { "Central Delhi": ["Karol Bagh", "Paharganj"] },
  "Maharashtra": { "Mumbai": ["Colaba", "Dadar"], "Pune": ["Koregaon Park"] },
  "Karnataka": { "Bengaluru": ["Koramangala", "Whitefield"] }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 GLOBAL STATE FILTER
  const [globalStateFilter, setGlobalStateFilter] = useState('All');
  const [incomeFilter, setIncomeFilter] = useState('month'); // 🔥 New Admin Income Filter
  
  const [labours, setLabours] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const [allWalletTxns, setAllWalletTxns] = useState<any[]>([]); 
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  
  const [appSettings, setAppSettings] = useState<any>({});
  const [labourRates, setLabourRates] = useState<Record<string, number>>({});
  const [commissionRate, setCommissionRate] = useState<number>(5); 
  const [deliveryBoyCommRate, setDeliveryBoyCommRate] = useState<number>(10);
  const [dynamicLocations, setDynamicLocations] = useState<any>(indiaLocationData);

  // Full Page Profile State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [customerWalletHistory, setCustomerWalletHistory] = useState<any[]>([]);
  
  const [walletAmtInput, setWalletAmtInput] = useState('');
  const [walletReasonInput, setWalletReasonInput] = useState('');
  const [chatMsgInput, setChatMsgInput] = useState(''); 

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const safeFetch = async (tableName: string, query: any) => {
        const { data, error } = await query;
        if (error) {
          console.error(`❌ Error fetching ${tableName}:`, error.message);
          return [];
        }
        return data || [];
      };

      const labData = await safeFetch('labours', supabase.from('labours').select('*'));
      const shpData = await safeFetch('shops', supabase.from('shops').select('*'));
      const custData = await safeFetch('customers', supabase.from('customers').select('*').order('id', { ascending: false }));
      const ordData = await safeFetch('orders', supabase.from('orders').select('*').order('created_at', { ascending: false }));
      const dBoysData = await safeFetch('delivery_boys', supabase.from('delivery_boys').select('*'));
      const wTxnsData = await safeFetch('wallet_transactions', supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false }));
      const subsData = await safeFetch('sub_admins', supabase.from('sub_admins').select('*'));
      const fdbkData = await safeFetch('feedbacks', supabase.from('feedbacks').select('*').order('created_at', { ascending: false }));
      const chtsData = await safeFetch('support_chats', supabase.from('support_chats').select('*').order('created_at', { ascending: true }));
      const locsData = await safeFetch('service_locations', supabase.from('service_locations').select('*'));

      setLabours(labData);
      setShops(shpData);
      setCustomers(custData);
      setOrders(ordData);
      setDeliveryBoys(dBoysData);
      setAllWalletTxns(wTxnsData);
      setSubAdmins(subsData);
      setFeedbacks(fdbkData);
      setChats(chtsData);

      if (locsData && locsData.length > 0) {
        const merged = JSON.parse(JSON.stringify(indiaLocationData));
        locsData.forEach((l: any) => {
          if (!merged[l.state]) merged[l.state] = {};
          if (!merged[l.state][l.district]) merged[l.state][l.district] = [];
          if (!merged[l.state][l.district].includes(l.block)) merged[l.state][l.district].push(l.block);
        });
        setDynamicLocations(merged);
      }

      const { data: settingsRes } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (settingsRes) {
        setAppSettings(settingsRes);
        setLabourRates(settingsRes.labour_rates || {});
        setCommissionRate(settingsRes.commission_rate || 5);
        setDeliveryBoyCommRate(settingsRes.delivery_boy_comm_rate || 10);
      }
    } catch (error) {
      console.error("Critical error in fetchData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Kya aap sach mein logout karna chahte hain?")) {
      await supabase.auth.signOut();
      window.location.href = '/login'; 
    }
  };

  const openUserDetails = async (user: any, role: string) => { 
    setSelectedUser({ ...user, displayRole: role }); 
    setChatMsgInput(''); 
    if(role === 'Customer' && user.id && !String(user.id).startsWith('ord_cust_')) {
      const { data } = await supabase.from('wallet_transactions').select('*').eq('customer_id', user.id).order('created_at', {ascending: false});
      setCustomerWalletHistory(data || []);
    } else {
      setCustomerWalletHistory([]);
    }
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  const handleProfileWalletAction = async (type: string) => {
    if (!walletAmtInput || Number(walletAmtInput) <= 0) return alert("Sahi amount daalein!");
    if (!walletReasonInput) return alert("Reason likhna zaroori hai!");
    if (!selectedUser) return;

    try {
      const { data, error } = await supabase.rpc('process_wallet_transaction', { 
        p_customer_id: Number(selectedUser.id), 
        p_amount: Number(walletAmtInput), 
        p_type: type, 
        p_reason: `Admin: ${walletReasonInput}` 
      });
      if (error) throw error;
      alert(`✅ Wallet successfully updated!`);
      setWalletAmtInput(''); setWalletReasonInput('');
      setSelectedUser({ ...selectedUser, balance: data });
      fetchData();
      
      const { data: hist } = await supabase.from('wallet_transactions').select('*').eq('customer_id', selectedUser.id).order('created_at', { ascending: false });
      setCustomerWalletHistory(hist || []);
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleProcessTransaction = async (txn: any, action: 'approve' | 'reject') => {
    if (!selectedUser) return;

    if (action === 'approve') {
      if (txn.type === 'debit') {
        const isPaid = window.confirm(`⚠️ DHYAN DEIN: Kya aapne apne Bank/PhonePe se customer ke UPI (${selectedUser.upi_id || 'NOT ADDED'}) par ₹${txn.amount} bhej diye hain?\n\nJab tak aap paise nahi bhejte, OK mat dabayein.`);
        if (!isPaid) return;

        const utr = window.prompt(`Paise bhej diye hain toh, Bank UTR ya Payment ID enter karein:`);
        if (utr === null) return; 
        if (!utr.trim()) return alert("❌ UTR daalna zaroori hai! Approval cancel ho gaya.");

        try {
          const newBalance = (Number(selectedUser.balance) || 0) - Number(txn.amount);
          if (newBalance < 0) return alert("❌ Customer ke wallet mein itne paise nahi hain!");

          await supabase.from('customers').update({ balance: newBalance }).eq('id', selectedUser.id);
          const finalReason = `${txn.reason || 'Withdrawal'} | Paid UTR: ${utr}`;
          await supabase.from('wallet_transactions').update({ status: 'completed', reason: finalReason }).eq('id', txn.id);

          alert("✅ Success! Paise cut gaye aur History mein UTR save ho gaya.");
          setSelectedUser({ ...selectedUser, balance: newBalance });
        } catch (e: any) { alert("Error: " + e.message); }
      } else {
        const verifyText = window.prompt(`⚠️ SECURITY CHECK:\nCustomer ne ₹${txn.amount} add karne ki request daali hai.\nDetails: ${txn.reason}\n\nKya aapne apne Bank App mein ye UTR check kar liya hai?\nAgar paise receive ho gaye hain, toh niche 'YES' type karein:` );
        
        if (verifyText !== 'YES') {
            return alert("❌ Verification Failed. Aapne YES nahi type kiya. Request approve nahi hui.");
        }

        try {
          const newBalance = (Number(selectedUser.balance) || 0) + Number(txn.amount);
          await supabase.from('customers').update({ balance: newBalance }).eq('id', selectedUser.id);
          await supabase.from('wallet_transactions').update({ status: 'completed' }).eq('id', txn.id);
          
          alert("✅ Top-up Approved! Balance Added.");
          setSelectedUser({ ...selectedUser, balance: newBalance });
        } catch (e: any) { alert("Error: " + e.message); }
      }
    } else {
      const rejectReason = window.prompt("❌ Reject karne ka kaaran (reason) likhein (e.g. Invalid UTR):");
      if (rejectReason === null) return; 
      if (!rejectReason.trim()) return alert("Reason likhna zaroori hai!");

      try {
        await supabase.from('wallet_transactions').update({ 
          status: 'rejected', 
          reason: `Rejected: ${rejectReason}` 
        }).eq('id', txn.id);
        alert("✅ Request Rejected. Reason history mein save ho gaya.");
      } catch (e: any) { alert("Error rejecting: " + e.message); }
    }
    
    fetchData();
    const { data } = await supabase.from('wallet_transactions').select('*').eq('customer_id', selectedUser.id).order('created_at', {ascending: false});
    setCustomerWalletHistory(data || []);
  };

  const handleSendNotification = async () => {
    if (!chatMsgInput.trim()) return alert("Kripya message type karein!");
    if (!selectedUser) return;

    try {
      const { error } = await supabase.from('support_chats').insert({
        customer_id: selectedUser.id,
        message: chatMsgInput,
        sender: 'admin'
      });
      if (error) throw error;
      alert("✅ Message/Notification sent successfully!");
      setChatMsgInput('');
      fetchData(); 
    } catch (e: any) { alert("Error sending message: " + e.message); }
  };

  // 🔥 CORE CALCULATIONS & FILTERS 🔥
  const filteredCustomers = globalStateFilter === 'All' ? customers : customers.filter(c => c.state === globalStateFilter);
  const filteredShops = globalStateFilter === 'All' ? shops : shops.filter(s => s.state === globalStateFilter);
  const filteredLabours = globalStateFilter === 'All' ? labours : labours.filter(l => l.state === globalStateFilter);
  const filteredOrders = globalStateFilter === 'All' ? orders : orders.filter(o => o.state === globalStateFilter);
  const filteredDeliveryBoys = globalStateFilter === 'All' ? deliveryBoys : deliveryBoys.filter(d => d.state === globalStateFilter);

  const allAvailableStates = Array.from(new Set([
      ...customers.map(c => c.state),
      ...orders.map(o => o.state)
  ])).filter(Boolean);

  const activeOrdersCount = filteredOrders.filter((o:any) => !['completed', 'delivered', 'refunded'].includes(o.status?.toLowerCase())).length;
  const totalRev = filteredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  
  // Pending Actions Details
  const pendingTopupsCount = allWalletTxns.filter(t => String(t.status).toLowerCase() === 'pending' && (String(t.type).toLowerCase().includes('credit') || String(t.type).toLowerCase().includes('add'))).length;
  const pendingWithdrawalsCount = allWalletTxns.filter(t => String(t.status).toLowerCase() === 'pending' && (String(t.type).toLowerCase().includes('debit') || String(t.type).toLowerCase().includes('withdraw') || String(t.type).toLowerCase().includes('minus'))).length;
  const pendingWalletRefundsCount = allWalletTxns.filter(t => String(t.status).toLowerCase() === 'pending' && (String(t.type).toLowerCase().includes('refund') || String(t.type).toLowerCase().includes('return'))).length;
  const pendingOrderRefundsCount = filteredOrders.filter((o:any) => o.refund_status?.includes('Pending Admin Refund')).length;
  const totalPendingAction = pendingTopupsCount + pendingWithdrawalsCount + pendingWalletRefundsCount + pendingOrderRefundsCount;

  // Wallet Liabilities (Total Money in system)
  const totalCustomerWallet = filteredCustomers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);
  const totalShopWallet = filteredShops.reduce((sum, s) => sum + (Number(s.balance) || 0), 0);
  const totalLabourWallet = filteredLabours.reduce((sum, l) => sum + (Number(l.balance) || 0), 0);
  const totalDeliveryWallet = filteredDeliveryBoys.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);

  // Admin Income Calculation (Based on Date Filter)
  const completedOrders = filteredOrders.filter(o => ['completed', 'delivered', 'refunded'].includes((o.status || '').toLowerCase()));
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  let adminIncome = 0;
  completedOrders.forEach(o => {
      const orderDateStr = o.updated_at || o.created_at;
      if(!orderDateStr) return;
      const orderDate = new Date(orderDateStr).getTime();
      
      let include = false;
      if (incomeFilter === 'today' && orderDate >= startOfDay) include = true;
      if (incomeFilter === 'month' && orderDate >= startOfMonth) include = true;
      if (incomeFilter === 'year' && orderDate >= startOfYear) include = true;
      if (incomeFilter === 'all') include = true;

      if (include) {
         const amt = Number(o.total_amount) || 0;
         adminIncome += (amt * (commissionRate / 100)); // Applying Commission %
      }
  });

  if (isLoading) {
    return (
      <div style={{ background: '#0a0f1c', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#38bdf8' }}>
        <h2>Loading Dashboard Data... 🚀</h2>
      </div>
    );
  }

  const pendingCustomerRequests = customerWalletHistory.filter((t: any) => String(t.status).toLowerCase() === 'pending');
  const pastCustomerHistory = customerWalletHistory.filter((t: any) => String(t.status).toLowerCase() !== 'pending');

  return (
    <div style={{ background: '#020617', minHeight: '100vh', padding: '24px', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Header - WITH GLOBAL FILTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', background: '#0f172a', padding: '20px 30px', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', padding: '12px', borderRadius: '12px', fontSize: '24px' }}>🚀</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fixifiy Master Admin OS</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '13px', fontWeight: '500' }}>Unified Management Dashboard 2026</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', padding: '5px 15px', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ marginRight: '10px', color: '#94a3b8', fontSize: '13px' }}>🌍 Location Filter:</span>
                <select value={globalStateFilter} onChange={(e) => setGlobalStateFilter(e.target.value)} style={{ background: 'transparent', color: '#38bdf8', border: 'none', outline: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                    <option value="All" style={{ background: '#0f172a', color: 'white' }}>All States / Global</option>
                    {allAvailableStates.map((stateName: any) => (
                         <option key={stateName} value={stateName} style={{ background: '#0f172a', color: 'white' }}>{stateName}</option>
                    ))}
                </select>
            </div>
            <button onClick={handleLogout} style={{ padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>🚪 Logout</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ background: '#0f172a', padding: '20px 15px', borderRadius: '20px', border: '1px solid #1e293b', height: 'fit-content', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <h4 style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', paddingLeft: '15px' }}>Main Menu</h4>
          {TABS_CONFIG.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id); setSelectedUser(null); }}
              style={{ 
                width: '100%', padding: '14px 18px', textAlign: 'left', 
                background: activeTab === tab.id && !selectedUser ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, transparent 100%)' : 'transparent', 
                color: activeTab === tab.id && !selectedUser ? '#38bdf8' : '#94a3b8', 
                border: 'none', borderLeft: activeTab === tab.id && !selectedUser ? '4px solid #38bdf8' : '4px solid transparent', 
                borderRadius: '0 12px 12px 0', cursor: 'pointer', 
                fontWeight: activeTab === tab.id && !selectedUser ? '600' : '500', 
                fontSize: '14px', display: 'flex', alignItems: 'center', gap: '14px', 
                marginBottom: '6px', transition: 'all 0.2s ease-in-out' 
              }}
            >
              <span style={{ fontSize: '18px', opacity: activeTab === tab.id && !selectedUser ? 1 : 0.7 }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#0f172a', padding: '35px', borderRadius: '20px', border: '1px solid #1e293b', minHeight: '75vh', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          
          {/* 🔥 FULL PAGE CUSTOMER PROFILE VIEW 🔥 */}
          {selectedUser ? (
            <div style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
              <button onClick={closeUserDetails} style={{ background: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⬅ Back to List
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '25px' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '28px' }}>{selectedUser.name || 'Unknown User'}</h2>
                  <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '15px' }}>
                    📞 {selectedUser.phone} &nbsp;|&nbsp; 
                    🏦 UPI: <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '16px' }}>{selectedUser.upi_id || 'Not Provided'}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right', background: 'rgba(16, 185, 129, 0.1)', padding: '15px 25px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <p style={{ margin: 0, color: '#10b981', fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold' }}>Current Balance</p>
                  <p style={{ margin: 0, color: '#10b981', fontSize: '36px', fontWeight: '900' }}>₹{selectedUser.balance || 0}</p>
                </div>
              </div>

              {pendingCustomerRequests.length > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: '16px', marginBottom: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⏳</span> Action Required: Pending Wallet Requests
                  </h3>
                  
                  {pendingCustomerRequests.map((txn: any) => (
                    <div key={txn.id} style={{ background: '#0f172a', padding: '15px 20px', borderRadius: '12px', borderLeft: `4px solid ${txn.type === 'debit' ? '#ef4444' : '#10b981'}`, marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                         <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ background: txn.type === 'debit' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: txn.type === 'debit' ? '#ef4444' : '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                               {txn.type === 'debit' ? 'WITHDRAWAL REQUEST' : 'TOP-UP REQUEST'}
                            </span>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>{new Date(txn.created_at).toLocaleString('en-IN')}</span>
                         </div>
                         <strong style={{ color: txn.type === 'debit' ? '#ef4444' : '#10b981', fontSize: '24px', display: 'block', marginBottom: '5px' }}>
                            {txn.type === 'debit' ? '-' : '+'} ₹{txn.amount}
                         </strong>
                         <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px' }}><strong>Details:</strong> {txn.reason}</p>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
                        <button onClick={() => handleProcessTransaction(txn, 'approve')} style={{ padding: '12px', background: txn.type === 'debit' ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
                          ✅ {txn.type === 'debit' ? 'Mark Paid & Save UTR' : 'Verify & Add Money'}
                        </button>
                        <button onClick={() => handleProcessTransaction(txn, 'reject')} style={{ padding: '10px', background: 'transparent', color: '#94a3b8', border: '1px solid #64748b', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          ❌ Reject Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px' }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#38bdf8' }}>🛠️ Manual Wallet Adjustment</h4>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input type="number" placeholder="Amount (₹)" value={walletAmtInput} onChange={e=>setWalletAmtInput(e.target.value)} style={{ flex: 1, padding: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '10px', outline: 'none' }} />
                    <input type="text" placeholder="Reason / Note" value={walletReasonInput} onChange={e=>setWalletReasonInput(e.target.value)} style={{ flex: 2, padding: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '10px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => handleProfileWalletAction('credit')} style={{ flex: 1, padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add Bonus/Refund</button>
                    <button onClick={() => handleProfileWalletAction('debit')} style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>➖ Deduct Money</button>
                  </div>
                </div>

                <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '25px', borderRadius: '16px' }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💬 Send Notification / Message
                  </h4>
                  <textarea 
                    placeholder="Type your message here..." 
                    value={chatMsgInput} 
                    onChange={e => setChatMsgInput(e.target.value)} 
                    style={{ width: '100%', height: '50px', padding: '12px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '10px', outline: 'none', resize: 'none', marginBottom: '15px', boxSizing: 'border-box' }} 
                  />
                  <button onClick={handleSendNotification} style={{ width: '100%', padding: '12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Send Message 🚀
                  </button>
                </div>
              </div>

              <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '20px' }}>📜 Full Transaction Ledger</h3>
              <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>
                      <th style={{padding: '16px 20px'}}>Date & Time</th>
                      <th style={{padding: '16px 20px'}}>Transaction Type</th>
                      <th style={{padding: '16px 20px'}}>Reason & UTR Details</th>
                      <th style={{padding: '16px 20px'}}>Status</th>
                      <th style={{padding: '16px 20px', textAlign: 'right'}}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastCustomerHistory.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No transaction history found.</td></tr>
                    ) : (
                      pastCustomerHistory.map((t:any)=>(
                        <tr key={t.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{padding: '16px 20px', color: '#cbd5e1', fontSize: '14px'}}>
                            {new Date(t.created_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})} <br/>
                            <span style={{fontSize: '12px', color: '#64748b'}}>{new Date(t.created_at).toLocaleTimeString('en-IN')}</span>
                          </td>
                          <td style={{padding: '16px 20px', fontSize: '14px'}}>
                            {t.type === 'credit' ? <span style={{color: '#10b981'}}>Deposit / Refund</span> : <span style={{color: '#ef4444'}}>Withdrawal / Charge</span>}
                          </td>
                          <td style={{padding: '16px 20px', fontSize: '14px', color: '#f8fafc', maxWidth: '300px'}}>{t.reason}</td>
                          <td style={{padding: '16px 20px'}}>
                            {String(t.status).toLowerCase() === 'rejected' ? (
                              <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>REJECTED</span>
                            ) : (
                              <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>COMPLETED</span>
                            )}
                          </td>
                          <td style={{padding: '16px 20px', fontWeight: 'bold', fontSize: '18px', textAlign: 'right', color: t.type==='credit'?'#10b981':'#ef4444'}}>
                            {t.type==='credit'?'+':'-'} ₹{t.amount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {/* 🔥 DASHBOARD OVERVIEW 🔥 */}
              {activeTab === 'dashboard' && (
                <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                  
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ margin: 0, fontSize: '26px', color: '#f1f5f9' }}>Command Center Overview <span style={{fontSize: '14px', color: '#38bdf8', fontWeight: 'normal'}}>({globalStateFilter === 'All' ? 'Global View' : `${globalStateFilter} Data`})</span></h2>
                  </div>

                  {/* Top Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '30px' }}>
                    <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '24px', borderRadius: '16px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#38bdf8' }}></div>
                      <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Pending Orders</h3>
                      <p style={{ fontSize: '38px', color: '#f8fafc', margin: '15px 0 0 0', fontWeight: '800' }}>{activeOrdersCount}</p>
                    </div>
                    
                    <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '24px', borderRadius: '16px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: totalPendingAction > 0 ? '#ef4444' : '#10b981' }}></div>
                      <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Pending Wallet Actions</h3>
                      <p style={{ fontSize: '38px', color: totalPendingAction > 0 ? '#ef4444' : '#10b981', margin: '15px 0 0 0', fontWeight: '800' }}>
                        {totalPendingAction}
                      </p>
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                         <span>Topups: {pendingTopupsCount}</span> | 
                         <span>Withdraws: {pendingWithdrawalsCount}</span> | 
                         <span>Refunds: {pendingOrderRefundsCount + pendingWalletRefundsCount}</span>
                      </div>
                    </div>
                    
                    <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '24px', borderRadius: '16px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#f59e0b' }}></div>
                      <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Total Sale Revenue</h3>
                      <p style={{ fontSize: '38px', color: '#f8fafc', margin: '15px 0 0 0', fontWeight: '800' }}>₹{totalRev.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Admin Income Tracker */}
                  <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '16px', border: '1px solid #10b981', marginBottom: '30px', position: 'relative', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: '#10b981', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          💰 Admin Income (Commission)
                        </h3>
                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Calculated at {commissionRate}% of completed orders.</p>
                      </div>
                      
                      <select 
                        value={incomeFilter} 
                        onChange={(e) => setIncomeFilter(e.target.value)} 
                        style={{ background: '#0f172a', color: 'white', border: '1px solid #10b981', padding: '10px 15px', borderRadius: '8px', outline: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        <option value="today">Today</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="all">All Time</option>
                      </select>
                    </div>
                    <p style={{ fontSize: '48px', color: '#10b981', margin: '20px 0 0 0', fontWeight: '900' }}>
                      ₹{adminIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                  </div>

                  {/* Live Wallet Liabilities */}
                  <h3 style={{ color: '#f8fafc', fontSize: '20px', marginBottom: '20px' }}>🏦 System Liability (Total Wallet Balances)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #38bdf8' }}>
                       <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>👤 Customers Wallet</p>
                       <p style={{ margin: 0, color: '#38bdf8', fontSize: '24px', fontWeight: 'bold' }}>₹{totalCustomerWallet.toLocaleString()}</p>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                       <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>🏪 Shops Wallet</p>
                       <p style={{ margin: 0, color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>₹{totalShopWallet.toLocaleString()}</p>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #a855f7' }}>
                       <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>👷 Labours Wallet</p>
                       <p style={{ margin: 0, color: '#a855f7', fontSize: '24px', fontWeight: 'bold' }}>₹{totalLabourWallet.toLocaleString()}</p>
                    </div>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #ec4899' }}>
                       <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase' }}>🚚 Delivery Boys Wallet</p>
                       <p style={{ margin: 0, color: '#ec4899', fontSize: '24px', fontWeight: 'bold' }}>₹{totalDeliveryWallet.toLocaleString()}</p>
                    </div>
                  </div>

                </div>
              )}

              {/* Other Managers */}
              {activeTab === 'orders' && <OrderManager orders={filteredOrders} customers={filteredCustomers} shops={shops} fetchData={fetchData} />}
              {activeTab === 'wallets' && <WalletManager allWalletTxns={allWalletTxns} customers={filteredCustomers} fetchData={fetchData} />}
              {activeTab === 'labour' && <LabourManager labours={labours} labourRates={labourRates} setLabourRates={setLabourRates} fetchData={fetchData} />}
              {activeTab === 'shop_owners' && <ShopManager shops={shops} fetchData={fetchData} />}
              {activeTab === 'delivery_boys' && <DeliveryBoyManager deliveryBoys={filteredDeliveryBoys} dynamicLocations={dynamicLocations} orders={filteredOrders} fetchData={fetchData} />}
              {activeTab === 'customers' && <CustomerManager customers={filteredCustomers} fetchData={fetchData} openUserDetails={openUserDetails} />}
              {activeTab === 'sub_admins' && <SubAdminManager subAdmins={subAdmins} dynamicLocations={dynamicLocations} fetchData={fetchData} />}
              {activeTab === 'locations' && <LocationManager dynamicLocations={dynamicLocations} fetchData={fetchData} />}
              {activeTab === 'feedback' && <FeedbackManager feedbacks={feedbacks} />}
              {activeTab === 'chats' && <ChatManager chats={chats} customers={filteredCustomers} fetchData={fetchData} />}
              {activeTab === 'settings' && <SettingsManager appSettings={appSettings} setAppSettings={setAppSettings} commissionRate={commissionRate} setCommissionRate={setCommissionRate} deliveryBoyCommRate={deliveryBoyCommRate} setDeliveryBoyCommRate={setDeliveryBoyCommRate} fetchData={fetchData} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}