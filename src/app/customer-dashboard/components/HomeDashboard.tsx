"use client";
import React from 'react';

// 🔥 Interface mein saare props aur 'selectedLanguage' add kar diya hai
interface HomeDashboardProps {
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
  setAppStep: (step: any) => void;
  setSelectedCategory?: (cat: string | null) => void;
  homeCategories?: any[];
  handleCategoryClick?: (cat: any) => void;
  selectedLanguage?: string; // 🔥 LANGUAGE PROP ADDED
}

export default function HomeDashboard({ setAppStep, selectedLanguage = 'English' }: HomeDashboardProps) {
  
  // 🌐 MULTI-LANGUAGE SYSTEM
  const isHindi = selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी');
  
  const t = {
    badge: isHindi ? "⭐ टॉप रेटेड सर्विसेज" : "⭐ Top Rated Services",
    heroTitle: isHindi ? "वेरीफाइड मिस्त्री बुक करें" : "Book Verified Mistri",
    heroSub: isHindi ? "प्लंबर, इलेक्ट्रीशियन और टेक रिपेयर आपके दरवाजे पर।" : "Plumber, Electrician & Tech repairs at your doorstep.",
    exploreBtn: isHindi ? "सर्विसेज देखें ➔" : "Explore Services ➔",
    
    transportTitle: isHindi ? "फ़ास्ट ट्रांसपोर्ट डिलीवरी" : "Fast Transport Delivery",
    transportSub: isHindi ? "लाइव GPS से अपना सामान ट्रैक करें।" : "Track your materials with live GPS.",
    
    genuineTitle: isHindi ? "100% असली प्रोडक्ट्स" : "100% Genuine Products",
    genuineSub: isHindi ? "क्वालिटी टेस्टेड मटेरियल और इलेक्ट्रॉनिक्स।" : "Quality tested materials & electronics."
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '15px' }}>
      
      <style>
        {`
          /* 🔥 PREMIUM AUTO-ADJUSTING HERO BANNER 🔥 */
          .hero-banner-mini {
            background: linear-gradient(135deg, #0f172a 0%, #2563eb 100%);
            border-radius: 16px;
            padding: clamp(12px, 3vw, 18px) clamp(16px, 4vw, 24px);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
            margin-bottom: 20px;
            gap: 12px;
            flex-wrap: wrap;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          /* Background Design Element */
          .hero-banner-mini::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -20px;
            width: 150px;
            height: 150px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 50%;
            z-index: 0;
          }

          .hero-content {
            flex: 1 1 200px;
            z-index: 1;
          }

          .top-badge {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            color: #facc15;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: clamp(9px, 2vw, 10px);
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            display: inline-block;
            margin-bottom: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .hero-title-mini {
            font-size: clamp(17px, 4vw, 22px);
            margin: 4px 0;
            font-weight: 900;
            line-height: 1.2;
            letter-spacing: -0.5px;
          }

          .hero-subtitle-mini {
            margin: 0 0 12px 0;
            font-size: clamp(11px, 2.5vw, 13px);
            color: #cbd5e1;
            max-width: 280px;
            line-height: 1.3;
          }

          .hero-emoji-mini {
            font-size: clamp(40px, 8vw, 55px);
            line-height: 1;
            z-index: 1;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
            animation: floatEmoji 3s ease-in-out infinite;
          }

          .hero-btn-mini {
            background: white;
            color: #0f172a;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-weight: 800;
            font-size: clamp(11px, 2.5vw, 13px);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }

          .hero-btn-mini:hover {
            transform: translateY(-3px);
            background: #f8fafc;
            box-shadow: 0 6px 15px rgba(255, 255, 255, 0.3);
          }

          /* Floating Animation */
          @keyframes floatEmoji {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0px); }
          }

          /* 🔥 UPGRADED OFFER CARDS 🔥 */
          .offer-card {
            padding: 12px 15px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: default;
          }
          
          .offer-card:hover {
            transform: translateY(-2px);
          }

          .offer-transport {
            background: linear-gradient(to right, #fff7ed, #ffedd5);
            border: 1px solid #fdba74;
            box-shadow: 0 4px 10px rgba(253, 186, 116, 0.15);
          }

          .offer-genuine {
            background: linear-gradient(to right, #f0fdf4, #dcfce7);
            border: 1px solid #86efac;
            box-shadow: 0 4px 10px rgba(134, 239, 172, 0.15);
          }
        `}
      </style>

      {/* 1. COMPACT & PREMIUM MISTRI HERO BANNER */}
      <div className="hero-banner-mini">
        <div className="hero-content">
          <div className="top-badge">{t.badge}</div>
          <h2 className="hero-title-mini">{t.heroTitle}</h2>
          <p className="hero-subtitle-mini">{t.heroSub}</p>
          <button className="hero-btn-mini" onClick={() => setAppStep('hire_labour')}>
            {t.exploreBtn}
          </button>
        </div>
        <div className="hero-emoji-mini">🛠️</div>
      </div>

      {/* 2. UPGRADED PREMIUM OFFER CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div className="offer-card offer-transport">
          <div style={{ fontSize: '26px', filter: 'drop-shadow(0 2px 4px rgba(234,88,12,0.2))' }}>🚚</div>
          <div>
            <h4 style={{ margin: '0 0 2px 0', color: '#9a3412', fontSize: '14px', fontWeight: '800' }}>{t.transportTitle}</h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#c2410c', fontWeight: '500' }}>{t.transportSub}</p>
          </div>
        </div>
        
        <div className="offer-card offer-genuine">
          <div style={{ fontSize: '26px', filter: 'drop-shadow(0 2px 4px rgba(22,163,74,0.2))' }}>✅</div>
          <div>
            <h4 style={{ margin: '0 0 2px 0', color: '#166534', fontSize: '14px', fontWeight: '800' }}>{t.genuineTitle}</h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#15803d', fontWeight: '500' }}>{t.genuineSub}</p>
          </div>
        </div>
      </div>

    </div>
  );
}