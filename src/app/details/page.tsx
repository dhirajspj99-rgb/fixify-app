"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from '@/supabase'; 
import { useRouter } from 'next/navigation';

export default function GuestHomePage() {
  const router = useRouter();
  
  const [productsData, setProductsData] = useState<any[]>([]);
  const [mistrisData, setMistrisData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Language State
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  const [searchTerm, setSearchTerm] = useState("");
  const [showHelpDesk, setShowHelpDesk] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mistriFilter, setMistriFilter] = useState<string>("All");

  // POPUP KE LIYE STATES 
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0);

  const t = (enText: string, hiText: string) => lang === 'EN' ? enText : hiText;

  const fallbackTech = [
    { id: 101, name: 'Redmi Note 13 Pro (8GB/256GB)', category: 'Mobiles & Accessories', price: 21999, rating: 4.5, reviews: 128 },
    { id: 102, name: 'HP Pavilion 15 (Core i5, 16GB)', category: 'Laptops & Printers', price: 54000, rating: 4.7, reviews: 85 },
  ];
  const fallbackLabours = [
    { id: 401, name: 'Raju Rajmistri', labour_type: 'Rajmistri', base_rate: 750, rating: 4.8, reviews: 120, avatar: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300' },
  ];

  const exactShopCategories = [
    "Mobiles & Accessories", "Laptops & Printers", "Cameras", "Old Vehicles (Sell/Buy)", 
    "Iron", "Cement", "Aluminium & Steel", "Hardware", "Paints", "Furniture", 
    "Electric", "UPVC Windows", "UPVC Windows & Gate", "General Store"
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
    if (c.includes('mobile') || c.includes('accessory')) return "Mobiles & Accessories";
    if (c.includes('laptop') || c.includes('printer')) return "Laptops & Printers";
    if (c.includes('camera')) return "Cameras";
    if (c.includes('vehicle') || c.includes('car')) return "Old Vehicles (Sell/Buy)";
    if (c.includes('cement')) return "Cement";
    if (c.includes('aluminium') || c.includes('steel')) return "Aluminium & Steel";
    if (c.includes('iron') && !c.includes('welder')) return "Iron";
    if (c.includes('hardware')) return "Hardware";
    if (c.includes('paint')) return "Paints";
    if (c.includes('furniture')) return "Furniture";
    if (c.includes('upvc') && c.includes('gate')) return "UPVC Windows & Gate";
    if (c.includes('upvc') || c.includes('window')) return "UPVC Windows";
    if (c.includes('electric') && !c.includes('electrician')) return "Electric";
    if (c.includes('general') || c.includes('grocery')) return "General Store";
    return catStr.charAt(0).toUpperCase() + catStr.slice(1); 
  };

  // 🔥 DATA FETCHING LOGIC 🔥
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Search ke liye maximum data load kar rahe hain (limit 5000 kiya hai)
        const { data: prodData } = await supabase.from('products').select('*').limit(5000).order('id', { ascending: false });
        const { data: labourData } = await supabase.from('labours').select('*').limit(200);

        if (prodData && prodData.length > 0) {
          // 0 stock wale products yahan hide NAHI kiye gaye hain, isliye sab dikhenge
          setProductsData(prodData.map(p => ({ ...p, category: standardizeCategory(p.category) })));
        } else {
          setProductsData(fallbackTech);
        }

        if (labourData && labourData.length > 0) {
          const filteredLabours = labourData.filter((m: any) => {
            const type1 = String(m.labour_type || '').toLowerCase().trim();
            const type2 = String(m.type || '').toLowerCase().trim();
            const roleStr = String(m.role || '').toLowerCase().trim();
            if (type1 === 'sub admin' || type2 === 'sub admin' || roleStr === 'sub admin') return false;
            return true;
          });
          setMistrisData(filteredLabours.length > 0 ? filteredLabours : fallbackLabours);
        } else {
          setMistrisData(fallbackLabours);
        }
      } catch (err) {
        setProductsData(fallbackTech);
        setMistrisData(fallbackLabours);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLoginRedirect = (e?: any) => {
    if(e) e.stopPropagation();
    router.push('/login'); 
  };

  const handleViewItem = (item: any, isMistri: boolean = false) => {
    setSelectedItem({ ...item, isMistri });
    setActiveModalImageIndex(0);
  };

  const getAutoImagesArray = (cat: string) => {
    if (!cat) return [];
    const c = cat.toLowerCase();
    if (c.includes('mobile') || c.includes('accessory')) return ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=400'];
    if (c.includes('laptop') || c.includes('printer')) return ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 'https://images.unsplash.com/photo-1283197607784-0a86db9d1877?w=400'];
    if (c.includes('vehicle') || c.includes('car')) return ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400'];
    if (c.includes('cement')) return ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400'];
    if (c.includes('iron') || c.includes('steel')) return ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'];
    if (c.includes('paint')) return ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'];
    if (c.includes('electric')) return ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400'];
    return ['https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400']; 
  };

  const defaultImage = 'https://placehold.co/400x300?text=No+Image';

  const getImagesArray = (item: any) => {
    if (!item) return [];
    if (item.isMistri) return item.avatar ? [item.avatar] : [defaultImage];
    if (!item.image_url || item.image_url.trim() === '') return getAutoImagesArray(item.category);
    return item.image_url.split(',');
  };

  // 🔥 MAIN LOGIC: 200 LIMIT AUR FULL SEARCH 🔥
  const groupedProducts = useMemo(() => {
    let filtered = productsData;
    
    // 1. Agar category select ki hai, toh filter karo
    if (activeCategory) {
      const targetCatObj = homeCategories.find(c => c.name === activeCategory);
      if (targetCatObj) filtered = filtered.filter(item => targetCatObj.match.includes(item.category));
    }
    
    // 2. Agar Search box me kuch likha hai, toh poore data me dhoondho
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    } else {
      // 3. Agar search khali hai, toh sirf starting ke 200 items dikhao
      filtered = filtered.slice(0, 200);
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
    .main-bg { background: #f4f7fb; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; color: #212121; padding-bottom: 0; }
    .hero-banner { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; padding: 25px 15px; text-align: center; margin-bottom: -20px; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; box-shadow: 0 10px 25px rgba(15,23,42,0.25); }
    .brand-logo-card { background: #ffffff; padding: 12px 25px; border-radius: 12px; display: inline-flex; flex-direction: column; align-items: center; box-shadow: 0 8px 25px rgba(0,0,0,0.2); border-bottom: 4px solid #fb641b; margin-bottom: 15px; position: relative; }
    .brand-text-logo { font-size: clamp(30px, 6vw, 50px); font-weight: 900; font-style: italic; font-family: 'Arial Black', Impact, sans-serif; letter-spacing: -1.5px; line-height: 1; display: flex; align-items: center; }
    .feed-card { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #eef2f6; transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column; height: 100%; box-shadow: 0 4px 6px rgba(0,0,0,0.02);}
    .feed-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); }
    .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .help-desk-btn { position: fixed; bottom: 25px; right: 25px; background: #fb641b; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 28px; cursor: pointer; z-index: 999; box-shadow: 0 4px 15px rgba(251, 100, 27, 0.4); transition: transform 0.3s; animation: bounce 2s infinite; }
    .help-desk-btn:hover { transform: scale(1.1); animation: none; }
    .category-item { transition: all 0.2s ease; cursor: pointer; opacity: 0.8; }
    .category-item:hover { opacity: 1; transform: scale(1.05); }
    .category-active { opacity: 1; transform: scale(1.1); font-weight: 900; }
    .category-active-bg { border: 2px solid #2874f0; background: #e0f2fe !important; }
    .dept-pill { padding: 8px 18px; border-radius: 25px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: 0.3s; border: 1px solid #cbd5e1; background: white; color: #475569; }
    .dept-pill-active { background: #16a34a; color: white; border-color: #16a34a; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); }
    .grid-container { display: grid; gap: 15px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    
    /* MODAL POPUP STYLES */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); display: flex; justify-content: center; align-items: flex-end; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-content { background: white; width: 100%; max-width: 800px; height: 90vh; border-top-left-radius: 20px; border-top-right-radius: 20px; overflow-y: auto; position: relative; animation: slideUp 0.3s ease-out; display: flex; flex-direction: column; }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @media (min-width: 768px) { .grid-container { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 25px; } .hero-banner { border-radius: 20px; max-width: 1160px; margin: 15px auto -20px auto; } .modal-overlay { align-items: center; padding: 20px; } .modal-content { height: auto; max-height: 90vh; border-radius: 20px; } }
  `;

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#2874f0', color: 'white' }}><h2>{t('Loading...', 'लोड हो रहा है...')}</h2></div>;

  return (
    <div className="main-bg">
      <style>{sharedStyles}</style>
      
      {/* HEADER */}
      <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '20px', background: '#f8fafc', cursor: 'pointer', userSelect: 'none' }}>
            <span style={{fontSize: '14px'}}>🌐</span>
            <span style={{fontSize: '12px', fontWeight: 'bold', color: '#0f172a'}}>{lang === 'EN' ? 'English' : 'हिंदी'}</span>
          </div>
          <button onClick={handleLoginRedirect} style={{ background: '#fb641b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {t('Login / Signup', 'लॉगिन / साइनअप')}
          </button>
        </div>
      </div>

      {/* COMPACT HERO BANNER */}
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
      <div style={{ maxWidth: '800px', margin: '40px auto 25px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '30px', padding: '8px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid #eef2f6' }}>
          <span style={{ fontSize: '18px', marginRight: '12px' }}>🔍</span>
          <input type="text" placeholder={t("Search FIXIFY for products, mistris...", "FIXIFY पर प्रोडक्ट्स और मिस्त्री खोजें...")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: '8px 0', fontSize: '15px', color: '#334155' }} />
        </div>
      </div>

      {/* TOP CIRCLE CATEGORIES */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 20px 20px' }}>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
          {homeCategories.map((cat, idx) => {
            const isActive = activeCategory === cat.name;
            return (
            <div key={idx} className={`category-item ${isActive ? 'category-active' : ''}`} onClick={() => setActiveCategory(isActive ? null : cat.name)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
              <div className={isActive ? 'category-active-bg' : ''} style={{ width: '60px', height: '60px', background: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px', boxShadow: '0 4px 10px rgba(0,0,0,0.06)', marginBottom: '8px' }}>{cat.icon}</div>
              <span style={{ fontSize: '12px', fontWeight: isActive ? '800' : '600', color: isActive ? '#2874f0' : '#475569', textAlign: 'center' }}>{t(cat.name, cat.hiName)}</span>
            </div>
          )})}
        </div>
      </div>

      {/* DYNAMIC PRODUCTS FEED */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {Object.entries(groupedProducts).map(([categoryName, items], catIdx) => (
          <div key={catIdx} style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>🛍️ {categoryName}</h3>
            <div className="grid-container">
              {items.map((product, idx) => {
                const images = getImagesArray(product);
                return (
                <div key={idx} className="feed-card" onClick={() => handleViewItem(product, false)}>
                  <div style={{ height: '150px', background: '#ffffff', padding: '15px', position: 'relative' }}>
                    <img loading="lazy" src={images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#334155', lineHeight: '1.3' }}>{product.name}</h4>
                    <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '4px' }}>{product.category}</span>
                  </div>
                  <div style={{ padding: '0 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#059669', fontWeight: '900', fontSize: '16px' }}>₹{product.price}</div>
                    <button style={{ background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: 'none' }}>{t('VIEW', 'देखें')}</button>
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
                <div style={{ width: '85px', height: '85px', borderRadius: '50%', background: '#e0f2fe', overflow: 'hidden', border: '3px solid #38bdf8', marginBottom: '15px' }}><img loading="lazy" src={mistri.avatar || defaultImage} alt={mistri.name} style={{width:'100%', height:'100%', objectFit:'cover'}} /></div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{mistri.name}</h4>
                <span style={{ fontSize: '12px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '20px', marginBottom: '12px' }}>{mistri.labour_type || mistri.category}</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', marginBottom: '15px' }}>₹{mistri.base_rate} <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 'normal' }}>/ {t('day', 'दिन')}</span></div>
                <button style={{ background: '#16a34a', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', width: '100%', marginTop: 'auto' }}>{t('HIRE NOW', 'बुक करें')}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 PREMIUM POPUP RENDERING 🌟 */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content hide-scrollbar" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, fontSize: '16px' }}>✖</button>
            {(() => {
              const images = getImagesArray(selectedItem);
              const price = selectedItem.price || selectedItem.base_rate || 0;
              const mrp = Math.floor(price * 1.2); 
              const rating = selectedItem.rating || 4.8;
              const reviewsCount = selectedItem.reviews || Math.floor(Math.random() * 300) + 50;

              return (
                <div style={{ paddingBottom: '80px' }}>
                  <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                      <img src={images[activeModalImageIndex]} alt={selectedItem.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: selectedItem.isMistri ? 'cover' : 'contain', borderRadius: selectedItem.isMistri ? '16px' : '0' }} />
                    </div>
                    {images.length > 1 && (
                      <div className="hide-scrollbar" style={{ display: 'flex', gap: '10px', padding: '10px 20px', overflowX: 'auto', background: 'white' }}>
                        {images.map((img: string, idx: number) => (
                          <div key={idx} onClick={() => setActiveModalImageIndex(idx)} style={{ width: '60px', height: '60px', borderRadius: '8px', border: activeModalImageIndex === idx ? '2px solid #2874f0' : '1px solid #cbd5e1', padding: '2px', cursor: 'pointer', flexShrink: 0 }}>
                            <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '25px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>{selectedItem.category || selectedItem.labour_type}</span>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '25px', fontSize: '12px', fontWeight: '800' }}>✓ Verified</span>
                    </div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '22px', fontWeight: '900' }}>{selectedItem.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ background: '#16a34a', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>{rating} ★</div>
                      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>{reviewsCount} Ratings</span>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                        <span style={{ fontSize: '30px', fontWeight: '900', color: '#1e293b' }}>₹{price}</span>
                        <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '500' }}>₹{mrp}</span>
                        <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '900' }}>20% OFF</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>{selectedItem.isMistri ? '⏳ Base rate per day' : '📦 Inclusive of all taxes & fees'}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a' }}>📌 Top Highlights</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '13px', lineHeight: '1.8' }}>
                        {selectedItem.isMistri ? (
                          <><li>Verified by Fixifiy</li><li>Professional & Experienced</li><li>100% Background Checked</li></>
                        ) : (
                          <><li>Genuine & Premium Quality</li><li>Standard Warranty Applicable</li><li>Easy Returns</li></>
                        )}
                      </ul>
                    </div>
                    {selectedItem.description && <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}><strong>Description:</strong><br/>{selectedItem.description}</div>}
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', padding: '15px', display: 'flex', gap: '10px', boxShadow: '0 -4px 15px rgba(0,0,0,0.05)', borderTop: '1px solid #e2e8f0', borderRadius: '0 0 20px 20px' }}>
                    <button onClick={() => router.push('/login')} style={{ flex: 1, background: '#fffbeb', color: '#d97706', border: '2px solid #fcd34d', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>💬 Ask a Question</button>
                    <button onClick={() => router.push('/login')} style={{ flex: 2, background: '#fb641b', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 10px rgba(251, 100, 27, 0.4)' }}>
                      {selectedItem.isMistri ? '📅 BOOK MISTRI NOW' : '🛒 LOGIN TO BUY'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* FOOTER WAHI ADDRESS AUR DONO EMAIL KE SATH */}
      <footer className="no-print" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#cbd5e1', padding: '50px 20px 90px 20px', marginTop: '50px', borderTop: '4px solid #fb641b', boxShadow: '0 -10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '34px', fontWeight: '900', fontStyle: 'italic', fontFamily: 'Arial Black, Impact, sans-serif', color: 'white', marginBottom: '15px', letterSpacing: '-1px' }}>
              F<span style={{ color: 'white' }}>i</span><span style={{ color: '#fb641b' }}>x</span><span style={{ color: 'white' }}>i</span>fiy
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '20px', color: '#94a3b8' }}><strong>Fixifiy Technology</strong> (A unit of Mahadev Enterprises). {t("India's No. 1 E-Commerce Sale & Service platform. Everything you need, all in one place!", "भारत का नंबर 1 ई-कॉमर्स और सर्विस प्लेटफॉर्म। आपकी हर जरूरत, एक ही जगह पर!")}</p>
            <div style={{ display: 'inline-block', background: 'rgba(251, 100, 27, 0.15)', border: '1px solid rgba(251, 100, 27, 0.4)', padding: '6px 12px', borderRadius: '6px', color: '#fb641b', fontSize: '12px', fontWeight: 'bold' }}>{t("Verified Enterprise Partner ✓", "वेरीफाइड एंटरप्राइज पार्टनर ✓")}</div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '3px solid #2874f0', paddingBottom: '8px', display: 'inline-block' }}>{t("Quick Links", "क्विक लिंक्स")}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', lineHeight: '2.4', color: '#94a3b8', cursor: 'pointer' }}>
              <li>➔ {t("About Fixifiy", "Fixifiy के बारे में")}</li><li>➔ {t("Privacy Policy", "गोपनीयता नीति")}</li><li>➔ {t("Terms & Conditions", "नियम और शर्तें")}</li><li>➔ {t("Return & Refund Policy", "रिटर्न और रिफंड पॉलिसी")}</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '3px solid #16a34a', paddingBottom: '8px', display: 'inline-block' }}>{t("Official Corporate Address", "आधिकारिक कॉर्पोरेट पता")}</h4>
            <div style={{ fontSize: '14px', lineHeight: '2', color: '#94a3b8' }}>
              <div style={{ marginBottom: '8px' }}>📍 <strong style={{ color: 'white' }}>Fixifiy (A unit of Mahadev Enterprises)</strong><br />{t("Plot No. 271, Narpa, Hasanpur Main Road,", "प्लॉट नं. 271, नरपा, हसनपुर मेन रोड,")}<br />{t("Samastipur, Bihar - 848208", "समस्तीपुर, Bihar - 848208")}</div>
              <div style={{ marginBottom: '6px' }}>📞 <strong style={{ color: 'white' }}>{t("Phone:", "फ़ोन:")}</strong> 1800-XXX-XXXX, +91 9709740882</div>
              <div>✉️ <strong style={{ color: 'white' }}>{t("Email:", "ईमेल:")}</strong> support@fixifiy.com <br/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fixifiyindia@gmail.com</div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '40px auto 0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '13px', color: '#64748b' }}>
          <div>© {new Date().getFullYear()} Fixifiy Services (A unit of Mahadev Enterprises). {t("All Rights Reserved.", "सर्वाधिकार सुरक्षित।")}</div>
          <div style={{ display: 'flex', gap: '15px' }}><span>🔒 {t("Secure SSL", "सुरक्षित SSL")}</span><span>⚡ {t("Fast BBPS", "फ़ास्ट BBPS")}</span><span>🛡️ {t("Verified Mistris", "वेरीफाइड मिस्त्री")}</span></div>
        </div>
      </footer>

      {/* HELP DESK POPUP */}
      <div className="help-desk-btn" onClick={() => setShowHelpDesk(!showHelpDesk)}>💬</div>
      {showHelpDesk && (
        <div style={{ position: 'fixed', bottom: '95px', right: '25px', background: 'white', padding: '20px', borderRadius: '12px', width: '280px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 998, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px', fontWeight: '900' }}>{t('Live Support 🟢', 'लाइव सपोर्ट 🟢')}</h4>
            <button onClick={() => setShowHelpDesk(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✖</button>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '15px' }}>{t('Need help with ordering?', 'क्या आपको आर्डर करने में मदद चाहिए?')}</p>
          <button onClick={() => router.push('/login')} style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>📞 {t('Login to Call Support', 'सपोर्ट को कॉल करने के लिए लॉगिन करें')}</button>
        </div>
      )}
    </div>
  );
}