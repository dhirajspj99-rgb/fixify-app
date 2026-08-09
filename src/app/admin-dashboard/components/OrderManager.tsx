"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OrderManager({ orders, customers, shops, fetchData }: any) {
  const [orderView, setOrderView] = useState('pending'); // pending, completed, returns

  const pendingOrders = orders.filter((o: any) => !['completed', 'delivered', 'refunded', 'cancelled', 'return requested', 'returned'].includes(o.status?.toLowerCase()));
  const completedOrders = orders.filter((o: any) => ['completed', 'delivered'].includes(o.status?.toLowerCase()));
  const returnedOrders = orders.filter((o: any) => ['return requested', 'cancelled', 'returned', 'refunded'].includes(o.status?.toLowerCase()));

  let displayOrders = orderView === 'pending' ? pendingOrders : orderView === 'completed' ? completedOrders : returnedOrders;

  const handleProcessRefund = async (order: any) => {
    const cust = customers.find((c: any) => c.phone === (order.user_phone || order.phone));
    if (!cust) return alert("❌ Error: Ye order GUEST (unregistered) user ka hai. Inka account database mein nahi hota, inko manual (PhonePe/GPay) se refund karein.");

    const amtStr = prompt(`Order Total: ₹${order.total_amount}\nKitna amount wallet mein refund karna hai?`, order.total_amount);
    if (!amtStr) return;
    const amt = Number(amtStr);

    if (!window.confirm(`Pakka ₹${amt} ${cust.name} ke wallet me refund karein?`)) return;

    try {
      const { error } = await supabase.rpc('process_wallet_transaction', {
        p_customer_id: cust.id, p_amount: amt, p_type: 'credit', p_reason: `Refund for Cancelled/Returned Order #${order.id}`
      });
      if (error) throw error;

      await supabase.from('orders').update({ status: 'Refunded', payment_status: 'Refunded to Wallet' }).eq('id', order.id);
      alert("✅ Refund successfully processed directly to Customer's Wallet!");
      fetchData();
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const getShopName = (id: any) => { const s = shops.find((x:any) => x.id == id); return s ? s.name : 'Unknown'; };

  return (
    <div className="fade-in">
      <h2 style={{ margin: '0 0 20px 0', color: '#38bdf8' }}>📦 Advanced Order Management</h2>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button onClick={() => setOrderView('pending')} style={{...btnStyle, background: orderView==='pending' ? '#38bdf8' : '#1e293b'}}>🚀 Pending ({pendingOrders.length})</button>
        <button onClick={() => setOrderView('completed')} style={{...btnStyle, background: orderView==='completed' ? '#10b981' : '#1e293b'}}>✅ Completed ({completedOrders.length})</button>
        <button onClick={() => setOrderView('returns')} style={{...btnStyle, background: orderView==='returns' ? '#ef4444' : '#1e293b'}}>🔄 Returns & Refunds ({returnedOrders.length})</button>
      </div>

      <div style={{ overflowX: 'auto', background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
          <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}><th style={{padding:'15px'}}>ID & Date</th><th style={{padding:'15px'}}>Customer & Shop</th><th style={{padding:'15px'}}>Amount</th><th style={{padding:'15px'}}>Status</th><th style={{padding:'15px'}}>Actions</th></tr></thead>
          <tbody>
            {displayOrders.map((o: any) => (
              <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{padding:'15px'}}><strong>#{o.order_no || o.id}</strong><br/><span style={{fontSize:'12px', color:'#94a3b8'}}>{new Date(o.created_at).toLocaleDateString()}</span></td>
                <td style={{padding:'15px'}}>{o.customer_name || o.phone}<br/><span style={{fontSize:'11px', color:'#38bdf8'}}>🏪 {getShopName(o.shop_id)}</span></td>
                <td style={{padding:'15px', fontWeight:'bold'}}>₹{o.total_amount}</td>
                <td style={{padding:'15px'}}><span style={{background:'rgba(255,255,255,0.1)', padding:'4px 8px', borderRadius:'6px', fontSize:'12px'}}>{o.status}</span></td>
                <td style={{padding:'15px'}}>
                  {/* Agar view 'returns' hai aur abhi tak refund nahi hua, to button dikhao */}
                  {orderView === 'returns' && o.status?.toLowerCase() !== 'refunded' ? (
                    <button onClick={() => handleProcessRefund(o)} style={{background:'#10b981', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>💸 Refund to Wallet</button>
                  ) : o.status?.toLowerCase() === 'refunded' ? (
                    <span style={{color: '#10b981', fontWeight: 'bold'}}>✅ Refunded</span>
                  ) : (
                    <button style={{background:'#38bdf8', color:'#0f172a', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>Track</button>
                  )}
                </td>
              </tr>
            ))}
            {displayOrders.length === 0 && <tr><td colSpan={5} style={{padding:'20px', textAlign:'center'}}>No orders found in this category.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' };