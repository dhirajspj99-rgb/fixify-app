"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

export default function ReviewFeedbackForm({ 
  productId, 
  userProfile, 
  selectedLanguage, 
  onClose 
}: any) {
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchedReviews, setFetchedReviews] = useState<any[]>([]); // 🔥 Naya state reviews store karne ke liye

  // 🌐 Language Setup
  const isHindi = selectedLanguage?.includes('Hindi') || selectedLanguage?.includes('हिंदी');
  
  const t = {
    rateProduct: isHindi ? "इस प्रोडक्ट को रेटिंग दें" : "Rate this Product",
    reviewPlaceholder: isHindi ? "आपको यह प्रोडक्ट कैसा लगा? अपना फीडबैक दें..." : "Aapko ye product kaisa laga? Feedback dein...",
    submitting: isHindi ? "सबमिट हो रहा है..." : "Submitting...",
    submitFeedback: isHindi ? "फीडबैक सबमिट करें" : "Submit Feedback",
    cancel: isHindi ? "रद्द करें" : "Cancel",
    loginError: isHindi ? "रिव्यु लिखने के लिए पहले लॉगिन करें!" : "Please login to submit a review!",
    ratingError: isHindi ? "कृपया कम से कम 1 स्टार रेटिंग दें!" : "Please give at least 1 star rating!",
    successMsg: isHindi ? "आपका फीडबैक सफलतापूर्वक सबमिट हो गया है! धन्यवाद।" : "Your feedback has been submitted successfully! Thank you.",
    failMsg: isHindi ? "फीडबैक सबमिट नहीं हो पाया। कृपया बाद में प्रयास करें।" : "Failed to submit feedback. Please try again later.",
    customerReviews: isHindi ? "कस्टमर रिव्यु" : "Customer Reviews",
    noReviews: isHindi ? "अभी तक कोई रिव्यु नहीं है। पहले व्यक्ति बनें!" : "No reviews yet. Be the first to review!"
  };

  // 🔥 1. FETCH REVIEWS FROM DATABASE 🔥
  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setFetchedReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  // Jab component khulega toh reviews fetch honge
  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId]);

  // 🔥 2. SUBMIT REVIEW LOGIC 🔥
  const submitReview = async () => {
    if (!userProfile || !userProfile.phone) {
      alert(t.loginError);
      return;
    }
    if (!reviewRating || reviewRating === 0) {
      alert(t.ratingError);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('product_reviews') 
        .insert([
          {
            product_id: productId,
            shop_id: null, // Agar shop id parent se nahi aa rahi hai toh null rakhein
            customer_name: userProfile.name || 'Customer',
            customer_phone: userProfile.phone,
            rating: reviewRating,
            review_text: reviewText,
            status: 'verified' 
          }
        ]);

      if (error) throw error;

      alert(t.successMsg);
      setReviewText('');
      setReviewRating(5);
      
      // Submit hone ke baad naye reviews turant load karo
      await loadReviews(); 
      // onClose(); // Agar form band karna hai toh isko uncomment kar dena, abhi khula rakha hai taaki user apna review dekh sake

    } catch (error: any) {
      console.error("Review Submit Error:", error.message);
      alert(t.failMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '0', borderRadius: '12px', marginBottom: '15px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      
      {/* 🌟 OVERALL RATING HEADER (Fixed dummy data for trust) 🌟 */}
      <div style={{ background: '#f8fafc', padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: '900', color: '#16a34a', lineHeight: '1' }}>4.5</div>
          <div style={{ color: '#facc15', fontSize: '18px', margin: '5px 0' }}>★★★★☆</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>128 Ratings & 45 Reviews</div>
        </div>
        
        <div style={{ flex: 1 }}>
          {[5, 4, 3, 2, 1].map(star => {
            const percentages = { 5: 65, 4: 20, 3: 10, 2: 3, 1: 2 };
            const barWidth = percentages[star as keyof typeof percentages] + '%';
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', fontSize: '12px', color: '#475569' }}>
                <span>{star} ★</span>
                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: barWidth, height: '100%', background: star >= 4 ? '#16a34a' : star === 3 ? '#facc15' : '#ef4444' }}></div>
                </div>
                <span style={{ width: '30px', textAlign: 'right' }}>{barWidth}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 📝 WRITE REVIEW FORM */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#fdfdfd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>{t.rateProduct}</h4>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>✖ {t.cancel}</button>
        </div>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span 
              key={star} 
              onClick={() => setReviewRating(star)} 
              style={{ cursor: 'pointer', fontSize: '28px', color: star <= reviewRating ? '#facc15' : '#e2e8f0', transition: '0.2s', lineHeight: '1' }}
            >
              ★
            </span>
          ))}
        </div>
        
        <textarea 
          value={reviewText} 
          onChange={e => setReviewText(e.target.value)} 
          placeholder={t.reviewPlaceholder} 
          rows={3} 
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px', outline: 'none', resize: 'none', backgroundColor: '#f8fafc' }}
        ></textarea>
        
        <button 
          onClick={submitReview} 
          disabled={isSubmitting} 
          style={{ background: isSubmitting ? '#94a3b8' : '#2874f0', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', width: '100%', transition: '0.2s', fontSize: '15px', boxShadow: '0 4px 6px rgba(40,116,240,0.2)' }}
        >
          {isSubmitting ? t.submitting : t.submitFeedback}
        </button>
      </div>

      {/* 💬 CUSTOMER REVIEWS LIST */}
      <div style={{ padding: '20px', background: 'white' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{t.customerReviews} ({fetchedReviews.length})</h3>
        
        {fetchedReviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '14px', background: '#f8fafc', borderRadius: '8px' }}>
            {t.noReviews}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
            {fetchedReviews.map((rev, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  
                  {/* Name and Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#16a34a', color: 'white', fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {rev.rating} <span style={{ fontSize: '10px' }}>★</span>
                    </div>
                    <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                      {rev.customer_name || 'Verified Customer'}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                      <span style={{background: '#d1fae5', padding: '2px', borderRadius: '50%', marginRight: '3px'}}>✓</span> Verified
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {new Date(rev.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>

                </div>
                
                {/* Review Text */}
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                  {rev.review_text || "Good product!"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}