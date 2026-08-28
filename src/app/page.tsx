"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const shopCategories = [
  { name: "Fashion & Clothing", icon: "👗", desc: "Mens, Womens & Kids Wear" },
  { name: "Mobile & Laptop", icon: "📱", desc: "Smartphones & Accessories" },
  { name: "General Store", icon: "🛒", desc: "Daily Needs & Kirana" },
  { name: "Cosmetics & Beauty", icon: "💄", desc: "Makeup & Skincare" },
  { name: "Stationery & Office", icon: "📚", desc: "Books, Pens & Supplies" },
  { name: "Hardware & Building", icon: "🏗️", desc: "Heavy Iron & Cement" }
];

const featuredProducts = [
  { title: "Trending Fashion / Kurtis", price: "Best Retail Price", img: "👕", tag: "Fashion" },
  { title: "Smartphones & Accessories", price: "Wholesale Rates", img: "💻", tag: "Electronics" },
  { title: "Daily Needs & Groceries", price: "Fresh & Packed", img: "🧴", tag: "General" },
  { title: "Beauty & Cosmetic Kit", price: "Top Brands", img: "💅", tag: "Beauty" },
  { title: "School & Office Stationery", price: "Bulk Available", img: "✏️", tag: "Stationery" },
  { title: "Building Materials / TMT", price: "Heavy Stock", img: "🧱", tag: "Hardware" }
];

export default function ShopOwnerHomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // 🔥 AUTO LOGIN & 24H SECURITY CHECK 🔥
    const shopData = localStorage.getItem('fixifiy_shop');
    const loginTime = localStorage.getItem('shop_login_time'); 

    if (shopData) {
      if (loginTime && !isNaN(parseInt(loginTime))) {
        const currentTime = new Date().getTime();
        const timePassed = currentTime - parseInt(loginTime);
        const hours24 = 24 * 60 * 60 * 1000; // 24 ghante milliseconds mein

        if (timePassed > hours24) {
          // ⏳ 24 ghante se zyada ho gaye -> Auto Logout kar do
          localStorage.removeItem('fixifiy_shop');
          localStorage.removeItem('shop_login_time');
        } else {
          // ✅ 24 ghante ke andar hai -> Seedha Dashboard bhejo
          router.replace('/shop-owner-dashboard');
        }
      } else {
        // 🔥 FIX: Agar time save nahi tha, toh abhi ka time daal do taaki timer start ho jaye!
        localStorage.setItem('shop_login_time', new Date().getTime().toString());
        router.replace('/shop-owner-dashboard');
      }
    }
  }, [router]);

  const handleNavigation = (path: string) => {
    try {
      router.push(path);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isMounted) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#020617', color: '#38bdf8', fontFamily: 'sans-serif' }}>
        <h2>Loading Fixifiy Partner...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', flexDirection: 'column', 
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)', 
      fontFamily: 'sans-serif', color: '#f8fafc', boxSizing: 'border-box', paddingBottom: '40px'
    }}>
      
      {/* 1. Top Professional Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🏬</span>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#38bdf8' }}>
            Fixifiy <span style={{ color: '#fff', fontWeight: '400', fontSize: '13px' }}>Partner</span>
          </h2>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleNavigation('/login')} 
            style={{ 
              background: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', 
              padding: '6px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' 
            }}
          >
            Login
          </button>
          <button 
            onClick={() => handleNavigation('/login')} 
            style={{ 
              background: '#38bdf8', color: '#0f172a', border: 'none', 
              padding: '6px 14px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '12px',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
            }}
          >
            Register
          </button>
        </div>
      </div>

      {/* 2. Guest Hero Banner */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #2563eb 100%)', 
          borderRadius: '16px', padding: '24px 20px', textAlign: 'left',
          boxShadow: '0 10px 25px rgba(2, 132, 199, 0.3)', border: '1px solid rgba(255,255,255,0.15)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '90px', opacity: 0.15 }}>🛍️</div>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: '#fef08a' }}>
            🌟 DIGITAL BYAPAR MANCH
          </span>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '12px 0 8px 0', lineHeight: '1.3' }}>
            Apni Dukaan Ko Digital Banayein Aur Pahunchein Hazaron Gahakon Tak
          </h1>
          <p style={{ fontSize: '13px', margin: '0 0 16px 0', color: '#e0f2fe', lineHeight: '1.4' }}>
            Fashion, Electronics, General Store, Cosmetics ya Hardware—ab sab kuch mobile par manage karein!
          </p>
          <button 
            onClick={() => handleNavigation('/login')}
            style={{ 
              backgroundColor: '#ffffff', color: '#0369a1', border: 'none', 
              padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            🚀 Register / Login Now
          </button>
        </div>
      </div>

      {/* 3. Shop Categories Section */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#e2e8f0' }}>
            📂 Shop Categories
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {shopCategories.map((cat, idx) => (
            <div 
              key={idx} 
              onClick={() => handleNavigation('/login')}
              style={{ 
                background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px', padding: '12px 8px', textAlign: 'center', cursor: 'pointer',
                transition: 'transform 0.2s', backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ fontSize: '26px', marginBottom: '6px' }}>{cat.icon}</div>
              <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#f8fafc' }}>{cat.name}</h4>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Featured Product Catalog */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#e2e8f0' }}>
            🔥 Add Your Store Products
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {featuredProducts.map((prod, idx) => (
            <div 
              key={idx} 
              onClick={() => handleNavigation('/login')}
              style={{ 
                background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '14px', padding: '14px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '32px' }}>{prod.img}</span>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px' }}>
                    {prod.tag}
                  </span>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#f8fafc', lineHeight: '1.3' }}>
                  {prod.title}
                </h4>
                <p style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', margin: '0 0 12px 0' }}>
                  {prod.price}
                </p>
              </div>

              <button style={{ 
                width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', 
                padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' 
              }}>
                + Add / View Stock
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}