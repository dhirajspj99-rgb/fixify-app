"use client";
import React, { useState, useEffect } from 'react';

export default function ShopWalletPassbook({ supabase, shopUser, setAppStep }: any) {
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [withdrawableBalance, setWithdrawableBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (shopUser?.id) {
      fetchShopWalletData();
    } else {
      setIsLoading(false);
    }
  }, [shopUser]);

  const calculateFinances = (order: any) => {
    const totalBill = Number(order.total_amount || 0);
    const deliveryCharge = Number(order.delivery_charge || order.delivery_fee || 0);
    const itemTotal = Math.max(0, totalBill - deliveryCharge); 
    const adminComm = itemTotal * 0.05; 
    return itemTotal - adminComm; 
  };

  const fetchShopWalletData = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch Orders SAFELY
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', shopUser.id);
        
      if (ordersError) {
        console.warn("Wallet Order Fetch Error:", ordersError);
      }

      // 2. Fetch Wallet Transactions SAFELY
      const { data: walletData, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('shop_id', shopUser.id)
        .eq('type', 'debit');
        
      if (walletError) {
        console.warn("Wallet Txn Fetch Error:", walletError);
      }

      let unifiedLedger: any[] = [];

      const validStatuses = ['completed', 'delivered', 'return accepted'];
      (ordersData || []).forEach((o: any) => {
        const status = String(o.status || '').toLowerCase().trim();
        if (validStatuses.includes(status)) {
          const netEarning = calculateFinances(o);
          unifiedLedger.push({
            id: 'order_' + o.id,
            real_id: o.id,
            type: 'credit',
            amount: netEarning,
            reason: `Order Sales Earning #${o.order_no || o.id}`,
            created_at: o.created_at,
            status: 'completed'
          });
        }
      });

      (walletData || []).forEach((w: any) => {
        unifiedLedger.push({
          id: 'txn_' + w.id,
          real_id: w.id,
          type: 'debit',
          amount: Number(w.amount),
          reason: w.reason || 'Withdrawal Request',
          created_at: w.created_at,
          status: w.status
        });
      });

      unifiedLedger.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      let tBal = 0;
      let wBal = 0;
      const now = new Date();

      unifiedLedger.forEach(txn => {
        if (txn.type === 'credit') {
          tBal += txn.amount;
          
          // 🔥 BYPASS: 7 Days Ka Lock Hata Diya Gaya Hai Testing Ke Liye 🔥
          wBal += txn.amount; // Saara paisa turant withdrawable mein add hoga
          
        } else if (txn.type === 'debit') {
          if (txn.status === 'completed' || txn.status === 'pending') {
            tBal -= txn.amount;
            wBal -= txn.amount;
          }
        }
      });

      setTotalBalance(tBal);
      setWithdrawableBalance(Math.max(0, wBal)); 
      setTransactions(unifiedLedger);

      await supabase.from('shops').update({ balance: tBal }).eq('id', shopUser.id);

    } catch (e: any) {
      console.error("Error calculating shop wallet:", e.message || e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) return alert("Kripya sahi amount daalein.");
    if (amt > withdrawableBalance) return alert(`Aap abhi sirf ₹${withdrawableBalance.toFixed(2)} nikal sakte hain.`);

    setIsProcessing(true);
    try {
      const { error: txnError } = await supabase.from('wallet_transactions').insert({
        shop_id: shopUser.id,
        user_type: 'shop',
        amount: amt,
        type: 'debit',
        status: 'pending', 
        reason: `Shop Withdrawal Request`
      });

      if (txnError) throw txnError;

      alert(`✅ ₹${amt} ka withdrawal request Admin ko bhej diya gaya hai!`);
      setShowWithdraw(false); 
      setWithdrawAmount('');
      fetchShopWalletData(); 
    } catch (e: any) { 
      alert("Withdrawal Error: " + e.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const pendingClearance = Math.max(0, totalBalance - withdrawableBalance);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
      
      <div style={{ background: '#0f172a', padding: '15px 20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '12px', marginBottom: '20px' }}>
        <button onClick={() => setAppStep('home')} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Shop Owner Wallet</h2>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '25px 20px', color: 'white', marginBottom: '25px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ flex: '1 1 250px' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#cbd5e1' }}>Available to Withdraw (Test Mode Active)</p>
            <h1 style={{ margin: 0, fontSize: '42px', fontWeight: '900', color: '#10b981' }}>
              ₹{withdrawableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h1>
            
            <button 
              onClick={() => setShowWithdraw(true)}
              style={{ marginTop: '15px', background: withdrawableBalance > 0 ? '#10b981' : '#475569', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: withdrawableBalance > 0 ? 'pointer' : 'not-allowed', width: '100%' }}
              disabled={withdrawableBalance <= 0}
            >
              💸 Request Withdrawal
            </button>
          </div>

          <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#94a3b8' }}>Total Wallet Balance</p>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#f8fafc' }}>₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div style={{ borderTop: '1px dashed #334155', paddingTop: '10px' }}>
              <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#f59e0b' }}>Pending Clearance (Testing)</p>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#fcd34d' }}>₹{pendingClearance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

        </div>
      </div>

      <div onClick={() => setIsHistoryOpen(!isHistoryOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', cursor: 'pointer', userSelect: 'none' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>📜 Wallet Ledger History</h3>
        <span style={{ fontSize: '14px', color: '#0284c7', fontWeight: 'bold' }}>{isHistoryOpen ? '▲ Hide' : '▼ View'}</span>
      </div>

      {isHistoryOpen && (
        <div>
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Loading history...</p>
          ) : transactions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No transactions found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transactions.slice(0, visibleCount).map((txn: any) => {
                const isCredit = txn.type === 'credit';
                let amountColor = isCredit ? '#10b981' : '#ef4444';
                let icon = isCredit ? '💰' : '📉';
                
                if (txn.reason.toLowerCase().includes('refund')) {
                  amountColor = '#f59e0b';
                  icon = '⚠️';
                }

                return (
                  <div key={txn.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{icon}</span> {txn.reason}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        {new Date(txn.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} 
                        &nbsp;•&nbsp;
                        <strong style={{ color: txn.status === 'completed' ? '#10b981' : (txn.status === 'pending' ? '#f59e0b' : '#ef4444') }}>{txn.status.toUpperCase()}</strong>
                      </p>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: amountColor, whiteSpace: 'nowrap', marginLeft: '15px' }}>
                      {isCredit ? '+' : '-'} ₹{txn.amount.toFixed(2)}
                    </h3>
                  </div>
                );
              })}

              {transactions.length > visibleCount && (
                <button 
                  onClick={() => setVisibleCount(visibleCount + 10)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', color: '#334155' }}
                >
                  Load More History ↓
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showWithdraw && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 9999 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Withdraw Shop Earnings</h3>
              <button onClick={() => setShowWithdraw(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            
            <div style={{ background: '#dcfce7', border: '1px solid #10b981', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#065f46' }}>Available to withdraw: <strong style={{ fontSize: '16px' }}>₹{withdrawableBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></p>
            </div>
            
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Enter Amount (₹)</label>
            <input type="number" placeholder="e.g. 5000" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} style={{ width: '100%', padding: '14px', fontSize: '18px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '20px', boxSizing: 'border-box' }} />
            
            <button onClick={handleWithdrawRequest} disabled={isProcessing || !withdrawAmount || Number(withdrawAmount) > withdrawableBalance} style={{ width: '100%', padding: '15px', background: (!withdrawAmount || Number(withdrawAmount) > withdrawableBalance) ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: (!withdrawAmount || Number(withdrawAmount) > withdrawableBalance) ? 'not-allowed' : 'pointer', transition: '0.2s' }}>
              {isProcessing ? 'Processing Request...' : 'Send Withdrawal Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}