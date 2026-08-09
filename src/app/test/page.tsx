"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Apni .env.local file se URL aur Key nikal rahe hain
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase client bana rahe hain
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TestPage() {
  const [status, setStatus] = useState("Checking Connection...");

  useEffect(() => {
    async function checkConnection() {
      try {
        // Supabase ke Auth system se baat karne ki koshish kar rahe hain
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus("Connection Failed ❌: " + error.message);
        } else {
          setStatus("Supabase Successfully Connected! 🎉");
        }
      } catch (err) {
        setStatus("Connection Failed ❌: URL ya Key sahi nahi hai.");
      }
    }
    checkConnection();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '24px', fontFamily: 'sans-serif' }}>
      <h1>Supabase Connection Test</h1>
      <p style={{ color: status.includes("Successfully") ? "green" : "red" }}>
        {status}
      </p>
    </div>
  );
}