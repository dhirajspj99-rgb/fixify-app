'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 

// 🔥 Spelling theek kar di gayi hai (AcceptOrderButton)
export default function AcceptOrderButton({ 
  orderId, 
  currentStatus, 
  paymentMethod, 
  paymentStatus, 
  onStatusChange 
}: any) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    // Safety check
    if (paymentMethod === 'UPI' && paymentStatus === 'pending') {
      alert("Admin dwara payment verify hone ka intezar karein.");
      return;
    }

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
      alert("✅ Order Successfully Accept Kar Liya Gaya!");
      if (onStatusChange) onStatusChange(); 
    }
  };

  if (['accepted', 'processing', 'completed', 'delivered'].includes(currentStatus)) {
    return <span style={{ color: '#10b981', fontWeight: 'bold' }}>Accepted ✅</span>;
  }

  // 🔥 UPI Payment Verification Logic 🔥
  if (paymentMethod === 'UPI') {
    if (paymentStatus === 'pending' || !paymentStatus) {
      return (
        <button 
          disabled
          style={{ padding: '8px 16px', backgroundColor: '#475569', color: '#cbd5e1', border: '1px solid #94a3b8', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold' }}
        >
          🔒 Waiting for Admin
        </button>
      );
    }
    
    if (paymentStatus === 'failed') {
      return (
        <button 
          disabled
          style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold' }}
        >
          ❌ Fake Payment
        </button>
      );
    }
  }

  // 🔥 Default (COD ya UPI Verified) 🔥
  return (
    <button 
      onClick={handleAccept} 
      disabled={loading}
      style={{ padding: '10px 20px', backgroundColor: loading ? '#ccc' : '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px' }}
    >
      {loading ? "Accepting..." : (paymentMethod === 'UPI' ? "✅ Payment Secured (Accept)" : "✅ Accept Order (COD)")}
    </button>
  );
}