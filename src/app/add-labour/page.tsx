"use client";
import { useState } from 'react';

// Yeh line aapki root folder wali supabase.js file ko connect karti hai.
// (Agar path ka error aaye, toh '../../supabase' ki jagah '../supabase' try kijiyega)
import { supabase } from '../../supabase'; 

export default function AddLabour() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wage, setWage] = useState('');

  async function saveLabour() {
    // Chhota sa check taaki khali details save na hon
    if (!name || !phone || !wage) {
      alert("Bhai, saari details bharna zaroori hai!");
      return;
    }

    const { error } = await supabase.from('labours').insert([
      { name: name, phone: phone, daily_wage: wage }
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Labour Successfully Added! 🎉");
      // Form ko wapas khali karne ke liye
      setName(''); 
      setPhone(''); 
      setWage('');
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Naya Labour Add Karein</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          placeholder="Labour ka Naam" 
          onChange={(e) => setName(e.target.value)} 
          value={name} 
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <input 
          placeholder="Mobile Number" 
          onChange={(e) => setPhone(e.target.value)} 
          value={phone} 
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <input 
          placeholder="Roj ki Dihadi (Wage)" 
          type="number" 
          onChange={(e) => setWage(e.target.value)} 
          value={wage} 
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <button 
          onClick={saveLabour}
          style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Save Labour
        </button>
      </div>
    </div>
  );
}