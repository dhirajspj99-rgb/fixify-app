"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { auth } from '@/firebase'; 
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'; 

// 📍 Sabhi States ka data
const locationData: any = {
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

const labourSkillsList = [
  "General Labour (Helper)", "Raj Mistri (Mason)", "Iron Welder", "Steel Work", 
  "Electrician", "Plumber", "Furniture / Carpenter", "Painter", "UPVC Windows", "Aluminium Work",
  "AC Service & Repair", "RO & Water Purifier Repair", "Washing Machine Repair", 
  "Refrigerator/Microwave Repair", "Full Home Deep Cleaning", "Sofa & Carpet Cleaning", 
  "Bathroom/Kitchen Cleaning", "Pest Control", "Packers & Movers"
];

const shopTypesList = [
  "General Store", "Iron & Steel Shop", "Hardware Shop", "Electrical Shop", 
  "Cement & Building Material", "Paint Shop", "Plumbing & Sanitary Shop", "Furniture & Plywood"
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'customer';
  
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
  const [labourTypes, setLabourTypes] = useState<string[]>([]); 
  const [shopTypes, setShopTypes] = useState<string[]>([]); 

  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  
  const isAdmin = role === 'admin';

  // 🔥 RECAPTCHA FIX: Clear & Re-initialize to prevent crash
  useEffect(() => {
    if (window.recaptchaVerifier) {
       window.recaptchaVerifier.clear();
       window.recaptchaVerifier = undefined;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response: any) => {},
      });
      window.recaptchaVerifier.render();
    } catch (err) {
      console.log("Recaptcha Init Error: ", err);
    }
  }, []);

  const handleLabourSkillChange = (skill: string) => {
    setLabourTypes((prev) => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleShopTypeChange = (type: string) => {
    setShopTypes((prev) => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleStateChange = (e: any) => {
    setStateName(e.target.value); setDistrict(''); setBlock(''); setCustomState(''); setCustomDistrict(''); setCustomBlock('');
  };

  const handleDistrictChange = (e: any) => {
    setDistrict(e.target.value); setBlock(''); setCustomDistrict(''); setCustomBlock('');
  };

  const handleForgotSendOtp = async () => {
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber.trim())) {
      alert(t("Enter a valid 10-digit mobile number.", "कृपया सही 10-अंकीय मोबाइल नंबर डालें।")); return;
    }
    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phoneNumber.trim()}`, window.recaptchaVerifier);
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
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,12}$/.test(newPassword)) {
      alert(t("⚠️ Password must be 6-12 chars (1 Capital, 1 Number, 1 Symbol).", "⚠️ पासवर्ड 6-12 अक्षरों का हो (1 Capital, 1 Number, 1 Symbol ज़रूरी है)।")); return; 
    }
    setLoading(true);
    try {
      alert(t("✅ Password updated successfully! Please Login.", "✅ पासवर्ड बदल गया है! कृपया लॉगिन करें।"));
      setForgotStep(0); setIsLogin(true); setOtp(''); setNewPassword(''); setPhoneNumber('');
    } catch (err: any) { alert("❌ Error updating password"); }
    finally { setLoading(false); }
  };

  // 🔥 MAIN LOGIC UPDATE: Checking Database before sending OTP 🔥
  const handleTriggerAuth = async () => {
    if (!isLogin && !isAdmin) {
      const finalState = stateName === 'Other' ? customState.trim() : stateName;
      const finalDistrict = district === 'Other' ? customDistrict.trim() : district;
      const finalBlock = block === 'Other' ? customBlock.trim() : block;

      if (!fullName || !phoneNumber || !finalState || !finalDistrict || !finalBlock || !address || !signupPassword) {
        alert(t("Please fill all details!", "कृपया सभी ज़रूरी डिटेल्स भरें!")); return;
      }
      if (role.toLowerCase().includes('labour') && labourTypes.length === 0) {
        alert(t("Select at least one skill!", "कृपया कम से कम एक काम (Skill) चुनें!")); return;
      }
      if (role.toLowerCase().includes('shop') && shopTypes.length === 0) {
        alert(t("Select at least one shop category!", "कृपया कम से कम एक शॉप केटेगरी चुनें!")); return;
      }
      if (!/^\d{10}$/.test(phoneNumber)) {
        alert(t("Enter valid 10-digit number.", "कृपया सही 10-अंकीय मोबाइल नंबर डालें।")); return;
      }
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,12}$/.test(signupPassword)) {
        alert(t("⚠️ Password must be 6-12 chars.", "⚠️ पासवर्ड 6-12 अक्षरों का हो (1 Capital, 1 Number, 1 Symbol)।")); return; 
      }
    } 
    
    if (isLogin && loginMethod === 'otp') {
      if (!loginId || !/^\d{10}$/.test(loginId.trim())) {
        alert(t("Enter valid 10-digit number for login!", "लॉगिन के लिए सही 10-अंकीय मोबाइल नंबर डालें!")); return;
      }
    }

    if (isAdmin) { handleAdminLogin(); return; }

    setLoading(true);
    let targetPhone = !isLogin ? phoneNumber.trim() : loginId.trim();
    if (targetPhone.startsWith('+91')) targetPhone = targetPhone.replace('+91', '').trim();

    // 👉 DB CHECK START
    let checkTable = 'customers';
    if (role.toLowerCase().includes('shop')) checkTable = 'shops';
    else if (role.toLowerCase().includes('labour')) checkTable = 'labours';
    else if (role.toLowerCase().includes('delivery')) checkTable = 'delivery_boys';

    if (isLogin) {
      // Login Check: Number must exist in the correct role table
      const { data, error } = await supabase.from(checkTable).select('phone').eq('phone', targetPhone).maybeSingle();
      if (!data) {
        setLoading(false);
        alert(t(
          `⚠️ Mobile number not found in ${role} database. Please Sign Up first.`, 
          `⚠️ यह नंबर ${role} के रूप में रजिस्टर नहीं है। कृपया पहले नया अकाउंट बनाएं।`
        ));
        return; 
      }
    } else {
      // Signup Check: Prevent duplicate accounts
      const { data, error } = await supabase.from(checkTable).select('phone').eq('phone', targetPhone).maybeSingle();
      if (data) {
        setLoading(false);
        alert(t(
          "⚠️ Account already exists! Please go to Login.", 
          "⚠️ यह नंबर पहले से रजिस्टर है! कृपया लॉगिन करें।"
        ));
        return; 
      }
    }
    // 👉 DB CHECK END

    // Send OTP if checks pass
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
        // SIGNUP PROCESS
        const finalState = stateName === 'Other' ? customState.trim() : stateName;
        const finalDistrict = district === 'Other' ? customDistrict.trim() : district;
        const finalBlock = block === 'Other' ? customBlock.trim() : block;
        const dummyEmail = `${phoneNumber}@fixifiy.in`;

        const { error: authError } = await supabase.auth.signUp({ 
          email: dummyEmail, password: signupPassword,
          options: { data: { role, full_name: fullName, phone_number: phoneNumber, state: finalState, district: finalDistrict, block: finalBlock, address } }
        });
        
        if (authError) { alert("Signup Error: " + authError.message); setLoading(false); return; } 
        
        let dbErrorMsg = null;
        if (role.toLowerCase().includes('shop')) {
          const { error: dbError } = await supabase.from('shops').insert([{ name: fullName, phone: phoneNumber, state: finalState, district: finalDistrict, block: finalBlock, address, upi_id: upiId, shop_type: shopTypes.join(', '), status: 'Pending' }]);
          if (dbError) dbErrorMsg = dbError.message;
        } else if (role.toLowerCase().includes('labour')) {
          const { error: dbError } = await supabase.from('labours').insert([{ name: fullName, phone: phoneNumber, state: finalState, district: finalDistrict, block: finalBlock, address, upi_id: upiId, labour_type: labourTypes.join(', '), status: 'Pending' }]);
          if (dbError) dbErrorMsg = dbError.message;
        } else {
          const { error: dbError } = await supabase.from('customers').insert([{ name: fullName, phone: phoneNumber, state: finalState, district: finalDistrict, block: finalBlock, address, upi_id: upiId }]);
          if (dbError) dbErrorMsg = dbError.message;
        }

        if (dbErrorMsg) alert("Database Error: " + dbErrorMsg);
        else alert(t("✅ Account successfully created!", "✅ अकाउंट सफलतापूर्वक बन गया है!"));

        await supabase.auth.signOut();
        setIsLogin(true); setShowOtpInput(false); setOtp(''); setFullName(''); setPhoneNumber(''); 
      } else {
        // LOGIN PROCESS VIA OTP
        const checkPhone = loginId.trim();
        let userFound = false;
        let targetUrl = '/'; 

        if (role === 'customer') {
          const { data } = await supabase.from('customers').select('*').eq('phone', checkPhone).single();
          if (data) {
            userFound = true;
            localStorage.setItem('fixifiy_customer', JSON.stringify(data));
            targetUrl = '/customer-dashboard'; 
          }
        } else {
          const checkTable = role.toLowerCase().includes('shop') ? 'shops' : 'labours';
          const { data: dbData } = await supabase.from(checkTable).select('*').eq('phone', checkPhone).single();
          if (dbData) {
            if (dbData.status === 'Pending') { await supabase.auth.signOut(); alert(t("⏳ Account is Pending.", "⏳ आपका अकाउंट अभी पेंडिंग है।")); setLoading(false); return; }
            if (dbData.status === 'Suspended') { await supabase.auth.signOut(); alert(t("🚫 Account is Suspended.", "🚫 आपका अकाउंट सस्पेंड है।")); setLoading(false); return; }
            
            userFound = true;
            
            if (role.toLowerCase().includes('labour')) {
               localStorage.setItem('fixifiy_labour', JSON.stringify(dbData));
               targetUrl = '/labour-dashboard'; 
            } else if (role.toLowerCase().includes('shop')) {
               localStorage.setItem('fixifiy_shop', JSON.stringify(dbData));
               targetUrl = '/shop-owner-dashboard'; 
            } else if (role.toLowerCase().includes('delivery')) {
               localStorage.setItem('fixifiy_delivery_boy', JSON.stringify(dbData));
               targetUrl = '/delivery'; 
            }
          }
        }

        if (!userFound) { 
          await supabase.auth.signOut();
          alert(t("⚠️ Mobile number not found in this role's database. Please Sign Up.", "⚠️ यह नंबर इस रोल के डेटाबेस में नहीं मिला। कृपया सही रोल चुनें।")); 
          setLoading(false); return; 
        }

        alert(t("Login Successful via OTP!", "OTP के ज़रिये लॉगिन सफल!")); 
        router.push(targetUrl);
      }
    } catch (err: any) { alert(t("Verification Failed: Invalid OTP", "वेरिफिकेशन फेल: गलत OTP")); } 
    finally { setLoading(false); }
  };

  const handlePasswordLogin = async () => {
    if (!loginId || !loginPassword) { alert(t("Enter ID and Password!", "कृपया आईडी और पासवर्ड भरें!")); return; }
    
    let finalEmail = loginId.trim();
    const isPhoneLogin = /^\d{10}$/.test(finalEmail);
    if (isPhoneLogin) finalEmail = `${finalEmail}@fixifiy.in`;

    const attemptKey = `login_attempts_${finalEmail}`;
    const attemptData = JSON.parse(localStorage.getItem(attemptKey) || '{"count": 0, "lockedUntil": null}');

    if (attemptData.lockedUntil && Date.now() < attemptData.lockedUntil) {
      const hoursLeft = Math.ceil((attemptData.lockedUntil - Date.now()) / (1000 * 60 * 60));
      alert(t(`🚫 Account locked! Try again after ${hoursLeft} hours.`, `🚫 सुरक्षा कारणों से आपका अकाउंट लॉक है। कृपया ${hoursLeft} घंटे बाद प्रयास करें।`));
      return;
    }

    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password: loginPassword });
    
    if (error) { 
      attemptData.count += 1;
      if (attemptData.count >= 3) {
        attemptData.lockedUntil = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(attemptKey, JSON.stringify(attemptData));
        alert(t("🚫 Account locked for 24 hours due to 3 failed attempts.", "🚫 3 बार गलत पासवर्ड डालने के कारण आपका अकाउंट 24 घंटे के लिए लॉक कर दिया गया है।"));
      } else {
        localStorage.setItem(attemptKey, JSON.stringify(attemptData));
        alert(t(`❌ Wrong Password! You have ${3 - attemptData.count} attempts left.`, `❌ गलत पासवर्ड! आपके पास ${3 - attemptData.count} मौके और बचे हैं।`));
      }
      setLoading(false); return; 
    }

    localStorage.removeItem(attemptKey);

    const registeredRole = authData.user?.user_metadata?.role;
    if (registeredRole && registeredRole !== role) {
      await supabase.auth.signOut();
      alert(t(`⚠️ Access Denied! You are registered as ${registeredRole}, not ${role}.`, `⚠️ गलत रोल! आपका अकाउंट ${role} का नहीं है।`));
      setLoading(false); return;
    }

    const checkPhone = isPhoneLogin ? loginId.trim() : loginId.split('@')[0];
    let userFound = false;
    let targetUrl = '/'; 

    if (role === 'customer') {
      const { data } = await supabase.from('customers').select('*').eq('phone', checkPhone).single();
      if (data) {
        userFound = true;
        localStorage.setItem('fixifiy_customer', JSON.stringify(data)); 
        targetUrl = '/customer-dashboard'; 
      }
    } else {
      const checkTable = role.toLowerCase().includes('shop') ? 'shops' : 'labours';
      const { data: dbData } = await supabase.from(checkTable).select('*').eq('phone', checkPhone).single();
      if (dbData) {
        if (dbData.status === 'Pending') { await supabase.auth.signOut(); alert(t("⏳ Account is Pending.", "⏳ आपका अकाउंट पेंडिंग है।")); setLoading(false); return; } 
        else if (dbData.status === 'Suspended') { await supabase.auth.signOut(); alert(t("🚫 Account is Suspended.", "🚫 आपका अकाउंट सस्पेंड है।")); setLoading(false); return; }
        
        userFound = true;

        if (role.toLowerCase().includes('labour')) {
           localStorage.setItem('fixifiy_labour', JSON.stringify(dbData));
           targetUrl = '/labour-dashboard'; 
        } else if (role.toLowerCase().includes('shop')) {
           localStorage.setItem('fixifiy_shop', JSON.stringify(dbData));
           targetUrl = '/shop-owner-dashboard'; 
        } else if (role.toLowerCase().includes('delivery')) {
           localStorage.setItem('fixifiy_delivery_boy', JSON.stringify(dbData));
           targetUrl = '/delivery'; 
        }
      }
    }

    if (!userFound) {
      await supabase.auth.signOut();
      alert(t("⚠️ Mobile number not found in this role's database. Please Sign Up.", "⚠️ यह नंबर इस रोल के डेटाबेस में नहीं मिला। कृपया सही रोल चुनें।"));
      setLoading(false); return;
    }

    alert(t("Login Successful!", "लॉगिन सफल!")); 
    router.push(targetUrl); 
  };

  const handleAdminLogin = async () => {
    if (!loginId || !loginPassword) { alert(t("Enter Admin ID & Password!", "एडमिन आईडी और पासवर्ड भरें!")); return; }
    
    let finalEmail = loginId.trim();
    
    if (!finalEmail.includes('@')) {
      if (/^\d{10}$/.test(finalEmail)) {
        finalEmail = `${finalEmail}@fixifiy.in`;
      } else {
        finalEmail = `${finalEmail}@fixifiy.in`;
      }
    }

    const attemptKey = `admin_attempts_${finalEmail}`;
    const attemptData = JSON.parse(localStorage.getItem(attemptKey) || '{"count": 0, "lockedUntil": null}');

    if (attemptData.lockedUntil && Date.now() < attemptData.lockedUntil) {
      const hoursLeft = Math.ceil((attemptData.lockedUntil - Date.now()) / (1000 * 60 * 60));
      alert(t(`🚫 Account locked! Try again after ${hoursLeft} hours.`, `🚫 अकाउंट लॉक है। कृपया ${hoursLeft} घंटे बाद प्रयास करें।`));
      return;
    }

    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password: loginPassword });
    
    if (error) { 
      attemptData.count += 1;
      if (attemptData.count >= 3) {
        attemptData.lockedUntil = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(attemptKey, JSON.stringify(attemptData));
        alert(t("🚫 Admin Account locked for 24 hours.", "🚫 3 बार गलत पासवर्ड के कारण एडमिन अकाउंट 24 घंटे के लिए लॉक हो गया है।"));
      } else {
        localStorage.setItem(attemptKey, JSON.stringify(attemptData));
        alert(t(`❌ Wrong Password! ${3 - attemptData.count} attempts left.`, `❌ गलत पासवर्ड! ${3 - attemptData.count} मौके बचे हैं।`));
      }
      setLoading(false); return; 
    }

    localStorage.removeItem(attemptKey);

    const registeredRole = authData.user?.user_metadata?.role;
    const isMasterAdminEmail = finalEmail.toLowerCase().includes('@gmail.com') || registeredRole === 'admin';

    if (!isMasterAdminEmail && registeredRole !== 'admin') {
      await supabase.auth.signOut();
      alert(t("⚠️ Access Denied! You are not an Admin.", "⚠️ चेतावनी! आप एडमिन नहीं हैं।"));
      setLoading(false); return;
    }

    alert(t("Admin Login Successful!", "एडमिन लॉगिन सफल!")); 
    router.push('/admin-dashboard'); 
    setLoading(false);
  };

  const inputStyle = { 
    display: 'block', width: '100%', margin: '14px 0', padding: '16px', borderRadius: '10px', 
    border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(15, 23, 42, 0.7)', 
    color: '#f8fafc', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const 
  };
  const buttonStyle = { 
    width: '100%', padding: '16px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', 
    borderRadius: '10px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', marginTop:'15px', 
    boxSizing: 'border-box' as const 
  };
  const eyeBtnStyle = { 
    position: 'absolute' as const, right: '15px', top: '50%', transform: 'translateY(-50%)', 
    background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' 
  };

  return (
    <div style={{ 
      position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', padding: '20px', boxSizing: 'border-box', overflow: 'hidden',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)', fontFamily: '"Segoe UI", sans-serif'
    }}>
      
      {/* 🔥 RECAPTCHA CONTAINER AT THE TOP 🔥 */}
      <div id="recaptcha-container" style={{ position: 'absolute', top: 0, left: 0 }}></div>

      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        transform: 'rotate(-15deg)', zIndex: 0, pointerEvents: 'none',
        display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignContent: 'center',
        color: 'rgba(255, 255, 255, 0.02)', fontSize: '80px', fontWeight: 900, userSelect: 'none',
        letterSpacing: '5px'
      }}>
        {Array(150).fill('FIXIFIY').map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>

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
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', 
              padding: '10px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(56, 189, 248, 0.4)'
            }}>
              <span style={{ fontSize: '28px', lineHeight: '1' }}>🛠️</span>
            </div>
            
            <h1 style={{ 
              fontSize: '42px', margin: '0', fontWeight: '900', letterSpacing: '1px',
              background: 'linear-gradient(to right, #38bdf8, #818cf8, #e879f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: '#38bdf8' 
            }}>
              Fixifiy
            </h1>
          </div>

          <p style={{ color: '#94a3b8', margin: '0', fontSize: '16px', fontWeight: '500' }}>
            {forgotStep > 0 ? t('Reset Password', 'पासवर्ड रीसेट करें') : (isAdmin ? 'Admin Panel' : (isLogin ? `${role.toUpperCase()} ${t('Login', 'लॉगिन')}` : t('Create New Account', 'नया अकाउंट बनाएं')))}
          </p>
        </div>

        {/* FORGOT PASSWORD FLOW */}
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
                <p style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>📲 {t('OTP has been sent', 'OTP भेज दिया गया है')}</p>
                <input type="number" placeholder="XXXXXX" value={otp} onChange={(e) => setOtp(e.target.value.slice(0, 6))} style={{...inputStyle, fontSize: '28px', letterSpacing: '12px', textAlign: 'center', fontWeight: 'bold'}} />
                <button onClick={handleForgotVerifyOtp} disabled={loading} style={buttonStyle}>{loading ? t("Verifying...", "जांच हो रही है...") : t("Verify OTP", "OTP वेरीफाई करें")}</button>
              </>
            )}
            {forgotStep === 3 && (
              <>
                <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>✅ {t('Verified! Create a new password', 'वेरीफाई हो गया! नया पासवर्ड बनाएं')}</p>
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

        {/* REGULAR LOGIN & SIGNUP */}
        {forgotStep === 0 && !showOtpInput && (
          <>
            {isLogin && !isAdmin && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '10px', boxSizing: 'border-box', width: '100%' }}>
                <button type="button" onClick={() => setLoginMethod('password')} style={{ flex: 1, padding: '12px', border: 'none', background: loginMethod === 'password' ? '#38bdf8' : 'transparent', color: loginMethod === 'password' ? '#0f172a' : '#94a3b8', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  {t('Password', 'पासवर्ड')}
                </button>
                <button type="button" onClick={() => setLoginMethod('otp')} style={{ flex: 1, padding: '12px', border: 'none', background: loginMethod === 'otp' ? '#38bdf8' : 'transparent', color: loginMethod === 'otp' ? '#0f172a' : '#94a3b8', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  {t('OTP', 'ओ.टी.पी')}
                </button>
              </div>
            )}

            {isLogin && !isAdmin && loginMethod === 'password' && (
                <div>
                    <input type="text" placeholder={t("Mobile Number or Email", "मोबाइल नंबर या ईमेल आईडी")} value={loginId} onChange={(e) => setLoginId(e.target.value)} style={inputStyle} />
                    
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

            {isLogin && !isAdmin && loginMethod === 'otp' && (
                <div>
                    <input type="tel" placeholder={t("10-Digit Mobile Number", "10-अंकीय मोबाइल नंबर")} value={loginId} onChange={(e) => setLoginId(e.target.value)} maxLength={10} style={inputStyle} />
                    <button onClick={handleTriggerAuth} disabled={loading} style={buttonStyle}>{loading ? t("Sending...", "भेजा जा रहा है...") : t("Send OTP & Login", "OTP भेजें और लॉगिन करें")}</button>
                </div>
            )}

            {/* ADMIN LOGIN FORM */}
            {isAdmin && (
                <div>
                    <input type="text" placeholder="Admin Email / Phone (e.g. admin@gmail.com)" value={loginId} onChange={(e) => setLoginId(e.target.value)} style={inputStyle} />
                    <div style={{ position: 'relative' }}>
                      <input type={showLoginPassword ? "text" : "password"} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{...inputStyle, paddingRight: '50px'}} />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} style={eyeBtnStyle}>{showLoginPassword ? '🙈' : '👁️'}</button>
                    </div>
                    <button onClick={handleAdminLogin} disabled={loading} style={buttonStyle}>{loading ? "Processing..." : "Admin Login"}</button>
                </div>
            )}

            {/* SIGNUP FORM */}
            {!isLogin && !isAdmin && (
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
                    <input type="text" placeholder={t("UPI ID (Optional)", "UPI ID (ऑप्शनल)")} value={upiId} onChange={(e) => setUpiId(e.target.value)} style={inputStyle} />

                    {role.toLowerCase().includes('labour') && (
                      <div style={{ marginBottom: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}>{t('Select Skills:', 'अपने काम (Skills) चुनें:')}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {labourSkillsList.map((skill) => (
                            <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '25px', cursor: 'pointer', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <input type="checkbox" checked={labourTypes.includes(skill)} onChange={() => handleLabourSkillChange(skill)} /> {skill}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {role.toLowerCase().includes('shop') && (
                      <div style={{ marginBottom: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}>{t('Select Shop Categories:', 'शॉप की केटेगरी चुनें:')}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {shopTypesList.map((type) => (
                            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '25px', cursor: 'pointer', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <input type="checkbox" checked={shopTypes.includes(type)} onChange={() => handleShopTypeChange(type)} /> {type}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ position: 'relative', marginTop: '15px', marginBottom: '15px' }}>
                      <input type={showSignupPassword ? "text" : "password"} placeholder={t("Create Strong Password", "मज़बूत पासवर्ड बनाएं")} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} maxLength={12} style={{...inputStyle, paddingRight: '50px', margin: 0}} />
                      <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} style={eyeBtnStyle}>{showSignupPassword ? '🙈' : '👁️'}</button>
                      <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', borderRadius: '6px' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>
                          <strong>{t('Note:', 'ध्यान दें:')}</strong> {t('Password 6-12 chars (1 Capital, 1 Number, 1 Symbol).', 'पासवर्ड 6-12 अक्षरों का हो जिसमें 1 Capital, 1 Number, 1 Symbol होना ज़रूरी है।')}
                        </p>
                      </div>
                    </div>

                    <button onClick={handleTriggerAuth} disabled={loading} style={buttonStyle}>{loading ? t("Sending...", "भेजा जा रहा है...") : t("Send OTP for Verification", "OTP भेजें और वेरीफाई करें")}</button>
                </div>
            )}
          </>
        )}

        {/* OTP VERIFICATION BOX */}
        {showOtpInput && forgotStep === 0 && (
          <div style={{ margin: '20px 0' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '15px', borderRadius: '10px', marginBottom: '15px', borderLeft: '4px solid #38bdf8' }}>
              <p style={{ margin: 0, color: '#f8fafc', fontSize: '14px', fontWeight: 'bold' }}>
                📲 {t('6-digit OTP has been sent to your mobile.', 'आपके मोबाइल पर 6-अंकीय OTP भेज दिया गया है।')}
              </p>
            </div>
            
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

        {!showOtpInput && forgotStep === 0 && !isAdmin && (
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