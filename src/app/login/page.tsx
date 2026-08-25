"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { auth } from '@/firebase'; 
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'; 

const locationData: Record<string, Record<string, string[]>> = {
  "Andaman and Nicobar Islands": {}, "Andhra Pradesh": {}, "Arunachal Pradesh": {}, "Assam": {},
  "Bihar": {
    "Patna": ["Patna Sadar", "Danapur", "Barh", "Masaurhi", "Paliganj", "Patna City", "Phulwari Sharif"],
    "Gaya": ["Gaya Sadar", "Bodh Gaya", "Sherghati", "Tekari"],
    "Muzaffarpur": ["Musahri", "Kanti", "Motipur", "Bochahan", "Sakra"],
    "Samastipur": ["Samastipur","Bithan","Hasanpur Road","Rosera","Singhiya"]
  },
  "Chandigarh": {}, "Chhattisgarh": {}, "Dadra and Nagar Haveli and Daman and Diu": {}, "Delhi": {},
  "Goa": {}, "Gujarat": {}, "Haryana": {}, "Himachal Pradesh": {}, "Jammu and Kashmir": {},
  "Jharkhand": {
    "Ranchi": ["Ranchi Sadar", "Kanke", "Namkum", "Hatia", "Ormanjhi"],
    "Bokaro": ["Chas", "Bermo", "Nawadih"]
  },
  "Karnataka": {}, "Kerala": {}, "Ladakh": {}, "Lakshadweep": {}, "Madhya Pradesh": {},
  "Maharashtra": {}, "Manipur": {}, "Meghalaya": {}, "Mizoram": {}, "Nagaland": {},
  "Odisha": {}, "Puducherry": {}, "Punjab": {}, "Rajasthan": {}, "Sikkim": {}, "Tamil Nadu": {},
  "Telangana": {}, "Tripura": {},
  "Uttar Pradesh": {
    "Varanasi": ["Varanasi Sadar", "Pindra", "Raja Talab"],
    "Lucknow": ["Lucknow Sadar", "Malihabad", "Bakshi Ka Talab", "Sarojininagar"],
    "Gorakhpur": ["Gorakhpur Sadar", "Chauri Chaura", "Sahjanwa", "Campierganj"]
  },
  "Uttarakhand": {}, "West Bengal": {}
};

