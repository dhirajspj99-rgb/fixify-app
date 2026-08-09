'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Path check kar lein

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([
    { id: 101, name: "Window AC 1.5 Ton", price: 30000, quantity: 1, type: "product" },
    { id: 102, name: "AC Installation", price: 1000, quantity: 1, type: "labour" }
  ]); 
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState("Home Delivery"); // Nayi State
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const today = new Date();
    today.setDate(today.getDate() + 3);
    const defaultDeliveryDate = today.toISOString().split('T')[0];

    const productList = cartItems
      .filter(item => item.type === 'product')
      .map(item => ({
        ...item,
        availability: 'pending', 
        estimated_delivery: defaultDeliveryDate 
      }));
      
    const labourList = cartItems.filter(item => item.type === 'labour');
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_no: 'ORD-' + Date.now(), 
          customer_name: customerName,
          user_phone: customerPhone,
          total_amount: totalAmount,
          payment_mode: 'Cash on Delivery',
          status: 'pending',
          items: cartItems,
          has_product: productList.length > 0,
          has_labour: labourList.length > 0,
          product_details: productList, 
          labour_details: labourList,
          
          // NAYA DATA: Customer kya chahta hai wo yahan save hoga
          delivery_type: deliveryType 
        }
      ]);

    setLoading(false);

    if (error) {
      console.error("Supabase Error:", error.message);
      alert("Error: " + error.message);
    } else {
      alert("Aapka Order Successfully Place Ho Gaya Hai!");
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Checkout Page</h2>
      
      <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text"
          placeholder="Apna Naam Dalein" 
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)} 
          required
          style={{ padding: '10px' }}
        />
        
        <input 
          type="tel"
          placeholder="Phone Number" 
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)} 
          required
          style={{ padding: '10px' }}
        />

        {/* NAYA INPUT: Delivery Type Select Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label><strong>Delivery Kaisa Chahiye?</strong></label>
          <select 
            value={deliveryType} 
            onChange={(e) => setDeliveryType(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Home Delivery">🚚 Shop Owner Bheje (Home Delivery)</option>
            <option value="Self Pickup">🏪 Customer Khud Pickup Karega (Self Pickup)</option>
          </select>
        </div>

        <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <strong>Total Amount: ₹{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}</strong>
        </div>
        
        <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? "Order Placed ho raha hai..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}