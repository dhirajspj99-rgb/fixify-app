import { createClient } from '@supabase/supabase-js'

// REACT_APP_ को हटाकर NEXT_PUBLIC_ कर दिया गया है
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)