import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT"https://pscjrxinuezsjumybuza.supabase.co "
const supabaseAnonKey = process.env.NEXT_"sb_publishable_rHK6HsACswJM96HNRstYKQ_3MzY_y4b"
const finalUrl = url.startsWith('http') ? url : `https://${url}`;
export const supabase = createClient(finalUrl, key);
