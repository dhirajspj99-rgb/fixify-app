import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pscjrxinuezsjumybuza.supabase.co "
const supabaseAnonKey = "sb_publishable_rHK6HsACswJM96HNRstYKQ_3MzY_y4b"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
