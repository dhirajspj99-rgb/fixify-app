import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        
        {/* Yahan se Navigation Bar hata diya gaya hai */}

        {/* Page Content (Aapka GuestHomePage yahan load hoga) */}
        <main>
          {children}
        </main>

      </body>
    </html>
  );
}