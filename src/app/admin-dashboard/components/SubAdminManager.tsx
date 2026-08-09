"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SubAdminManager({ subAdmins, dynamicLocations, fetchData }: any) {
  const [newSubAdmin, setNewSubAdmin] = useState({
    name: '', phone: '', password: '', address: '', state: '', district: '', upi_id: '', powers: [] as string[]
  });
  const [subAdminZones, setSubAdminZones] = useState<string[]>([]);
  const [customZoneInput, setCustomZoneInput] = useState('');
  const [zoneStateInput, setZoneStateInput] = useState('');
  const [zoneDistrictInput, setZoneDistrictInput] = useState('');

  // Database aur dynamic locations se saare states ki list
  const availableStates = Object.keys(dynamicLocations || {}).sort();
  
  // Selected Home State ke pure districts ki list
  const availableHomeDistricts = newSubAdmin.state && dynamicLocations[newSubAdmin.state] 
    ? Object.keys(dynamicLocations[newSubAdmin.state]).sort() 
    : [];

  // Selected Zone State ke pure districts ki list
  const availableZoneDistricts = zoneStateInput && dynamicLocations[zoneStateInput] 
    ? Object.keys(dynamicLocations[zoneStateInput]).sort() 
    : [];

  const availablePowers = [
    'Manage Orders', 
    'Manage Labours', 
    'Manage Shop Owners', 
    'Wallet Control', 
    'Manage Inventory', 
    'Manage Approvals', 
    'Manage Locations'
  ];

  const togglePower = (power: string) => {
    setNewSubAdmin(prev => {
      const powers = prev.powers.includes(power) ? prev.powers.filter(p => p !== power) : [...prev.powers, power];
      return { ...prev, powers };
    });
  };

  const handleAddZone = () => {
    let newZone = customZoneInput.trim() ? customZoneInput.trim() : zoneDistrictInput ? `${zoneDistrictInput} (${zoneStateInput})` : '';
    if (!newZone) return alert("Kripya State/District select karein ya Custom Area (jaise Noida, Sector 62) type karein.");
    if (subAdminZones.includes(newZone)) alert("Ye zone pehle se added hai."); 
    else setSubAdminZones([...subAdminZones, newZone]);
    setCustomZoneInput(''); setZoneDistrictInput('');
  };

  const handleRemoveZone = (zone: string) => {
    setSubAdminZones(subAdminZones.filter(z => z !== zone));
  };

  const handleAddSubAdmin = async () => {
    if (!newSubAdmin.name || !newSubAdmin.phone || !newSubAdmin.password) return alert("Naam, Phone aur Password daalna zaroori hai!");
    if (!newSubAdmin.state || !newSubAdmin.district) return alert("Home State aur District select karna zaroori hai!");
    if (newSubAdmin.powers.length === 0) return alert("Kripya Sub-Admin ko kam se kam ek power assign karein!");
    
    try {
      const { error } = await supabase.from('sub_admins').insert([{
        name: newSubAdmin.name,
        phone: newSubAdmin.phone,
        password: newSubAdmin.password,
        address: newSubAdmin.address || 'N/A',
        state: newSubAdmin.state,
        district: newSubAdmin.district,
        upi_id: newSubAdmin.upi_id || 'N/A',
        status: 'Active',
        permissions: newSubAdmin.powers.join(', '),
        assigned_zones: subAdminZones.length > 0 ? subAdminZones.join(' | ') : `${newSubAdmin.district} (${newSubAdmin.state})`
      }]);

      if (error) throw error;
      alert(`✅ Sub Admin '${newSubAdmin.name}' successfully add ho gaya!`);
      setNewSubAdmin({ name: '', phone: '', password: '', address: '', state: '', district: '', upi_id: '', powers: [] });
      setSubAdminZones([]);
      fetchData();
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const terminateSubAdmin = async (id: number, name: string) => {
    if (window.confirm(`Kya aap sach mein '${name}' ka Sub-Admin account terminate karna chahte hain?`)) {
      await supabase.from('sub_admins').delete().eq('id', id);
      fetchData();
      alert("Sub-Admin terminated successfully!");
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>🛠️ Smart Zonal Sub-Admins & Advanced Powers Control</h2>
      <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '14px' }}>
        Database se fetch kiye gaye saare States aur unke respective Districts ab automatic dropdown mein available hain. Aap Noida jaisi custom localities bhi add kar sakte hain.
      </p>

      {/* Registration Form */}
      <div style={{ background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <input placeholder="Manager Full Name" value={newSubAdmin.name} onChange={e => setNewSubAdmin({...newSubAdmin, name: e.target.value})} style={inpStyle} />
          <input placeholder="Phone Number" value={newSubAdmin.phone} onChange={e => setNewSubAdmin({...newSubAdmin, phone: e.target.value})} style={inpStyle} />
          <input placeholder="Secure Password" value={newSubAdmin.password} onChange={e => setNewSubAdmin({...newSubAdmin, password: e.target.value})} style={inpStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {/* State Selection */}
          <select value={newSubAdmin.state} onChange={e => setNewSubAdmin({...newSubAdmin, state: e.target.value, district: ''})} style={inpStyle}>
            <option value="">-- Select Home State --</option>
            {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Full District List based on Selected State */}
          <select value={newSubAdmin.district} onChange={e => setNewSubAdmin({...newSubAdmin, district: e.target.value})} style={inpStyle} disabled={!newSubAdmin.state}>
            <option value="">-- Select District --</option>
            {availableHomeDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <input placeholder="UPI ID (Optional)" value={newSubAdmin.upi_id} onChange={e => setNewSubAdmin({...newSubAdmin, upi_id: e.target.value})} style={inpStyle} />
        </div>

        {/* Powers Box */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
          <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase' }}>🛡️ Assign Administrative Powers</strong>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {availablePowers.map(power => {
              const isSelected = newSubAdmin.powers.includes(power);
              return (
                <div key={power} onClick={() => togglePower(power)} style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', background: isSelected ? '#38bdf8' : 'rgba(255,255,255,0.05)', color: isSelected ? '#0f172a' : '#cbd5e1', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                  {isSelected ? '✓ ' : '+ '} {power}
                </div>
              );
            })}
          </div>
        </div>

        {/* Territories/Zones Box */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
          <strong style={{ color: '#a78bfa', display: 'block', marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase' }}>🗺️ Assign Territory Zones (e.g., Noida, Sector 62, etc.)</strong>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <select value={zoneStateInput} onChange={e => {setZoneStateInput(e.target.value); setZoneDistrictInput('');}} style={{...inpStyle, flex: 1, minWidth: '150px'}}>
              <option value="">Select State</option>
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={zoneDistrictInput} onChange={e => setZoneDistrictInput(e.target.value)} disabled={!zoneStateInput} style={{...inpStyle, flex: 1, minWidth: '150px'}}>
              <option value="">Select District</option>
              {availableZoneDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div style={{color: '#64748b', display: 'flex', alignItems: 'center'}}>OR</div>
            <input type="text" placeholder="Type Custom Area (e.g. Noida)" value={customZoneInput} onChange={e => setCustomZoneInput(e.target.value)} style={{...inpStyle, flex: 1.5, minWidth: '200px'}} />
            <button onClick={handleAddZone} style={{ background: '#a78bfa', color: '#0f172a', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' }}>Add Zone +</button>
          </div>
          
          <div style={{ background: '#0a0f1c', minHeight: '50px', borderRadius: '8px', padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', border: '1px dashed rgba(139, 92, 246, 0.3)' }}>
            {subAdminZones.length === 0 && <div style={{ color: '#475569', fontSize: '13px', alignSelf: 'center', width: '100%', textAlign: 'center' }}>No custom zones added. (Will control selected district by default).</div>}
            {subAdminZones.map(zone => (
              <div key={zone} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#c4b5fd', border: '1px solid #8b5cf6', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 {zone} <span onClick={() => handleRemoveZone(zone)} style={{cursor: 'pointer', color: '#ef4444', fontWeight: 'bold'}}>✖</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleAddSubAdmin} style={{ background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
          🚀 Initialize Sub-Admin Environment
        </button>
      </div>

      {/* Sub-Admins List Table */}
      <div style={{ overflowX: 'auto', background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'white' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{padding:'15px'}}>Manager Profile</th>
              <th style={{padding:'15px'}}>Home Territory</th>
              <th style={{padding:'15px'}}>Assigned Powers</th>
              <th style={{padding:'15px'}}>Assigned Zones / Areas</th>
              <th style={{padding:'15px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subAdmins.map((s: any) => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{padding:'15px'}}>
                  <strong style={{color: '#e2e8f0'}}>{s.name}</strong><br/>
                  <span style={{fontSize: '12px', color: '#94a3b8'}}>📞 {s.phone}</span><br/>
                  <span style={{fontSize: '11px', color: '#ef4444'}}>Pass: {s.password}</span>
                </td>
                <td style={{padding:'15px'}}>
                  <span style={{ color: '#ec4899', fontSize: '11px', background: 'rgba(236,72,153,0.1)', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{s.district}, {s.state}</span>
                </td>
                <td style={{padding:'15px', whiteSpace: 'normal', maxWidth: '220px'}}>
                  <span style={{ color: '#38bdf8', fontSize: '12px', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', lineHeight: '1.5' }}>{s.permissions || 'Full Access'}</span>
                </td>
                <td style={{padding:'15px', whiteSpace: 'normal', maxWidth: '250px'}}>
                  {s.assigned_zones ? s.assigned_zones.split(' | ').map((z:string, i:number) => (
                    <span key={i} style={{ color: '#a78bfa', fontSize: '11px', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', margin: '2px', display: 'inline-block' }}>📍 {z}</span>
                  )) : <span style={{color: '#64748b', fontSize: '12px'}}>Default Zone</span>}
                </td>
                <td style={{padding:'15px'}}>
                  <button onClick={() => terminateSubAdmin(s.id, s.name)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Terminate</button>
                </td>
              </tr>
            ))}
            {subAdmins.length === 0 && (
              <tr><td colSpan={5} style={{padding:'30px', textAlign:'center', color: '#64748b'}}>No Sub-Admins registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inpStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' as const };