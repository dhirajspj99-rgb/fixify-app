"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase'; 
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth'; 

export default function SignupPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 📝 Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userRoleCategory, setUserRoleCategory] = useState('Customer'); // 'Customer', 'Shop Owner', 'Labour'
  const [address, setAddress] = useState('');
  const [upiId, setUpiId] = useState('');
  const [specificLabourType, setSpecificLabourType] = useState('General'); 

  // 🔐 OTP States
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // ⚙️ UI States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🛠️ reCAPTCHA Setup
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response: any) => {},
      });
    }
  }, []);

  // 📱 STEP 1: OTP BHEJNA (Login ya Signup dono ke liye)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone || phone.length < 10) {
      setErrorMessage("Kripya sahi 10-digit Phone number bharein!");
      return;
    }

    if (!isLoginMode && !name) {
      setErrorMessage("Kripya apna naam daalein!");
      return;
    }

    setLoading(true);
    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.replace('+91', '').trim();
    else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2).trim();

    // Agar Signup mode hai, toh pehle check kar sakte hain ki number pehle se toh nahi hai
    if (!isLoginMode && userRoleCategory === 'Customer') {
      const { data: existingCust } = await supabase.from('customers').select('*').eq('phone', cleanPhone).single();
      if (existingCust) {
        setErrorMessage("Ye phone number pehle se registered hai! Kripya Login karein.");
        setLoading(false);
        return;
      }
    }

    const formattedNumber = `+91${cleanPhone}`;
    const appVerifier = window.recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
      setSuccessMessage("✅ OTP aapke mobile par bhej diya gaya hai!");
    } catch (error: any) {
      setErrorMessage("❌ OTP bhejne mein error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 STEP 2: OTP VERIFY KAREIN AUR LOGIN/SIGNUP PROCESS PURI KAREIN
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrorMessage("Kripya sahi 6-digit OTP daalein!");
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('+91')) cleanPhone = cleanPhone.replace('+91', '').trim();
    else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2).trim();

    try {
      // 1. Firebase se OTP Verify karein
      const result = await confirmationResult.confirm(otp);
      const user = result.user; 

      if (isLoginMode) {
        // 🔥 LOGIN LOGIC: Teeno tables mein check karein ki user kahan hai
        let userRole = null;
        
        const { data: customerData } = await supabase.from('customers').select('*').eq('phone', cleanPhone).single();
        if (customerData) userRole = 'customer';

        if (!userRole) {
          const { data: labourData } = await supabase.from('labours').select('*').eq('phone', cleanPhone).single();
          if (labourData) userRole = 'labour';
        }

        if (!userRole) {
          const { data: deliveryData } = await supabase.from('delivery_boys').select('*').eq('phone', cleanPhone).single();
          if (deliveryData) userRole = 'delivery_boy';
        }

        if (userRole) {
          setSuccessMessage("✅ Login Success! Redirection ho raha hai...");
          setTimeout(() => {
            if (userRole === 'customer') router.push('/'); // Customer home page
            else router.push('/shop-owner-dashboard'); // Staff/Shop owner dashboard
          }, 1500); 
        } else {
          await signOut(auth); 
          throw new Error("Aapka account nahi mila. Kripya pehle Sign up karein.");
        }

      } else {
        // 🔥 SIGNUP LOGIC: Naya account database mein insert karein
        if (userRoleCategory === 'Customer') {
          // 1. Customer Signup -> Customers Table mein insert
          const { error: custError } = await supabase.from('customers').insert([{
            name: name,
            phone: cleanPhone,
            address: address || '',
            balance: 0
          }]);

          if (custError) throw custError;

          setSuccessMessage("✅ Customer Account Successful! Redirecting...");
          setTimeout(() => router.push('/'), 1500);

        } else {
          // 2. Shop Owner / Labour Signup -> Labours Table mein insert (Pending status ke sath)
          const finalRoleType = userRoleCategory === 'Shop Owner' ? 'Shop Owner' : specificLabourType;

          const { error: dbError } = await supabase.from('labours').insert([{ 
            name: name, 
            phone: cleanPhone, 
            address: address, 
            upi_id: upiId,    
            labour_type: finalRoleType, 
            status: 'Pending'
          }]);

          if (dbError) throw dbError;
          
          setSuccessMessage("✅ Request bhej di gayi hai! Admin ke Approval ke baad aap login kar payenge.");
          setTimeout(() => {
            setIsLoginMode(true);
            setShowOtpInput(false);
            clearForm();
          }, 3000);
        }
      }

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("invalid-verification-code")) {
        setErrorMessage("❌ Galat OTP! Kripya sahi code daalein.");
      } else {
        setErrorMessage(err.message || "❌ Server Error! Kripya dobara try karein.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => { setName(''); setPhone(''); setOtp(''); setAddress(''); setUpiId(''); };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '"Segoe UI", sans-serif' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '450px', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #334155' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#38bdf8', fontSize: '28px', margin: '0 0 10px 0', fontWeight: '800' }}>Fixifiy</h1>
          <p style={{ color: '#94a3b8', margin: '0', fontSize: '15px' }}>{isLoginMode ? 'Apne account mein login karein' : 'Naya account banayein'}</p>
        </div>

        {errorMessage && <div style={{ backgroundColor: '#ef444420', borderLeft: '4px solid #ef4444', color: '#fca5a5', padding: '12px', marginBottom: '20px', fontSize: '14px' }}>⚠️ {errorMessage}</div>}
        {successMessage && <div style={{ backgroundColor: '#10b98120', borderLeft: '4px solid #10b981', color: '#6ee7b7', padding: '12px', marginBottom: '20px', fontSize: '14px' }}>✅ {successMessage}</div>}

        <form onSubmit={!showOtpInput ? handleSendOtp : (e) => { e.preventDefault(); handleVerifyOtp(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* JAB TAK OTP SEND NAHI HUA, FIELDS DIKHAO */}
          {!showOtpInput ? (
            <>
              {!isLoginMode && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Aap kaun hain? (Role)</label>
                  <select value={userRoleCategory} onChange={(e) => setUserRoleCategory(e.target.value)} style={inputStyle}>
                    <option value="Customer">🛒 Customer (ग्राहक)</option>
                    <option value="Shop Owner">🏪 Shop Owner (दुकानदार)</option>
                    <option value="Labour">👷 Mistri / Labour (मिस्त्री)</option>
                  </select>
                </div>
              )}

              {!isLoginMode && (
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Pura Naam</label>
                  <input type="text" placeholder="Rahul Kumar" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
              )}

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} maxLength={10} />
              </div>

              {!isLoginMode && (
                <>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Pata (Address)</label>
                    <input type="text" placeholder="Apna ghar/dukan ka pata" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
                  </div>
                  {userRoleCategory !== 'Customer' && (
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>UPI ID</label>
                      <input type="text" placeholder="mobile@upi" value={upiId} onChange={e => setUpiId(e.target.value)} style={inputStyle} />
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // OTP INPUT BOX
            <div style={inputGroupStyle}>
              <label style={labelStyle}>6-Digit OTP Darj Karein</label>
              <input 
                type="number" 
                placeholder="XXXXXX" 
                value={otp} 
                onChange={e => setOtp(e.target.value.slice(0, 6))} 
                style={{...inputStyle, fontSize: '20px', letterSpacing: '8px', textAlign: 'center', fontWeight: 'bold'}} 
              />
              <button 
                type="button" 
                onClick={() => { setShowOtpInput(false); setOtp(''); }} 
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '13px', textAlign: 'right', cursor: 'pointer', marginTop: '5px' }}
              >
                ✎ Number Badlein
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ backgroundColor: loading ? '#0ea5e980' : '#0ea5e9', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', marginTop: '10px' }}>
            {loading ? 'Processing...' : (showOtpInput ? 'Verify OTP & Complete' : (isLoginMode ? 'Login Karein' : 'OTP Bhejen (Send OTP)'))}
          </button>
        </form>
        
        {/* RECAPTCHA CONTAINER (Invisible) */}
        <div id="recaptcha-container"></div>
        
        {!showOtpInput && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => { setIsLoginMode(!isLoginMode); setErrorMessage(''); }} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLoginMode ? 'Naya account banana hai? Sign up' : 'Pehle se account hai? Log in'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const inputGroupStyle = { display: 'flex', flexDirection: 'column' as const, gap: '6px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' as const };
const inputStyle = { padding: '14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', outline: 'none', width: '100%', boxSizing: 'border-box' as const };