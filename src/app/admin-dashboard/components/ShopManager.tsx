"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ShopManager({ shops, fetchData }: any) {
  const [newShop, setNewShop] = useState({ name: '', phone: '', password: '', address: '', upi_id: '' });
  const [shopTypes, setShopTypes] = useState<string[]>([]);
  const [selectedShop, setSelectedShop] = useState<any>(null); // Profile modal ke liye
  const shopTypesList = ["General Store", "Iron & Steel Shop", "Hardware Shop", "Electrical Shop", "Cement & Building Material"];

  // 1. Direct Register by Admin (Default Approved)
  const handleAddShop = async () => {
    if (!newShop.name || !newShop.phone || !newShop.password) return alert("Naam, Phone aur Password zaroori hai!");
    if (shopTypes.length === 0) return alert("Kam se kam ek Shop Category chunein!");

    try {
      const { error } = await supabase.from('shops').insert([{
        name: newShop.name, phone: newShop.phone, password: newShop.password,
        address: newShop.address, upi_id: newShop.upi_id, shop_type: shopTypes.join(', '), status: 'Approved'
      }]);
      if (error) throw error;
      alert("✅ Shop Owner successfully registered!");
      setNewShop({ name: '', phone: '', password: '', address: '', upi_id: '' });
      setShopTypes([]); fetchData();
    } catch (e: any) { alert("Error: " + e.message); }
  };

  // 2. Status Change (Approve, Suspend, Terminate)
  const handleUpdateStatus = async (shopId: number, newStatus: string) => {
    try {
      const { error } = await supabase.from('shops').update({ status: newStatus }).eq('id', shopId);
      if (error) throw error;
      alert(`✅ Shop status updated to: ${newStatus}`);
      fetchData();
      if (selectedShop) setSelectedShop(null); // Modal band kar do agar khula ho
    } catch (e: any) { alert("Error: " + e.message); }
  };

  // Pending shops ki list nikalne ke liye live filter
  const pendingShops = shops.filter((s: any) => !s.status || s.status === 'Pending');

  return (
    <div className="fade-in">
      <h2 style={{ color: '#8b5cf6', marginTop: 0 }}>🏪 Shop Owner Control & Inventory</h2>
      
      {/* 🔴 LIVE PENDING ALERT NOTIFICATION BANNER */}
      {pendingShops.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', border: '1px solid #f87171', padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', animation: 'pulse 1.5s infinite' }}>🔔</span>
            <div>
              <h4 style={{ margin: '0 0 3px 0', color: '#fca5a5', fontSize: '15px' }}>New Shop Registration Alert!</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#fee2e2' }}>Aapke paas <strong style={{color: 'white'}}>{pendingShops.length}</strong> nayi shop requests pending hain approval ke liye.</p>
            </div>
          </div>
        </div>
      )}

      {/* Register New Shop Box */}
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#8b5cf6' }}>➕ Register New Shop Owner</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input placeholder="Shop Name" value={newShop.name} onChange={e=>setNewShop({...newShop, name: e.target.value})} style={inpStyle} />
          <input placeholder="Phone" value={newShop.phone} onChange={e=>setNewShop({...newShop, phone: e.target.value})} style={inpStyle} />
          <input placeholder="Password" value={newShop.password} onChange={e=>setNewShop({...newShop, password: e.target.value})} style={inpStyle} />
          <input placeholder="Address" value={newShop.address} onChange={e=>setNewShop({...newShop, address: e.target.value})} style={inpStyle} />
        </div>
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {shopTypesList.map(t => (
            <label key={t} style={{ background: shopTypes.includes(t) ? '#8b5cf6' : '#1e293b', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', color: 'white' }}>
              <input type="checkbox" checked={shopTypes.includes(t)} onChange={() => setShopTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])} style={{display:'none'}} /> {t}
            </label>
          ))}
        </div>
        <button onClick={handleAddShop} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Register Shop</button>
      </div>

      {/* Shops Table */}
      <div style={{ background: '#0f172a', borderRadius: '12px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '16px' }}>📋 All Registered Shops ({shops.length})</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <th style={{padding:'12px'}}>Shop Name</th>
              <th style={{padding:'12px'}}>Phone & Pass</th>
              <th style={{padding:'12px'}}>Category</th>
              <th style={{padding:'12px'}}>Status</th>
              <th style={{padding:'12px', textAlign: 'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s:any)=>{
              const status = s.status || 'Pending';
              return (
                <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'12px'}}><strong>{s.name}</strong></td>
                  <td style={{padding:'12px'}}>{s.phone} <br/><span style={{color:'#ef4444', fontSize:'11px'}}>Pass: {s.password}</span></td>
                  <td style={{padding:'12px', color:'#a78bfa'}}>{s.shop_type}</td>
                  <td style={{padding:'12px'}}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
                      background: status === 'Approved' ? 'rgba(22, 163, 74, 0.2)' : status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: status === 'Approved' ? '#4ade80' : status === 'Pending' ? '#facc15' : '#f87171',
                      border: `1px solid ${status === 'Approved' ? '#22c55e' : status === 'Pending' ? '#eab308' : '#ef4444'}`
                    }}>
                      {status}
                    </span>
                  </td>
                  <td style={{padding:'12px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    {/* View Profile Button */}
                    <button onClick={() => setSelectedShop(s)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                      👁️ Profile
                    </button>

                    {/* Approve / Pending Actions */}
                    {status !== 'Approved' && (
                      <button onClick={() => handleUpdateStatus(s.id, 'Approved')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ✅ Approve
                      </button>
                    )}

                    {/* Suspend / Terminate Actions */}
                    {status !== 'Suspended' ? (
                      <button onClick={() => handleUpdateStatus(s.id, 'Suspended')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ⚠️ Suspend
                      </button>
                    ) : (
                      <button onClick={() => handleUpdateStatus(s.id, 'Terminated')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ❌ Terminate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 👤 SHOP OWNER PROFILE MODAL */}
      {selectedShop && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', width: '400px', maxWidth: '90%', border: '1px solid rgba(139, 92, 246, 0.4)', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#a78bfa' }}>🏪 Shop Owner Profile</h3>
              <span onClick={() => setSelectedShop(null)} style={{ cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✖</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '20px' }}>
              <div><strong>Shop Name:</strong> {selectedShop.name}</div>
              <div><strong>Phone Number:</strong> {selectedShop.phone}</div>
              <div><strong>Password:</strong> <span style={{color: '#f87171'}}>{selectedShop.password}</span></div>
              <div><strong>Address:</strong> {selectedShop.address || 'Not Provided'}</div>
              <div><strong>UPI ID:</strong> {selectedShop.upi_id || 'Not Provided'}</div>
              <div><strong>Categories:</strong> <span style={{color: '#a78bfa'}}>{selectedShop.shop_type}</span></div>
              <div><strong>Current Status:</strong> <span style={{fontWeight: 'bold', color: selectedShop.status === 'Approved' ? '#4ade80' : '#f87171'}}>{selectedShop.status || 'Pending'}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {selectedShop.status !== 'Approved' && (
                <button onClick={() => handleUpdateStatus(selectedShop.id, 'Approved')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Approve Shop</button>
              )}
              {selectedShop.status !== 'Suspended' && (
                <button onClick={() => handleUpdateStatus(selectedShop.id, 'Suspended')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Suspend</button>
              )}
              <button onClick={() => handleUpdateStatus(selectedShop.id, 'Terminated')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Terminate</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const inpStyle = { padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', flex: 1, minWidth: '180px' };