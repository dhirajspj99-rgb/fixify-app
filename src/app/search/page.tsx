"use client";
import { useState } from 'react';

// 1. Dummy Product Data (Baad mein ye Supabase database se aayega)
const allProducts = [
  { id: 1, name: 'Smart TV 43 Inch', category: 'Electronics', price: '₹25,000' },
  { id: 2, name: 'Gaming Laptop', category: 'Electronics', price: '₹65,000' },
  { id: 3, name: 'Wireless Headphones', category: 'Accessories', price: '₹2,500' },
  { id: 4, name: 'Running Shoes', category: 'Fashion', price: '₹1,800' },
  { id: 5, name: 'Cotton T-Shirt', category: 'Fashion', price: '₹499' },
  { id: 6, name: 'Smart Watch', category: 'Accessories', price: '₹3,000' },
];

export default function ProductSearchPage() {
  // 2. Search text ko track karne ke liye state
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Search Filter Logic: Agar naam match karega tabhi list mein dikhega
  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <h1 style={{ textAlign: 'center' }}>🛍️ Product Search</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Apna pasandida saman search karein</p>

      {/* Search Input Field */}
      <div style={{ marginTop: '20px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Saman ka naam likhein... (Jaise: Laptop, Shoes)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '15px', 
            fontSize: '16px', 
            borderRadius: '8px', 
            border: '2px solid #0070f3',
            outline: 'none'
          }}
        />
      </div>

      {/* Product List Display */}
      <div>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div 
              key={product.id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                marginBottom: '10px', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{product.name}</h3>
                <span style={{ fontSize: '12px', color: '#888', backgroundColor: '#e0e0e0', padding: '3px 8px', borderRadius: '10px' }}>
                  {product.category}
                </span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                {product.price}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#e74c3c' }}>
            Koi saman nahi mila. Kripya kuch aur search karein. 😔
          </div>
        )}
      </div>

    </div>
  );
}