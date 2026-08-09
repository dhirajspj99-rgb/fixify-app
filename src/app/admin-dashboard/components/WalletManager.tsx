"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function WalletManager() {
  const [walletTxns, setWalletTxns] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [labours, setLabours] = useState<any[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const [pendingOrderRefunds, setPendingOrderRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'shop' | 'labour' | 'delivery' | 'reports'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllUsers, setShowAllLive] = useState(false);

  // Modals & Selections
  const [selectedHistoryUser, setSelectedHistoryUser] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'adjust' | 'master_review' | 'receipt' | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [modalInput, setModalInput] = useState({ amount: '', reason: '', upi: '', utr: '', actionType: 'credit' });

  // 📊 Reports State
  const [reportData, setReportData] = useState({ 
    dailyIn: 0, dailyOut: 0, monthlyIn: 0, monthlyOut: 0,
    inByRole: { customer: 0, shop: 0, labour: 0, delivery_boy: 0 }
  });
  const [reportSelectedRole, setReportSelectedRole] = useState<'customer' | 'shop' | 'labour' | 'delivery' | null>(null);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [txns, custs, shps, labs, dels, orders, labBookings] = await Promise.all([
        supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*'),
        supabase.from('shops').select('*'),
        supabase.from('labours').select('*'),
        supabase.from('delivery_boys').select('*'),
        supabase.from('orders').select('*').ilike('refund_status', '%Pending Admin Refund%'),
        supabase.from('labour_bookings').select('*').ilike('refund_status', '%Pending Admin Refund%')
      ]);

      if (txns.data) {
        setWalletTxns(txns.data);
        calculateReports(txns.data);
      }
      if (custs.data) setCustomers(custs.data.map(c => ({...c, _type: 'Customer', _color: '#a855f7', _icon: '👤'})));
      if (shps.data) setShops(shps.data.map(s => ({...s, _type: 'Shop', _color: '#3b82f6', _icon: '🏪', name: s.shop_name || s.name})));
      if (labs.data) setLabours(labs.data.map(l => ({...l, _type: 'Labour', _color: '#10b981', _icon: '👷'})));
      if (dels.data) setDeliveryBoys(dels.data.map(d => ({...d, _type: 'Delivery', _color: '#f97316', _icon: '🏍️'})));

      const combinedRefunds = [...(orders.data || []), ...(labBookings.data || [])].sort((a, b) => b.id - a.id); 
      setPendingOrderRefunds(combinedRefunds);
    } catch (error) { console.error("Error fetching data:", error); }
    setLoading(false);
  };

  const calculateReports = (txns: any[]) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let dIn = 0, dOut = 0, mIn = 0, mOut = 0;
    let rolesIn: any = { customer: 0, shop: 0, labour: 0, delivery_boy: 0 };

    txns.forEach(t => {
      if (t.status !== 'completed') return;
      const tTime = new Date(t.created_at).getTime();
      const isDebit = String(t.type).includes('debit') || String(t.type).includes('withdraw');
      const amt = Number(t.amount) || 0;
      const role = String(t.user_type || 'customer').toLowerCase();

      if (tTime >= startOfMonth) { 
        if (isDebit) mOut += amt; 
        else { mIn += amt; if(rolesIn[role] !== undefined) rolesIn[role] += amt; } 
      }
      if (tTime >= startOfToday) { 
        if (isDebit) dOut += amt; 
        else dIn += amt; 
      }
    });

    setReportData({ dailyIn: dIn, dailyOut: dOut, monthlyIn: mIn, monthlyOut: mOut, inByRole: rolesIn });
  };

  const getUserFromTxn = (txn: any) => {
    const list = [...customers, ...shops, ...labours, ...deliveryBoys];
    const id = txn.customer_id || txn.shop_id || txn.labour_id || txn.delivery_id;
    return list.find(u => u.id === id || u.phone === id) || { id: id, name: 'Unknown', _type: txn.user_type, _icon: '❓', _color: '#64748b', phone: '' };
  };

  const pendingTxns = walletTxns.filter(t => t.status === 'pending');
  const allUsers = [...customers, ...shops, ...labours, ...deliveryBoys];
  let filteredUsers = activeTab === 'all' ? allUsers : allUsers.filter(u => u._type.toLowerCase() === activeTab);
  
  if (searchQuery) {
    filteredUsers = filteredUsers.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.phone || '').includes(searchQuery));
  } else if (!showAllUsers) {
    filteredUsers = filteredUsers.slice(0, 8); 
  }

  const userSpecificTxns = selectedHistoryUser ? walletTxns.filter(t => {
    const u = getUserFromTxn(t);
    return u.id === selectedHistoryUser.id && (u._type || '').toLowerCase() === (selectedHistoryUser._type || '').toLowerCase();
  }) : [];

  const reportFilteredTxns = walletTxns.filter(t => {
    if (t.status !== 'completed') return false;
    if (!reportSelectedRole) return false;
    const uType = String(t.user_type || '').toLowerCase();
    if (reportSelectedRole === 'delivery') return uType.includes('delivery');
    return uType === reportSelectedRole;
  });

  const getParsedItems = (order: any) => {
    let items = order.items || order.cart_items || order.product_details || [];
    if (typeof items === 'string') { try { items = JSON.parse(items); } catch(e) { items = []; } }
    return Array.isArray(items) ? items : [];
  };

  const downloadCSV = (txnsToDownload: any[], title: string) => {
    if (txnsToDownload.length === 0) return alert("No data to download!");
    const headers = ['Date', 'Time', 'User Type', 'Name', 'Phone', 'Transaction Type', 'Amount (Rs)', 'Status', 'Details/UTR'];
    const rows = txnsToDownload.map(t => {
      const u = getUserFromTxn(t);
      const d = new Date(t.created_at);
      return [ d.toLocaleDateString(), d.toLocaleTimeString(), u._type, `"${u.name}"`, u.phone, t.type, t.amount, t.status, `"${t.reason.replace(/"/g, '""')}"` ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}_${Date.now()}.csv`;
    link.click();
  };

  const handleAdjustBalance = async () => {
    if (!modalInput.amount || !modalInput.reason) return alert("Please enter amount and reason!");
    const amt = Number(modalInput.amount);
    const isCredit = modalInput.actionType === 'credit';
    if (!isCredit && !window.confirm(`⚠️ WARNING: DEDUCT ₹${amt} from ${selectedUser.name}?`)) return;

    const newBal = isCredit ? (selectedUser.balance || 0) + amt : (selectedUser.balance || 0) - amt;
    const tName = selectedUser._type === 'Customer' ? 'customers' : selectedUser._type === 'Shop' ? 'shops' : selectedUser._type === 'Labour' ? 'labours' : 'delivery_boys';
    const idField = selectedUser._type === 'Customer' ? 'customer_id' : selectedUser._type === 'Shop' ? 'shop_id' : selectedUser._type === 'Labour' ? 'labour_id' : 'delivery_id';

    try {
      await supabase.from(tName).update({ balance: newBal }).eq('id', selectedUser.id);
      await supabase.from('wallet_transactions').insert({ [idField]: selectedUser.id, user_type: selectedUser._type.toLowerCase(), amount: amt, type: modalInput.actionType, status: 'completed', reason: `Admin Action: ${modalInput.reason}` });
      alert("✅ Wallet Updated Successfully!");
      setActiveModal(null); fetchAllData();
    } catch (e:any) { alert("Error: " + e.message); }
  };

  const handleProcessWithdrawal = async (approve: boolean) => {
    const user = getUserFromTxn(selectedTxn);
    const tName = user._type === 'Customer' ? 'customers' : user._type === 'Shop' ? 'shops' : user._type === 'Labour' ? 'labours' : 'delivery_boys';

    try {
      if (approve) {
        if (!modalInput.utr && String(selectedTxn.type).includes('debit')) return alert("Enter Bank UTR Number to confirm payment!");
        await supabase.from('wallet_transactions').update({ status: 'completed', reason: `${selectedTxn.reason} | Bank UTR: ${modalInput.utr}` }).eq('id', selectedTxn.id);
        alert("✅ Withdrawal Sent & Marked as Paid!");
      } else {
        if (!modalInput.reason) return alert("Enter reason for rejection!");
        if (String(selectedTxn.type).includes('debit')) {
            const newBal = (user.balance || 0) + selectedTxn.amount; // Refund
            await supabase.from(tName).update({ balance: newBal }).eq('id', user.id);
        }
        await supabase.from('wallet_transactions').update({ status: 'rejected', reason: `Rejected: ${modalInput.reason}` }).eq('id', selectedTxn.id);
        alert("❌ Rejected & Amount Refunded to User Wallet!");
      }
      setActiveModal(null); fetchAllData();
    } catch(e:any) { alert("Error: " + e.message); }
  };

  const processOrderRefund = async () => {
      const order = selectedOrder;
      const cName = order.customer_name || order.name || 'Customer';
      if(!window.confirm(`Mark refund as settled for ${cName}?`)) return;
      
      const tableName = (order.type || '').toLowerCase().includes('labour') ? 'labour_bookings' : 'orders';
      try {
        const custPhone = order.user_phone || order.phone || order.mobile;
        const targetCust = customers.find(c => c.id === order.customer_id || c.phone === custPhone);
        
        if (targetCust) {
          const newBal = (targetCust.balance || 0) + Number(order.total_amount);
          await supabase.from('customers').update({ balance: newBal }).eq('id', targetCust.id);
          await supabase.from('wallet_transactions').insert({ customer_id: targetCust.id, user_type: 'customer', amount: Number(order.total_amount), type: 'refund', status: 'completed', reason: `Refund for Cancelled/Returned Order #${order.order_no || order.id}` });
        }

        await supabase.from(tableName).update({ refund_status: 'Refund Settled' }).eq('id', order.id);
        alert("✅ Product Refund Processed & Wallet Credited!");
        setActiveModal(null); fetchAllData();
      } catch (err: any) { alert("Error: " + err.message); }
  };

  const openMasterReview = (type: 'withdraw'|'refund', item: any) => {
    if (type === 'withdraw') {
      const u = getUserFromTxn(item);
      const isDebit = String(item.type).includes('debit') || String(item.type).includes('withdraw');
      const upiPattern = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/;
      const extractedUPI = item.reason?.match(upiPattern)?.[0];
      const finalUpi = u.upi_id || u.upi || extractedUPI || '';

      setSelectedTxn(item); setSelectedOrder(null); setSelectedHistoryUser(u);
      setModalInput({ amount: '', reason: '', upi: finalUpi, utr: '', actionType: isDebit ? 'debit' : 'credit' });
    } else {
      const custPhone = item.user_phone || item.phone || item.mobile;
      const cust = customers.find(c => c.id === item.customer_id || c.phone === custPhone) || { name: item.customer_name || 'Customer', phone: custPhone, _type: 'Customer', _icon: '👤', _color: '#a855f7' };
      
      setSelectedOrder(item); setSelectedTxn(null); setSelectedHistoryUser(cust);
    }
    setActiveModal('master_review');
  };

  if (loading) return <div style={{ color: '#38bdf8', textAlign: 'center', marginTop: '50px', fontSize: '20px', fontWeight: 'bold' }}>🔄 Loading Ledger Hub...</div>;

  return (
    <div className="fade-in" style={{ paddingBottom: '50px', fontFamily: '"Inter", sans-serif', color: '#f8fafc' }}>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-text { color: black !important; }
        }
      `}</style>

      {/* 🚀 HEADER & TABS */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#38bdf8' }}>💳 Master Wallet Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>Complete Financial Control & Reports.</p>
        </div>
        <button onClick={fetchAllData} style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 Refresh Data</button>
      </div>

      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>
        {['all', 'reports', 'customer', 'shop', 'labour', 'delivery'].map(tab => (
          <button key={tab} onClick={() => {setActiveTab(tab as any); setShowAllLive(false); setSelectedHistoryUser(null); setReportSelectedRole(null);}} style={{ padding: '10px 18px', background: activeTab === tab ? '#38bdf8' : 'transparent', color: activeTab === tab ? '#000' : '#94a3b8', border: `1px solid ${activeTab === tab ? '#38bdf8' : '#334155'}`, borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize' }}>
            {tab === 'all' ? '🌐 Dashboard' : tab === 'reports' ? '📊 Reports' : `${tab}s`}
          </button>
        ))}
      </div>

      {/* ======================= 📊 REPORTS TAB VIEW ======================= */}
      {activeTab === 'reports' && (
        <div className="fade-in" style={{ marginBottom: '30px' }}>
          
          <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end' }}>
             <button onClick={() => downloadCSV(reportSelectedRole ? reportFilteredTxns : walletTxns.filter(t => t.status === 'completed'), reportSelectedRole ? `${reportSelectedRole}_Financial_Report` : 'Detailed_Financial_Report')} style={{ background: '#10b981', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📥 Download Excel</button>
             <button onClick={() => window.print()} style={{ background: '#38bdf8', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Print PDF Report</button>
          </div>

          <h3 className="print-text" style={{ color: 'white', margin: '0 0 15px 0' }}>📊 Daily & Monthly Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>📈 TODAY (Money In)</div>
              <div className="print-text" style={{ fontSize: '30px', fontWeight: '900', color: 'white' }}>₹{reportData.dailyIn.toLocaleString()}</div>
            </div>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>📉 TODAY (Withdrawals Out)</div>
              <div className="print-text" style={{ fontSize: '30px', fontWeight: '900', color: 'white' }}>₹{reportData.dailyOut.toLocaleString()}</div>
            </div>
          </div>

          <h3 className="print-text" style={{ color: '#38bdf8', margin: '0 0 15px 0', borderTop: '1px solid #334155', paddingTop: '20px' }}>🏢 Department-Wise Income (Click to View History)</h3>
          
          {/* 🔥 FIXED: NO CONFLICTING SHORTHAND/LONGHAND STYLES 🔥 */}
          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            
            <div onClick={() => setReportSelectedRole('customer')} style={{ cursor: 'pointer', background: '#1e293b', padding: '15px', borderRadius: '12px', borderTop: reportSelectedRole === 'customer' ? '2px solid #a855f7' : '1px solid #334155', borderRight: reportSelectedRole === 'customer' ? '2px solid #a855f7' : '1px solid #334155', borderBottom: reportSelectedRole === 'customer' ? '2px solid #a855f7' : '1px solid #334155', borderLeft: '4px solid #a855f7', transition: '0.2s', transform: reportSelectedRole === 'customer' ? 'scale(1.02)' : 'none' }}>
              <div style={{ color: '#a855f7', fontSize: '13px', fontWeight: 'bold' }}>👤 Customers</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: '5px 0' }}>₹{reportData.inByRole.customer.toLocaleString()}</div>
            </div>
            
            <div onClick={() => setReportSelectedRole('shop')} style={{ cursor: 'pointer', background: '#1e293b', padding: '15px', borderRadius: '12px', borderTop: reportSelectedRole === 'shop' ? '2px solid #3b82f6' : '1px solid #334155', borderRight: reportSelectedRole === 'shop' ? '2px solid #3b82f6' : '1px solid #334155', borderBottom: reportSelectedRole === 'shop' ? '2px solid #3b82f6' : '1px solid #334155', borderLeft: '4px solid #3b82f6', transition: '0.2s', transform: reportSelectedRole === 'shop' ? 'scale(1.02)' : 'none' }}>
              <div style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 'bold' }}>🏪 Shops</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: '5px 0' }}>₹{reportData.inByRole.shop.toLocaleString()}</div>
            </div>
            
            <div onClick={() => setReportSelectedRole('labour')} style={{ cursor: 'pointer', background: '#1e293b', padding: '15px', borderRadius: '12px', borderTop: reportSelectedRole === 'labour' ? '2px solid #10b981' : '1px solid #334155', borderRight: reportSelectedRole === 'labour' ? '2px solid #10b981' : '1px solid #334155', borderBottom: reportSelectedRole === 'labour' ? '2px solid #10b981' : '1px solid #334155', borderLeft: '4px solid #10b981', transition: '0.2s', transform: reportSelectedRole === 'labour' ? 'scale(1.02)' : 'none' }}>
              <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>👷 Labours</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: '5px 0' }}>₹{reportData.inByRole.labour.toLocaleString()}</div>
            </div>
            
            <div onClick={() => setReportSelectedRole('delivery')} style={{ cursor: 'pointer', background: '#1e293b', padding: '15px', borderRadius: '12px', borderTop: reportSelectedRole === 'delivery' ? '2px solid #f97316' : '1px solid #334155', borderRight: reportSelectedRole === 'delivery' ? '2px solid #f97316' : '1px solid #334155', borderBottom: reportSelectedRole === 'delivery' ? '2px solid #f97316' : '1px solid #334155', borderLeft: '4px solid #f97316', transition: '0.2s', transform: reportSelectedRole === 'delivery' ? 'scale(1.02)' : 'none' }}>
              <div style={{ color: '#f97316', fontSize: '13px', fontWeight: 'bold' }}>🏍️ Delivery Boys</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: '5px 0' }}>₹{reportData.inByRole.delivery_boy.toLocaleString()}</div>
            </div>

          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.5)' }}>
              <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>📅 THIS MONTH (Total Money In)</div>
              <div className="print-text" style={{ fontSize: '36px', fontWeight: '900', color: 'white' }}>₹{reportData.monthlyIn.toLocaleString()}</div>
            </div>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.5)' }}>
              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>📅 THIS MONTH (Total Withdrawals)</div>
              <div className="print-text" style={{ fontSize: '36px', fontWeight: '900', color: 'white' }}>₹{reportData.monthlyOut.toLocaleString()}</div>
            </div>
          </div>

          {/* 🔥 SMART HISTORY VIEW 🔥 */}
          {!reportSelectedRole ? (
            <div className="no-print" style={{ textAlign: 'center', padding: '40px', background: '#0f172a', borderRadius: '16px', border: '1px dashed #334155', color: '#94a3b8' }}>
               <div style={{ fontSize: '35px', marginBottom: '10px' }}>👆</div>
               Click on any department card above (Customer, Shop, etc.) to view its detailed transaction history.
            </div>
          ) : (
            <div className="fade-in">
              <h3 className="print-text" style={{ color: '#38bdf8', margin: '0 0 15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📋 Detailed History: <span style={{textTransform: 'capitalize'}}>{reportSelectedRole}</span></span>
                <button className="no-print" onClick={() => setReportSelectedRole(null)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>Close History</button>
              </h3>
              <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #334155', overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                      <th style={{padding: '12px'}}>Date & Time</th>
                      <th style={{padding: '12px'}}>User Name</th>
                      <th style={{padding: '12px'}}>Transaction Details</th>
                      <th style={{padding: '12px', textAlign: 'right'}}>Amount</th>
                    </tr>
                  </thead>
                  <tbody className="print-text">
                    {reportFilteredTxns.length === 0 ? <tr><td colSpan={4} style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>No completed transactions found for this role.</td></tr> : 
                      reportFilteredTxns.slice(0, 100).map(txn => {
                      const u = getUserFromTxn(txn);
                      const isCredit = String(txn.type).includes('credit') || String(txn.type).includes('refund') || String(txn.type).includes('add');
                      return (
                        <tr key={txn.id} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{padding: '12px'}}>{new Date(txn.created_at).toLocaleString()}</td>
                          <td style={{padding: '12px', fontWeight: 'bold', color: 'white'}}>{u.name}</td>
                          <td style={{padding: '12px', maxWidth: '250px'}}>{txn.reason}</td>
                          <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: isCredit ? '#10b981' : '#ef4444', fontSize: '14px'}}>
                            {isCredit ? '+' : '-'} ₹{txn.amount}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= 🚨 ACTION CENTER (Visible in All tab) ======================= */}
      {activeTab === 'all' && (pendingTxns.length > 0 || pendingOrderRefunds.length > 0) && (
        <div className="no-print" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '16px', marginBottom: '30px', borderLeft: '5px solid #eab308' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#eab308', display: 'flex', alignItems: 'center', gap: '8px' }}>⚡ Action Center (Pending Approvals)</h3>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
            
            {pendingOrderRefunds.map(order => {
              const custPhone = order.user_phone || order.phone || order.mobile;
              const cust = customers.find(c => c.id === order.customer_id || c.phone === custPhone) || { name: order.customer_name || 'Customer' };
              
              return (
                <div key={`ref_${order.id}`} style={{ minWidth: '300px', background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.5)' }}>
                  <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold', marginBottom: '5px' }}>🛍️ Order Cancel / Refund</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{cust.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Order #{order.order_no || order.id}</div>
                  <div style={{ color: '#10b981', fontSize: '24px', fontWeight: '900', margin: '10px 0' }}>₹{order.total_amount}</div>
                  <button style={{ width: '100%', padding: '10px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => openMasterReview('refund', order)}>🔍 Review & Process Refund</button>
                </div>
              );
            })}

            {pendingTxns.map(txn => {
              const u = getUserFromTxn(txn);
              const isDebit = String(txn.type).includes('debit') || String(txn.type).includes('withdraw');
              const color = isDebit ? '#ef4444' : '#10b981';
              return (
                <div key={txn.id} style={{ minWidth: '280px', background: '#0f172a', padding: '15px', borderRadius: '12px', border: `1px solid ${color}60` }}>
                  <div style={{ fontSize: '11px', color: u._color, fontWeight: 'bold', marginBottom: '5px' }}>{u._icon} {u._type} {isDebit ? 'Withdrawal' : 'Top-up'}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{u.name}</div>
                  <div style={{ color: color, fontSize: '20px', fontWeight: '900', margin: '5px 0' }}>{isDebit ? '-' : '+'}₹{txn.amount}</div>
                  <button style={{ width: '100%', marginTop: '10px', padding: '10px', background: color, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => openMasterReview('withdraw', txn)}>🔍 Review Request</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= 👥 USER DIRECTORY ======================= */}
      {activeTab !== 'reports' && (
        <div className="no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc' }}>👥 User Directory & Manual Controls</h3>
            <input type="text" placeholder="🔍 Search Name/Phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ minWidth: '250px', padding: '10px 15px', borderRadius: '20px', border: '1px solid #334155', background: '#1e293b', color: 'white', outline: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            {filteredUsers.length === 0 ? <p style={{ color: '#64748b' }}>No users found.</p> : filteredUsers.map(u => {
              const isSelected = selectedHistoryUser?.id === u.id && selectedHistoryUser?._type === u._type;
              
              return (
              <div key={`${u._type}_${u.id}`} onClick={() => setSelectedHistoryUser(u)} style={{ cursor: 'pointer', background: '#0f172a', padding: '15px', borderRadius: '16px', border: isSelected ? '2px solid #38bdf8' : `1px solid ${u._color}40`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: '0.2s', boxShadow: isSelected ? '0 10px 20px rgba(56, 189, 248, 0.1)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: u._color, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{u._icon} {u._type}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f8fafc', marginTop: '4px' }}>{u.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{u.phone || u.owner_phone}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: (Number(u.balance)||0) < 0 ? '#ef4444' : '#10b981', fontSize: '20px', fontWeight: '900' }}>₹{Number(u.balance||0).toLocaleString()}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedUser(u); setModalInput({...modalInput, actionType: 'credit'}); setActiveModal('adjust'); }} style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add</button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedUser(u); setModalInput({...modalInput, actionType: 'debit'}); setActiveModal('adjust'); }} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>- Deduct (Cut)</button>
                </div>
              </div>
            )})}
          </div>
          {!searchQuery && !showAllUsers && activeTab !== 'all' && (
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <button onClick={() => setShowAllLive(true)} style={{ background: '#334155', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>👁️ Show All Users in this Category</button>
            </div>
          )}
        </div>
      )}

      {/* ======================= 📜 SMART TRANSACTION HISTORY (Only for Selected User) ======================= */}
      {activeTab !== 'reports' && (
        <div className="no-print">
          {!selectedHistoryUser ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#0f172a', borderRadius: '16px', border: '1px dashed #334155', color: '#94a3b8' }}>
              <div style={{ fontSize: '35px', marginBottom: '10px' }}>👆</div>
              Click on any User Card above to view their personal transaction history.
            </div>
          ) : (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 15px 0' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>📜 History: {selectedHistoryUser.name} ({selectedHistoryUser._type})</span>
                  <button onClick={() => setSelectedHistoryUser(null)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Close History</button>
                </h3>
                <button onClick={() => downloadCSV(userSpecificTxns, `${selectedHistoryUser.name}_Wallet_History`)} style={{ background: '#10b981', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                  📥 Download
                </button>
              </div>
              
              <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #334155', overflowX: 'auto', minHeight: '150px' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                      <th style={{padding: '15px'}}>Date & Time</th>
                      <th style={{padding: '15px'}}>Transaction Details / UTR</th>
                      <th style={{padding: '15px', textAlign: 'right'}}>Amount & Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSpecificTxns.length === 0 ? (
                      <tr><td colSpan={3} style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>No transactions found for this user.</td></tr>
                    ) : (
                      userSpecificTxns.map(txn => {
                        const isCredit = String(txn.type).includes('credit') || String(txn.type).includes('refund') || String(txn.type).includes('add');
                        return (
                          <tr key={txn.id} style={{ borderBottom: '1px solid #1e293b', cursor: 'pointer' }} onClick={() => {setSelectedTxn(txn); setActiveModal('receipt');}}>
                            <td style={{padding: '15px', color: '#94a3b8', whiteSpace: 'nowrap'}}>
                              <div style={{ color: 'white', fontWeight: 'bold' }}>{new Date(txn.created_at).toLocaleDateString()}</div>
                              <div style={{ fontSize: '10px' }}>{new Date(txn.created_at).toLocaleTimeString()}</div>
                            </td>
                            <td style={{padding: '15px', color: '#cbd5e1', maxWidth: '300px', lineHeight: '1.4'}}>{txn.reason}</td>
                            <td style={{padding: '15px', textAlign: 'right', whiteSpace: 'nowrap'}}>
                              <div style={{ fontWeight: '900', color: isCredit ? '#10b981' : '#ef4444', fontSize: '16px' }}>{isCredit ? '+' : '-'} ₹{txn.amount}</div>
                              <span style={{ fontSize: '9px', background: String(txn.status).includes('reject') ? '#ef444420' : String(txn.status).includes('pending') ? '#f59e0b20' : '#10b98120', color: String(txn.status).includes('reject') ? '#ef4444' : String(txn.status).includes('pending') ? '#f59e0b' : '#10b981', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '4px', display: 'inline-block' }}>{txn.status}</span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= SUPER MASTER MODALS ======================= */}
      
      {activeModal === 'adjust' && selectedUser && (
        <div style={modalOverlay}>
          <div style={{...modalContent, maxWidth: '400px', borderTop: `4px solid ${modalInput.actionType === 'credit' ? '#10b981' : '#ef4444'}`}}>
            <button onClick={() => setActiveModal(null)} style={closeBtn}>&times;</button>
            <h3 style={{ margin: '0 0 20px 0', color: 'white' }}>{modalInput.actionType === 'credit' ? '➕ Add Balance' : '✂️ Deduct (Penalty / Cut)'}</h3>
            
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{color: '#94a3b8', fontSize: '12px'}}>{selectedUser._icon} {selectedUser.name} ({selectedUser._type})</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginTop: '5px' }}>₹{selectedUser.balance || 0}</div>
            </div>

            <label style={lblStyle}>Amount (₹)</label>
            <input type="number" placeholder="Enter Amount" value={modalInput.amount} onChange={e=>setModalInput({...modalInput, amount: e.target.value})} style={inpStyle} />
            
            <label style={lblStyle}>Reason for {modalInput.actionType === 'credit' ? 'Addition' : 'Deduction'} (Mandatory)</label>
            <input type="text" placeholder={modalInput.actionType === 'credit' ? "e.g. Bonus, Cash Added" : "e.g. Fraud Penalty, Wrong Item"} value={modalInput.reason} onChange={e=>setModalInput({...modalInput, reason: e.target.value})} style={inpStyle} />
            
            <button onClick={handleAdjustBalance} style={{...btnStyle, background: modalInput.actionType === 'credit' ? '#10b981' : '#ef4444', marginTop: '10px'}}>{modalInput.actionType === 'credit' ? 'Confirm Add Money' : '✂️ Confirm Cut Money'}</button>
          </div>
        </div>
      )}

      {activeModal === 'master_review' && (selectedTxn || selectedOrder) && selectedHistoryUser && (() => {
        const isOrder = !!selectedOrder;
        const u = selectedHistoryUser;
        const txnsForUser = userSpecificTxns; 

        return (
          <div style={modalOverlay}>
            <div style={{ background: '#0f172a', width: '100%', maxWidth: '1000px', height: '90vh', borderRadius: '16px', border: '1px solid #38bdf8', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1e293b', background: '#1e293b' }}>
                <h2 style={{ margin: 0, color: 'white', fontSize: '20px' }}>{isOrder ? '🛍️ Order Refund Review' : '💸 Wallet Request Review'}</h2>
                <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '28px', cursor: 'pointer' }}>&times;</button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, overflowY: 'auto' }}>
                <div style={{ flex: '1 1 400px', padding: '20px', borderRight: '1px solid #1e293b' }}>
                  
                  <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', borderLeft: `4px solid ${u._color}`, marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', color: u._color, fontWeight: 'bold' }}>{u._icon} {u._type} Profile</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: '5px 0' }}>{u.name}</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>📞 {u.phone || u.owner_phone}</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: (u.balance||0) < 0 ? '#ef4444' : '#10b981', marginTop: '10px' }}>Wallet Balance: ₹{u.balance || 0}</div>
                  </div>

                  {isOrder ? (
                    <div>
                      <h4 style={{ color: '#a855f7', marginBottom: '10px' }}>A to Z Product Details</h4>
                      <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', border: '1px solid #334155' }}>
                        {getParsedItems(selectedOrder).length === 0 ? <p style={{color:'#94a3b8', fontSize:'13px'}}>No specific items found. Full order refund.</p> : 
                          getParsedItems(selectedOrder).map((item: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
                            <div style={{ color: 'white' }}>{item.name || item.product_name} <span style={{color: '#94a3b8'}}>x{item.qty || 1}</span></div>
                            <div style={{ color: '#10b981', fontWeight: 'bold' }}>₹{item.price * (item.qty || 1)}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '15px', borderRadius: '10px', border: '1px dashed #a855f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ color: '#d8b4fe', fontWeight: 'bold' }}>Total Refund Amount:</span>
                        <span style={{ color: '#10b981', fontSize: '24px', fontWeight: '900' }}>₹{selectedOrder.total_amount}</span>
                      </div>
                      <button onClick={processOrderRefund} style={{...btnStyle, background: '#a855f7'}}>✅ Process & Refund to Customer</button>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ color: modalInput.actionType === 'debit' ? '#ef4444' : '#10b981', marginBottom: '10px' }}>{modalInput.actionType === 'debit' ? 'Withdrawal Payment Processing' : 'Top-up Approval'}</h4>
                      <div style={{ fontSize: '36px', fontWeight: '900', textAlign: 'center', marginBottom: '20px', color: modalInput.actionType === 'debit' ? '#ef4444' : '#10b981' }}>₹{selectedTxn.amount}</div>

                      {modalInput.actionType === 'debit' ? (
                        <>
                          <div style={{ background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
                            {modalInput.upi ? (
                              <>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${modalInput.upi}&pn=User&am=${selectedTxn.amount}&cu=INR`} alt="QR" style={{ width: '150px' }} />
                                <p style={{ color: '#0f172a', margin: '10px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>UPI ID: {modalInput.upi}</p>
                                <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '11px' }}>Scan from PhonePe/GPay to pay</p>
                              </>
                            ) : <p style={{ color: '#ef4444', fontWeight: 'bold' }}>No UPI ID Found. Manually transfer to bank.</p>}
                          </div>
                          
                          <label style={lblStyle}>Enter Bank UTR No. (Empty Box)</label>
                          <input type="text" placeholder="Type Bank UTR No. here..." value={modalInput.utr} onChange={e=>setModalInput({...modalInput, utr: e.target.value})} style={{...inpStyle, borderColor: '#10b981', background: '#1e293b'}} />
                          <button onClick={() => handleProcessWithdrawal(true)} style={{...btnStyle, background: '#10b981', marginBottom: '15px'}}>✅ Confirm Paid & Save UTR</button>
                          
                          <div style={{ borderTop: '1px dashed #334155', margin: '15px 0' }}></div>
                          <label style={lblStyle}>Or enter Reason to Reject</label>
                          <input type="text" placeholder="Why are you rejecting?" value={modalInput.reason} onChange={e=>setModalInput({...modalInput, reason: e.target.value})} style={{...inpStyle, borderColor: '#ef4444', background: '#1e293b'}} />
                          <button onClick={() => handleProcessWithdrawal(false)} style={{...btnStyle, background: 'transparent', color: '#ef4444', border: '1px solid #ef4444'}}>❌ Reject & Auto-Refund to Wallet</button>
                        </>
                      ) : (
                        <>
                          <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #334155' }}>
                            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}>Request Note:</div>
                            <div style={{ color: 'white', fontSize: '14px' }}>{selectedTxn.reason}</div>
                          </div>
                          <button onClick={() => handleProcessWithdrawal(true)} style={{...btnStyle, background: '#10b981', marginBottom: '15px'}}>✅ Approve Top-up</button>
                          <input type="text" placeholder="Reject Reason" value={modalInput.reason} onChange={e=>setModalInput({...modalInput, reason: e.target.value})} style={{...inpStyle, borderColor: '#ef4444'}} />
                          <button onClick={() => handleProcessWithdrawal(false)} style={{...btnStyle, background: 'transparent', color: '#ef4444', border: '1px solid #ef4444'}}>❌ Reject Request</button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ flex: '1 1 400px', padding: '20px', background: '#020617' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>📜 Past Passbook History</h4>
                  {txnsForUser.length === 0 ? <p style={{ color: '#64748b', fontSize: '13px' }}>No previous transactions found for this user.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {txnsForUser.map(t => {
                        const isC = String(t.type).includes('credit') || String(t.type).includes('refund') || String(t.type).includes('add');
                        return (
                          <div key={t.id} style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${isC ? '#10b981' : '#ef4444'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(t.created_at).toLocaleString()}</span>
                              <span style={{ fontSize: '14px', fontWeight: 'bold', color: isC ? '#10b981' : '#ef4444' }}>{isC ? '+' : '-'} ₹{t.amount}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>{t.reason}</div>
                            <div style={{ fontSize: '10px', color: t.status === 'completed' ? '#10b981' : t.status==='rejected' ? '#ef4444' : '#f59e0b', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Status: {t.status}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeModal === 'receipt' && selectedTxn && (() => {
        const u = getUserFromTxn(selectedTxn);
        const isCredit = String(selectedTxn.type).includes('credit') || String(selectedTxn.type).includes('refund') || String(selectedTxn.type).includes('add');
        return (
          <div style={modalOverlay}>
            <div style={{...modalContent, textAlign: 'center', background: '#0f172a', border: '1px solid #334155'}}>
              <button onClick={() => setActiveModal(null)} style={closeBtn}>&times;</button>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>{isCredit ? '✅' : '💸'}</div>
              <h2 style={{ margin: '0 0 5px 0', color: 'white', fontSize: '32px' }}>{isCredit ? '+' : '-'} ₹{selectedTxn.amount}</h2>
              <p style={{ color: String(selectedTxn.status).includes('reject') ? '#ef4444' : String(selectedTxn.status).includes('pending') ? '#f59e0b' : '#10b981', fontWeight: 'bold', margin: '0 0 25px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>{selectedTxn.status}</p>
              
              <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'left', fontSize: '14px', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{color: '#94a3b8'}}>User</span> <span style={{fontWeight: 'bold', color: 'white'}}>{u.name}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{color: '#94a3b8'}}>Date</span> <span style={{fontWeight: 'bold', color: 'white'}}>{new Date(selectedTxn.created_at).toLocaleDateString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{color: '#94a3b8'}}>Type</span> <span style={{fontWeight: 'bold', color: 'white', textTransform: 'capitalize'}}>{selectedTxn.type}</span></div>
                <div style={{ borderTop: '1px dashed #334155', paddingTop: '12px', marginTop: '12px' }}><span style={{color: '#94a3b8'}}>Details / UTR</span> <br/><span style={{display: 'block', marginTop: '5px', lineHeight: '1.5', color: '#38bdf8', fontWeight: 'bold'}}>{selectedTxn.reason}</span></div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

// SHARED STYLES
const modalOverlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(5px)' };
const modalContent = { background: '#1e293b', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '30px', position: 'relative' as const, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' };
const closeBtn = { position: 'absolute' as const, top: '15px', right: '20px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer' };
const inpStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' as const, fontSize: '15px' };
const lblStyle = { color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px', fontWeight: 'bold' };
const btnStyle = { width: '100%', padding: '14px', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.2s' };