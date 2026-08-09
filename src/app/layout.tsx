import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        
        {/* Navigation Bar */}
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '15px 40px', 
          backgroundColor: '#ffffff', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          
          {/* Brand Name */}
          <a href="/" style={{ fontSize: '22px', fontWeight: '900', textDecoration: 'none', color: '#2563eb' }}>
            FIXIFIY
          </a>

          {/* Menu Buttons - Sabhi buttons ab login page se jude hain */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            
            {/* Customer Login */}
            <a href="/login?role=customer" style={{ padding: '8px 14px', backgroundColor: '#8b5cf6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}>
              👥 Customer
            </a>

            {/* Labour Login */}
            <a href="/login?role=labour" style={{ padding: '8px 14px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}>
              👷 Labour
            </a>

            {/* Shop Owner Login */}
            <a href="/login?role=shop-owner" style={{ padding: '8px 14px', backgroundColor: '#f59e0b', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}>
              🏪 Shop Owner
            </a>

            {/* Admin Login */}
            <a href="/login?role=admin" style={{ padding: '5px 10px', backgroundColor: '#334155', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '11px' }}>
              👑 Admin
            </a>
          </div>
        </nav>

        {/* Page Content */}
        <main style={{ minHeight: '85vh', padding: '20px' }}>
          {children}
        </main>

      </body>
    </html>
  );
}