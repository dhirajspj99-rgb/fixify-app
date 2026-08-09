"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LocationManager({ dynamicLocations, fetchData }: any) {
  const [newLoc, setNewLoc] = useState({ state: '', district: '', block: '' });
  const availableStates = Object.keys(dynamicLocations).sort();
  const availableDistricts = newLoc.state ? Object.keys(dynamicLocations[newLoc.state] || {}).sort() : [];

  const handleAddLocation = async () => {
    if (!newLoc.state || !newLoc.district || !newLoc.block) {
      return alert("State, District aur Block teeno ka naam daalna zaroori hai!");
    }

    try {
      const { error } = await supabase.from('service_locations').insert([{
        state: newLoc.state.trim(),
        district: newLoc.district.trim(),
        block: newLoc.block.trim()
      }]);

      if (error) throw error;
      alert(`✅ Success! Naya service area (${newLoc.block}, ${newLoc.district}) add ho gaya.`);
      setNewLoc({ state: '', district: '', block: '' });
      fetchData();
    } catch (e: any) {
      alert("Error adding location: " + e.message);
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>📍 Network Expansion & Location Control</h2>
      <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '14px' }}>
        Agar aapko koi naya Rajya, Zila ya Block shuru karna hai jahan aapki delivery aur labour services jayengi, toh usko yahan initialize karein.
      </p>

      <div style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>State Name (Rajya)</label>
          <input 
            list="state-list" 
            placeholder="E.g., Bihar" 
            value={newLoc.state} 
            onChange={e => setNewLoc({...newLoc, state: e.target.value, district: '', block: ''})} 
            style={inpStyle} 
          />
          <datalist id="state-list">{availableStates.map(s => <option key={s} value={s} />)}</datalist>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>District Name (Zila)</label>
          <input 
            list="district-list" 
            placeholder="E.g., Patna" 
            value={newLoc.district} 
            onChange={e => setNewLoc({...newLoc, district: e.target.value, block: ''})} 
            style={inpStyle} 
            disabled={!newLoc.state} 
          />
          <datalist id="district-list">{availableDistricts.map(d => <option key={d} value={d} />)}</datalist>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Block / Tehsil Name</label>
          <input 
            placeholder="E.g., Danapur" 
            value={newLoc.block} 
            onChange={e => setNewLoc({...newLoc, block: e.target.value})} 
            style={inpStyle} 
            disabled={!newLoc.district} 
          />
        </div>

        <button onClick={handleAddLocation} style={{ background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>
          ➕ Initialize New Service Area
        </button>
      </div>
    </div>
  );
}

const inpStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', width: '100%', boxSizing: 'border-box' as const };