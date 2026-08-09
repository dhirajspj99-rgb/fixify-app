"use client";
import React, { useState, useEffect } from "react";

// 🔥 यहाँ हमने डबल इम्पोर्ट हटा दिया है। सिर्फ एक सही इम्पोर्ट रखा है:
import { auth } from "@/firebase"; 

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // reCAPTCHA सेटअप
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible", // इसे 'invisible' रखने से कस्टमर को बार-बार बॉक्स टिक नहीं करना पड़ेगा
        callback: (response: any) => {
          // reCAPTCHA solved
        },
      });
    }
  }, []);

  // OTP भेजने का फंक्शन
  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setMessage("❌ कृपया सही 10-अंकीय मोबाइल नंबर डालें।");
      return;
    }

    setLoading(true);
    setMessage("");
    
    // Firebase में नंबर +91 के साथ भेजना जरूरी है (Country Code)
    const formattedNumber = `+91${phoneNumber}`; 
    const appVerifier = window.recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
      setMessage("✅ OTP आपके मोबाइल पर भेज दिया गया है!");
    } catch (error: any) {
      console.error(error);
      setMessage("❌ OTP भेजने में त्रुटि: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP वेरीफाई करने का फंक्शन
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setMessage("❌ कृपया सही 6-अंकीय OTP डालें।");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      setMessage("🎉 लॉगिन सफल! आपका नंबर वेरीफाई हो गया है।");
      console.log("Logged in user:", user);
      
      // 👉 यहाँ आप अपने डेटाबेस (Supabase) में कस्टमर का नंबर सेव या अपडेट करा सकते हैं 
      // या कस्टमर को होम पेज / कार्ट पर भेज सकते हैं।

    } catch (error: any) {
      console.error(error);
      setMessage("❌ गलत OTP! कृपया दोबारा चेक करें।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #cbd5e1", borderRadius: "12px", background: "#f8fafc", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#0f172a", marginBottom: "20px" }}>लॉगिन / साइन-अप</h2>

      {message && (
        <div style={{ padding: "10px", marginBottom: "15px", borderRadius: "8px", background: message.includes("❌") ? "#fee2e2" : "#dcfce7", color: message.includes("❌") ? "#ef4444" : "#16a34a", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>
          {message}
        </div>
      )}

      {!showOtpInput ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label style={{ fontSize: "14px", fontWeight: "bold", color: "#475569" }}>मोबाइल नंबर दर्ज करें:</label>
          <div style={{ display: "flex", alignItems: "center", border: "2px solid #cbd5e1", borderRadius: "8px", background: "white", overflow: "hidden" }}>
            <span style={{ padding: "15px", background: "#f1f5f9", fontWeight: "bold", color: "#64748b", borderRight: "2px solid #cbd5e1" }}>+91</span>
            <input 
              type="tel" 
              maxLength={10}
              placeholder="9876543210" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
              style={{ flex: 1, padding: "15px", border: "none", outline: "none", fontSize: "16px", fontWeight: "bold", letterSpacing: "1px" }}
            />
          </div>
          
          <button onClick={handleSendOtp} disabled={loading} style={{ background: "#2563eb", color: "white", padding: "15px", fontSize: "16px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", transition: "0.2s" }}>
            {loading ? "⏳ OTP भेजा जा रहा है..." : "OTP भेजें"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label style={{ fontSize: "14px", fontWeight: "bold", color: "#475569" }}>OTP दर्ज करें:</label>
          <input 
            type="number" 
            maxLength={6}
            placeholder="6-अंकीय OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            style={{ width: "100%", padding: "15px", border: "2px solid #cbd5e1", borderRadius: "8px", fontSize: "20px", fontWeight: "bold", textAlign: "center", letterSpacing: "10px", outline: "none", boxSizing: "border-box" }}
          />
          
          <button onClick={handleVerifyOtp} disabled={loading} style={{ background: "#16a34a", color: "white", padding: "15px", fontSize: "16px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer" }}>
            {loading ? "⏳ वेरीफाई हो रहा है..." : "वेरीफाई करें"}
          </button>
          
          <button onClick={() => { setShowOtpInput(false); setOtp(""); setMessage(""); }} style={{ background: "transparent", color: "#2563eb", border: "none", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}>
            ← नंबर बदलें
          </button>
        </div>
      )}

      {/* reCAPTCHA के लिए अदृश्य (Invisible) कंटेनर */}
      <div id="recaptcha-container"></div>
    </div>
  );
}