import { createClient } from '@supabase/supabase-js';

// Vercel या लोकल एनवायरनमेंट से सेफली लिंक और की उठाएगा, और खाली होने पर क्रैश नहीं होने देगा
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pscjrxinuezsjumybuza.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_rHK6HsACswJM96HNRstYKQ_3MzY_y4b";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);