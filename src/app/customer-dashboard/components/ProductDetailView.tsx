"use client";
import React, { useState, useEffect } from 'react';
import DeliveryEstimator from './DeliveryEstimator'; 
import { supabase } from '@/supabase'; 

// 🔥 1. FAKE (DUMMY) DATA GENERATOR (60 Reviews) 🔥
const DUMMY_NAMES = [
  "Rahul Kumar", "Amit Singh", "Priya Sharma", "Vikram Das", "Neha Gupta", 
  "Ravi Verma", "Anjali Mishra", "Suresh Patil", "Manoj Yadav", "Pooja Reddy", 
  "Karan Tiwari", "Sneha Rao", "Deepak Joshi", "Nisha Wagh", "Akash Bose", 
  "Sanjay Gupta", "Kavita R.", "Vinay K.", "Monika S.", "Rohan M."
];

const DUMMY_COMMENTS = [
  "Bahut badhiya product hai, mujhe pasand aaya.", "Quality ek number hai!", 
  "Worth the price. Fast delivery.", "Good product, standard quality.", 
  "I am fully satisfied with this purchase.", "Thoda aur better ho sakta tha, but overall okay.", 
  "Best in the market. Highly recommended.", "Superb experience!", 
  "Product exactly as shown in the picture.", "Value for money.", 
  "Very useful and durable.", "Maja aa gaya use karke.", 
  "Packaging bahut achhi thi.", "Average product, can be improved.", 
  "Excellent quality, will buy again.", "Nice product.", "Very good.", 
  "Okay okay hai.", "Loved it!", "Exactly what I was looking for."
];

const generateDummyReviews = () => {
  const reviews = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const name = DUMMY_NAMES[i % DUMMY_NAMES.length];
    const comment = DUMMY_COMMENTS[(i * 3) % DUMMY_COMMENTS.length]; 
    const rating = i % 8 === 0 ? 3 : (i % 5 === 0 ? 4 : 5); 
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - (i * 2 + (i % 3))); 
    reviews.push({
      customer_name: name,
      rating: rating,
      review_text: comment,
      created_at: pastDate.toISOString(),
      is_fake: true 
    });
  }
  return reviews;
};

// 60 Fake Reviews Ready
const DUMMY_REVIEWS = generateDummyReviews();

