"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function FinanceAndUsersManager({ labours, shops, appSettings, setAppSettings, commissionRate, setCommissionRate, deliveryBoyCommRate, setDeliveryBoyCommRate, fetchData }: any) {
  const [subView, setSubView] = useState('shops'); // shops, labours, finance
  const [newPerson, setNewPerson] = useState({ name: '', phone: '', password: '', address: '', upi_id: '' });
  const [shopTypes, setShopTypes] = useState<string[]>([]);
  const [labourTypes, setLabourTypes] = useState<string[]>([]);

  const shopTypesList = ["General Store", "Iron & Steel Shop", "Hardware Shop", "Electrical Shop", "Cement & Building Material"];
  const labourSkillsList = ["General Labour (Helper)", "Raj Mistri (Mason)", "Electrician", "Plumber", "Furniture / Carpenter", "Painter", "AC Repair"];

  const handleAddPerson = async (role: string) => {
    if (!newPerson.name || !newPerson.phone || !newPerson.password) return alert("Naam, Phone aur Password zaroori hai!");
    const targetTable = role === 'Shop Owner' ? 'shops' : 'labours';
    const finalRole = role === 'Shop Owner' ? shopTypes.join(', ') : labourTypes.join(', ');
    
    if (role === 'Shop Owner' && shopTypes.length === 0) return alert("Kam se kam ek Shop Category chunein!");
    if (role === 'Labour' && labourTypes.length === 0) return alert("Kam se kam ek Labour Skill chunein!");

    try {
      const insertData: any = { name: newPerson.name, phone: newPerson.phone, password: newPerson.password, address: newPerson.address, upi_id: newPerson.upi_id, status: 'Approved' };
      if (role === 'Shop Owner') insertData.shop_type = finalRole; else insertData.labour_type = finalRole;

      const { error } = await supabase.from(targetTable).insert([insertData]);
      if (error) throw error;

      alert(`✅ ${role} successfully registered!`);
      setNewPerson({ name: '', phone: '', password: '', address: '', upi_id: '' });
      setShopTypes([]); setLabourTypes([]);
      fetchData();
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const deletePerson = async (id: number, name: string, table: string) => {
    if (window.confirm(`Delete '${name}'?`)) {
      await supabase.from(table).delete().eq('id', id);
      fetchData(); alert("Deleted successfully!");
    }
  };

  const saveCompanySettings = async () => {
    const { error } = await supabase.from('app_settings').update({ ...appSettings, commission_rate: commissionRate, delivery_boy_comm_rate: deliveryBoyCommRate }).eq('id', 1);
    if (error) alert(error.message); else alert("✅ Settings & Finance updated!");
  };

  return (
    <div className="fade-in">
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>🏪 Shop Owners, 👷 Labours & 💰 Finance Control</h2>
      
      {/* Sub Menu Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => setSubView('shops')} style={{...btnStyle, background: subView==='shops'?'#8b5cf6':'#1e293b'}}>🏪 Shop Owners ({shops.length})</button>
        <button onClick={() => setSubView('labours')} style={{...btnStyle, background: subView==='labours'?'#10b981':'#1e293b'}}>👷 Labours ({labours.length})</button>
        <button onClick={() => setSubView('finance')} style={{...btnStyle, background: subView==='finance'?'#f59e0b':'#1e293b'}}>💰 Finance & Settings</button>
      </div>

      {/* 1. SHOP OWNERS TAB */}
      {subView === 'shops' && (
        <div>
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#8b5cf6' }}>➕ Register New Shop Owner</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <input placeholder="Shop Name" value={newPerson.name} onChange={e=>setNewPerson({...newPerson, name: e.target.value})} style={inpStyle} />
              <input placeholder="Phone" value={newPerson.phone} onChange={e=>setNewPerson({...newPerson, phone: e.target.value})} style={inpStyle} />
              <input placeholder="Password" value={newPerson.password} onChange={e=>setNewPerson({...newPerson, password: e.target.value})} style={inpStyle} />
              <input placeholder="Address" value={newPerson.address} onChange={e=>setNewPerson({...newPerson, address: e.target.value})} style={inpStyle} />
              <input placeholder="UPI ID" value={newPerson.upi_id} onChange={e=>setNewPerson({...newPerson, upi_id: e.target.value})} style={inpStyle} />
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {shopTypesList.map(t => (
                <label key={t} style={{ background: shopTypes.includes(t) ? '#8b5cf6' : '#1e293b', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={shopTypes.includes(t)} onChange={() => setShopTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])} style={{display:'none'}} /> {t}
                </label>
              ))}
            </div>
            <button onClick={() => handleAddPerson('Shop Owner')} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Register Shop</button>
          </div>

          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}><th style={{padding:'12px'}}>Name & Phone</th><th style={{padding:'12px'}}>Category</th><th style={{padding:'12px'}}>Password</th><th style={{padding:'12px'}}>Action</th></tr></thead>
            <tbody>
              {shops.map((s:any)=>(
                <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'12px'}}><strong>{s.name}</strong><br/><span style={{color:'#94a3b8', fontSize:'12px'}}>{s.phone}</span></td>
                  <td style={{padding:'12px', color:'#a78bfa'}}>{s.shop_type}</td>
                  <td style={{padding:'12px', color:'#ef4444'}}>{s.password}</td>
                  <td style={{padding:'12px'}}><button onClick={()=>deletePerson(s.id, s.name, 'shops')} style={{background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid #ef4444', padding:'5px 10px', borderRadius:'6px', cursor:'pointer'}}>🗑️ Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. LABOURS TAB */}
      {subView === 'labours' && (
        <div>
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#10b981' }}>➕ Register New Labour / Worker</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <input placeholder="Full Name" value={newPerson.name} onChange={e=>setNewPerson({...newPerson, name: e.target.value})} style={inpStyle} />
              <input placeholder="Phone" value={newPerson.phone} onChange={e=>setNewPerson({...newPerson, phone: e.target.value})} style={inpStyle} />
              <input placeholder="Password" value={newPerson.password} onChange={e=>setNewPerson({...newPerson, password: e.target.value})} style={inpStyle} />
              <input placeholder="Address" value={newPerson.address} onChange={e=>setNewPerson({...newPerson, address: e.target.value})} style={inpStyle} />
              <input placeholder="UPI ID" value={newPerson.upi_id} onChange={e=>setNewPerson({...newPerson, upi_id: e.target.value})} style={inpStyle} />
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {labourSkillsList.map(skill => (
                <label key={skill} style={{ background: labourTypes.includes(skill) ? '#10b981' : '#1e293b', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={labourTypes.includes(skill)} onChange={() => setLabourTypes(prev => prev.includes(skill) ? prev.filter(x=>x!==skill) : [...prev, skill])} style={{display:'none'}} /> {skill}
                </label>
              ))}
            </div>
            <button onClick={() => handleAddPerson('Labour')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Register Labour</button>
          </div>

          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}><th style={{padding:'12px'}}>Name & Phone</th><th style={{padding:'12px'}}>Skills</th><th style={{padding:'12px'}}>Password</th><th style={{padding:'12px'}}>Action</th></tr></thead>
            <tbody>
              {labours.filter((l:any)=>!['admin', 'sub admin'].includes((l.labour_type||'').toLowerCase())).map((l:any)=>(
                <tr key={l.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'12px'}}><strong>{l.name}</strong><br/><span style={{color:'#94a3b8', fontSize:'12px'}}>{l.phone}</span></td>
                  <td style={{padding:'12px', color:'#38bdf8'}}>{l.labour_type}</td>
                  <td style={{padding:'12px', color:'#ef4444'}}>{l.password}</td>
                  <td style={{padding:'12px'}}><button onClick={()=>deletePerson(l.id, l.name, 'labours')} style={{background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid #ef4444', padding:'5px 10px', borderRadius:'6px', cursor:'pointer'}}>🗑️ Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. FINANCE & SETTINGS TAB */}
      {subView === 'finance' && (
        <div style={{ background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#f59e0b' }}>⚙️ Company & Commission Settings</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <input placeholder="Company Name" value={appSettings.company_name} onChange={e=>setAppSettings({...appSettings, company_name:e.target.value})} style={inpStyle} />
            <input placeholder="Support Phone" value={appSettings.company_phone} onChange={e=>setAppSettings({...appSettings, company_phone:e.target.value})} style={inpStyle} />
            <input placeholder="GST No." value={appSettings.company_gst} onChange={e=>setAppSettings({...appSettings, company_gst:e.target.value})} style={inpStyle} />
            <input placeholder="Wallet UPI ID" value={appSettings.wallet_upi} onChange={e=>setAppSettings({...appSettings, wallet_upi:e.target.value})} style={inpStyle} />
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div><label style={{fontSize:'12px', color:'#94a3b8', display:'block'}}>Admin Commission %</label><input type="number" value={commissionRate} onChange={e=>setCommissionRate(Number(e.target.value))} style={inpStyle} /></div>
            <div><label style={{fontSize:'12px', color:'#94a3b8', display:'block'}}>Delivery Boy Commission %</label><input type="number" value={deliveryBoyCommRate} onChange={e=>setDeliveryBoyCommRate(Number(e.target.value))} style={inpStyle} /></div>
          </div>
          <button onClick={saveCompanySettings} style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save All Settings</button>
        </div>
      )}
    </div>
  );
}

const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' };
const inpStyle = { padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', flex: 1, minWidth: '180px' };