import { supabase } from './supabaseClient'; // Apne supabase file ka path check kar lein

// 1. Role-based Login function
export const loginUser = async (email, password, role) => {
  const table = role === 'customer' ? 'customers' : role === 'labour' ? 'labours' : 'shop_owners';
  
  // Supabase check
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('phone', email) // Agar aap phone use kar rahe hain
    .eq('password', password)
    .single();

  if (error || !data) return { success: false, error: "Invalid credentials" };
  
  // Data save karna
  localStorage.setItem('user_id', data.id);
  localStorage.setItem('user_role', role);
  return { success: true, data };
};

// 2. Role Verification (Har page par ye check lagayein)
export const checkAuth = (requiredRole) => {
  const role = localStorage.getItem('user_role');
  if (!role || role !== requiredRole) {
    window.location.href = '/login'; // Unauthorized hone par login par bhejein
  }
};

// 3. Logout
export const logout = () => {
  localStorage.clear();
  window.location.href = '/';
};