export default function ProductDetailView({ 
  cartModalItem, setAppStep, selectedItemImages, activeModalImageIndex, setActiveModalImageIndex, 
  buyType, setBuyType, buyValue, setBuyValue, setShowReviewsModal, handleConfirmAddToCart, 
  getRelatedItems, openCartModal, shopDetails, userProfile, setUserProfile, selectedLanguage = 'English' 
}: any) {

  const [showTrustModal, setShowTrustModal] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false); 
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // States for Reviews
  const [savedReviews, setSavedReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false); 

  const isHindi = selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी');

  const t = {
    backToDash: isHindi ? "← डैशबोर्ड पर वापस" : "← Back to Dashboard",
    verifiedReviews: isHindi ? "वेरीफाइड कस्टमर रिव्यु" : "Verified Customer Reviews",
    writeReview: isHindi ? "📝 रिव्यु लिखें" : "📝 Write Review",
    rateProduct: isHindi ? "इस प्रोडक्ट को रेटिंग दें" : "Rate this Product",
    reviewPlaceholder: isHindi ? "आपको यह प्रोडक्ट कैसा लगा? अपना फीडबैक दें..." : "Aapko ye product kaisa laga? Feedback dein...",
    submitting: isHindi ? "सबमिट हो रहा है..." : "Submitting...",
    submitFeedback: isHindi ? "फीडबैक सबमिट करें" : "Submit Feedback",
    allReviewsTitle: isHindi ? "कस्टमर रिव्यु" : "Customer Reviews", 
    noReviews: isHindi ? "अभी तक कोई रिव्यु नहीं है। पहला रिव्यु लिखें!" : "No reviews yet. Be the first to review!",
    off: isHindi ? "छूट" : "OFF",
    noReturn: isHindi ? "कोई रिटर्न पॉलिसी उपलब्ध नहीं है" : "No Return Policy Available",
    applicable: isHindi ? "लागू है" : "Applicable",
    secureTrusted: isHindi ? "100% सुरक्षित और भरोसेमंद" : "100% Secure & Trusted",
    qtyPlaceholder: isHindi ? "मात्रा" : "Qty",
    addToCart: isHindi ? "🛒 शॉपिंग कार्ट में डालें" : "🛒 ADD TO SHOPPING CART",
    outOfStock: isHindi ? "🚫 स्टॉक में नहीं है" : "🚫 OUT OF STOCK",
    customersViewed: isHindi ? "जिन कस्टमर्स ने यह ख़रीदा, उन्होंने ये भी देखा" : "Customers who bought this also viewed",
    trustTitle: isHindi ? "हमारा भरोसा और वादे" : "Our Trust & Promises",
    qaTitle: isHindi ? "क्वालिटी एश्योरेंस" : "Quality Assurance",
    qaDesc: isHindi ? "100% असली उत्पाद। हमारे वेरीफाइड शॉप ओनर्स द्वारा सीधे चेक और डिलीवर किया जाता है।" : "100% Genuine products. Checked and delivered directly from our verified shop owners.",
    trTitle: isHindi ? "टॉप रेटिंग्स" : "Top Ratings",
    trDesc: isHindi ? "कस्टमर्स द्वारा बेहतरीन रेटिंग। हम हमेशा शानदार सर्विस देने की पूरी कोशिशদ্দি करते हैं।" : "Highly rated by customers. We consistently strive to deliver the best service possible.",
    ecTitle: isHindi ? "एक्सट्रा केयर" : "Extra Care",
    ecDesc: isHindi ? "सुरक्षित पैकिंग। डिलीवरी के दौरान आपके सामान की खास देखभाल की जाती है।" : "Safely packed. We handle your items with extra care during transit to avoid any damage.",
    ebTitle: isHindi ? "एक्सट्रा फायदे" : "Extra Benefits",
    ebDesc: isHindi ? "हर खरीदारी पर आसान सपोर्ट और हमारे प्रीमियम ग्राहकों के लिए एक्सक्लूसिव फायदे।" : "Hassle-free support and exclusive ongoing benefits on every purchase for our customers.",
    codAvailable: isHindi ? "कैश ऑन डिलीवरी उपलब्ध" : "Cash on Delivery Available",
    onlineOnly: isHindi ? "सिर्फ ऑनलाइन पेमेंट" : "Online Payment Only"
  };

  const fetchReviews = async () => {
    if (!cartModalItem?.id) return;
    setIsLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', cartModalItem.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [cartModalItem?.id]);

  const submitReview = async () => {
    if (!userProfile || !userProfile.phone) { 
      alert(isHindi ? "रिव्यु लिखने के लिए पहले लॉगिन करें!" : "Please login to submit a review!");
      return;
    }
    if (!reviewRating || reviewRating === 0) {
      alert(isHindi ? "कृपया कम से कम 1 स्टार रेटिंग दें!" : "Please give at least 1 star rating!");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert([{
          product_id: cartModalItem.id,
          shop_id: cartModalItem.shop_id, 
          customer_name: userProfile.name || 'Customer', 
          customer_phone: userProfile.phone, 
          rating: reviewRating,
          review_text: reviewText,
          status: 'verified' 
        }]);

      if (error) throw error;

      alert(isHindi ? "आपका फीडबैक सफलतापूर्वक सबमिट हो गया है! धन्यवाद।" : "Your feedback has been submitted successfully! Thank you.");
      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false); 
      
      fetchReviews();
      setShowAllReviews(true);

    } catch (error: any) {
      console.error("Review Submit Error:", error.message);
      alert(isHindi ? "फीडबैक सबमिट नहीं हो पाया। कृपया बाद में प्रयास करें।" : "Failed to submit feedback. Please try again later.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 🔥 MERGE REAL REVIEWS FROM DB WITH 60 FAKE REVIEWS 🔥
  const allReviews = [...savedReviews, ...DUMMY_REVIEWS];

  const nextModalImage = (e: any) => {
    e.stopPropagation();
    setActiveModalImageIndex((prev: number) => (prev + 1) % selectedItemImages.length);
  };
  
  const prevModalImage = (e: any) => {
    e.stopPropagation();
    setActiveModalImageIndex((prev: number) => (prev - 1 + selectedItemImages.length) % selectedItemImages.length);
  };

  if (!cartModalItem) return null;

  const itemStock = Number(cartModalItem.total_stock || cartModalItem.stock || 0);
  const itemUnit = cartModalItem.unit || 'Pc'; 
  const returnPolicy = cartModalItem.return_policy || 'No Return';
  const shopPincode = shopDetails?.pincode || cartModalItem?.shop_pincode || ''; 
  const isCodAvailable = cartModalItem.is_cod_available !== false; // Default true agar null hai

  return (
    <>
      <div className="glass-card no-print" style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', background: 'white' }}>
        <button onClick={() => setAppStep('home')} style={{ background: 'transparent', border: 'none', color: '#2874f0', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>{t.backToDash}</button>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
          
          <div style={{ flex: '1 1 100%', maxWidth: '450px' }}>
            <div style={{ width: '100%', background: 'white', borderRadius: '12px', padding: '15px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* FIX: Changed justify-content to justifyContent */}
              <div style={{ width: '100%', height: '350px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                {selectedItemImages.length > 1 && (
                  <>
                    <button onClick={prevModalImage} style={{ position: 'absolute', left: '10px', background: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }}>❮</button>
                    <button onClick={nextModalImage} style={{ position: 'absolute', right: '10px', background: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }}>❯</button>
                  </>
                )}
                
                <img 
                  src={selectedItemImages[activeModalImageIndex]} 
                  alt={cartModalItem.name} 
                  onClick={() => setIsImageZoomed(true)} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in', transition: 'transform 0.3s ease' }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>

              {selectedItemImages.length > 1 && (
                <div className="hide-scrollbar" style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '5px', width: '100%' }}>
                  {selectedItemImages.map((img: string, idx: number) => (
                    <img 
                      key={idx} src={img} onClick={() => setActiveModalImageIndex(idx)}
                      alt={`Thumbnail ${idx}`}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, border: activeModalImageIndex === idx ? '2px solid #2874f0' : '1px solid #cbd5e1', opacity: activeModalImageIndex === idx ? 1 : 0.5 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: '1 1 400px' }}>
            <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '4px 12px', borderRadius: '20px', color: '#475569', fontWeight: 'bold', textTransform: 'uppercase' }}>{cartModalItem.category}</span>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: '15px 0 10px 0', lineHeight: '1.2' }}>
              {cartModalItem.name} {cartModalItem.is_heavy && '🚛'}
            </h1>
            
            {/* RATINGS & REVIEW BTN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ background: '#16a34a', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
                {cartModalItem.rating || '4.6'} ★
              </div>
              
              <span onClick={() => setShowAllReviews(!showAllReviews)} style={{ fontSize: '14px', color: '#2874f0', cursor: 'pointer', fontWeight: '600' }}>
                ({allReviews.length} {t.verifiedReviews}) ›
              </span>

              <span onClick={() => setShowReviewForm(!showReviewForm)} style={{ fontSize: '13px', background: '#facc15', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}>
                {t.writeReview}
              </span>
            </div>

            {/* ALL REVIEWS VIEW */}
            {showAllReviews && (
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e2e8f0', maxHeight: '350px', overflowY: 'auto' }} className="hide-scrollbar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', position: 'sticky', top: 0, background: '#f8fafc', paddingBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px' }}>{t.allReviewsTitle} ({allReviews.length})</h4>
                  <button onClick={() => setShowAllReviews(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                </div>

                {isLoadingReviews ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Loading...</p>
                ) : allReviews.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>{t.noReviews}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {allReviews.map((rev, index) => (
                      <div key={index} style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {rev.customer_name || 'Customer'}
                            <span style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                              <span style={{background: '#d1fae5', padding: '2px', borderRadius: '50%', marginRight: '2px'}}>✓</span> Verified
                            </span>
                          </span>
                          <span style={{ color: rev.rating >= 4 ? '#16a34a' : '#facc15', fontSize: '13px', fontWeight: 'bold' }}>
                            {rev.rating} ★
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{rev.review_text}</p>
                        {rev.created_at && (
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '5px' }}>
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showReviewForm && (
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{t.rateProduct}</h4>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} onClick={() => setReviewRating(star)} style={{ cursor: 'pointer', fontSize: '24px', color: star <= reviewRating ? '#facc15' : '#cbd5e1' }}>★</span>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder={t.reviewPlaceholder} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px' }}></textarea>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={submitReview} disabled={isSubmittingReview} style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isSubmittingReview ? t.submitting : t.submitFeedback}
                  </button>
                  <button onClick={() => setShowReviewForm(false)} style={{ background: 'transparent', color: '#ef4444', border: 'none', fontWeight: 'bold', cursor: 'pointer', padding: '0 10px' }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#16a34a', lineHeight: '1' }}>
                  ₹{cartModalItem.price.toLocaleString('en-IN')}
                  <span style={{fontSize: '20px', color: '#64748b', fontWeight: '700', marginLeft: '5px'}}>/ {itemUnit}</span>
                </div>
                <div style={{ fontSize: '20px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '500' }}>₹{Math.round(cartModalItem.price * 1.2).toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '16px', color: '#ef4444', fontWeight: '800' }}>20% {t.off}</div>
            </div>

            {/* 🔥 ADDED PAYMENT MODE BLOCK ALONG WITH RETURN POLICY AND TRUST 🔥 */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
              
              <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: returnPolicy === 'No Return' ? '#fef2f2' : '#ecfdf5', borderRadius: '8px', border: `1px solid ${returnPolicy === 'No Return' ? '#fecaca' : '#a7f3d0'}` }}>
                <span style={{ fontSize: '22px' }}>{returnPolicy === 'No Return' ? '🚫' : '↩️'}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: returnPolicy === 'No Return' ? '#dc2626' : '#059669' }}>
                  {returnPolicy === 'No Return' ? t.noReturn : `${returnPolicy} ${t.applicable}`}
                </span>
              </div>

              <div 
                onClick={() => setShowTrustModal(true)}
                style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              >
                <span style={{ fontSize: '22px' }}>🛡️</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1d4ed8' }}>
                  {t.secureTrusted} <span style={{ fontSize: '12px' }}>ⓘ</span>
                </span>
              </div>

              {/* PAYMENT MODE DISPLAY */}
              <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: isCodAvailable ? '#f0fdfa' : '#f8fafc', borderRadius: '8px', border: `1px solid ${isCodAvailable ? '#10b981' : '#cbd5e1'}` }}>
                <span style={{ fontSize: '22px' }}>{isCodAvailable ? '💵' : '💳'}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: isCodAvailable ? '#059669' : '#334155' }}>
                  {isCodAvailable ? t.codAvailable : t.onlineOnly}
                </span>
              </div>

            </div>

            <DeliveryEstimator shopPincode={shopPincode} userProfile={userProfile} selectedLanguage={selectedLanguage} setUserProfile={setUserProfile} />

            {itemStock > 0 ? (
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', paddingRight: '15px', overflow: 'hidden' }}>
                  <input type="number" placeholder={t.qtyPlaceholder} value={buyValue} onChange={(e) => setBuyValue(e.target.value)} style={{ width: '80px', fontSize: '18px', textAlign: 'center', padding: '14px', border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold' }} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#64748b' }}>{itemUnit}</span>
                </div>
                <button onClick={handleConfirmAddToCart} className="primary-btn" style={{ background: '#ff9f00', flex: 1, padding: '16px', fontSize: '18px', borderRadius: '8px', fontWeight: '900', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,159,0,0.3)' }}>{t.addToCart}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                 <button disabled style={{ background: '#94a3b8', flex: 1, padding: '16px', fontSize: '18px', borderRadius: '8px', fontWeight: '900', color: 'white', border: 'none', cursor: 'not-allowed' }}>{t.outOfStock}</button>
              </div>
            )}
          </div>
        </div>

        {getRelatedItems().length > 0 && (
          <div style={{ marginTop: '50px', borderTop: '2px solid #f1f5f9', paddingTop: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{t.customersViewed}</h3>
            <div className="amazon-slider-row hide-scrollbar" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px' }}>
              {getRelatedItems().map((related: any, idx: number) => {
                 const firstImg = related.image_url ? related.image_url.split(',')[0] : 'https://placehold.co/400x300?text=No+Image';
                 return (
                   <div key={idx} onClick={() => openCartModal(related)} className="amazon-slider-card" style={{ minWidth: '150px', cursor: 'pointer', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px' }}>
                     <div style={{ height: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', background: '#f8fafc', borderRadius: '6px' }}>
                       <img src={firstImg} alt={related.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                     </div>
                     <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#334155', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{related.name}</h4>
                     <div style={{ fontSize: '15px', color: '#16a34a', fontWeight: '900' }}>₹{(related.price || related.base_rate).toLocaleString('en-IN')}</div>
                   </div>
                 )
              })}
            </div>
          </div>
        )}
      </div>

      {isImageZoomed && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} onClick={() => setIsImageZoomed(false)}>
          <button onClick={() => setIsImageZoomed(false)} style={{ position: 'absolute', top: '25px', right: '30px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '24px', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</button>
          <img src={selectedItemImages[activeModalImageIndex]} alt="Zoomed" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} onClick={(e) => { e.stopPropagation(); setIsImageZoomed(false); }} />
        </div>
      )}

      {/* 🔥 FIXED TRUST MODAL 🔥 */}
      {showTrustModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowTrustModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '25px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>🛡️ {t.trustTitle}</h3>
              <button onClick={() => setShowTrustModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#ef4444' }}>✖</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#0f172a' }}>{t.qaTitle}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{t.qaDesc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>⭐</span>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#0f172a' }}>{t.trTitle}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{t.trDesc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>📦</span>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#0f172a' }}>{t.ecTitle}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{t.ecDesc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🎁</span>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#0f172a' }}>{t.ebTitle}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{t.ebDesc}</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowTrustModal(false)} style={{ width: '100%', padding: '12px', marginTop: '25px', background: '#2874f0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>OK, Got it</button>
          </div>
        </div>
      )}
    </>
  );
}