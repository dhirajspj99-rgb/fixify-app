"use client";
import React from 'react';
import { useAppContext } from './AppContext'; // 🔥 Language fetch karne ke liye

export default function Footer({ setAppState }: { setAppState?: (step: any) => void }) {
  
  // 🔥 Global Language
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  // Translation Texts
  const t = {
    desc: isHindi 
      ? "भारत का नंबर 1 ई-कॉमर्स और सर्विस प्लेटफॉर्म। आपकी हर जरूरत, एक ही जगह पर!" 
      : "India's No. 1 E-Commerce Sale & Service platform. Everything you need, all in one place!",
    verifiedBadge: isHindi ? "वेरीफाइड एंटरप्राइज पार्टनर ✓" : "Verified Enterprise Partner ✓",
    quickLinks: isHindi ? "क्विक लिंक्स" : "Quick Links",
    about: isHindi ? "Fixifiy के बारे में" : "About Fixifiy",
    privacy: isHindi ? "गोपनीयता नीति (Privacy Policy)" : "Privacy Policy",
    terms: isHindi ? "नियम और शर्तें (Terms)" : "Terms & Conditions",
    refund: isHindi ? "रिटर्न और रिफंड पॉलिसी" : "Return & Refund Policy",
    addressTitle: isHindi ? "आधिकारिक कॉर्पोरेट पता" : "Official Corporate Address",
    addressL1: isHindi ? "प्लॉट नं. 271, नरपा, हसनपुर मेन रोड," : "Plot No. 271, Narpa, Hasanpur Main Road,",
    addressL2: isHindi ? "समस्तीपुर, बिहार - 848208" : "Samastipur, Bihar - 848208",
    phone: isHindi ? "फ़ोन:" : "Phone:",
    email: isHindi ? "ईमेल:" : "Email:",
    rights: isHindi ? "सर्वाधिकार सुरक्षित।" : "All Rights Reserved.",
    secure: isHindi ? "सुरक्षित SSL" : "Secure SSL",
    fastBBPS: isHindi ? "फ़ास्ट BBPS" : "Fast BBPS",
    verifiedMistris: isHindi ? "वेरीफाइड मिस्त्री" : "Verified Mistris"
  };

  const handleNavigation = (page: string) => {
    if (setAppState) {
      setAppState(page);
    } else {
      // Fallback agar parent state passed nahi hai
      window.location.href = `#${page}`;
    }
  };

  return (
    <footer className="no-print footer-corporate">
      <style>{`
        .footer-corporate {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #cbd5e1;
          padding: 50px 20px 90px 20px;
          margin-top: 50px;
          border-top: 4px solid #fb641b;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.1);
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 40px;
        }
        .footer-brand-logo {
          font-size: 34px;
          font-weight: 900;
          font-style: italic;
          font-family: 'Arial Black', Impact, sans-serif;
          color: white;
          margin-bottom: 15px;
          letter-spacing: -1px;
        }
        .footer-heading {
          color: white;
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 20px 0;
          position: relative;
          padding-bottom: 8px;
        }
        .footer-heading::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background: #fb641b;
          border-radius: 2px;
        }
        .footer-links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 14px;
          line-height: 2.4;
        }
        .footer-links-list li {
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
        }
        .footer-links-list li:hover {
          color: #38bdf8;
          transform: translateX(5px);
        }
        .footer-contact-box {
          font-size: 14px;
          line-height: 2;
          color: #94a3b8;
        }
        .footer-contact-box strong {
          color: #f8fafc;
        }
        .footer-bottom-bar {
          max-width: 1200px;
          margin: 40px auto 0 auto;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          font-size: 13px;
          color: #64748b;
        }
      `}</style>

      <div className="footer-container">
        
        {/* Company Logo & About */}
        <div>
          <div className="footer-brand-logo">
            F<span style={{ color: 'white' }}>i</span>
            <span style={{ color: '#fb641b' }}>x</span>
            <span style={{ color: 'white' }}>i</span>fiy
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '20px', color: '#94a3b8' }}>
            <strong>Fixifiy Technology</strong> (A unit of Mahadev Enterprises). {t.desc}
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(251, 100, 27, 0.15)', border: '1px solid rgba(251, 100, 27, 0.4)', padding: '6px 12px', borderRadius: '6px', color: '#fb641b', fontSize: '12px', fontWeight: 'bold' }}>
            {t.verifiedBadge}
          </div>
        </div>

        {/* Quick Links with Click Action */}
        <div>
          <h4 className="footer-heading" style={{ borderColor: '#2874f0' }}>{t.quickLinks}</h4>
          <ul className="footer-links-list">
            <li onClick={() => handleNavigation('about')}>➔ {t.about}</li>
            <li onClick={() => handleNavigation('privacy')}>➔ {t.privacy}</li>
            <li onClick={() => handleNavigation('terms')}>➔ {t.terms}</li>
            <li onClick={() => handleNavigation('refund')}>➔ {t.refund}</li>
          </ul>
        </div>

        {/* Contact Details with Official Address */}
        <div>
          <h4 className="footer-heading" style={{ borderColor: '#16a34a' }}>{t.addressTitle}</h4>
          <div className="footer-contact-box">
            <div style={{ marginBottom: '8px' }}>
              📍 <strong>Fixifiy (A unit of Mahadev Enterprises)</strong><br />
              {t.addressL1}<br />
              {t.addressL2}
            </div>
            <div style={{ marginBottom: '6px' }}>📞 <strong>{t.phone}</strong> 1800-XXX-XXXX, +91 9709740882</div>
            <div>
              ✉️ <strong>{t.email}</strong> support@fixifiy.in <br/>
              <span style={{ marginLeft: '22px' }}>fixifiyindia@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="footer-bottom-bar">
        <div>© {new Date().getFullYear()} Fixifiy Services (A unit of Mahadev Enterprises). {t.rights}</div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span>🔒 {t.secure}</span>
          <span>⚡ {t.fastBBPS}</span>
          <span>🛡️ {t.verifiedMistris}</span>
        </div>
      </div>
    </footer>
  );
}