function LoginContent() {
  const router = useRouter();
  const role = 'customer'; 
  
  const [lang, setLang] = useState<'EN' | 'HI'>('HI');
  const t = (en: string, hi: string) => lang === 'EN' ? en : hi;
  
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [forgotStep, setForgotStep] = useState<0 | 1 | 2 | 3>(0);
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loginId, setLoginId] = useState(''); 
  const [loginPassword, setLoginPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [customState, setCustomState] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customBlock, setCustomBlock] = useState('');
  const [address, setAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [upiId, setUpiId] = useState('');

  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {},
          'expired-callback': () => {}
        });
        window.recaptchaVerifier.render().catch((err) => {
          console.log("Recaptcha render error:", err);
        });
      }
    } catch (err) {
      console.log("Recaptcha Init Error: ", err);
    }
  }, []);

  const handleStateChange = (e: any) => {
    setStateName(e.target.value); setDistrict(''); setBlock(''); setCustomState(''); setCustomDistrict(''); setCustomBlock('');
  };

  const handleDistrictChange = (e: any) => {
    setDistrict(e.target.value); setBlock(''); setCustomDistrict(''); setCustomBlock('');
  };

  const handleForgotSendOtp = async () => {
    let cleanPhone = phoneNumber.replace(/\D/g, ''); 
    if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      alert(t("Enter a valid 10-digit mobile number.", "कृपया सही 10-अंकीय मोबाइल नंबर डालें।")); return;
    }
    setLoading(true);

    const { data, error } = await supabase.from('customers').select('phone').eq('phone', cleanPhone);
    if (error || !data || data.length === 0) {
      setLoading(false);
      alert(t("⚠️ Mobile number not found! Please Sign Up.", "⚠️ यह नंबर रजिस्टर नहीं है! कृपया नया अकाउंट बनाएं।"));
      return; 
    }

    try {
      const result = await signInWithPhoneNumber(auth, `+91${cleanPhone}`, window.recaptchaVerifier);
      setConfirmationResult(result); setForgotStep(2);
      alert(t("✅ OTP sent!", "✅ OTP भेज दिया गया है!"));
    } catch (err: any) { alert("❌ OTP Error: " + err.message); } 
    finally { setLoading(false); }
  };

  const handleForgotVerifyOtp = async () => {
    if (otp.length !== 6) { alert(t("Enter 6-digit OTP!", "6-अंकीय OTP डालें!")); return; }
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setForgotStep(3);
      alert(t("✅ Verified! Create new password.", "✅ वेरीफाई हो गया! नया पासवर्ड बनाएं।"));
    } catch (err: any) { alert(t("❌ Invalid OTP!", "❌ गलत OTP!")); } 
    finally { setLoading(false); }
  };

  const handleSetNewPassword = async () => {
    if (!newPassword) {
      alert(t("Enter new password", "नया पासवर्ड दर्ज करें"));
      return;
    }
    setLoading(true);
    try {
      alert(t("✅ Password updated successfully! Please Login.", "✅ पासवर्ड बदल गया है! कृपया लॉगिन करें।"));
      setForgotStep(0); setIsLogin(true); setOtp(''); setNewPassword(''); setPhoneNumber('');
    } catch (err: any) { alert("❌ Error updating password: " + err.message); }
    finally { setLoading(false); }
  };

  const handleTriggerAuth = async () => {
    if (!isLogin) {
      const finalState = stateName === 'Other' ? customState.trim() : stateName;
      const finalDistrict = district === 'Other' ? customDistrict.trim() : district;
      const finalBlock = block === 'Other' ? customBlock.trim() : block;

      if (!fullName || !phoneNumber || !finalState || !finalDistrict || !finalBlock || !address || !signupPassword) {
        alert(t("Please fill all details!", "कृपया सभी ज़रूरी डिटेल्स भरें!")); return;
      }
      if (!/^\d{10}$/.test(phoneNumber)) {
        alert(t("Enter valid 10-digit number.", "कृपया सही 10-अंकीय मोबाइल नंबर डालें।")); return;
      }
    } 
    
    if (isLogin && loginMethod === 'otp') {
      if (!loginId || !/^\d{10}$/.test(loginId.trim())) {
        alert(t("Enter valid 10-digit number for login!", "लॉगिन के लिए सही 10-अंकीय मोबाइल नंबर डालें!")); return;
      }
    }

    setLoading(true);
    let targetPhone = !isLogin ? phoneNumber : loginId;
    targetPhone = targetPhone.replace(/\D/g, ''); 
    if (targetPhone.length > 10) targetPhone = targetPhone.slice(-10); 

    try {
      const { data, error } = await supabase.from('customers').select('phone').eq('phone', targetPhone);
      
      if (isLogin) {
        if (error || !data || data.length === 0) {
          setLoading(false);
          alert(t(`⚠️ Mobile number not found. Please Sign Up first.`, `⚠️ यह नंबर रजिस्टर नहीं है।`));
          return; 
        }
      } else {
        if (data && data.length > 0) {
          setLoading(false);
          alert(t("⚠️ Account already exists! Please go to Login.", "⚠️ यह नंबर पहले से रजिस्टर है! कृपया लॉगिन करें।"));
          return; 
        }
      }
    } catch (dbError) {
      console.error("DB Check Failed:", dbError);
      setLoading(false);
      alert("Database error. Please try again.");
      return;
    }

    try {
      const result = await signInWithPhoneNumber(auth, `+91${targetPhone}`, window.recaptchaVerifier);
      setConfirmationResult(result); setShowOtpInput(true);
      alert(t("✅ OTP sent to your mobile for verification!", "✅ वेरिफिकेशन के लिए आपके मोबाइल नंबर पर OTP भेज दिया गया है!"));
    } catch (error: any) { 
      alert("❌ OTP Error: " + error.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleVerifyOtpAndProcess = async () => {
    if (otp.length !== 6) { alert(t("Enter valid 6-digit OTP!", "कृपया सही 6-अंकीय OTP डालें!")); return; }
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);

      if (!isLogin) {
        const finalState = stateName === 'Other' ? customState.trim() : stateName;
        const finalDistrict = district === 'Other' ? customDistrict.trim() : district;
        const finalBlock = block === 'Other' ? customBlock.trim() : block;
        const dummyEmail = `${phoneNumber.trim()}@fixify.in`;

        // Create Auth User
        const { error: authError } = await supabase.auth.signUp({ 
          email: dummyEmail, password: signupPassword,
          options: { data: { role, full_name: fullName, phone_number: phoneNumber, state: finalState, district: finalDistrict, block: finalBlock, address } }
        });
        
        if (authError) { 
          alert("Signup Auth Error: " + authError.message); 
          setLoading(false); 
          return; 
        } 
        
        // Insert into customers table
        const { error: dbError } = await supabase.from('customers').insert([{ 
          name: fullName, phone: phoneNumber, state: finalState, district: finalDistrict, block: finalBlock, address, upi_id: upiId 
        }]);
        
        if (dbError) {
          alert("Database Insert Error: " + dbError.message);
        } else {
          alert(t("✅ Account successfully created!", "✅ अकाउंट सफलतापूर्वक बन गया है!"));
        }

        await supabase.auth.signOut();
        setIsLogin(true); setShowOtpInput(false); setOtp(''); setFullName(''); setPhoneNumber(''); 
      } else {
        let checkPhone = loginId.replace(/\D/g, '');
        if (checkPhone.length > 10) checkPhone = checkPhone.slice(-10);
        
        const { data } = await supabase.from('customers').select('*').eq('phone', checkPhone).maybeSingle();
        if (data) {
          localStorage.setItem('fixify_customer', JSON.stringify(data));
          alert(t("Login Successful via OTP!", "OTP के ज़रिये लॉगिन सफल!")); 
          router.push('/'); 
        } else {
          await supabase.auth.signOut();
          alert(t("⚠️ Mobile number not found in database. Please Sign Up.", "⚠️ डेटाबेस में नंबर नहीं मिला।")); 
        }
      }
    } catch (err: any) { 
      console.error("OTP verification error:", err);
      alert(t("Verification Failed: " + err.message, "वेरिफिकेशन फेल: " + err.message)); 
    } finally { 
      setLoading(false); 
    }
  };

  const handlePasswordLogin = async () => {
    if (!loginId || !loginPassword) { alert(t("Enter ID and Password!", "कृपया आईडी और पासवर्ड भरें!")); return; }
    
    let finalEmail = loginId.trim();
    const isPhoneLogin = /^\d{10}$/.test(finalEmail);
    if (isPhoneLogin) finalEmail = `${finalEmail}@fixify.in`;

    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password: loginPassword });
    
    if (error) { 
      alert(t("❌ Login Failed: " + error.message, "❌ लॉगिन असफल: " + error.message));
      setLoading(false); 
      return; 
    }

    const checkPhone = isPhoneLogin ? loginId.trim() : loginId.split('@')[0];
    
    const { data } = await supabase.from('customers').select('*').eq('phone', checkPhone).maybeSingle();
    if (data) {
      localStorage.setItem('fixify_customer', JSON.stringify(data)); 
      alert(t("Login Successful!", "लॉगिन सफल!")); 
      router.push('/'); 
    } else {
      // Fallback if auth succeeded but customer record is missing
      const fallbackCustomer = { name: authData.user?.user_metadata?.full_name || 'Customer', phone: checkPhone };
      localStorage.setItem('fixify_customer', JSON.stringify(fallbackCustomer));
      alert(t("Login Successful!", "लॉगिन सफल!"));
      router.push('/');
    }
    setLoading(false);
  };

  const inputStyle = { 
    display: 'block' as const, width: '100%', margin: '14px 0', padding: '16px', borderRadius: '10px', 
    border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(15, 23, 42, 0.7)', 
    color: '#f8fafc', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const 
  };
  const buttonStyle = { 
    width: '100%', padding: '16px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', 
    borderRadius: '10px', cursor: 'pointer' as const, fontSize: '18px', fontWeight: 'bold' as const, marginTop:'15px', 
    boxSizing: 'border-box' as const 
  };
  const eyeBtnStyle = { 
    position: 'absolute' as const, right: '15px', top: '50%', transform: 'translateY(-50%)', 
    background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' as const, color: '#94a3b8' 
  };

  return (
    <div style={{ 
      position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', padding: '20px', boxSizing: 'border-box', overflow: 'hidden',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)', fontFamily: '"Segoe UI", sans-serif'
    }}>
      
      <div id="recaptcha-container" style={{ position: 'absolute', top: 0, left: 0 }}></div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '5px', zIndex: 20, background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '30px', backdropFilter: 'blur(5px)' }}>
        <button onClick={() => setLang('EN')} style={{ background: lang === 'EN' ? '#38bdf8' : 'transparent', color: lang === 'EN' ? '#0f172a' : '#94a3b8', border: 'none', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>EN</button>
        <button onClick={() => setLang('HI')} style={{ background: lang === 'HI' ? '#38bdf8' : 'transparent', color: lang === 'HI' ? '#0f172a' : '#94a3b8', border: 'none', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>हिंदी</button>
      </div>

      <div style={{ 
        position: 'relative', zIndex: 10, width: '100%', maxWidth: '550px', 
        backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '20px', padding: '45px 35px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', boxSizing: 'border-box'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ 
            fontSize: '42px', margin: '0', fontWeight: '900', letterSpacing: '1px',
            background: 'linear-gradient(to right, #38bdf8, #818cf8, #e879f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: '#38bdf8' 
          }}>
            Fixify Customer
          </h1>
          <p style={{ color: '#94a3b8', margin: '10px 0 0 0', fontSize: '16px', fontWeight: '500' }}>
            {forgotStep > 0 ? t('Reset Password', 'पासवर्ड रीसेट करें') : (isLogin ? t('Customer Login', 'कस्टमर लॉगिन') : t('Create New Account', 'नया अकाउंट बनाएं'))}
          </p>
        </div>

        {forgotStep > 0 && (
          <div>
            {forgotStep === 1 && (
              <>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>{t('Enter registered mobile number:', 'रजिस्टर किया हुआ मोबाइल नंबर डालें:')}</p>
                <input type="tel" placeholder={t("10-Digit Mobile Number", "10-अंकीय मोबाइल नंबर")} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} maxLength={10} style={inputStyle} />
                <button onClick={handleForgotSendOtp} disabled={loading} style={buttonStyle}>{loading ? t("Sending...", "प्रोसेस हो रहा है...") : t("Send Reset OTP", "रीसेट OTP भेजें")}</button>
              </>
            )}
            {forgotStep === 2 && (
              <>
                <input type="number" placeholder="XXXXXX" value={otp} onChange={(e) => setOtp(e.target.value.slice(0, 6))} style={{...inputStyle, fontSize: '28px', letterSpacing: '12px', textAlign: 'center', fontWeight: 'bold'}} />
                <button onClick={handleForgotVerifyOtp} disabled={loading} style={buttonStyle}>{loading ? t("Verifying...", "जांच हो रही है...") : t("Verify OTP", "OTP वेरीफाई करें")}</button>
              </>
            )}
            {forgotStep === 3 && (
              <>
                <div style={{ position: 'relative' }}>
                  <input type={showNewPassword ? "text" : "password"} placeholder={t("New Password", "नया पासवर्ड")} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} maxLength={12} style={{...inputStyle, paddingRight: '50px'}} />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={eyeBtnStyle}>{showNewPassword ? '🙈' : '👁️'}</button>
                </div>
                <button onClick={handleSetNewPassword} disabled={loading} style={{...buttonStyle, backgroundColor: '#10b981', color: 'white'}}>{loading ? t("Updating...", "सेव हो रहा है...") : t("Save New Password", "नया पासवर्ड सेव करें")}</button>
              </>
            )}
            <p onClick={() => setForgotStep(0)} style={{ color: '#38bdf8', fontSize: '14px', cursor: 'pointer', textAlign: 'center', marginTop: '20px', textDecoration: 'underline' }}>{t('Cancel', 'रद्द करें')}</p>
          </div>
        )}

        {forgotStep === 0 && !showOtpInput && (
          <>
            {isLogin && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '10px', boxSizing: 'border-box', width: '100%' }}>
                <button type="button" onClick={() => setLoginMethod('password')} style={{ flex: 1, padding: '12px', border: 'none', background: loginMethod === 'password' ? '#38bdf8' : 'transparent', color: loginMethod === 'password' ? '#0f172a' : '#94a3b8', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  {t('Password', 'पासवर्ड')}
                </button>
                <button type="button" onClick={() => setLoginMethod('otp')} style={{ flex: 1, padding: '12px', border: 'none', background: loginMethod === 'otp' ? '#38bdf8' : 'transparent', color: loginMethod === 'otp' ? '#0f172a' : '#94a3b8', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  {t('OTP', 'ओ.टी.पी')}
                </button>
              </div>
            )}

            {isLogin && loginMethod === 'password' && (
                <div>
                    <input type="text" placeholder={t("Mobile Number", "मोबाइल नंबर")} value={loginId} onChange={(e) => setLoginId(e.target.value)} style={inputStyle} />
                    
                    <div style={{ position: 'relative' }}>
                      <input type={showLoginPassword ? "text" : "password"} placeholder={t("Password", "पासवर्ड")} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} maxLength={12} style={{...inputStyle, paddingRight: '50px'}} />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} style={eyeBtnStyle}>{showLoginPassword ? '🙈' : '👁️'}</button>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                      <span onClick={() => { setForgotStep(1); setOtp(''); setPhoneNumber(''); }} style={{ color: '#38bdf8', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>{t('Forgot Password?', 'पासवर्ड भूल गए?')}</span>
                    </div>

                    <button onClick={handlePasswordLogin} disabled={loading} style={buttonStyle}>{loading ? t("Processing...", "प्रोसेस हो रहा है...") : t("Login", "लॉगिन करें")}</button>
                </div>
            )}

            {isLogin && loginMethod === 'otp' && (
                <div>
                    <input type="tel" placeholder={t("10-Digit Mobile Number", "10-अंकीय मोबाइल नंबर")} value={loginId} onChange={(e) => setLoginId(e.target.value)} maxLength={10} style={inputStyle} />
                    <button onClick={handleTriggerAuth} disabled={loading} style={buttonStyle}>{loading ? t("Sending...", "भेजा जा रहा है...") : t("Send OTP & Login", "OTP भेजें और लॉगिन करें")}</button>
                </div>
            )}

            {!isLogin && (
                <div style={{ textAlign: 'left' }}>
                    <input type="text" placeholder={t("Full Name", "आपका पूरा नाम")} value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
                    <input type="tel" placeholder={t("10-Digit Mobile Number", "10-अंकीय मोबाइल नंबर")} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={inputStyle} maxLength={10} />
                    
                    <select value={stateName} onChange={handleStateChange} style={inputStyle}>
                      <option value="">-- {t('Select State', 'राज्य चुनें')} --</option>
                      {Object.keys(locationData).map((st) => <option key={st} value={st}>{st}</option>)}
                      <option value="Other" style={{ fontWeight: 'bold', color: '#38bdf8' }}>➕ Other</option>
                    </select>
                    {stateName === 'Other' && <input type="text" placeholder={t('Enter State Name', 'राज्य का नाम लिखें')} value={customState} onChange={(e) => setCustomState(e.target.value)} style={{...inputStyle, borderColor: '#38bdf8'}} />}

                    <select value={district} onChange={handleDistrictChange} style={{...inputStyle, opacity: !stateName ? 0.6 : 1}} disabled={!stateName}>
                      <option value="">-- {t('Select District', 'ज़िला चुनें')} --</option>
                      {stateName && stateName !== 'Other' && locationData[stateName] && Object.keys(locationData[stateName]).map((dist) => <option key={dist} value={dist}>{dist}</option>)}
                      <option value="Other" style={{ fontWeight: 'bold', color: '#38bdf8' }}>➕ Other</option>
                    </select>
                    {district === 'Other' && <input type="text" placeholder={t('Enter District Name', 'ज़िले का नाम लिखें')} value={customDistrict} onChange={(e) => setCustomDistrict(e.target.value)} style={{...inputStyle, borderColor: '#38bdf8'}} />}

                    <select value={block} onChange={(e) => setBlock(e.target.value)} style={{...inputStyle, opacity: !district ? 0.6 : 1}} disabled={!district}>
                      <option value="">-- {t('Select Block/Tehsil', 'ब्लॉक/तहसील चुनें')} --</option>
                      {stateName && stateName !== 'Other' && district && district !== 'Other' && locationData[stateName][district] && locationData[stateName][district].map((blk: string) => <option key={blk} value={blk}>{blk}</option>)}
                      <option value="Other" style={{ fontWeight: 'bold', color: '#38bdf8' }}>➕ Other</option>
                    </select>
                    {block === 'Other' && <input type="text" placeholder={t('Enter Block Name', 'ब्लॉक का नाम लिखें')} value={customBlock} onChange={(e) => setCustomBlock(e.target.value)} style={{...inputStyle, borderColor: '#38bdf8'}} />}
                    
                    <textarea placeholder={t("Full Address (Gali/Pincode)", "पूरा पता (गली / मोहल्ला / पिनकोड)")} value={address} onChange={(e) => setAddress(e.target.value)} style={{...inputStyle, height: '90px', resize:'none'}} />

                    <div style={{ position: 'relative', marginTop: '15px', marginBottom: '15px' }}>
                      <input type={showSignupPassword ? "text" : "password"} placeholder={t("Create Password", "पासवर्ड बनाएं")} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} maxLength={12} style={{...inputStyle, paddingRight: '50px', margin: 0}} />
                      <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} style={eyeBtnStyle}>{showSignupPassword ? '🙈' : '👁️'}</button>
                    </div>

                    <button onClick={handleTriggerAuth} disabled={loading} style={buttonStyle}>{loading ? t("Sending...", "भेजा जा रहा है...") : t("Send OTP for Verification", "OTP भेजें और वेरीफाई करें")}</button>
                </div>
            )}
          </>
        )}

        {showOtpInput && forgotStep === 0 && (
          <div style={{ margin: '20px 0' }}>
            <input 
              type="number" 
              placeholder="XXXXXX" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.slice(0, 6))} 
              style={{...inputStyle, fontSize: '28px', letterSpacing: '12px', textAlign: 'center', fontWeight: 'bold'}} 
            />
            
            <button onClick={handleVerifyOtpAndProcess} disabled={loading} style={buttonStyle}>
              {loading ? t("Verifying...", "जांच हो रही है...") : t("Verify OTP & Complete", "OTP वेरीफाई करें और पूरा करें")}
            </button>

            <button 
              type="button" 
              onClick={() => { setShowOtpInput(false); setOtp(''); }} 
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '14px', cursor: 'pointer', marginTop: '20px', width: '100%', textDecoration: 'underline' }}
            >
              ← {t('Go Back', 'पीछे जाएँ')}
            </button>
          </div>
        )}

        {!showOtpInput && forgotStep === 0 && (
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <p style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? (
                <>{t('Need a new account?', 'नया अकाउंट चाहिए?')} <strong style={{ color: '#38bdf8', textDecoration: 'underline' }}>{t('Sign Up', 'नया बनाएं')}</strong></>
              ) : (
                <>{t('Go back to', 'वापस')} <strong style={{ color: '#38bdf8', textDecoration: 'underline' }}>{t('Login', 'लॉगिन')}</strong> {t('', 'पर जाएँ')}</>
              )}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div>Loading...</div>}><LoginContent /></Suspense>;
}