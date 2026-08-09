'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 

export default function AceptOrderButton({ orderId, currentStatus, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'accepted' }) 
      .eq('id', orderId);

    setLoading(false);

    if (error) {
      console.error("Order accept error:", error.message);
      alert("Kuch galat ho gaya.");
    } else {
      alert("Order Successfully Accept Kar Liya Gaya!");
      if (onStatusChange) onStatusChange(); 
    }
  };

  if (currentStatus === 'accepted') {
    return <span style={{ color: '#10b981', fontWeight: 'bold' }}>Accepted ✅</span>;
  }

  return (
    <button 
      onClick={handleAccept} 
      disabled={loading}
      style={{
        padding: '8px 16px',
        backgroundColor: loading ? '#ccc' : '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? "Accepting..." : "Accept Order"}
    </button>
  );
}