"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient("APNA_URL", "APNA_KEY");

export default function AddLabour() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wage, setWage] = useState('');

  async function saveLabour() {
    const { error } = await supabase.from('labours').insert([
      { name: name, phone: phone, daily_wage: wage }
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Labour Successfully Added! 🎉");
      setName(''); setPhone(''); setWage('');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Naya Labour Add Karein</h1>
      <input placeholder="Labour ka Naam" onChange={(e) => setName(e.target.value)} value={name} />
      <input placeholder="Mobile Number" onChange={(e) => setPhone(e.target.value)} value={phone} />
      <input placeholder="Roj ki Dihadi (Wage)" type="number" onChange={(e) => setWage(e.target.value)} value={wage} />
      <button onClick={saveLabour}>Save Labour</button>
    </div>
  );
}