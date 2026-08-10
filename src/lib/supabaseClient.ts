import { createClient } from '@supabase/supabase-js';

// हमने process.env हटा दिया है ताकि Vercel की गलत सेटिंग कोड को क्रैश न कर पाए
const supabaseUrl = "https://pscjrxinuezsjumybuza.supabase.co";
const supabaseAnonKey = "sb_publishable_rHK6HsACswJM96HNRstYKQ_3MzY_y4b";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);