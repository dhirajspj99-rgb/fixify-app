"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const labourSkillsList = [
  "General Labour (Helper)", "Raj Mistri (Mason)", "Iron Welder", "Steel Work", 
  "Electrician", "Plumber", "Furniture / Carpenter", "Painter", "UPVC Windows", "Aluminium Work",
  "AC Service & Repair", "RO & Water Purifier", "Washing Machine Repair", 
  "Refrigerator Repair", "House Deep Cleaning", "Bathroom Cleaning"
];

export default function LabourManager({ labours, fetchData }: any) {
  // 🚀 ANTI-HANG ARCHITECTURE: Only one selected profile at a time
  const [viewProfile, setViewProfile] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // ⚙️ PRICING SETTINGS (Work-wise & State-wise)
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [skillRates, setSkillRates] = useState<Record<string, string>>({});
  const [statePercents, setStatePercents] = useState<Record<string, string>>({"Bihar (Base)": "0"});
  const [newStateName, setNewStateName] = useState('');
  const [newStateVal, setNewStateVal] = useState('');

  // ➕ ADD NEW LABOUR
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabour, setNewLabour] = useState({ name: '', phone: '', password: '', state: '', district: '', address: '', upi_id: '' });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadPricingSettings();
  }, []);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // ================= ⚙️ PRICING LOGIC =================
  const loadPricingSettings = async () => {
    const { data } = await supabase.from('app_settings').select('labour_rates, state_multipliers').limit(1).maybeSingle();
    
    // Load Skill Rates
    let loadedSkills: Record<string, string> = {};
    labourSkillsList.forEach(s => loadedSkills[s] = '500'); // Default 500 for all
    if (data?.labour_rates) {
      try {
        const parsed = typeof data.labour_rates === 'string' ? JSON.parse(data.labour_rates) : data.labour_rates;
        loadedSkills = { ...loadedSkills, ...parsed };
      } catch(e) {}
    }
    setSkillRates(loadedSkills);

    // Load State Multipliers
    if (data?.state_multipliers) {
      try {
        const parsed = typeof data.state_multipliers === 'string' ? JSON.parse(data.state_multipliers) : data.state_multipliers;
        setStatePercents(parsed);
      } catch(e) {}
    }
  };

  const handleSavePricing = async () => {
    try {
      await supabase.from('app_settings').update({ 
        labour_rates: skillRates,
        state_multipliers: statePercents
      }).eq('id', 1);
      
      showNotification("✅ Pricing & Commission Saved!");
      setShowPricingModal(false);
    } catch (e: any) { alert("Error saving pricing: " + e.message); }
  };

  const addStateMultiplier = () => {
    if (!newStateName.trim() || !newStateVal.trim()) return alert("Enter State name and Percentage!");
    setStatePercents(prev => ({ ...prev, [newStateName.trim()]: newStateVal }));
    setNewStateName(''); setNewStateVal('');
  };

  const removeStateMultiplier = (state: string) => {
    if (state.includes('Bihar')) return alert("Base State (Bihar/Patna) cannot be removed.");
    const updated = { ...statePercents };
    delete updated[state];
    setStatePercents(updated);
  };

  const updateSkillRate = (skill: string, val: string) => {
    setSkillRates(prev => ({ ...prev, [skill]: val }));
  };

  // ================= ➕ ADD LABOUR LOGIC =================
  const submitNewLabour = async () => {
    if (!newLabour.name || !newLabour.phone || !newLabour.password) return alert("Name, Phone, and Password are required!");
    if (selectedSkills.length === 0) return alert("Select at least one skill!");
    
    setIsAdding(true);
    try {
      const { error } = await supabase.from('labours').insert([{
        name: newLabour.name, phone: newLabour.phone, password: newLabour.password,
        state: newLabour.state, district: newLabour.district, address: newLabour.address,
        upi_id: newLabour.upi_id, labour_type: selectedSkills.join(', '), status: 'Approved'
      }]);
      
      if (error) throw error;
      showNotification("✅ New Labour Added Successfully!");
      setShowAddModal(false);
      setNewLabour({ name: '', phone: '', password: '', state: '', district: '', address: '', upi_id: '' });
      setSelectedSkills([]);
      fetchData();
    } catch (e: any) { alert("Error: " + e.message); }
    setIsAdding(false);
  };

  // ================= 📋 CONTROLS =================
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('labours').update({ status: newStatus }).eq('id', id);
      showNotification(`✅ Status updated to ${newStatus}`);
      fetchData(); 
      if(viewProfile && viewProfile.id === id) setViewProfile({...viewProfile, status: newStatus});
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleVerifyAadhaar = async (id: string, status: string) => {
    await supabase.from('labours').update({ aadhaar_verified: status }).eq('id', id);
    showNotification(`✅ Aadhaar marked as ${status}`);
    fetchData(); 
    if(viewProfile && viewProfile.id === id) setViewProfile({...viewProfile, aadhaar_verified: status});
  };

  const filteredLabours = (labours || []).filter((l: any) => 
    (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.phone || '').includes(searchQuery)
  );

  return (
    <div className="fade-in" style={{ position: 'relative', paddingBottom: '40px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* 🔔 FLOATING TOAST */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: '#fff', padding: '15px 25px', borderRadius: '10px', fontWeight: '900', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 10000, animation: 'slideIn 0.4s ease-out' }}>
          {toastMsg}
        </div>
      )}

      {/* 🚀 HEADER & ACTION BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: '#10b981', margin: '0 0 5px 0', fontSize: '26px' }}>👷 Master Labour Control</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Manage pricing, skills, and approvals without lag.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowPricingModal(true)} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            ⚙️ Rate & Commission Settings
          </button>
          <button onClick={() => setShowAddModal(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            ➕ Register New Labour
          </button>
        </div>
      </div>

      {/* 📋 LABOUR DIRECTORY (Optimized) */}
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 15px rgba(0,0,0,0.3)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, color: 'white' }}>📋 Labour Directory ({filteredLabours.length})</h3>
          <input type="text" placeholder="🔍 Search Name or Phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid #334155', background: '#1e293b', color: 'white', outline: 'none', width: '250px' }} />
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#1e293b', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '15px' }}>Labour Info</th>
                <th style={{ padding: '15px' }}>Skills & Type</th>
                <th style={{ padding: '15px' }}>Wallet / Docs</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Action / Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabours.length === 0 ? <tr><td colSpan={4} style={{textAlign:'center', padding:'30px', color:'#64748b'}}>No records found.</td></tr> : 
                filteredLabours.map((labour: any) => (
                <tr key={labour.id} style={{ borderBottom: '1px solid #1e293b', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background='#1e293b50'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#f8fafc' }}>{labour.name} {labour.is_prime && '👑'}</div>
                    <div style={{ fontSize: '13px', color: '#38bdf8', marginTop: '4px' }}>{labour.phone}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>📍 {labour.district ? `${labour.district}, ` : ''}{labour.state || 'Location N/A'}</div>
                  </td>
                  <td style={{ padding: '15px', fontSize: '12px', color: '#cbd5e1', maxWidth: '200px', lineHeight: '1.5' }}>
                    {labour.labour_type || 'No skills added'}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ color: '#10b981', fontWeight: '900', fontSize: '16px', marginBottom: '6px' }}>₹{labour.balance || 0}</div>
                    <span style={{ fontSize: '10px', background: labour.aadhaar_verified === 'Verified' ? '#10b98120' : '#f59e0b20', color: labour.aadhaar_verified === 'Verified' ? '#10b981' : '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Aadhaar: {labour.aadhaar_verified || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button onClick={() => setViewProfile(labour)} style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                      👁️ View & Manage
                    </button>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {labour.status !== 'Approved' && <button onClick={() => handleUpdateStatus(labour.id, 'Approved')} style={{ flex: 1, background: '#10b981', color: '#000', border: 'none', padding: '6px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor:'pointer' }}>Approve</button>}
                      {labour.status !== 'Suspended' && <button onClick={() => handleUpdateStatus(labour.id, 'Suspended')} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor:'pointer' }}>Suspend</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODALS (Optimized outside the loop) ===================== */}

      {/* ⚙️ 1. PRICING & COMMISSION MODAL */}
      {showPricingModal && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle, maxWidth: '600px'}}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#f59e0b' }}>⚙️ Global Pricing & Commission</h3>
              <button onClick={() => setShowPricingModal(false)} style={closeBtnStyle}>&times;</button>
            </div>
            
            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '5px' }}>
              
              <h4 style={{ color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '8px', marginTop: 0 }}>📍 State-Wise Percentage (+ / -)</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>Base Location is Patna (Bihar) with 0% extra charge. Other states will calculate relative to Base.</p>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input type="text" placeholder="State Name (e.g. Delhi)" value={newStateName} onChange={e=>setNewStateName(e.target.value)} style={{...inpStyle, flex: 2, marginBottom: 0}} />
                <input type="number" placeholder="% (e.g. 15 or -5)" value={newStateVal} onChange={e=>setNewStateVal(e.target.value)} style={{...inpStyle, flex: 1, marginBottom: 0}} />
                <button onClick={addStateMultiplier} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Add</button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                {Object.entries(statePercents).map(([state, percent]) => (
                  <div key={state} style={{ background: '#1e293b', border: '1px solid #334155', padding: '8px 12px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{state}</span>
                    <span style={{ color: Number(percent) >= 0 ? '#10b981' : '#ef4444', fontWeight: '900' }}>{Number(percent) > 0 ? '+' : ''}{percent}%</span>
                    <span onClick={() => removeStateMultiplier(state)} style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}>✖</span>
                  </div>
                ))}
              </div>

              <h4 style={{ color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>🛠️ Work-wise Base Charges (Patna Base)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                {labourSkillsList.map(skill => (
                  <div key={skill} style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '11px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{skill}</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                      <span style={{ padding: '8px 10px', color: '#94a3b8', background: '#334155' }}>₹</span>
                      <input type="number" value={skillRates[skill] || ''} onChange={e => updateSkillRate(skill, e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '8px', outline: 'none', fontWeight: 'bold' }} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
            
            <div style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
              <button onClick={handleSavePricing} style={{ width: '100%', padding: '14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>
                💾 Save Pricing & Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ➕ 2. ADD NEW LABOUR MODAL */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#38bdf8' }}>➕ Register New Labour</h3>
              <button onClick={() => setShowAddModal(false)} style={closeBtnStyle}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input type="text" placeholder="Full Name *" value={newLabour.name} onChange={e => setNewLabour({...newLabour, name: e.target.value})} style={inpStyle} />
              <input type="tel" placeholder="10-Digit Phone *" value={newLabour.phone} onChange={e => setNewLabour({...newLabour, phone: e.target.value})} maxLength={10} style={inpStyle} />
              <input type="text" placeholder="Password *" value={newLabour.password} onChange={e => setNewLabour({...newLabour, password: e.target.value})} style={inpStyle} />
              <input type="text" placeholder="UPI ID (Optional)" value={newLabour.upi_id} onChange={e => setNewLabour({...newLabour, upi_id: e.target.value})} style={inpStyle} />
              <input type="text" placeholder="State" value={newLabour.state} onChange={e => setNewLabour({...newLabour, state: e.target.value})} style={inpStyle} />
              <input type="text" placeholder="District" value={newLabour.district} onChange={e => setNewLabour({...newLabour, district: e.target.value})} style={inpStyle} />
            </div>
            <textarea placeholder="Full Address" value={newLabour.address} onChange={e => setNewLabour({...newLabour, address: e.target.value})} rows={2} style={{...inpStyle, width: '100%', marginBottom: '15px', resize: 'none'}} />
            
            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontWeight: 'bold', marginBottom: '10px' }}>Select Skills *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {labourSkillsList.map(skill => (
                  <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: selectedSkills.includes(skill) ? '#3b82f6' : '#0f172a', color: 'white', padding: '6px 10px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #334155' }}>
                    <input type="checkbox" hidden checked={selectedSkills.includes(skill)} onChange={() => handleSkillToggle(skill)} />
                    {selectedSkills.includes(skill) ? '✓' : '+'} {skill}
                  </label>
                ))}
              </div>
            </div>

            <button onClick={submitNewLabour} disabled={isAdding} style={{ width: '100%', padding: '14px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '16px', cursor: isAdding ? 'not-allowed' : 'pointer' }}>
              {isAdding ? 'Adding...' : '✅ Register Now'}
            </button>
          </div>
        </div>
      )}

      {/* ⚙️ 3. VIEW & MANAGE INDIVIDUAL PROFILE MODAL */}
      {viewProfile && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle, maxWidth: '450px'}}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: 'white' }}>⚙️ Manage Profile</h3>
              <button onClick={() => setViewProfile(null)} style={closeBtnStyle}>&times;</button>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {viewProfile.profile_pic ? (
                <img src={viewProfile.profile_pic} style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #3b82f6', objectFit: 'cover' }} />
              ) : ( <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#3b82f6', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px' }}>👷</div> )}
              <h2 style={{ margin: '12px 0 4px 0', color: 'white' }}>{viewProfile.name} {viewProfile.is_prime && '👑'}</h2>
              <div style={{ color: '#38bdf8', fontSize: '16px', fontWeight: 'bold' }}>{viewProfile.phone}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}><strong>Skills:</strong> {viewProfile.labour_type}</div>
            </div>

            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', color: '#cbd5e1', fontSize: '14px', marginBottom: '15px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'white' }}>Aadhaar & Documents</h4>
              <div style={{ marginBottom: '10px' }}><strong>Aadhaar Number:</strong> {viewProfile.aadhaar_number || <span style={{color:'#ef4444'}}>Not Provided</span>}</div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {viewProfile.aadhaar_front ? <a href={viewProfile.aadhaar_front} target="_blank" style={{ flex: 1, textAlign: 'center', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>Front Doc 👁️</a> : <div style={{ flex:1, padding: '8px', textAlign: 'center', background: '#334155', borderRadius: '6px', fontSize: '12px' }}>No Front</div>}
                {viewProfile.aadhaar_back ? <a href={viewProfile.aadhaar_back} target="_blank" style={{ flex: 1, textAlign: 'center', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>Back Doc 👁️</a> : <div style={{ flex:1, padding: '8px', textAlign: 'center', background: '#334155', borderRadius: '6px', fontSize: '12px' }}>No Back</div>}
              </div>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button onClick={() => handleVerifyAadhaar(viewProfile.id, 'Verified')} style={{ flex: 1, background: '#10b981', color: '#000', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✅ Verify Doc</button>
                <button onClick={() => handleVerifyAadhaar(viewProfile.id, 'Rejected')} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>❌ Reject Doc</button>
              </div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', padding: '15px', borderRadius: '12px', color: '#fef08a', fontSize: '14px', textAlign: 'center' }}>
              <div style={{ fontWeight: '900', marginBottom: '5px', fontSize: '16px' }}>👑 VIP Prime Control</div>
              <div style={{ marginBottom: '10px' }}>Current Status: <strong style={{color: viewProfile.is_prime ? '#10b981' : '#ef4444'}}>{viewProfile.is_prime ? `Active till ${new Date(viewProfile.prime_expiry).toLocaleDateString()}` : 'Not Active'}</strong></div>
              <button onClick={() => handleGrantPrime(viewProfile.id)} style={{ width: '100%', background: '#f59e0b', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>
                ⭐ Grant / Extend 3 Months Prime
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// STYLES
const inpStyle = { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '15px' };
const modalOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(5px)' };
const modalContentStyle = { background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '25px', position: 'relative' as const, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' };
const modalHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #1e293b' };
const closeBtnStyle = { background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer', lineHeight: '1' };