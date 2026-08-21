import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Hum yahan check kar rahe hain ki file sach mein read ho rahi hai ya nahi
console.log("👉 SUPABASE URL IN BUILD:", supabaseUrl);

// Agar URL nahi milta, toh Next.js yahan ek clear message ke sath build rok dega
if (!supabaseUrl || !supabaseKey) {
  throw new Error("🚨 BADE BHAI! Supabase ka URL ya Key nahi mil rahi hai. Pakka .env.local file ka naam galat hai, uske aage .txt lag gaya hai, ya woh galat folder mein hai!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);