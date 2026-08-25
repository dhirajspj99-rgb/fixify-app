"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from '@/supabase'; 
import { useRouter } from 'next/navigation';

export default function GuestHomePage() {
  const router = useRouter();
  
  const [productsData, setProductsData] = useState<any[]>([]);
  const [mistrisData, setMistrisData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mistriFilter, setMistriFilter] = useState<string>("All");
  
  // 🔥 Logged-in customer state
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);

  const t = (enText: string, hiText: string) => lang === 'EN' ? enText : hiText;

  const exactShopCategories = [
    "Mobiles & Accessories", "Laptops & Printers", "Cameras",
    "Old Vehicles (Sell/Buy)", "Iron", "Cement", "Aluminium & Steel",
    "Hardware", "Paints", "Furniture", "Electric", "UPVC Windows",
    "UPVC Windows & Gate", "General Store"
  ];

  const homeCategories = [
    { name: 'Mobiles & IT', hiName: 'मोबाइल्स और IT', icon: '📱', match: ["Mobiles & Accessories", "Laptops & Printers", "Cameras"] },
    { name: 'Building Mat.', hiName: 'निर्माण सामग्री', icon: '🏗️', match: ["Iron", "Cement", "Aluminium & Steel"] },
    { name: 'Hardware & Paint', hiName: 'हार्डवेयर और पेंट', icon: '🛠️', match: ["Hardware", "Paints", "Furniture"] },
    { name: 'Electric & UPVC', hiName: 'इलेक्ट्रिक और UPVC', icon: '⚡', match: ["Electric", "UPVC Windows", "UPVC Windows & Gate"] },
    { name: 'Vehicles', hiName: 'पुरानी गाड़ियां', icon: '🚗', match: ["Old Vehicles (Sell/Buy)"] },
    { name: 'General Store', hiName: 'जनरल स्टोर', icon: '🛒', match: ["General Store"] },
  ];

  const mistriDepartments = ['All', 'Rajmistri', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Iron Welder'];

  const standardizeCategory = (catStr: string) => {
    if (!catStr) return 'General Store';
    const c = catStr.toLowerCase();
    if (c.includes('mobile')) return "Mobiles & Accessories";
    if (c.includes('laptop')) return "Laptops & Printers";
    if (c.includes('vehicle') || c.includes('car')) return "Old Vehicles (Sell/Buy)";
    if (c.includes('cement')) return "Cement";
    if (c.includes('aluminium') || c.includes('steel')) return "Aluminium & Steel";
    if (c.includes('iron')) return "Iron";
    if (c.includes('hardware')) return "Hardware";
    if (c.includes('paint')) return "Paints";
    if (c.includes('electric')) return "Electric";
    return catStr.charAt(0).toUpperCase() + catStr.slice(1); 
  };

  useEffect(() => {
    // Check if customer is logged in from localStorage
    const savedCustomer = localStorage.getItem('fixify_customer');
    if (savedCustomer) {
      try {
        setLoggedInCustomer(JSON.parse(savedCustomer));
      } catch (e) {
        console.error(e);
      }
    }

    const fetchData = async () => {
      try {
        const { data: prodData } = await supabase.from('products').select('*').limit(5000).order('id', { ascending: false });
        const { data: labourData } = await supabase.from('labours').select('*').limit(200);
        
        if (prodData && prodData.length > 0) {
          const validProducts = prodData.filter(p => {
             const hasShopOwner = p.shop_id !== null && p.shop_id !== undefined && p.shop_id !== '';
             const stockNum = Number(p.stock);
             const inStock = !isNaN(stockNum) && stockNum > 0;
             return hasShopOwner && inStock; 
          });
          setProductsData(validProducts.map(p => ({ ...p, category: standardizeCategory(p.category) })));
        }

        if (labourData && labourData.length > 0) {
          setMistrisData(labourData.filter((m: any) => String(m.role || '').toLowerCase() !== 'sub admin'));
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleViewItem = (item: any, isMistri: boolean = false) => {
    const type = isMistri ? 'mistri' : 'product';
    router.push(`/details?id=${item.id}&type=${type}`);
  };

  const getImagesArray = (item: any) => {
    if (!item) return ['https://placehold.co/400x300?text=No+Image'];
    if (item.isMistri) return item.avatar ? [item.avatar] : ['https://placehold.co/400x300?text=Mistri'];
    if (!item.image_url || item.image_url.trim() === '') return ['https://placehold.co/400x300?text=Fixifiy'];
    return item.image_url.split(',');
  };

  const groupedProducts = useMemo(() => {
    let filtered = productsData;
    if (activeCategory) {
      const targetCatObj = homeCategories.find(c => c.name === activeCategory);
      if (targetCatObj) filtered = filtered.filter(item => targetCatObj.match.includes(item.category));
    }
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    const groups: Record<string, any[]> = {};
    filtered.forEach(item => {
      const cat = item.category || 'Other Items';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    const sortedGroups: Record<string, any[]> = {};
    exactShopCategories.forEach(cat => {
      if (groups[cat] && groups[cat].length > 0) { sortedGroups[cat] = groups[cat]; delete groups[cat]; }
    });
    Object.keys(groups).forEach(cat => { sortedGroups[cat] = groups[cat]; });

    return sortedGroups;
  }, [productsData, searchTerm, activeCategory]);

  const finalMistris = useMemo(() => {
    let filtered = mistrisData.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (mistriFilter !== "All") filtered = filtered.filter(m => String(m.labour_type || m.category || "").toLowerCase().includes(mistriFilter.toLowerCase()));
    return filtered;
  }, [mistrisData, searchTerm, mistriFilter]);

  const sharedStyles = `
    .main-bg { background: #f8fafc; min-height: 100vh; font-family: system-ui, sans-serif; color: #0f172a; padding-bottom: 0px; }
    .hero-banner { 
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); 
      color: white; padding: 40px 20px; text-align: center; 
      border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; 
      box-shadow: 0 10px 40px rgba(15,23,42,0.2); margin-bottom: 30px; 
    }
    .brand-logo-card {
      background: #ffffff; padding: 12px 25px; border-radius: 12px; display: inline-flex; 
      flex-direction: column; align-items: center; box-shadow: 0 8px 25px rgba(0,0,0,0.2); 
      border-bottom: 4px solid #fb641b; margin-bottom: 15px; position: relative;
    }
    .brand-text-logo {
      font-size: clamp(30px, 6vw, 50px); font-weight: 900; font-style: italic; 
      font-family: 'Arial Black', Impact, sans-serif; letter-spacing: -1.5px; 
      line-height: 1; display: flex; align-items: center;
    }
    .feed-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column; height: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.03);}
    .feed-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); border-color: #cbd5e1; }
    .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .grid-container { display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    .dept-pill { padding: 8px 18px; border-radius: 25px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: 0.3s; border: 1px solid #cbd5e1; background: white; color: #475569; }
    .dept-pill-active { background: #16a34a; color: white; border-color: #16a34a; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); }
  `;

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', color: '#2874f0' }}><h2>{t('Loading Shop Data...', 'शॉप डेटा लोड हो रहा है...')}</h2></div>;

  return (
    <div className="main-bg">
      <style>{sharedStyles}</style>
      
      {/* HEADER */}
      <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(15px)', position: 'sticky', top: 0, zIndex: 100, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '28px', fontWeight: '900', fontStyle: 'italic', color: '#0f172a', letterSpacing: '-1px' }}>
          F<span style={{color: '#fb641b'}}>i</span>x<span style={{color: '#2874f0'}}>i</span>fiy
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')} style={{ cursor: 'pointer', background: '#f1f5f9', padding: '8px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            🌐 {lang === 'EN' ? 'English' : 'हिंदी'}
          </div>

          {loggedInCustomer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>👤 {loggedInCustomer.name}</span>
              <button onClick={() => { localStorage.removeItem('fixify_customer'); setLoggedInCustomer(null); router.refresh(); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                {t('Logout', 'लॉग आउट')}
              </button>
            </div>
          ) : (
            <button onClick={() => router.push('/login')} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
              {t('Login / Signup', 'लॉगिन / साइनअप')}
            </button>
          )}
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="hero-banner">
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: '25px', fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px', color: '#fbbf24', border: '1px solid rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
          🇮🇳 {t("India's No. 1 E-Commerce Sale & Service", "भारत का नं. 1 ई-कॉमर्स और सर्विस प्लेटफॉर्म")}
        </div>
        <br/>
        <div className="brand-logo-card">
          <div className="brand-text-logo">
            <span style={{ color: '#0a192f' }}>F</span><span style={{ color: '#0a192f' }}>i</span>
            <span style={{ color: '#fb641b', position: 'relative' }}>x<span style={{ position: 'absolute', top: '-10px', right: '-12px', fontSize: 'clamp(16px, 3vw, 24px)' }}>🛒</span></span>
            <span style={{ color: '#0a192f' }}>i</span><span style={{ color: '#0a192f' }}>f</span><span style={{ color: '#0a192f' }}>i</span><span style={{ color: '#0a192f' }}>y</span>
          </div>
        </div>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, margin: '10px 0 8px 0', lineHeight: 1.3, color: '#f8fafc' }}>
          {t("Everything You Need, All In One Place! ✨", "यहाँ मिलेगा सब कुछ, एक ही जगह! ✨")}
        </h1>
        <p style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', opacity: 0.9, maxWidth: '700px', margin: '0 auto', color: '#cbd5e1', lineHeight: '1.5' }}>
          {t("From A to Z Products to Verified Premium Mistris, experience the best of both worlds.", "A to Z प्रोडक्ट्स से लेकर वेरिफाइड प्रीमियम मिस्त्री तक, सब कुछ बुक करें एक क्लिक में।")}
        </p>
      </div>

      {/* SEARCH BAR */}
      <div style={{ maxWidth: '800px', margin: '-50px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '40px', padding: '12px 30px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '22px', marginRight: '15px' }}>🔍</span>
          <input type="text" placeholder={t("Search from shop stock...", "शॉप स्टॉक से खोजें...")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: '10px 0', fontSize: '16px', color: '#0f172a' }} />
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 30px 20px' }}>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
          {homeCategories.map((cat, idx) => {
            const isActive = activeCategory === cat.name;
            return (
            <div key={idx} onClick={() => setActiveCategory(isActive ? null : cat.name)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px', cursor: 'pointer', transition: '0.3s', transform: isActive ? 'scale(1.08)' : 'none' }}>
              <div style={{ width: '70px', height: '70px', background: isActive ? '#e0f2fe' : 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', marginBottom: '10px', border: isActive ? '2px solid #2874f0' : '1px solid #e2e8f0' }}>{cat.icon}</div>
              <span style={{ fontSize: '13px', fontWeight: isActive ? '800' : '600', color: isActive ? '#2874f0' : '#475569', textAlign: 'center' }}>{t(cat.name, cat.hiName)}</span>
            </div>
          )})}
        </div>
      </div>

      {/* PRODUCTS FEED */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {Object.entries(groupedProducts).length === 0 && <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>{t('No products found in shop stock.', 'शॉप स्टॉक में कोई प्रोडक्ट नहीं मिला।')}</div>}
        
        {Object.entries(groupedProducts).map(([categoryName, items], catIdx) => (
          <div key={catIdx} style={{ marginBottom: '50px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', borderBottom: '3px solid #e2e8f0', paddingBottom: '10px', marginBottom: '25px' }}>🛍️ {categoryName}</h3>
            <div className="grid-container">
              {items.map((product, idx) => {
                const images = getImagesArray(product);
                return (
                <div key={idx} className="feed-card" onClick={() => handleViewItem(product, false)}>
                  <div style={{ height: '200px', background: '#f8fafc', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <img loading="lazy" src={images[0]} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', width: 'fit-content', marginBottom: '10px', fontWeight: '800' }}>{product.category}</span>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', lineHeight: '1.4', fontWeight: '800' }}>{product.name}</h4>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '20px' }}>₹{product.price}</div>
                      <button style={{ background: '#2874f0', color: 'white', padding: '8px 18px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(40,116,240,0.3)' }}>{t('BUY NOW', 'खरीदें')}</button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>

      {/* MISTRIS SECTION */}
      {(finalMistris.length > 0 || mistriFilter !== "All") && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 40px 20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', borderBottom: '2px solid #16a34a', paddingBottom: '10px', marginBottom: '20px' }}>⭐ {t('Verified Premium Mistris', 'वेरिफाइड प्रीमियम मिस्त्री')}</h3>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '25px', paddingBottom: '5px' }}>
            {mistriDepartments.map((dept, idx) => (
              <button key={idx} onClick={() => setMistriFilter(dept)} className={`dept-pill ${mistriFilter === dept ? 'dept-pill-active' : ''}`}>{dept}</button>
            ))}
          </div>

          <div className="grid-container">
            {finalMistris.map((mistri, idx) => (
              <div key={idx} onClick={() => handleViewItem(mistri, true)} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', height: '100%', transition: '0.3s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: '#e0f2fe', overflow: 'hidden', border: '3px solid #38bdf8', marginBottom: '15px' }}>
                  <img loading="lazy" src={mistri.avatar || 'https://placehold.co/300x300?text=Mistri'} alt={mistri.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                </div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{mistri.name}</h4>
                <span style={{ fontSize: '12px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '20px', marginBottom: '12px' }}>{mistri.labour_type || mistri.category}</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', marginBottom: '15px' }}>₹{mistri.base_rate} <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 'normal' }}>/ {t('day', 'दिन')}</span></div>
                <button style={{ background: '#16a34a', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', width: '100%', marginTop: 'auto' }}>{t('HIRE NOW', 'बुक करें')}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="no-print" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#cbd5e1',
        padding: '60px 20px 40px 20px',
        marginTop: '60px',
        borderTop: '4px solid #fb641b',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px' }}>
          
          <div>
            <div style={{ fontSize: '34px', fontWeight: '900', fontStyle: 'italic', fontFamily: 'Arial Black, Impact, sans-serif', color: 'white', marginBottom: '15px', letterSpacing: '-1px' }}>
              F<span style={{ color: 'white' }}>i</span><span style={{ color: '#fb641b' }}>x</span><span style={{ color: 'white' }}>i</span>fiy
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '20px', color: '#94a3b8' }}>
              <strong>Fixifiy Technology</strong> (A unit of Mahadev Enterprises). India's No. 1 E-Commerce Sale & Service platform. Everything you need, all in one place!
            </p>
            <div style={{ display: 'inline-block', background: 'rgba(251, 100, 27, 0.15)', border: '1px solid rgba(251, 100, 27, 0.4)', padding: '6px 12px', borderRadius: '6px', color: '#fb641b', fontSize: '12px', fontWeight: 'bold' }}>
              Verified Enterprise Partner ✓
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '3px solid #2874f0', paddingBottom: '8px', display: 'inline-block' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', lineHeight: '2.4', color: '#94a3b8' }}>
              <li style={{ cursor: 'pointer' }}>➔ About Fixifiy</li>
              <li style={{ cursor: 'pointer' }}>➔ Privacy Policy</li>
              <li style={{ cursor: 'pointer' }}>➔ Terms & Conditions</li>
              <li style={{ cursor: 'pointer' }}>➔ Return & Refund Policy</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '3px solid #16a34a', paddingBottom: '8px', display: 'inline-block' }}>
              Official Corporate Address
            </h4>
            <div style={{ fontSize: '14px', lineHeight: '2', color: '#94a3b8' }}>
              <div style={{ marginBottom: '8px' }}>
                📍 <strong style={{ color: 'white' }}>Fixifiy (A unit of Mahadev Enterprises)</strong><br />
                Plot No. 271, Narpa, Hasanpur Main Road,<br />
                Samastipur, Bihar - 848208
              </div>
              <div style={{ marginBottom: '6px' }}>📞 <strong style={{ color: 'white' }}>Phone:</strong> 1800-XXX-XXXX, +91 9709740882</div>
              <div>✉️ <strong style={{ color: 'white' }}>Email:</strong> support@fixifiy.com <br/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fixifiyindia@gmail.com</div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '40px auto 0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '13px', color: '#64748b' }}>
          <div>© {new Date().getFullYear()} Fixifiy Services (A unit of Mahadev Enterprises). All Rights Reserved.</div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span>🔒 Secure SSL</span>
            <span>⚡ Fast BBPS</span>
            <span>🛡️ Verified Partners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}