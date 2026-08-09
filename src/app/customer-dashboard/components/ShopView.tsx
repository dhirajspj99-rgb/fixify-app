"use client";
import React, { useState, useMemo } from 'react';
import { useAppContext } from './AppContext'; // 🔥 Language fetch karne ke liye

export default function ShopView(props: any) {
  const { 
    selectedCategory, setAppStep, displayProducts, openCartModal, 
    mainCart, totalCartWeight, handleDeliveryGpsTrace, isGpsLoading, 
    distanceKm, deliveryCharge, processProductCheckout, ADMIN_DELIVERY_RATE_PER_KM 
  } = props;

  // 🔥 MULTI-LANGUAGE SYSTEM SETUP 🔥
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  const t = {
    notifyMsg: (name: string) => isHindi 
      ? `✅ ${name} के लिए नोटिफिकेशन सेट हो गया है! \n\nजैसे ही दुकानदार इसका स्टॉक अपडेट करेगा, आपको ऑटो-नोटिफिकेशन मिल जाएगा।` 
      : `✅ Notification set for ${name}! \n\nJaise hi dukandar iska stock update karega, aapko auto-notification mil jayega.`,
    searchPlaceholder: isHindi ? "प्रोडक्ट्स और कैटेगरी खोजें..." : "Search for products, categories...",
    superSaver: isHindi ? "सुपर सेवर <br/>डील्स" : "Super Saver <br/>Deals",
    inStockNow: isHindi ? "अभी स्टॉक में है" : "In Stock Now",
    allIn: (cat: string) => isHindi ? `सभी ${cat} में` : `All in ${cat}`,
    close: isHindi ? "✖ बंद करें" : "✖ Close",
    searchResultsFor: (query: string) => isHindi ? `"${query}" के लिए खोज परिणाम` : `Search Results for "${query}"`,
    topIn: (cat: string) => isHindi ? `${cat} में टॉप` : `Top in ${cat}`,
    viewAll: isHindi ? "सभी देखें ➔" : "View All ➔",
    outOfStock: isHindi ? "स्टॉक में नहीं" : "OUT OF STOCK",
    noReturn: isHindi ? "🚫 कोई वापसी नहीं" : "🚫 No Return",
    addBtn: isHindi ? "+ कार्ट में डालें" : "+ ADD TO CART",
    notifyBtn: isHindi ? "🔔 नोटिफाई करें" : "🔔 NOTIFY ME",
    noShopsTitle: isHindi ? "कोई दुकान नहीं मिली" : "No Shops Found",
    noShopsDesc: isHindi ? "दुकानदार द्वारा अभी तक कोई आइटम स्टॉक में नहीं जोड़ा गया है।" : "Dukandar dwara abhi tak koi item stock mein nahi joda gaya hai.",
    itemsInCart: isHindi ? "आइटम कार्ट में हैं" : "Item(s) in Cart",
    proceedToPay: isHindi ? "पेमेंट करें ➔" : "Proceed to Pay ➔"
  };

  // 🔥 Category Translation Dictionary 🔥
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

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferredCategory, setPreferredCategory] = useState<string | null>(null);

  // 🔥 CUSTOMER NOTIFY ME FUNCTION 🔥
  const handleNotifyMe = (product: any) => {
    // Yahan backend par notification save karne ka logic aayega
    alert(t.notifyMsg(product.name));
  };

  // 🔥 STRICT LOGIC: ONLY SHOP OWNER PRODUCTS + NOTIFY ME 🔥
  const groupedProducts = useMemo(() => {
    if (!displayProducts || displayProducts.length === 0) return [];

    // 🛑 RULE 1: MASTER INVENTORY BLOCKER 🛑
    // Sirf wahi item dikhenge jisme shop_id hai (yaani kisi dukandar ka hai)
    let shopOnlyProducts = displayProducts.filter((p: any) => p.shop_id !== null && p.shop_id !== undefined && p.shop_id !== '');

    // 2. Search Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      shopOnlyProducts = shopOnlyProducts.filter((p: any) => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // 3. Category wise Grouping
    const groups: Record<string, any[]> = {};
    shopOnlyProducts.forEach((p: any) => {
      const cat = p.category || 'General Store';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    const finalCategoryGroups: any[] = [];
    const activeCat = expandedCategory || (selectedCategory !== 'All Categories' ? selectedCategory : null);

    Object.keys(groups).forEach(cat => {
      if (activeCat && activeCat !== cat) return;

      const catProducts = groups[cat];
      
      // RULE 2: In-stock upar, Out-of-Stock neeche
      const inStock = catProducts.filter(p => (p.total_stock > 0 || p.stock > 0));
      const outOfStock = catProducts.filter(p => !(p.total_stock > 0 || p.stock > 0));
      const mixedList = [...inStock, ...outOfStock];

      if (mixedList.length > 0) {
        if (activeCat) {
           // 🔥 VIEW ALL: Us category ke saare items (Stock aur 0 Stock dono) 🔥
           finalCategoryGroups.push({ category: cat, products: mixedList });
        } else {
           // 🔥 DASHBOARD: Max 15 items har category mein dikhenge 🔥
           finalCategoryGroups.push({ category: cat, products: mixedList.slice(0, 15) });
        }
      }
    });

    // Jis category mein sabse zyada in-stock item hain, wo upar dikhegi
    const sortedGroups = finalCategoryGroups.sort((a, b) => {
      if (a.category === preferredCategory) return -1;
      if (b.category === preferredCategory) return 1;
      return b.products.length - a.products.length;
    });

    return sortedGroups;
  }, [displayProducts, selectedCategory, expandedCategory, searchQuery, preferredCategory]);

  const getCategoryIcon = (catName: string) => {
    const c = catName.toLowerCase();
    if (c.includes('mobile')) return '📱';
    if (c.includes('laptop') || c.includes('print')) return '💻';
    if (c.includes('fashion') || c.includes('cloth')) return '👕';
    if (c.includes('cosmetic') || c.includes('makeup')) return '💄';
    if (c.includes('book') || c.includes('diary')) return '📚';
    if (c.includes('vehicle')) return '🏍️';
    if (c.includes('iron') || c.includes('steel')) return '🏗️';
    if (c.includes('cement')) return '🧱';
    if (c.includes('hardware')) return '🛠️';
    if (c.includes('furniture')) return '🪑';
    if (c.includes('paint')) return '🎨';
    if (c.includes('electric')) return '⚡';
    return '🛍️';
  };

  const isExpandedMode = expandedCategory !== null;

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', background: '#f1f5f9', minHeight: '100vh', paddingBottom: '120px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .bubble-cat {
          display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
          min-width: 75px; cursor: pointer; transition: transform 0.2s;
        }
        .bubble-cat:hover { transform: scale(1.05); }
        .bubble-icon-wrapper {
          width: 60px; height: 60px; border-radius: 50%; background: white;
          display: flex; justify-content: center; align-items: center; font-size: 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 2px solid transparent;
          transition: border 0.3s; margin-bottom: 5px;
        }
        
        .pro-card {
          background: white; border-radius: 8px; overflow: hidden; 
          box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; flex-direction: column; 
          border: 1px solid #e2e8f0; transition: all 0.2s ease; cursor: pointer;
          position: relative;
        }
        .pro-card:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
        
        .card-scroll { min-width: 160px; max-width: 160px; flex-shrink: 0; }
        .card-grid { width: 100%; height: 100%; }

        @media (min-width: 768px) {
          .card-scroll { min-width: 200px; max-width: 200px; }
        }
        
        .pro-img-box {
          height: 150px; width: 100%; background: #f8fafc; position: relative;
          display: flex; justify-content: center; align-items: center; padding: 10px;
        }
        .pro-img {
          max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.3s ease;
        }
        .pro-card:hover .pro-img { transform: scale(1.05); }
        
        .pro-discount-badge {
          position: absolute; top: 0; left: 0; background: #16a34a; color: white;
          padding: 3px 8px; font-size: 11px; font-weight: bold; border-bottom-right-radius: 8px; z-index: 2;
        }
        
        .add-btn {
          background: white; color: #2874f0; border: 1px solid #e2e8f0; border-top: none;
          padding: 10px; font-weight: 800; cursor: pointer; width: 100%; 
          font-size: 13px; transition: all 0.2s; text-transform: uppercase;
        }
        .add-btn:hover { background: #2874f0; color: white; }

        .notify-btn {
          background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; border-top: none;
          padding: 10px; font-weight: 800; cursor: pointer; width: 100%; 
          font-size: 13px; transition: all 0.2s; text-transform: uppercase;
        }
        .notify-btn:hover { background: #fef3c7; color: #d97706; }

        .glass-cart {
          background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px); border-top: 1px solid rgba(226, 232, 240, 0.8);
        }
      `}</style>

      {/* TOP HEADER APP BAR */}
      <div style={{ background: '#2874f0', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => {
                if (searchQuery) setSearchQuery('');
                else if (isExpandedMode) setExpandedCategory(null);
                else setAppStep('home');
              }} 
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: 0 }}>
              ← 
            </button>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '1px' }}>
              Fixifiy<span style={{color: '#ff9f00'}}>Store</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            🛒 <span style={{ background: '#ff9f00', padding: '2px 6px', borderRadius: '10px', fontSize: '11px' }}>{mainCart?.length || 0}</span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '8px', border: 'none', fontSize: '15px', outline: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
        </div>
      </div>

      {/* CATEGORY BUBBLES */}
      {!isExpandedMode && !searchQuery && (
        <div style={{ background: 'white', padding: '15px 10px', marginBottom: '10px', display: 'flex', gap: '15px', overflowX: 'auto' }} className="hide-scrollbar">
          {groupedProducts.map((g) => (
            <div key={g.category} className="bubble-cat" title={getTranslatedCategory(g.category)} onClick={() => setExpandedCategory(g.category)}>
              <div className="bubble-icon-wrapper" style={{ border: preferredCategory === g.category ? '2px solid #ff9f00' : '2px solid transparent' }}>
                {getCategoryIcon(g.category)}
              </div>
              <span style={{ fontSize: '11px', fontWeight: preferredCategory === g.category ? '800' : '600', color: preferredCategory === g.category ? '#ff9f00' : '#334155', textAlign: 'center', whiteSpace: 'nowrap', maxWidth: '75px', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2' }}>
                {getTranslatedCategory(g.category)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* PROMO BANNER */}
      {!isExpandedMode && !searchQuery && (
        <div style={{ padding: '0 10px 15px 10px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ width: '100%', height: '120px', borderRadius: '8px', background: 'linear-gradient(135deg, #FF1053, #FF7043)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', color: 'white', boxShadow: '0 4px 10px rgba(255, 16, 83, 0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ zIndex: 2 }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', lineHeight: '1.2' }} dangerouslySetInnerHTML={{__html: t.superSaver}}></h2>
              <div style={{ marginTop: '8px', background: 'white', color: '#FF1053', padding: '4px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' }}>{t.inStockNow}</div>
            </div>
            <div style={{ fontSize: '70px', opacity: 0.2, position: 'absolute', right: '-5px', bottom: '-15px', transform: 'rotate(-15deg)', zIndex: 1 }}>🛍️</div>
          </div>
        </div>
      )}

      {/* MAIN PRODUCT FEEDS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 10px' }}>
        
        {isExpandedMode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: '900' }}>
              {t.allIn(getTranslatedCategory(expandedCategory || ''))}
            </h2>
            <button onClick={() => setExpandedCategory(null)} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              {t.close}
            </button>
          </div>
        )}

        {searchQuery && (
           <h3 style={{ padding: '10px 5px', color: '#334155', margin: 0 }}>{t.searchResultsFor(searchQuery)}</h3>
        )}

        {groupedProducts.length > 0 ? (
          groupedProducts.map((group) => (
            <div key={group.category} style={{ marginBottom: isExpandedMode || searchQuery ? '10px' : '20px', background: isExpandedMode ? 'transparent' : 'white', borderRadius: isExpandedMode ? '0' : '8px', padding: isExpandedMode ? '0' : '15px 0' }}>
              
              {!isExpandedMode && !searchQuery && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px 15px 15px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
                    {t.topIn(getTranslatedCategory(group.category))}
                  </h3>
                  <span onClick={() => setExpandedCategory(group.category)} style={{ fontSize: '14px', background: '#2874f0', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(40,116,240,0.3)' }}>
                    {t.viewAll}
                  </span>
                </div>
              )}

              <div 
                className={isExpandedMode || searchQuery ? "" : "hide-scrollbar"} 
                style={{ 
                  display: isExpandedMode || searchQuery ? 'grid' : 'flex', 
                  gridTemplateColumns: isExpandedMode || searchQuery ? 'repeat(auto-fill, minmax(150px, 1fr))' : 'none',
                  gap: '12px', 
                  overflowX: isExpandedMode || searchQuery ? 'visible' : 'auto', 
                  paddingBottom: isExpandedMode || searchQuery ? '10px' : '5px', 
                  paddingLeft: isExpandedMode || searchQuery ? '0' : '15px',
                  paddingRight: isExpandedMode || searchQuery ? '0' : '15px',
                  scrollSnapType: isExpandedMode || searchQuery ? 'none' : 'x mandatory' 
                }}
              >
                {group.products.map((product: any, idx: number) => {
                   const hasStock = product.total_stock > 0 || product.stock > 0; 
                   const discountPercent = Math.floor(Math.random() * 20) + 10;
                   const itemUnit = product.unit || 'Pc'; 
                   const returnPolicy = product.return_policy || 'No Return';

                   return (
                    <div 
                      key={product.id || idx} 
                      className={`pro-card ${isExpandedMode || searchQuery ? 'card-grid' : 'card-scroll'}`} 
                      onClick={() => { if(hasStock) { setPreferredCategory(product.category); openCartModal(product); } }}
                      style={{ opacity: hasStock ? 1 : 0.6, scrollSnapAlign: 'start' }} 
                    >
                      <div className="pro-img-box">
                        {hasStock && <div className="pro-discount-badge">{discountPercent}% OFF</div>}
                        <img 
                          className="pro-img"
                          src={product.image_url && product.image_url.trim() !== '' ? product.image_url.split(',')[0] : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300'} 
                          alt={product.name} 
                          style={{ filter: hasStock ? 'none' : 'grayscale(100%)' }}
                          loading="lazy"
                        />
                        {!hasStock && (
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(239,68,68,0.9)', color: 'white', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '900', width: '85%', textAlign: 'center', letterSpacing: '1px' }}>
                            {t.outOfStock}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '13px', color: '#0f172a', lineHeight: '1.3', fontWeight: '600', height: '34px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {product.name} {product.is_heavy && '🚛'}
                        </div>
                        
                        <div style={{ fontSize: '10px', fontWeight: '800', marginTop: '6px', color: returnPolicy === 'No Return' ? '#ef4444' : '#16a34a' }}>
                          {returnPolicy === 'No Return' ? t.noReturn : `↩️ ${returnPolicy}`}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '10px', background: '#16a34a', color: 'white', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            {product.rating || '4.2'} ★
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>({product.reviews_count || Math.floor(Math.random() * 500) + 50})</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: 'auto' }}>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: '#000' }}>₹{product.price?.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>/ {itemUnit}</span>
                        </div>
                        {hasStock && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through', marginTop: '2px' }}>
                            ₹{Math.round(product.price * (1 + discountPercent/100)).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                      
                      {/* 🔥 NOTIFY ME BUTTON IF OUT OF STOCK 🔥 */}
                      {hasStock ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPreferredCategory(product.category); openCartModal(product); }} 
                          className="add-btn">
                          {t.addBtn}
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleNotifyMe(product); }} 
                          className="notify-btn">
                          {t.notifyBtn}
                        </button>
                      )}

                    </div>
                   );
                })}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '50px' }}>📦</span>
            <h3 style={{ color: '#0f172a', margin: '15px 0 5px 0' }}>{t.noShopsTitle}</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{t.noShopsDesc}</p>
          </div>
        )}
      </div>

      {/* FLOATING GLASSMORPHISM CART */}
      {mainCart && mainCart.length > 0 && (
         <div className="glass-cart" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: '15px 20px', zIndex: 1000, display: 'flex', justifyContent: 'center', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
            <div style={{ maxWidth: '600px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                  ₹{mainCart.reduce((sum: number, item: any) => sum + item.price, 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>
                  {mainCart.length} {t.itemsInCart}
                </div>
              </div>
              <button 
                onClick={() => setAppStep('cart_checkout')} 
                style={{ background: '#ff9f00', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(255, 159, 0, 0.4)', transition: 'transform 0.2s' }}
              >
                {t.proceedToPay}
              </button>
            </div>
         </div>
      )}
    </div>
  );
}