"use client";
import React, { useMemo } from 'react';
import HomeDashboard from './HomeDashboard';
import { useAppContext } from './AppContext'; 

export default function HomeFeed({
  userProfile, userLocation, handleVipUpgrade, 
  searchTerm, setSearchTerm, displayProducts, openCartModal,
  homeCategories, handleCategoryClick, setAppStep, setSelectedCategory,
  featuredMistris, mistriSearchTerm, setMistriSearchTerm, processDirectMistriBook
}: any) {

  // 🔥 MULTI-LANGUAGE SYSTEM SETUP 🔥
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  const t = {
    notifyMsg: (name: string) => isHindi 
      ? `✅ ${name} के लिए नोटिफिकेशन सेट हो गया है! \n\nजैसे ही दुकानदारों के पास इसका स्टॉक आएगा, आपको नोटिफिकेशन मिल जाएगा।` 
      : `✅ Notification set for ${name}! \n\nJaise hi dukandaron ke paas iska stock aayega, aapko notification mil jayega.`,
    hello: isHindi ? "नमस्ते," : "Hello,",
    becomeVip: isHindi ? "👑 VIP बनें" : "👑 Become VIP",
    searchPlaceholder: isHindi ? "प्रोडक्ट्स, मटेरियल, मिस्त्री सर्च करें..." : "Search products, materials, mistri...",
    outOfStock: isHindi ? "स्टॉक में नहीं" : "OUT OF STOCK",
    addBtn: isHindi ? "+ कार्ट में डालें" : "+ ADD",
    notifyBtn: isHindi ? "🔔 नोटिफाई करें" : "🔔 NOTIFY ME",
    topIn: isHindi ? "में टॉप आइटम्स" : "Top in",
    viewAll: isHindi ? "सभी देखें ➔" : "View All ➔",
    addingStockMsg: isHindi 
      ? "अभी इस कैटेगरी में आइटम जोड़े जा रहे हैं... जल्द ही नई इन्वेंट्री दिखेगी!" 
      : "Abhi is category mein items add ho rahe hain... Jald hi nayi inventory dikhegi!",
    topMistri: isHindi ? "⭐ टॉप रेटेड मिस्त्री" : "⭐ Top Rated Mistri",
    perDay: isHindi ? "/ दिन" : "/ day",
    bookMistri: isHindi ? "मिस्त्री बुक करें" : "BOOK MISTRI",
    stockWord: isHindi ? "स्टॉक:" : "Stock:",
    noProductFound: isHindi ? "ऊप्स! कोई प्रोडक्ट नहीं मिला।" : "Oops! Koi product nahi mila.",
    shopByCategory: isHindi ? "कैटेगरी चुनें" : "Shop by Category" // 🔥 Naya Translation
  };

  const catTranslation: Record<string, string> = {
    'Fashion & Design': 'फैशन और डिजाइन',
    'Cosmetic Items': 'कॉस्मेटिक आइटम',
    'Book & Diary': 'किताबें और स्टेशनरी',
    'Mobiles & Accessories': 'मोबाइल्स और एक्सेसरीज',
    'Electric': 'इलेक्ट्रिक',
    'Laptops & Printers': 'लैपटॉप और प्रिंटर',
    'Iron': 'लोहा (Iron)',
    'Cement': 'सीमेंट (Cement)',
    'Hardware': 'हार्डवेयर (Hardware)',
    'Paints': 'पेंट्स (Paints)',
    'Furniture': 'फर्नीचर',
    'Old Vehicles (Sell/Buy)': 'पुराने वाहन (खरीदें/बेचें)',
    'Cameras': 'कैमरा',
    'Aluminium & Steel': 'एल्युमीनियम और स्टील',
    'UPVC Windows': 'UPVC विंडोज',
    'General Store': 'जनरल स्टोर',
  };

  const getTranslatedCategory = (engName: string) => {
    if (!isHindi) return engName;
    return catTranslation[engName] || engName;
  };

  const handleNotifyMe = (e: any, product: any) => {
    e.stopPropagation();
    alert(t.notifyMsg(product.name));
  };

  const filteredMistris = featuredMistris.filter((m: any) => 
    (m.name || '').toLowerCase().includes(mistriSearchTerm.toLowerCase()) || 
    (m.labour_type || m.type || '').toLowerCase().includes(mistriSearchTerm.toLowerCase())
  );

  const getCategoryIcon = (catName: string) => {
    const c = catName.toLowerCase();
    if (c.includes('mobile')) return '📱';
    if (c.includes('laptop') || c.includes('print')) return '💻';
    if (c.includes('fashion') || c.includes('cloth') || c.includes('design')) return '👕';
    if (c.includes('cosmetic') || c.includes('makeup') || c.includes('singar')) return '💄';
    if (c.includes('book') || c.includes('diary') || c.includes('stationary')) return '📚';
    if (c.includes('vehicle')) return '🏍️';
    if (c.includes('iron') || c.includes('steel') || c.includes('लोहा')) return '🏗️';
    if (c.includes('cement') || c.includes('सीमेंट')) return '🧱';
    if (c.includes('hardware') || c.includes('हार्डवेयर')) return '🛠️';
    if (c.includes('furniture') || c.includes('फर्नीचर')) return '🪑';
    if (c.includes('paint') || c.includes('पेंट')) return '🎨';
    if (c.includes('electric') || c.includes('इलेक्ट्रिक')) return '⚡';
    return '🛍️';
  };

  const priorityCategories = [
    'Fashion & Design', 'Cosmetic Items', 'Book & Diary', 'Mobiles & Accessories', 
    'Electric', 'Laptops & Printers', 'Iron', 'Cement', 'Hardware', 'Paints', 
    'Furniture', 'Old Vehicles (Sell/Buy)', 'Cameras', 'Aluminium & Steel', 'UPVC Windows', 'General Store'
  ];

  const aggregatedProducts = useMemo(() => {
    if (!displayProducts) return [];
    
    const shopItemsOnly = displayProducts.filter((p: any) => {
      if (!p.shop_id) return false;
      const sId = String(p.shop_id).toLowerCase().trim();
      if (sId === 'null' || sId === 'undefined' || sId === '') return false;
      return true;
    });

    const mergedMap: Record<string, any> = {};
    
    shopItemsOnly.forEach((p: any) => {
      const uniqueKey = (p.name + '_' + p.category).toLowerCase().trim();
      
      if (!mergedMap[uniqueKey]) {
         mergedMap[uniqueKey] = { ...p, total_stock: Number(p.total_stock || 0) };
      } else {
         mergedMap[uniqueKey].total_stock += Number(p.total_stock || 0);
         if (Number(p.price) < Number(mergedMap[uniqueKey].price)) {
             mergedMap[uniqueKey].price = p.price;
             mergedMap[uniqueKey].shop_id = p.shop_id; 
         }
      }
    });

    return Object.values(mergedMap);
  }, [displayProducts]);

  const categoryRows = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    aggregatedProducts.forEach((p: any) => {
      const cat = p.category || 'General Store';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    const finalGroups = priorityCategories.map(cat => {
      const items = groups[cat] || [];
      items.sort((a, b) => {
        const aStock = a.total_stock > 0 ? 1 : 0;
        const bStock = b.total_stock > 0 ? 1 : 0;
        return bStock - aStock;
      });
      return { category: cat, products: items.slice(0, 5) };
    });

    Object.keys(groups).forEach(cat => {
      if (!priorityCategories.includes(cat)) {
        const items = groups[cat];
        items.sort((a, b) => {
          const aStock = a.total_stock > 0 ? 1 : 0;
          const bStock = b.total_stock > 0 ? 1 : 0;
          return bStock - aStock;
        });
        finalGroups.push({ category: cat, products: items.slice(0, 5) });
      }
    });

    return finalGroups;
  }, [aggregatedProducts]);

  const searchResults = useMemo(() => {
    if (!searchTerm || !aggregatedProducts) return [];
    const q = searchTerm.toLowerCase();
    return aggregatedProducts
      .filter((p: any) => (p.name && p.name.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q)))
      .slice(0, 15);
  }, [searchTerm, aggregatedProducts]);

  return (
    <div className="no-print">
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top Header Card (Welcome Message) */}
      <div style={{ background: 'white', margin: '15px 20px', padding: '15px 20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: userProfile.is_vip ? 'linear-gradient(135deg, #facc15, #f59e0b)' : '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', color: 'white', fontWeight: 'bold' }}>
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div>
            <h2 style={{ margin: '0 0 3px 0', fontSize: '18px', color: '#1e293b' }}>
              {t.hello} {userProfile.name || 'Customer'}! 
              {userProfile.is_vip && <span style={{fontSize: '14px', marginLeft: '6px'}} title="VIP Member">👑</span>}
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>📍</span> {userLocation}
            </div>
          </div>
        </div>
        {!userProfile.is_vip && (
          <button onClick={handleVipUpgrade} style={{background: 'linear-gradient(90deg, #facc15, #f59e0b)', color: '#0f172a', padding: '8px 14px', borderRadius: '30px', fontWeight: '900', fontSize: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)'}}>{t.becomeVip}</button>
        )}
      </div>

      {/* 🔥 NEW CATEGORY SELECTION SLIDER (Replaced Banner) 🔥 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 12px 0', color: '#1e293b' }}>
          {t.shopByCategory}
        </h3>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
          {homeCategories && homeCategories.map((cat: any, idx: number) => (
            <div 
              key={idx} 
              onClick={() => handleCategoryClick(cat)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '75px', cursor: 'pointer' }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '8px' }}>
                {cat.icon || getCategoryIcon(cat.name)}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textAlign: 'center', lineHeight: '1.2' }}>
                {getTranslatedCategory(cat.name)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SINGLE SEARCH BAR */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '20px', position: 'relative', zIndex: 100 }}>
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', boxSizing: 'border-box' }}
          />
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
          {searchTerm && <span onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', color: '#94a3b8' }}>✖</span>}

          {searchTerm && (
            <div style={{ position: 'absolute', top: '100%', left: '0', right: '0', background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', maxHeight: '350px', overflowY: 'auto', marginTop: '10px' }}>
              {searchResults.length > 0 ? searchResults.map((product: any, idx: number) => {
                const hasStock = product.total_stock > 0;
                return (
                  <div key={idx} onClick={() => { if(hasStock) openCartModal(product); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderBottom: '1px solid #e2e8f0', cursor: hasStock ? 'pointer' : 'not-allowed', opacity: hasStock ? 1 : 0.6 }}>
                    <img src={product.image_url ? product.image_url.split(',')[0] : 'https://placehold.co/100x100'} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px', background: '#f8fafc' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#0f172a' }}>{product.name}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{getTranslatedCategory(product.category)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ fontWeight: '900', color: '#16a34a', fontSize: '15px' }}>₹{product.price}</div>
                      {!hasStock ? <span style={{fontSize: '10px', color: '#ef4444', fontWeight: 'bold'}}>{t.outOfStock}</span> : <span style={{fontSize: '10px', color: '#16a34a', fontWeight: 'bold'}}>{t.stockWord} {product.total_stock}</span>}
                    </div>
                  </div>
                )
              }) : <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>{t.noProductFound}</div>}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 MISTRI OFFERS HOME DASHBOARD CALL 🔥 */}
      <HomeDashboard 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        setAppStep={setAppStep} 
        setSelectedCategory={setSelectedCategory} 
        homeCategories={homeCategories || []} 
        handleCategoryClick={handleCategoryClick} 
        selectedLanguage={selectedLanguage}
      />

      {/* 🔥 CATEGORY ROWS 🔥 */}
      <div style={{ paddingBottom: '20px' }}>
        {categoryRows.map((group, groupIdx) => {
          const transCatName = getTranslatedCategory(group.category);
          
          return (
          <div key={groupIdx} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 30px 20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                {getCategoryIcon(group.category)} {isHindi ? `${transCatName} ${t.topIn}` : `${t.topIn} ${transCatName}`}
              </h3>
              <button 
                onClick={() => { setSelectedCategory(group.category); setAppStep('shop_items'); }} 
                style={{ background: '#2874f0', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 5px rgba(40,116,240,0.3)' }}
              >
                {t.viewAll}
              </button>
            </div>

            {group.products.length > 0 ? (
              <div className="hide-scrollbar" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollSnapType: 'x mandatory' }}>
                {group.products.map((product: any, idx: number) => {
                  const hasStock = product.total_stock > 0;
                  const itemUnit = product.unit || 'Pc';

                  return (
                    <div key={idx} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '160px', maxWidth: '160px', flexShrink: 0, overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start', position: 'relative', opacity: hasStock ? 1 : 0.7 }} onClick={() => { if(hasStock) openCartModal(product); }}>
                      
                      <div style={{ height: '140px', width: '100%', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                        <img src={product.image_url ? product.image_url.split(',')[0] : 'https://placehold.co/300x300'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: hasStock ? 'none' : 'grayscale(100%)' }} loading="lazy" />
                        
                        {!hasStock && (
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(239,68,68,0.9)', color: 'white', padding: '5px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', width: '85%', textAlign: 'center' }}>
                            {t.outOfStock}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '10px' }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#0f172a', lineHeight: '1.3', height: '34px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {product.name} {product.is_heavy && '🚛'}
                        </h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px', marginBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '15px', fontWeight: '900', color: '#000' }}>₹{product.price?.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>/ {itemUnit}</span>
                          </div>
                          {hasStock && <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 'bold' }}>{t.stockWord} {product.total_stock}</span>}
                        </div>

                        {hasStock ? (
                          <button onClick={(e) => { e.stopPropagation(); openCartModal(product); }} style={{ background: '#f8fafc', color: '#2874f0', border: '1px solid #cbd5e1', padding: '8px', fontWeight: '800', cursor: 'pointer', width: '100%', fontSize: '12px', borderRadius: '4px' }}>
                            {t.addBtn}
                          </button>
                        ) : (
                          <button onClick={(e) => handleNotifyMe(e, product)} style={{ background: '#fffbeb', color: '#f59e0b', border: '1px solid #fde68a', padding: '8px', fontWeight: '800', cursor: 'pointer', width: '100%', fontSize: '12px', borderRadius: '4px' }}>
                            {t.notifyBtn}
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8', fontSize: '14px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                {t.addingStockMsg}
              </div>
            )}
          </div>
        )})}
      </div>

      {/* Featured Mistris */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #16a34a', paddingBottom: '10px', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{background: '#facc15', padding: '2px 6px', borderRadius: '4px', fontSize: '14px'}}>⭐</span> {t.topMistri}
          </h3>
          <button onClick={() => setAppStep('hire_labour')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{t.viewAll}</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', alignItems: 'stretch' }}>
          {filteredMistris.map((mistri: any) => (
            <div key={mistri.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
              <div style={{position: 'absolute', top: 0, right: '15px', background: '#facc15', color: '#0f172a', fontSize: '10px', fontWeight: '900', padding: '4px 8px', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px'}}>PREMIUM</div>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '2px solid #38bdf8', marginBottom: '10px', overflow: 'hidden' }}>
                {mistri.avatar ? <img src={mistri.avatar} alt={mistri.name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : '👷'}
              </div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#1e293b' }}>{mistri.name}</h4>
              <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '10px' }}>{mistri.labour_type || mistri.type}</span>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a', marginBottom: '15px' }}>₹{mistri.base_rate || mistri.rate || 500} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>{t.perDay}</span></div>
              <button onClick={() => processDirectMistriBook(mistri)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', width: '100%', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>{t.bookMistri}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}