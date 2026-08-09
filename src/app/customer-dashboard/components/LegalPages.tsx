"use client";
import React from 'react';
import { useAppContext } from './AppContext'; // 🔥 Language fetch karne ke liye

export default function LegalPages({ pageType, setAppState, shopOwnerPolicyNote }: { pageType: string; setAppState: (step: any) => void; shopOwnerPolicyNote?: string }) {
  
  // 🔥 Global Language
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  // Translation Object
  const t = {
    backBtn: isHindi ? "← Fixifiy होम पर वापस" : "← Back to Fixifiy Home",
    
    // About Us
    aboutTitle: isHindi ? "Fixifiy के बारे में ✨" : "About Fixifiy ✨",
    aboutP1: isHindi 
      ? "Fixifiy (महादेव एंटरप्राइजेज की एक इकाई) भारत का तेजी से बढ़ता नंबर 1 ई-कॉमर्स और सर्विस प्लेटफॉर्म है। हम ग्राहकों और स्थानीय भरोसेमंद व्यवसायों के बीच की दूरी को कम करते हैं, एक ही छत के नीचे ए से जेड (A to Z) रिटेल उत्पादों से लेकर वेरीफाइड प्रीमियम मिस्त्री तक सब कुछ प्रदान करते हैं।" 
      : "Fixifiy (A unit of Mahadev Enterprises) is India’s rapidly growing No. 1 E-Commerce Sale & Service platform. We bridge the gap between customers and local trusted businesses by offering everything under one roof—from A to Z retail products to Verified Premium Mistris (skilled labor).",
    missionTitle: isHindi ? "हमारा मिशन" : "Our Mission",
    missionP: isHindi 
      ? "स्थानीय वेंडर्स, रिटेल दुकानदारों और कुशल तकनीशियनों को उनकी सेवाओं का डिजिटलीकरण करके सशक्त बनाना, और साथ ही ग्राहकों को सुपरफास्ट डिलीवरी, पारदर्शी मूल्य निर्धारण और 100% सुरक्षित बिल भुगतान (BBPS) प्रदान करना।" 
      : "To empower local vendors, retail shop owners, and skilled technicians by digitizing their services while providing customers with lightning-fast delivery, transparent pricing, and 100% secure utility payments (BBPS).",

    // Terms
    termsTitle: isHindi ? "नियम और शर्तें 📜" : "Terms & Conditions 📜",
    lastUpdated: isHindi ? "अंतिम अपडेट:" : "Last updated:",
    termsWelcome: isHindi 
      ? "Fixifiy (महादेव एंटरप्राइजेज की एक इकाई) में आपका स्वागत है। हमारे प्लेटफॉर्म, वेबसाइट या मोबाइल ऐप का उपयोग करके, आप निम्नलिखित नियमों और शर्तों का पालन करने के लिए सहमत होते हैं।" 
      : "Welcome to Fixifiy (A unit of Mahadev Enterprises). By accessing or using our platform, website, or mobile application, you agree to comply with and be bound by the following terms and conditions.",
    term1Title: isHindi ? "1. प्लेटफॉर्म की भूमिका और डिस्क्लेमर" : "1. Platform Role & Disclaimer",
    term1P: isHindi 
      ? "Fixifiy एक ऑनलाइन मार्केटप्लेस के रूप में कार्य करता है जो उपयोगकर्ताओं को थर्ड-पार्टी विक्रेताओं, स्थानीय दुकानों और सेवा प्रदाताओं (मिस्त्रियों) से जोड़ता है। Fixifiy सीधे तौर पर किसी प्रोडक्ट की मैन्युफैक्चरिंग या वारंटी के लिए ज़िम्मेदार नहीं है, जब तक कि वह सीधे हमारे द्वारा न बेचा गया हो।" 
      : "Fixifiy acts as an online marketplace and technology facilitator connecting users with independent third-party sellers, local shops, and service providers (Mistris). Fixifiy is not directly responsible for the manufacturing or individual warranty of third-party products unless explicitly sold directly by us.",
    term2Title: isHindi ? "2. यूज़र अकाउंट और वॉलेट सुरक्षा" : "2. User Account & Wallet Security",
    term2P: isHindi 
      ? "यूज़र्स अपने लॉगिन डिटेल्स और वॉलेट पिन की गोपनीयता बनाए रखने के लिए ज़िम्मेदार हैं। यूज़र की लापरवाही के कारण होने वाले किसी भी अनधिकृत एक्सेस के लिए Fixifiy ज़िम्मेदार नहीं होगा।" 
      : "Users are responsible for maintaining the confidentiality of their login credentials and wallet pin. Fixifiy holds no liability for unauthorized access resulting from user negligence.",
    term3Title: isHindi ? "3. मूल्य निर्धारण और भुगतान" : "3. Pricing & Payments",
    term3P: isHindi 
      ? "उत्पादों और सेवाओं की सभी कीमतें संबंधित विक्रेताओं या सिस्टम मानकों द्वारा तय की जाती हैं। BBPS के माध्यम से होने वाले बिल भुगतान और रिचार्ज ऑपरेटर के नियमों के अधीन हैं।" 
      : "All prices listed on products and services are determined by respective vendors or system standards. Utility payments and recharges processed via our BBPS system are subject to operator terms.",
    term4Title: isHindi ? "4. दायित्व की सीमा" : "4. Limitation of Liability",
    term4P: isHindi 
      ? "कानून द्वारा अनुमत अधिकतम सीमा तक, सेवा में देरी या थर्ड-पार्टी वेंडर विवादों से उत्पन्न होने वाले किसी भी नुकसान के लिए Fixifiy ज़िम्मेदार नहीं होगा।" 
      : "To the maximum extent permitted by law, Fixifiy shall not be liable for any indirect, incidental, or consequential damages arising out of service delays or third-party vendor disputes.",

    // Refund
    refundTitle: isHindi ? "रिटर्न और रिफंड पॉलिसी 🔄" : "Return & Refund Policy 🔄",
    refundIntro: isHindi 
      ? "Fixifiy में ग्राहक संतुष्टि हमारी सर्वोच्च प्राथमिकता है। हालांकि, कृपया ध्यान दें कि हमारे मल्टी-वेंडर प्लेटफॉर्म पर रिटर्न और रिफंड कैसे संभाले जाते हैं:" 
      : "At Fixifiy, customer satisfaction is our top priority. However, please note how returns and refunds are handled across our multi-vendor platform:",
    vendorNoticeTitle: isHindi ? "🏪 शॉप ओनर / वेंडर पॉलिसी नोटिस" : "🏪 Shop Owner / Vendor Policy Notice",
    vendorNoticeP: shopOwnerPolicyNote || (isHindi 
      ? "Fixifiy पर प्रत्येक दुकानदार या विक्रेता अपनी स्वयं की रिटर्न और रिप्लेसमेंट विंडो (आमतौर पर डिलीवरी से 3 से 7 दिन) तय करता है। कृपया खरीदने से पहले प्रोडक्ट पेज या विक्रेता के दिशानिर्देशों को जांच लें।" 
      : "Each individual shop owner or product seller on Fixifiy defines their own specific Return & Replacement window (usually 3 to 7 days from delivery). Please check the specific product page or seller guidelines before purchasing."),
    refundGuideTitle: isHindi ? "रिफंड के दिशानिर्देश" : "Refund Guidelines",
    refundG1: isHindi 
      ? "ऑनलाइन प्रीपेड या वॉलेट पेमेंट का रिफंड, वेंडर की मंजूरी के बाद 3-5 कार्य दिवसों के भीतर Fixifiy वॉलेट या मूल भुगतान स्रोत में वापस कर दिया जाता है।" 
      : "Refunds for online prepaid or wallet payments are processed back to the Fixifiy Wallet or original payment source within 3-5 business days upon vendor approval.",
    refundG2: isHindi 
      ? "क्षतिग्रस्त या खराब वस्तुओं की रिपोर्ट डिलीवरी के 24 घंटे के भीतर फोटो प्रमाण के साथ की जानी चाहिए।" 
      : "Damaged or defective items must be reported within 24 hours of delivery along with photographic proof.",
    refundG3: isHindi 
      ? "एक बार जब तकनीशियन (मिस्त्री) लोकेशन पर पहुंच जाता है, तो सर्विस बुकिंग का चार्ज नॉन-रिफंडेबल होता है।" 
      : "Service bookings (Mistri charges) are non-refundable once the technician arrives at the location.",

    // Privacy
    privacyTitle: isHindi ? "गोपनीयता नीति (Privacy Policy) 🔒" : "Privacy Policy 🔒",
    privacyTrust: isHindi ? "आपका भरोसा ही हमारी सबसे बड़ी संपत्ति है।" : "Your trust is our greatest asset.",
    privacyIntro: isHindi 
      ? "Fixifiy में, हम आपकी गोपनीयता को बहुत गंभीरता से लेते हैं। यह प्राइवेसी पॉलिसी बताती है कि जब आप हमारे ऐप या वेबसाइट का उपयोग करते हैं तो हम आपकी व्यक्तिगत जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।" 
      : "At Fixifiy, we take your privacy very seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our mobile app or website.",
    priv1Title: isHindi ? "1. हम कौन सी जानकारी एकत्र करते हैं" : "1. Information We Collect",
    priv1P: isHindi 
      ? "हम वह जानकारी एकत्र करते हैं जो आप हमें सीधे प्रदान करते हैं, जैसे कि अकाउंट बनाना, प्रोफाइल अपडेट करना, मिस्त्री बुक करना, सामान ऑर्डर करना या सपोर्ट टीम से संपर्क करना (नाम, फोन नंबर, डिलीवरी का पता और लोकेशन)।" 
      : "We collect information you provide directly to us, such as when you create an account, update your profile, book a Mistri, order products, or contact our support team (Name, Phone Number, Delivery Address, and Location Coordinates).",
    priv2Title: isHindi ? "2. हम आपके डेटा का उपयोग कैसे करते हैं" : "2. How We Use Your Data",
    priv2P: isHindi 
      ? "आपके डेटा का उपयोग केवल ऑर्डर प्रोसेस करने, डिलीवरी पार्टनर या मिस्त्री असाइन करने, सुरक्षित वॉलेट बैलेंस बनाए रखने और ऑर्डर स्टेटस नोटिफिकेशन भेजने के लिए किया जाता है।" 
      : "Your data is used strictly to process orders, assign delivery partners or skilled Mistris, maintain secure wallet balances, and send order status notifications.",
    priv3Title: isHindi ? "3. डेटा सुरक्षा" : "3. Data Security",
    priv3P: isHindi 
      ? "हम यह सुनिश्चित करने के लिए मजबूत सुरक्षा उपाय, एन्क्रिप्शन और सुरक्षित डेटाबेस प्रोटोकॉल लागू करते हैं कि आपके व्यक्तिगत और वित्तीय लेनदेन सुरक्षित रहें।" 
      : "We implement robust security measures, encryption, and secure Supabase database protocols to ensure your personal and financial transactions remain safe from unauthorized access.",
    priv4Title: isHindi ? "4. हमसे संपर्क करें" : "4. Contact Us",
    priv4P: isHindi 
      ? "यदि गोपनीयता के संबंध में आपके कोई प्रश्न हैं, तो हमें support@fixifiy.com पर या हमारे कॉर्पोरेट कार्यालय प्लॉट नं. 271, नरपा, हसनपुर मेन रोड, समस्तीपुर, बिहार में संपर्क करें।" 
      : "If you have any questions regarding privacy, reach out to us at support@fixifiy.com or our corporate office at Plot No. 271, Narpa, Hasanpur Main Road, Samastipur, Bihar."
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '30px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => setAppState('home')} 
          style={{ background: '#f1f5f9', border: 'none', color: '#0f172a', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '25px' }}
        >
          {t.backBtn}
        </button>

        {/* 1. ABOUT US */}
        {pageType === 'about' && (
          <div>
            <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '900', marginBottom: '15px' }}>{t.aboutTitle}</h1>
            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '15px' }}>
              {t.aboutP1}
            </p>
            <h3 style={{ color: '#1e293b', marginTop: '25px' }}>{t.missionTitle}</h3>
            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '15px' }}>
              {t.missionP}
            </p>
          </div>
        )}

        {/* 2. TERMS & CONDITIONS */}
        {pageType === 'terms' && (
          <div>
            <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '900', marginBottom: '15px' }}>{t.termsTitle}</h1>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>{t.lastUpdated} {new Date().getFullYear()}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#475569', lineHeight: '1.7', fontSize: '14px' }}>
              <p>{t.termsWelcome}</p>
              
              <h3 style={{ color: '#1e293b', margin: '10px 0 5px 0' }}>{t.term1Title}</h3>
              <p>{t.term1P}</p>
              
              <h3 style={{ color: '#1e293b', margin: '10px 0 5px 0' }}>{t.term2Title}</h3>
              <p>{t.term2P}</p>
              
              <h3 style={{ color: '#1e293b', margin: '10px 0 5px 0' }}>{t.term3Title}</h3>
              <p>{t.term3P}</p>

              <h3 style={{ color: '#1e293b', margin: '10px 0 5px 0' }}>{t.term4Title}</h3>
              <p>{t.term4P}</p>
            </div>
          </div>
        )}

        {/* 3. RETURN & REFUND POLICY */}
        {pageType === 'refund' && (
          <div>
            <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '900', marginBottom: '15px' }}>{t.refundTitle}</h1>
            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '15px', marginBottom: '20px' }}>
              {t.refundIntro}
            </p>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ color: '#166534', margin: '0 0 8px 0', fontSize: '16px' }}>{t.vendorNoticeTitle}</h4>
              <p style={{ color: '#14532d', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                {t.vendorNoticeP}
              </p>
            </div>

            <h3 style={{ color: '#1e293b', marginTop: '20px' }}>{t.refundGuideTitle}</h3>
            <ul style={{ color: '#475569', lineHeight: '1.8', fontSize: '14px', paddingLeft: '20px' }}>
              <li>{t.refundG1}</li>
              <li>{t.refundG2}</li>
              <li>{t.refundG3}</li>
            </ul>
          </div>
        )}

        {/* 4. PRIVACY POLICY */}
        {pageType === 'privacy' && (
          <div>
            <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '900', marginBottom: '15px' }}>{t.privacyTitle}</h1>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>{t.privacyTrust}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#475569', lineHeight: '1.7', fontSize: '14px' }}>
              <p>{t.privacyIntro}</p>

              <h3 style={{ color: '#1e293b', margin: '10px 0 5px 0' }}>{t.priv1Title}</h3>
              <p>{t.priv1P}</p>

              <h3 style={{ color: '#1e293b', margin: '10px 0 5px 0' }}>{t.priv2Title}</h3>
              <p>{t.priv2P}</p>

              <h3 style={{ color: '#1e293b', margin: '10px 0 5px 0' }}>{t.priv3Title}</h3>
              <p>{t.priv3P}</p>

              <h3 style={{ color: '#1e293b', margin: '10px 0 5px 0' }}>{t.priv4Title}</h3>
              <p>{t.priv4P}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}