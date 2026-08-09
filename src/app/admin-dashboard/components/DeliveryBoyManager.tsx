"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DeliveryBoyManager({ deliveryBoys, dynamicLocations, orders, fetchData }: any) {
  const [newBoy, setNewBoy] = useState({ name: '', phone: '', password: '', address: '', state: '', district: '', block: '' });
  
  // Settings States
  const [deliveryFee, setDeliveryFee] = useState<number>(30);
  const [adminUpiSetting, setAdminUpiSetting] = useState('');
  const [officePhoneSetting, setOfficePhoneSetting] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Lists & Tabs
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'partners' | 'withdrawals' | 'support' | 'settings'>('partners');

  // JSONB Chat State
  const [selectedChatBoy, setSelectedChatBoy] = useState<any>(null);
  const [adminChatInput, setAdminChatInput] = useState('');

  // 🔥 Withdrawal Action Modal State 🔥
  const [actionWd, setActionWd] = useState<{ id: number, boyId: number, amount: number, status: 'approved' | 'rejected' } | null>(null);
  const [actionNote, setActionNote] = useState('');

  const availableStates = Object.keys(dynamicLocations).sort();
  const availableDistricts = newBoy.state ? Object.keys(dynamicLocations[newBoy.state] || {}).sort() : [];
  const availableBlocks = newBoy.district ? (dynamicLocations[newBoy.state]?.[newBoy.district] || []).sort() : [];

  useEffect(() => {
    fetchAdminControlsData();
  }, []);

  const fetchAdminControlsData = async () => {
    try {
      const { data: settingsData } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();
      if (settingsData) {
        if (settingsData.delivery_boy_fee) setDeliveryFee(Number(settingsData.delivery_boy_fee) || 30);
        if (settingsData.delivery_boy_upi || settingsData.upi_id) setAdminUpiSetting(settingsData.delivery_boy_upi || settingsData.upi_id || '');
        const foundPhone = settingsData.company_phone || settingsData.phone || settingsData.admin_phone || settingsData.contact_number || '';
        if (foundPhone) setOfficePhoneSetting(foundPhone);
      }
      const { data: wdData } = await supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false });
      if (wdData) setWithdrawRequests(wdData);
    } catch (e) { console.warn("Control fetch notice:", e); }
  };

  const handleSaveAppSettings = async () => {
    setSavingSettings(true);
    try {
      const { error } = await supabase.from('app_settings').update({
        delivery_boy_fee: deliveryFee,
        delivery_boy_upi: adminUpiSetting,
        company_phone: officePhoneSetting
      }).eq('id', 1);

      if (error) {
        const { error: err2 } = await supabase.from('app_settings').upsert({
          id: 1, delivery_boy_fee: deliveryFee, delivery_boy_upi: adminUpiSetting, company_phone: officePhoneSetting
        });
        if (err2) throw err2;
      }
      alert("✅ Delivery & Support settings successfully updated!");
      fetchAdminControlsData();
    } catch (e: any) { alert("Error saving settings: " + e.message); } 
    finally { setSavingSettings(false); }
  };

  const handleAddDeliveryBoy = async () => {
    if (!newBoy.name || !newBoy.phone || !newBoy.password) return alert("Naam, Phone aur Password daalna zaroori hai!");
    if (!newBoy.state || !newBoy.district) return alert("State aur District select karna zaroori hai!");
    try {
      const { error } = await supabase.from('delivery_boys').insert([{
        name: newBoy.name, phone: newBoy.phone, password: newBoy.password, address: newBoy.address || 'N/A',
        state: newBoy.state, district: newBoy.district, block: newBoy.block || 'N/A', status: 'Active', balance: 0, support_chat: []
      }]);
      if (error) throw error;
      alert(`✅ Delivery Partner '${newBoy.name}' registered!`);
      setNewBoy({ name: '', phone: '', password: '', address: '', state: '', district: '', block: '' });
      fetchData();
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const updateBoyStatus = async (id: number, status: string) => {
    await supabase.from('delivery_boys').update({ status }).eq('id', id);
    fetchData();
  };

  const deleteBoy = async (id: number, name: string) => {
    if (window.confirm(`Kya aap delivery partner '${name}' ka account delete karna chahte hain?`)) {
      await supabase.from('delivery_boys').delete().eq('id', id);
      fetchData(); alert("Delivery partner deleted!");
    }
  };

  // 🔥 OPEN WITHDRAWAL MODAL 🔥
  const openActionModal = (wd: any, status: 'approved' | 'rejected') => {
    setActionWd({ id: wd.id, boyId: wd.delivery_boy_id, amount: wd.amount, status });
    setActionNote('');
  };

  // 🔥 SUBMIT WITHDRAWAL WITH UTR/REASON 🔥
  const submitWithdrawalAction = async () => {
    if (!actionWd) return;
    if (actionWd.status === 'approved' && !actionNote.trim()) return alert("Please enter UTR / Transaction ID!");
    if (actionWd.status === 'rejected' && !actionNote.trim()) return alert("Please enter Reason for Rejection!");

    try {
      const { error: wErr } = await supabase.from('withdrawal_requests').update({ 
        status: actionWd.status, 
        admin_note: actionNote.trim() 
      }).eq('id', actionWd.id);
      if (wErr) throw wErr;

      if (actionWd.status === 'rejected') {
        const targetBoy = deliveryBoys.find((b: any) => String(b.id) === String(actionWd.boyId));
        if (targetBoy) {
          const restoredBal = (Number(targetBoy.balance) || 0) + Number(actionWd.amount);
          await supabase.from('delivery_boys').update({ balance: restoredBal }).eq('id', actionWd.boyId);
          await supabase.from('wallet_transactions').insert({ user_type: 'delivery_boy', delivery_boy_id: actionWd.boyId, amount: actionWd.amount, type: 'credit', status: 'completed', reason: `Withdrawal Rejected (Refund)` });
        }
      } else {
        await supabase.from('wallet_transactions').insert({ user_type: 'delivery_boy', delivery_boy_id: actionWd.boyId, amount: actionWd.amount, type: 'debit', status: 'completed', reason: `UPI Withdrawal Paid (UTR: ${actionNote.trim()})` });
      }

      alert(`✅ Withdrawal ${actionWd.status} successfully!`);
      setActionWd(null);
      setActionNote('');
      fetchAdminControlsData(); 
      fetchData();
    } catch (e: any) { alert("Error updating withdrawal: " + e.message); }
  };

  const handleAdminReplyChat = async () => {
    if (!adminChatInput.trim() || !selectedChatBoy) return;
    try {
      const { data } = await supabase.from('delivery_boys').select('support_chat').eq('id', selectedChatBoy.id).single();
      let currentChat = data?.support_chat || [];
      if (typeof currentChat === 'string') { try { currentChat = JSON.parse(currentChat); } catch(e){ currentChat = []; } }
      if (!Array.isArray(currentChat)) currentChat = [];

      currentChat.push({
        sender: 'admin',
        message: adminChatInput.trim(),
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase.from('delivery_boys').update({ support_chat: currentChat }).eq('id', selectedChatBoy.id);
      if (error) throw error;

      setAdminChatInput('');
      fetchData(); 
      
      setSelectedChatBoy({ ...selectedChatBoy, support_chat: currentChat });
      
    } catch(e: any) { alert("Chat Error: " + e.message); }
  };

  return (
    <div className="fade-in">
      <h2 style={{ color: '#ec4899', marginTop: 0 }}>🚚 Delivery Partners & Control Center</h2>
      <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
        Yahan se Admin naye delivery partners hire karta hai, delivery fee control karta hai, wallet withdrawals approve karta hai aur support requests handle karta hai.
      </p>

      {/* 🧭 SUB-NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => {setActiveSubTab('partners'); setSelectedChatBoy(null);}} style={tabBtnStyle(activeSubTab === 'partners')}>👥 Partners & Hiring</button>
        <button onClick={() => {setActiveSubTab('withdrawals'); setSelectedChatBoy(null);}} style={tabBtnStyle(activeSubTab === 'withdrawals')}>💳 Wallet Withdrawals ({withdrawRequests.filter(w => w.status === 'pending').length} Pending)</button>
        <button onClick={() => setActiveSubTab('support')} style={tabBtnStyle(activeSubTab === 'support')}>🎧 Help Desk & Chat</button>
        <button onClick={() => {setActiveSubTab('settings'); setSelectedChatBoy(null);}} style={tabBtnStyle(activeSubTab === 'settings')}>⚙️ Fee & Office Controls</button>
      </div>

      {/* ================= 1. PARTNERS & HIRING TAB ================= */}
      {activeSubTab === 'partners' && (
        <div>
          <div style={{ background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid rgba(236, 72, 153, 0.2)', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ec4899' }}>➕ Hire New Delivery Partner</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input placeholder="Full Name" value={newBoy.name} onChange={e => setNewBoy({...newBoy, name: e.target.value})} style={inpStyle} />
              <input placeholder="Phone Number" value={newBoy.phone} onChange={e => setNewBoy({...newBoy, phone: e.target.value})} style={inpStyle} />
              <input placeholder="Secure Password" value={newBoy.password} onChange={e => setNewBoy({...newBoy, password: e.target.value})} style={inpStyle} />
              <input placeholder="Full Address / Area" value={newBoy.address} onChange={e => setNewBoy({...newBoy, address: e.target.value})} style={{...inpStyle, flex: '1.5'}} />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select value={newBoy.state} onChange={e => setNewBoy({...newBoy, state: e.target.value, district: '', block: ''})} style={inpStyle}>
                <option value="">-- Select State --</option>
                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={newBoy.district} onChange={e => setNewBoy({...newBoy, district: e.target.value, block: ''})} style={inpStyle} disabled={!newBoy.state}>
                <option value="">-- Select District --</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={newBoy.block} onChange={e => setNewBoy({...newBoy, block: e.target.value})} style={inpStyle} disabled={!newBoy.district}>
                <option value="">-- Select Block --</option>
                {availableBlocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <button onClick={handleAddDeliveryBoy} style={{ background: '#ec4899', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '5px' }}>
              🚀 Register & Hire Delivery Partner
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{padding:'15px'}}>Partner Details</th>
                  <th style={{padding:'15px'}}>Operating Zone</th>
                  <th style={{padding:'15px'}}>Wallet Balance</th>
                  <th style={{padding:'15px'}}>Deliveries Done</th>
                  <th style={{padding:'15px'}}>Status</th>
                  <th style={{padding:'15px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveryBoys.map((b: any) => {
                  const isSuspended = b.status === 'Suspended';
                  const doneCount = orders.filter((o:any) => String(o.delivery_boy_id) === String(b.id) && ['completed', 'delivered'].includes((o.status||'').toLowerCase())).length;
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{padding:'15px'}}>
                        <strong style={{color: '#e2e8f0'}}>{b.name}</strong><br/>
                        <span style={{fontSize: '12px', color: '#94a3b8'}}>📞 {b.phone}</span><br/>
                        <span style={{fontSize: '11px', color: '#ef4444'}}>Pass: {b.password}</span><br/>
                        <span style={{fontSize: '11px', color: '#38bdf8'}}>UPI: {b.upi_id || 'Not Set'}</span>
                      </td>
                      <td style={{padding:'15px'}}>
                        <span style={{ color: '#ec4899', fontSize: '11px', background: 'rgba(236,72,153,0.1)', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{b.district}, {b.state}</span><br/>
                        <span style={{fontSize: '12px', color: '#94a3b8'}}>{b.address || b.block}</span>
                      </td>
                      <td style={{padding:'15px', color: '#4ade80', fontWeight: 'bold'}}>₹{b.balance || 0}</td>
                      <td style={{padding:'15px', color: '#10b981', fontWeight: 'bold'}}>{doneCount} Orders</td>
                      <td style={{padding:'15px'}}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: isSuspended ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isSuspended ? '#f59e0b' : '#34d399'}}>
                          {b.status || 'Active'}
                        </span>
                      </td>
                      <td style={{padding:'15px', display:'flex', gap:'8px', alignItems:'center'}}>
                        {isSuspended ? (
                          <button onClick={() => updateBoyStatus(b.id, 'Active')} style={{ background: '#10b981', color: 'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' }}>✅ Activate</button>
                        ) : (
                          <button onClick={() => updateBoyStatus(b.id, 'Suspended')} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b', padding:'6px 12px', borderRadius:'6px', cursor:'pointer' }}>⏸️ Suspend</button>
                        )}
                        <button onClick={() => deleteBoy(b.id, b.name)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding:'6px 12px', borderRadius:'6px', cursor:'pointer' }}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 2. WALLET WITHDRAWALS TAB ================= */}
      {activeSubTab === 'withdrawals' && (
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>💳 Withdrawal Requests</h3>
          {withdrawRequests.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>No withdrawal requests found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {withdrawRequests.map((wd: any) => {
                const partner = deliveryBoys.find((b: any) => String(b.id) === String(wd.delivery_boy_id)) || {};
                const isPending = (wd.status || 'pending').toLowerCase() === 'pending';
                const isApproved = (wd.status || '').toLowerCase() === 'approved';
                const isRejected = (wd.status || '').toLowerCase() === 'rejected';

                return (
                  <div key={wd.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: isPending ? '4px solid #f59e0b' : isApproved ? '4px solid #10b981' : '4px solid #ef4444', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'white' }}>{partner.name || 'Partner #' + wd.delivery_boy_id} (📞 {partner.phone || 'N/A'})</div>
                      <div style={{ fontSize: '13px', color: '#38bdf8', marginTop: '3px' }}>UPI ID: <strong>{wd.upi_id || partner.upi_id || 'Not specified'}</strong></div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{new Date(wd.created_at).toLocaleString()}</div>
                      
                      {/* 🔥 SHOW UTR OR REASON FROM ADMIN HERE 🔥 */}
                      {isApproved && wd.admin_note && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}><strong>UTR No:</strong> {wd.admin_note}</div>}
                      {isRejected && wd.admin_note && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}><strong>Reason:</strong> {wd.admin_note}</div>}

                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#4ade80' }}>₹{wd.amount}</div>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openActionModal(wd, 'approved')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✅ Pay</button>
                          <button onClick={() => openActionModal(wd, 'rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>❌ Reject</button>
                        </div>
                      ) : (
                        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isApproved ? '#34d399' : '#f87171' }}>{isApproved ? '✅ Paid' : '❌ Rejected'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= 3. HELP DESK & SUPPORT TAB ================= */}
      {activeSubTab === 'support' && (
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          
          {!selectedChatBoy ? (
            <div>
              <h3 style={{ margin: '0 0 15px 0', color: '#10b981' }}>🎧 Select Partner to Chat</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                {deliveryBoys.map((b: any) => {
                  let chatArray = b.support_chat || [];
                  if (typeof chatArray === 'string') { try { chatArray = JSON.parse(chatArray); } catch(e){ chatArray=[]; } }
                  const msgCount = Array.isArray(chatArray) ? chatArray.length : 0;
                  
                  return (
                    <div key={b.id} onClick={() => setSelectedChatBoy(b)} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'white' }}>{b.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0' }}>📞 {b.phone}</div>
                      <div style={{ fontSize: '11px', color: msgCount > 0 ? '#10b981' : '#64748b', fontWeight: 'bold' }}>
                        {msgCount > 0 ? `💬 ${msgCount} Messages in Chat` : 'No messages yet'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <button onClick={() => setSelectedChatBoy(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>← Back</button>
                <h3 style={{ margin: 0, color: '#10b981' }}>Chat with {selectedChatBoy.name}</h3>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', height: '350px', overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(() => {
                  let msgs = selectedChatBoy.support_chat || [];
                  if (typeof msgs === 'string') { try { msgs = JSON.parse(msgs); } catch(e){ msgs=[]; } }
                  if (!Array.isArray(msgs) || msgs.length === 0) return <div style={{textAlign:'center', color:'#64748b', marginTop:'100px'}}>No messages yet.</div>;
                  
                  return msgs.map((msg: any, idx: number) => {
                    const isAdminMsg = msg.sender === 'admin';
                    return (
                      <div key={idx} style={{ alignSelf: isAdminMsg ? 'flex-end' : 'flex-start', background: isAdminMsg ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: '12px', maxWidth: '80%', fontSize: '14px' }}>
                        <div style={{ fontSize: '10px', color: isAdminMsg ? '#bfdbfe' : '#94a3b8', marginBottom: '4px' }}>{isAdminMsg ? 'You (Admin)' : selectedChatBoy.name}</div>
                        {msg.message}
                      </div>
                    );
                  });
                })()}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Type a reply to delivery boy..." 
                  value={adminChatInput} 
                  onChange={e => setAdminChatInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleAdminReplyChat()}
                  style={inpStyle} 
                />
                <button onClick={handleAdminReplyChat} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 4. FEE & OFFICE CONTROLS TAB ================= */}
      {activeSubTab === 'settings' && (
        <div style={{ background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '600px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>⚙️ Global Delivery Controls</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>Per Delivery Earning / Fee for Partner (₹)</label>
            <input type="number" value={deliveryFee} onChange={e => setDeliveryFee(Number(e.target.value))} style={inpStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>Admin UPI ID (For Cash Collections)</label>
            <input type="text" placeholder="admin@upi" value={adminUpiSetting} onChange={e => setAdminUpiSetting(e.target.value)} style={inpStyle} />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>Office / Support Contact Number</label>
            <input type="tel" placeholder="+919999999999" value={officePhoneSetting} onChange={e => setOfficePhoneSetting(e.target.value)} style={inpStyle} />
          </div>

          <button onClick={handleSaveAppSettings} disabled={savingSettings} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%' }}>
            {savingSettings ? 'Saving...' : '💾 Save Global Settings'}
          </button>
        </div>
      )}

      {/* 🔥 UTR / REJECT REASON MODAL 🔥 */}
      {actionWd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: '#0f172a', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: actionWd.status === 'approved' ? '#10b981' : '#ef4444', margin: '0 0 15px 0' }}>
              {actionWd.status === 'approved' ? '✅ Approve & Add UTR' : '❌ Reject & Add Reason'}
            </h3>
            
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
              Amount: <strong style={{color: 'white'}}>₹{actionWd.amount}</strong>
            </p>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '8px' }}>
              {actionWd.status === 'approved' ? 'Enter UTR / Transaction No.' : 'Enter Reason for Rejection'}
            </label>
            <input 
              type="text" 
              placeholder={actionWd.status === 'approved' ? "e.g. 31234567890" : "e.g. Invalid UPI ID"} 
              value={actionNote} 
              onChange={(e) => setActionNote(e.target.value)} 
              style={inpStyle} 
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setActionWd(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitWithdrawalAction} style={{ flex: 1, padding: '12px', background: actionWd.status === 'approved' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Submit</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const inpStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' as const };
const tabBtnStyle = (isActive: boolean) => ({ background: isActive ? '#ec4899' : 'rgba(255,255,255,0.05)', color: isActive ? 'white' : '#94a3b8', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' });