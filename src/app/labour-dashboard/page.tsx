"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ADMIN_COMMISSION_PERCENTAGE = 0.05;

const availableSkillsList = [
  "General Labour (Helper)", "Raj Mistri (Mason)", "Electrician", "Plumber", 
  "Furniture / Carpenter", "Painter", "AC Service & Repair", "RO / Water Purifier", 
  "Washing Machine Repair", "Refrigerator Repair", "House Deep Cleaning", "Bathroom Cleaning"
];

// 🗺️ MAP COMPONENT
const JobMap = ({ destination, coords, onClose, t }: { destination: string, coords: {lat: number, lon: number} | null, onClose: () => void, t: any }) => {
  const destEncoded = encodeURIComponent(destination || 'India');
  const mapUrl = coords ? `https://maps.google.com/maps?saddr=${coords.lat},${coords.lon}&daddr=${destEncoded}&output=embed` : `https://maps.google.com/maps?q=${destEncoded}&output=embed`;
  const nativeUrl = coords ? `https://maps.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lon}&destination=${destEncoded}&dir_action=navigate` : `https://maps.google.com/maps/dir/?api=1&destination=${destEncoded}&dir_action=navigate`;

  return (
    <div style={{ marginTop: '10px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>📍 {t.jobRoute}</div>
        <button onClick={onClose} style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeMap}</button>
      </div>
      <div style={{ width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
        <iframe width="100%" height="100%" frameBorder="0" src={mapUrl} title="Job Map"></iframe>
      </div>
      <button onClick={() => window.open(nativeUrl, '_blank', 'noopener,noreferrer')} style={{ width: '100%', background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.navMap}</button>
    </div>
  );
};

export default function LabourDashboardApp() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [workerCoords, setWorkerCoords] = useState<{lat: number, lon: number} | null>(null);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [activeTab, setActiveTab] = useState<'new_jobs' | 'active_work' | 'history' | 'wallet' | 'profile'>('new_jobs');

  const [jobs, setJobs] = useState<any[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);

  // Payment & Settings
  const [idCardUpi, setIdCardUpi] = useState('admin@upi');
  const [premiumUpi, setPremiumUpi] = useState('admin@upi');
  const [adminOfficePhone, setAdminOfficePhone] = useState('Number Not Set');
  const [showIdPayment, setShowIdPayment] = useState(false);
  const [showPrimePayment, setShowPrimePayment] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingJobPic, setUploadingJobPic] = useState<number | null>(null); 

  // Edit Address & Skills
  const [newAddress, setNewAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [mySkills, setMySkills] = useState<string[]>([]);

  // Help Desk
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Modals Data
  const [chatJob, setChatJob] = useState<any>(null);
  const [mapJob, setMapJob] = useState<any>(null); // Map Modal State Added
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptTime, setAcceptTime] = useState('');

  const [startOtp, setStartOtp] = useState<Record<string, string>>({});
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // BILINGUAL DICTIONARY
  const translations = {
    hi: {
      loginTitle: "लेबर / मिस्त्री लॉगिन", phoneLabel: "मोबाइल नंबर", passLabel: "पासवर्ड", loginBtn: "लॉगिन करें",
      refresh: "रिफ्रेश", callCust: "ग्राहक को कॉल करें", viewMap: "🗺️ रास्ता देखें", jobRoute: "काम का रास्ता", closeMap: "❌ मैप बंद करें", navMap: "🧭 गूगल मैप खोलें",
      emptyNew: "📭 अभी आपकी स्किल से मैच करता कोई नया काम नहीं है।", emptyActive: "📭 अभी कोई चालू काम नहीं है।", emptyHistory: "📭 कोई पुराना रिकॉर्ड नहीं मिला।",
      custName: "ग्राहक:", loc: "पता:", acceptBtn: "काम स्वीकार करें", negoBtn: "बातचीत / रेट तय करें",
      pinMsg: "काम शुरू करने के लिए ग्राहक से 6-अंकीय PIN पूछें", pinBtn: "PIN डालें और काम शुरू करें",
      photoMsg: "काम की 3 फोटो (शुरू, बीच, अंत) अपलोड करें:", completeBtn: "✅ काम पूरा करें और पैसे पाएं",
      withdraw: "पैसे निकालने की रिक्वेस्ट", walletBal: "उपलब्ध बैलेंस", history: "पुराना रिकॉर्ड",
      searchPlaceholder: "🔍 काम या ग्राहक का नाम खोजें...", hide: "▲ छुपाएं", details: "▼ विवरण",
      changePassword: "पासवर्ड बदलें", logout: "लॉगआउट करें", helpSupport: "🎧 सहायता (Help Desk)", supportDesc: "क्लिक करके एडमिन से चैट या कॉल करें।",
      callOffice: "ऑफिस कॉल करें", writeMessage: "अपनी समस्या यहाँ लिखें...", sendMsg: "मैसेज भेजें",
      tab1: "🎯 नया काम", tab2: "⏳ चालू काम", tab3: "📜 इतिहास", tab4: "👤 प्रोफाइल", tab5: "💳 वॉलेट",
      acceptTitle: "काम का रेट और समय तय करें", dateLbl: "तारीख:", timeLbl: "समय:", rateLbl: "तय हुआ रेट (₹):", cancel: "रद्द करें", confirm: "✅ कन्फर्म करें",
      withdrawTitle: "पैसे निकालने का अनुरोध", sendRequest: "रिक्वेस्ट भेजें", amountLbl: "रकम (₹)", upiLbl: "UPI आईडी",
      downloadId: "🪪 ID कार्ड और नियम-कानून डाउनलोड करें (₹200)", editAddr: "पता बदलें", manageSkills: "🛠️ मेरे काम (Skills) मैनेज करें",
      aadhaarDoc: "आधार और डाक्यूमेंट्स", frontPic: "सामने की फोटो", backPic: "पीछे की फोटो", profilePic: "📸 अपनी फोटो (Selfie)",
      upload: "📤 अपलोड", uploaded: "✅ अपलोड हो गया", passbook: "📜 पासबुक और लेन-देन हिस्ट्री", noTx: "अभी तक कोई लेन-देन नहीं हुआ है।",
      vipPrime: "👑 VIP Prime बनें", vipDesc: "3 गुना ज़्यादा सीधे काम पाएं!", getNow: "अभी लें",
      alerts: {
        reqFail: "कृपया सभी जानकारी भरें!", jobAccept: "✅ काम स्वीकार कर लिया गया!", invPin: "❌ गलत PIN! (ग्राहक के मोबाइल के आखिरी 6 अंक)",
        jobStart: "✅ काम चालू हो गया!", upPics: "कृपया काम की तीनों फोटो अपलोड करें।", jobComp: "✅ काम पूरा हुआ! पैसे आपके वॉलेट में जोड़ दिए गए हैं।",
        entUpi: "कृपया अपनी UPI ID डालें!", entAmt: "कृपया सही रकम डालें!", noBal: "आपके वॉलेट में इतना बैलेंस नहीं है!", wdSent: "✅ निकासी की रिक्वेस्ट एडमिन को भेज दी गई है!",
        msgSent: "✅ आपका मैसेज एडमिन को भेज दिया गया है!", pwdWrong: "पुराना पासवर्ड गलत है!", pwdMatch: "नया पासवर्ड मैच नहीं हो रहा!", pwdSucc: "✅ आपका पासवर्ड बदल गया है!",
        upSucc: "✅ फोटो अपलोड सफल!", reqUtr: "कृपया पेमेंट का UTR / Transaction No. डालें!",
        docPen: "❌ आपके ID कार्ड का पेमेंट अभी एडमिन से अप्रूव होना बाकी है!"
      }
    },
    en: {
      loginTitle: "Labour / Worker Login", phoneLabel: "Mobile Number", passLabel: "Password", loginBtn: "LOGIN",
      refresh: "Refresh", callCust: "Call Customer", viewMap: "🗺️ View Route", jobRoute: "Job Location", closeMap: "❌ Close Map", navMap: "🧭 Open Google Maps",
      emptyNew: "📭 No new jobs matching your skills.", emptyActive: "📭 No active jobs.", emptyHistory: "📭 No history found.",
      custName: "Customer:", loc: "Address:", acceptBtn: "Accept Job", negoBtn: "Negotiate / Quote Rate",
      pinMsg: "Ask Customer for 6-Digit PIN to start", pinBtn: "Verify PIN & Start Job",
      photoMsg: "Upload 3 Job Photos (Start, Mid, End):", completeBtn: "✅ Complete Job & Get Paid",
      withdraw: "Request Withdrawal", walletBal: "Available Balance", history: "Job History",
      searchPlaceholder: "🔍 Search job or customer...", hide: "▲ Hide", details: "▼ Details",
      changePassword: "Change Password", logout: "Logout", helpSupport: "🎧 Help Desk", supportDesc: "Click to chat or call Admin.",
      callOffice: "Call Office", writeMessage: "Type your issue...", sendMsg: "Send",
      tab1: "🎯 New Jobs", tab2: "⏳ Active", tab3: "📜 History", tab4: "👤 Profile", tab5: "💳 Wallet",
      acceptTitle: "Confirm Rate & Schedule", dateLbl: "Date:", timeLbl: "Time:", rateLbl: "Agreed Rate (₹):", cancel: "Cancel", confirm: "✅ Confirm",
      withdrawTitle: "Withdrawal Request", sendRequest: "Send Request", amountLbl: "Amount (₹)", upiLbl: "UPI ID",
      downloadId: "🪪 Download ID Card & Guidelines (₹200)", editAddr: "Edit Address", manageSkills: "🛠️ Manage My Skills",
      aadhaarDoc: "Aadhaar & Documents", frontPic: "Front Photo", backPic: "Back Photo", profilePic: "📸 Selfie / Photo",
      upload: "📤 Upload", uploaded: "✅ Uploaded", passbook: "📜 Passbook & Transactions", noTx: "No transactions recorded yet.",
      vipPrime: "👑 Become VIP Prime", vipDesc: "Get 3X More Direct Bookings!", getNow: "Get Now",
      alerts: {
        reqFail: "Please fill all details!", jobAccept: "✅ Job Accepted!", invPin: "❌ Invalid PIN! (Hint: Last 6 digits of customer phone)",
        jobStart: "✅ Job Started!", upPics: "Please upload all 3 photos.", jobComp: "✅ Job Completed! Amount added to wallet.",
        entUpi: "Please enter your UPI ID!", entAmt: "Enter valid amount!", noBal: "Insufficient balance!", wdSent: "✅ Withdrawal Request Sent to Admin!",
        msgSent: "✅ Message sent to Admin!", pwdWrong: "Wrong old password!", pwdMatch: "Passwords do not match!", pwdSucc: "✅ Password successfully changed!",
        upSucc: "✅ Upload Successful!", reqUtr: "Please enter UTR / Transaction No.!",
        docPen: "❌ Your ID Card payment is pending Admin approval!"
      }
    }
  };
  const t = translations[lang];

  const bottomNavItems = [
    { id: 'new_jobs', icon: '🎯', labelHi: 'नया काम', labelEn: 'New Jobs' },
    { id: 'active_work', icon: '⏳', labelHi: 'चालू काम', labelEn: 'Active' },
    { id: 'history', icon: '📜', labelHi: 'इतिहास', labelEn: 'History' },
    { id: 'profile', icon: '👤', labelHi: 'प्रोफाइल', labelEn: 'Profile' }
  ];

  const getJobFinancials = (job: any) => {
    const totalAmt = Number(job.total_amount || job.charge || 0); 
    const adminFee = totalAmt * ADMIN_COMMISSION_PERCENTAGE;
    return { totalAmt, adminFee, netAmt: totalAmt - adminFee };
  };

  const fetchLiveGPS = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setWorkerCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.warn("GPS Failed", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const { data } = await supabase.from('app_settings').select('*').limit(1).maybeSingle();
      if (data) {
        if (data.id_card_upi) setIdCardUpi(data.id_card_upi);
        if (data.premium_upi) setPremiumUpi(data.premium_upi);
        const officePhone = data.company_phone || data.phone || data.contact_number || data.admin_phone;
        if (officePhone) setAdminOfficePhone(officePhone);
      }
    } catch (e) { console.log("Settings Error:", e); }
  };

  // 🔥 Yahan hum local storage ko hamesha latest database record se sync karenge 🔥
  const fetchMyWalletAndJobs = async (passedWorkerId: any, wPhone: string) => {
    try {
      const { data: wData, error } = await supabase.from('labours').select('*').eq('phone', wPhone.trim()).maybeSingle();

      if (error || !wData) {
        localStorage.removeItem('fixifiy_labour');
        setWorkerProfile(null);
        return;
      }

      // Sync latest data to localStorage
      localStorage.setItem('fixifiy_labour', JSON.stringify(wData));

      const validWorkerId = wData.id;

      setWorkerProfile(wData);
      setNewAddress(wData.address || '');
      setWalletBalance(Number(wData.balance) || 0);
      if (wData.upi_id) setWithdrawUpi(wData.upi_id);

      const rawSkills = wData.labour_type || '';
      const parsedSkills = rawSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
      setMySkills(parsedSkills);

      let msgs = wData.support_chat || [];
      if (typeof msgs === 'string') { try { msgs = JSON.parse(msgs); } catch(e) { msgs = []; } }
      setChatMessages(Array.isArray(msgs) ? msgs : []);

      const { data: txData, error: txErr } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('labour_id', validWorkerId)
        .order('created_at', { ascending: false });

      if (!txErr && txData) setWalletTransactions(txData);

      const cleanPhone = wPhone.trim();
      const { data: jobData } = await supabase.from('labour_bookings').select('*').order('created_at', { ascending: false });
      if (jobData) {
        const relevantJobs = jobData.filter(j => !j.assigned_to || String(j.assigned_to).trim() === cleanPhone || String(j.worker_id) === String(validWorkerId));
        setJobs(relevantJobs);
      }
    } catch (err) { 
      console.warn("Global Data Fetch Error:", err); 
    }
  };

  // 🔥 OTP + Password dono ke data ko detect karne ke liye NEW UseEffect 🔥
  useEffect(() => {
    const checkSession = async () => {
      // 🚀 STEP 1: Pehle LocalStorage Check Karo (OTP Login walon ke liye)
      let phoneNo = '';
      const storedSession = typeof window !== 'undefined' ? localStorage.getItem('fixifiy_labour') : null;
      if (storedSession) {
        try {
           phoneNo = JSON.parse(storedSession).phone;
        } catch(e) {}
      }

      // 🚀 STEP 2: Agar LocalStorage mein phone nahi mila, tab Supabase Session check karo
      const { data: { session } } = await supabase.auth.getSession();
      if (!phoneNo && session?.user) {
          let sessionPhone = session.user.email?.replace('@fixifiy.in', '').replace(/[^0-9]/g, '');
          if (sessionPhone && sessionPhone.startsWith('91') && sessionPhone.length === 12) {
              sessionPhone = sessionPhone.substring(2);
          }
          phoneNo = sessionPhone || '';
      }

      // 🚀 STEP 3: Phone number mil gaya, toh Database se latest details nikal lo
      if (phoneNo) {
          await fetchMyWalletAndJobs(null, phoneNo);
          fetchLiveGPS();
      } else {
          // not logged in
          setWorkerProfile(null);
      }

      setIsCheckingAuth(false);
      fetchAdminSettings();
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    setLoginError('');
    if (!phone || !password) return setLoginError(lang === 'hi' ? "मोबाइल नंबर और पासवर्ड भरें।" : "Phone & Password required.");

    const finalEmail = `${phone.trim()}@fixifiy.in`;
    const { error: authErr } = await supabase.auth.signInWithPassword({ email: finalEmail, password: password.trim() });
    if (authErr) return setLoginError(lang === 'hi' ? "❌ गलत आईडी या पासवर्ड!" : "❌ Invalid ID or Password!");

    const { data, error } = await supabase.from('labours').select('*').eq('phone', phone.trim()).maybeSingle(); 
    if (error || !data) return setLoginError(lang === 'hi' ? "अकाउंट नहीं मिला।" : "Account not found.");
    if (data.status === 'Suspended') return setLoginError(lang === 'hi' ? "आपका अकाउंट सस्पेंड है।" : "Account suspended.");

    localStorage.setItem('fixifiy_labour', JSON.stringify(data));
    setWorkerProfile(data);
    fetchMyWalletAndJobs(data.id, data.phone);
  };

  const handleLogout = async () => {
    if (!window.confirm(t.logout + "?")) return;
    localStorage.removeItem('fixifiy_labour'); // Clear local data
    await supabase.auth.signOut(); // Clear Supabase session
    setWorkerProfile(null);
  };

  const handleRefresh = async () => {
    if (workerProfile?.id) await fetchMyWalletAndJobs(workerProfile.id, workerProfile.phone);
    fetchAdminSettings();
  };

  const handleDocumentUpload = async (file: File, type: string) => {
    setUploadingDoc(true);
    try {
      const ext = file.name.split('.').pop();
      const fn = `${workerProfile.id}_${type}_${Date.now()}.${ext}`;

      await supabase.storage.from('labour_documents').upload(fn, file);
      const url = supabase.storage.from('labour_documents').getPublicUrl(fn).data.publicUrl;

      await supabase.from('labours').update({ [type]: url }).eq('id', workerProfile.id);
      setWorkerProfile((prev: any) => ({ ...prev, [type]: url }));

      await fetchMyWalletAndJobs(workerProfile.id, workerProfile.phone);
      alert(t.alerts.upSucc);
    } catch (e:any) { alert("Upload Error: " + e.message); }
    setUploadingDoc(false);
  };

  const handleJobPhotoUpload = async (jobId: number, file: File, photoType: 'work_in_pic' | 'work_out_pic' | 'completed_work_pic') => {
    setUploadingJobPic(jobId);
    try {
      const ext = file.name.split('.').pop();
      const fn = `job_${jobId}_${photoType}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('labour_documents').upload(fn, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('labour_documents').getPublicUrl(fn);

      const { error: updateError } = await supabase.from('labour_bookings').update({ [photoType]: urlData.publicUrl }).eq('id', jobId);
      if (updateError) throw updateError;

      await fetchMyWalletAndJobs(workerProfile.id, workerProfile.phone);
      alert(t.alerts.upSucc);
    } catch (err: any) {
      alert("Error Uploading Photo: " + err.message);
    }
    setUploadingJobPic(null);
  };

  const saveAadhaarNumber = async (num: string) => {
    await supabase.from('labours').update({ aadhaar_number: num }).eq('id', workerProfile.id);
    fetchMyWalletAndJobs(workerProfile.id, workerProfile.phone);
  };

  const handleToggleSkill = async (skill: string) => {
    let updated = [...mySkills];
    if (updated.includes(skill)) {
      updated = updated.filter(s => s !== skill);
    } else {
      updated.push(skill);
    }
    setMySkills(updated);
    const skillsString = updated.join(', ');
    await supabase.from('labours').update({ labour_type: skillsString }).eq('id', workerProfile.id);
    fetchMyWalletAndJobs(workerProfile.id, workerProfile.phone);
  };

  const processPaymentSuccess = async (type: 'id_card' | 'prime') => {
    if (type === 'id_card' && !utrNumber.trim()) return alert(t.alerts.reqUtr);
    alert(lang === 'hi' ? "⏳ पेमेंट चेक हो रहा है..." : "⏳ Processing payment...");
    try {
      if (type === 'id_card') {
        await supabase.from('wallet_transactions').insert([{
          labour_id: workerProfile.id, user_type: 'labour', amount: 200, type: 'debit', status: 'pending', reason: `ID Card Fee (UTR: ${utrNumber})`
        }]);
        alert(lang === 'hi' ? "✅ UTR जमा हो गया! एडमिन जल्द ही अप्रूव करेगा।" : "✅ UTR Submitted! Admin will verify.");
        setShowIdPayment(false);
        setUtrNumber('');
      } else {
        await supabase.from('wallet_transactions').insert([{
          labour_id: workerProfile.id, user_type: 'labour', amount: 499, type: 'debit', status: 'pending', reason: `VIP Prime (UTR: ${utrNumber})`
        }]);
        alert(lang === 'hi' ? "✅ VIP Prime का UTR जमा हो गया!" : "✅ UTR Submitted for VIP Prime!");
        setShowPrimePayment(false);
        setUtrNumber('');
      }
      fetchMyWalletAndJobs(workerProfile.id, workerProfile.phone);
    } catch (e:any) { alert("Error: " + e.message); }
  };

  const executeDownloadIDCardWithGuidelines = () => {
    if (!workerProfile.id_card_paid) return alert(t.alerts.docPen);
    const profilePicUrl = workerProfile.profile_pic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    const printContent = `
      <html><head><title>Fixifiy Partner Kit - ${workerProfile.name}</title>
      <style>
        body { font-family: 'Arial', sans-serif; background: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
        .page { background: white; width: 100%; max-width: 700px; margin: 0 auto 30px auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box; page-break-after: always; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 26px; font-weight: 900; letter-spacing: 1px; }
        .id-card-box { width: 320px; margin: 20px auto; background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; border: 2px solid #eab308; }
        .card-header { background: #000; color: white; text-align: center; padding: 18px; }
        .photo { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; margin: -35px auto 10px auto; display: block; object-fit: cover; background: #e2e8f0;}
        .card-details { text-align: center; padding: 5px 15px 20px 15px; }
        .badge { background: #eab308; color: #000; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; display: inline-block; margin-top: 8px;}
        .rules-title { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 15px; border-left: 4px solid #16a34a; padding-left: 10px; }
        .rule-item { font-size: 12px; line-height: 1.5; margin-bottom: 6px; color: #334155; }
        .fine-box { background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; margin-top: 15px; font-size: 12px; color: #dc2626; font-weight: bold; line-height: 1.5;}
      </style></head>
      <body>
        <div class="page">
          <div class="header">
            <h1>FIXIFIY</h1>
            <span style="font-size:12px; font-weight:bold; color:#64748b;">OFFICIAL PARTNER ID</span>
          </div>
          <div class="id-card-box">
            <div class="card-header"><h2 style="margin:0;font-size:20px;">FIXIFIY SERVICE</h2><p style="margin:0;font-size:11px;color:#94a3b8">Verified Professional</p></div>
            <img src="${profilePicUrl}" class="photo" />
            <div class="card-details">
              <h3 style="margin:0 0 3px 0;font-size:20px;">${workerProfile.name}</h3>
              <p style="margin:2px 0; color:#475569; font-weight:bold; font-size:12px;">ID: LAB-${workerProfile.id}</p>
              <p style="margin:2px 0; color:#475569; font-size:12px;">📞 +91 ${workerProfile.phone}</p>
              <div class="badge">${workerProfile.labour_type || 'Service Expert'}</div>
              <p style="font-size:10px; color:#64748b; margin-top:8px; border-top:1px dashed #cbd5e1; padding-top:6px;">📍 ${workerProfile.address || 'India'}</p>
            </div>
          </div>
        </div>
        <div class="page">
          <div class="header">
            <h1>FIXIFIY</h1>
            <span style="font-size:12px; font-weight:bold; color:#16a34a;">RULES & REGULATIONS / नियम और शर्तें</span>
          </div>

          <div class="rules-title">1. Code of Conduct / आचार संहिता</div>
          <div class="rule-item"><strong>EN:</strong> Partners must maintain hygiene, polite behavior, and clean attire at customer premises.<br/><strong>HI:</strong> पार्टनर को ग्राहक के घर पर साफ-सफाई, विनम्र व्यवहार और साफ कपड़े पहनकर जाना होगा।</div>
          <div class="rule-item"><strong>EN:</strong> Smoking, drinking, or using abusive language is strictly prohibited.<br/><strong>HI:</strong> धूम्रपान, मदिरापान या अभद्र भाषा का प्रयोग करना पूरी तरह वर्जित है।</div>

          <div class="rules-title">2. Job Execution & Safety / काम और सुरक्षा</div>
          <div class="rule-item"><strong>EN:</strong> Always verify customer PIN before starting work and upload mandatory Start, Mid, and End photos.<br/><strong>HI:</strong> काम शुरू करने से पहले ग्राहक से PIN ज़रूर लें और शुरू, बीच तथा खत्म होने की फोटो अपलोड करें।</div>

          <div class="rules-title">3. Penalties & Jurmana / जुर्माने के नियम</div>
          <div class="fine-box">
            ⚠️ <strong>Penalty Policy / जुर्माना नीति:</strong><br/>
            • <strong>EN:</strong> Canceling accepted job at last moment: <strong>₹500 Fine</strong><br/>• <strong>HI:</strong> स्वीकार किया गया काम आखिरी समय पर रद्द करने पर: <strong>₹500 जुर्माना</strong><br/><br/>
            • <strong>EN:</strong> Misbehavior with customer or taking offline cash: <strong>Instant Account Suspension & ₹1000 Fine</strong><br/>• <strong>HI:</strong> ग्राहक से बदतमीजी या ऐप के बाहर नकद पैसे लेने पर: <strong>अकाउंट तुरंत सस्पेंड और ₹1000 जुर्माना</strong>
          </div>
        </div>
        <script>window.onload = function() { setTimeout(() => window.print(), 500); }</script>
      </body></html>
    `;
    const w = window.open('', '_blank', 'noopener,noreferrer'); w?.document.write(printContent); w?.document.close();
  };

  const handleAcceptJob = async () => {
    if (!chatJob || !acceptDate || !acceptTime || !negotiatedPrice) return alert(t.alerts.reqFail);
    try {
      let currentMsgs = chatJob.messages;
      if (typeof currentMsgs === 'string') { try { currentMsgs = JSON.parse(currentMsgs); } catch(e){ currentMsgs=[]; } }
      if (!Array.isArray(currentMsgs)) currentMsgs = [];

      currentMsgs.push({ sender: 'labour', text: `✅ Schedule: ${acceptDate} at ${acceptTime}. Final Rate: ₹${negotiatedPrice}`, timestamp: new Date().toISOString() });

      const { error } = await supabase.from('labour_bookings').update({ 
        status: 'Worker Assigned', assigned_to: workerProfile.phone, worker_id: workerProfile.id, 
        charge: Number(negotiatedPrice), total_amount: Number(negotiatedPrice), scheduled_date: acceptDate, messages: currentMsgs 
      }).eq('id', chatJob.id);

      if(error) throw error;
      alert(t.alerts.jobAccept);
      setChatJob(null); setActiveTab('active_work'); handleRefresh();
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const startJob = async (job: any) => {
    const expectedPin = String(job.phone).slice(-6);
    if (startOtp[job.id] !== expectedPin) return alert(t.alerts.invPin);
    try {
      await supabase.from('labour_bookings').update({ status: 'Work Started' }).eq('id', job.id);
      alert(t.alerts.jobStart); handleRefresh();
    } catch(e:any) { alert("Error: " + e.message); }
  };

  const handleCompleteJob = async (job: any) => {
    if (!job.work_in_pic || !job.work_out_pic || !job.completed_work_pic) return alert(t.alerts.upPics);
    try {
      const { netAmt } = getJobFinancials(job);
      const newBal = walletBalance + netAmt;

      await supabase.from('labour_bookings').update({ status: 'Work Completed' }).eq('id', job.id);
      await supabase.from('labours').update({ balance: newBal }).eq('id', workerProfile.id);

      await supabase.from('wallet_transactions').insert([{ 
        labour_id: workerProfile.id, 
        user_type: 'labour', 
        amount: Number(netAmt.toFixed(2)), 
        type: 'credit', 
        status: 'completed', 
        reason: `Earning from Order #${job.id}` 
      }]);

      alert(t.alerts.jobComp);
      setActiveTab('history'); handleRefresh();
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawUpi) return alert(t.alerts.entUpi);
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return alert(t.alerts.entAmt);
    if (amt > walletBalance) return alert(t.alerts.noBal);

    try {
      const newBal = walletBalance - amt;
      await supabase.from('labours').update({ upi_id: withdrawUpi, balance: newBal }).eq('id', workerProfile.id);

      await supabase.from('withdrawal_requests').insert([{ 
        labour_id: workerProfile.id, amount: amt, upi_id: withdrawUpi, status: 'pending' 
      }]);

      await supabase.from('wallet_transactions').insert([{ 
        labour_id: workerProfile.id, user_type: 'labour', amount: amt, type: 'debit', status: 'pending', reason: `UPI Withdrawal Request` 
      }]);

      alert(t.alerts.wdSent); 
      setShowWithdrawModal(false); setWithdrawAmount(''); handleRefresh(); 
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleSendSupportMessage = async () => {
    if (!supportMessage.trim()) return;
    try {
      let currentChat = [...chatMessages];
      currentChat.push({ sender: 'labour', message: supportMessage.trim(), timestamp: new Date().toISOString() });
      await supabase.from('labours').update({ support_chat: currentChat }).eq('id', workerProfile.id);
      setChatMessages(currentChat); setSupportMessage(''); alert(t.alerts.msgSent);
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const handleChangePassword = async () => {
    if (oldPassword !== workerProfile.password) return alert(t.alerts.pwdWrong);
    if (newPassword !== confirmPassword) return alert(t.alerts.pwdMatch);
    try {
      await supabase.from('labours').update({ password: newPassword }).eq('id', workerProfile.id);
      setWorkerProfile({ ...workerProfile, password: newPassword });
      alert(t.alerts.pwdSucc); setShowPasswordModal(false); setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) { alert("Error: " + e.message); }
  };

  const openSecureCall = (phoneNum: string) => {
    if (phoneNum && phoneNum !== 'Number Not Set') window.location.href = `tel:${phoneNum}`;
    else alert(lang==='hi'?"नंबर उपलब्ध नहीं है।":"Phone number not available.");
  };

  const cleanPhone = String(workerProfile?.phone || '').trim();

  const matchesLabourSkills = (jobCategory: string) => {
    if (!jobCategory) return true;
    return mySkills.some(skill => jobCategory.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(jobCategory.toLowerCase()));
  };

  const newJobs = jobs.filter(j => {
    const isMyLeadOrDirect = (!j.assigned_to || String(j.assigned_to).trim() === cleanPhone);
    const isPending = (j.status === 'Pending' || j.status === 'New Order');
    const hasMatchingSkill = matchesLabourSkills(j.category || j.labour_type);
    return isPending && isMyLeadOrDirect && hasMatchingSkill;
  });

  const activeJobs = jobs.filter(j => (j.status === 'Worker Assigned' || j.status === 'Work Started') && (String(j.assigned_to).trim() === cleanPhone || j.worker_id == workerProfile?.id));
  const completedJobs = jobs.filter(j => j.status === 'Work Completed' && (String(j.assigned_to).trim() === cleanPhone || j.worker_id == workerProfile?.id));

  const filteredHistory = completedJobs.filter(o => {
    const matchesSearch = historySearchQuery === '' || String(o.id).toLowerCase().includes(historySearchQuery.toLowerCase()) || String(o.customer_name || '').toLowerCase().includes(historySearchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isCheckingAuth) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;

  if (!workerProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #000000 100%)', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')} style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{lang === 'hi' ? 'EN' : 'HI'}</button>
          </div>
          <h2 style={{ textAlign: 'center', color: '#0f172a', margin: '0 0 25px 0' }}>{t.loginTitle}</h2>
          {loginError && <div style={{background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', textAlign: 'center'}}>{loginError}</div>}
          <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>{t.phoneLabel}</label><input type="tel" placeholder={t.phoneLabel} value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} /></div>
          <div style={{ marginBottom: '25px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>{t.passLabel}</label><input type="password" placeholder={t.passLabel} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} /></div>
          <button onClick={handleLogin} style={{ width: '100%', padding: '16px', background: '#000', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>{t.loginBtn}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', paddingBottom: '90px', fontFamily: '"Inter", sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#000' }}>Hi, {workerProfile.name?.split(' ')[0]}</h2>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{workerProfile.is_prime ? '⭐ VIP Prime' : 'Standard'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div onClick={() => setActiveTab('wallet')} style={{ background: '#fef9c3', color: '#ca8a04', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #fef08a', cursor: 'pointer' }}>
             💳 ₹{walletBalance}
          </div>
          {workerProfile.profile_pic ? (
            <img src={workerProfile.profile_pic} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} alt="Profile" />
          ) : (
            <div style={{ width: '38px', height: '38px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
          )}
        </div>
      </div>

      {!workerProfile.is_prime && (
        <div style={{ margin: '15px', padding: '20px', background: 'linear-gradient(135deg, #000 0%, #1e293b 100%)', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#eab308' }}>{t.vipPrime}</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>{t.vipDesc}</div>
          </div>
          <button onClick={() => setShowPrimePayment(true)} style={{ background: '#eab308', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{t.getNow}</button>
        </div>
      )}

      <div style={{ padding: '15px' }}>

        {/* TAB 1: NEW JOBS */}
        {activeTab === 'new_jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <h3 style={{ margin: 0, color: '#1e293b', fontSize: '17px', fontWeight: '900' }}>{t.tab1} ({newJobs.length})</h3>
               <button onClick={handleRefresh} style={{ background: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 {t.refresh}</button>
            </div>
            {newJobs.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontWeight: 'bold', background: 'white', borderRadius: '12px' }}>{t.emptyNew}</div> : newJobs.map(job => {
              const isDirect = String(job.assigned_to).trim() === cleanPhone;
              const isExpanded = expandedJobId === job.id;
              const fullAddress = `${job.address || ''} ${job.block ? ', '+job.block : ''} ${job.district ? ', '+job.district : ''} ${job.pincode ? ' - '+job.pincode : ''}`.trim() || 'Address not available';
              const custPhone = job.phone || job.user_phone || job.customer_phone;
              return (
              <div key={job.id} style={{ background: 'white', borderRadius: '14px', padding: '15px', marginBottom: '12px', borderLeft: isDirect ? '5px solid #2563eb' : '5px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div onClick={() => setExpandedJobId(isExpanded ? null : job.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: isDirect ? '#2563eb' : '#d97706', textTransform: 'uppercase' }}>{isDirect ? 'Direct' : 'Lead'} #{job.id}</span>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '900' }}>🛠️ {job.category || job.labour_type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     {job.total_amount && <div style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a' }}>₹{getJobFinancials(job).netAmt.toFixed(0)}</div>}
                    <span style={{ fontSize: '11px', color: '#000', fontWeight: 'bold' }}>{isExpanded ? t.hide : t.details}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: '12px', borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '13px' }}>
                      <strong>{t.custName}</strong> {job.customer_name}<br/>
                      <strong>{t.loc}</strong> {fullAddress}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      {custPhone && <button onClick={() => openSecureCall(custPhone)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>📞 {t.callCust}</button>}
                      <button onClick={() => setMapJob(job)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{t.viewMap}</button>
                    </div>

                    <button onClick={() => { setChatJob(job); setNegotiatedPrice(String(job.total_amount||'')); setAcceptDate(''); setAcceptTime(''); }} style={{ width: '100%', padding: '14px', background: isDirect ? '#000' : '#f8fafc', color: isDirect ? 'white' : '#000', border: isDirect ? 'none' : '2px solid #cbd5e1', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}>{isDirect ? t.acceptBtn : t.negoBtn}</button>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}

        {/* TAB 2: ACTIVE WORK */}
        {activeTab === 'active_work' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '17px', fontWeight: '900' }}>{t.tab2} ({activeJobs.length})</h3>
            {activeJobs.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontWeight: 'bold', background: 'white', borderRadius: '12px' }}>{t.emptyActive}</div> : activeJobs.map(job => {
              const isStarted = job.status === 'Work Started';
              const isExpanded = expandedJobId === job.id;
              const fullAddress = `${job.address || ''} ${job.block ? ', '+job.block : ''} ${job.district ? ', '+job.district : ''} ${job.pincode ? ' - '+job.pincode : ''}`.trim() || 'Address not available';
              const custPhone = job.phone || job.user_phone || job.customer_phone;
              return (
              <div key={job.id} style={{ background: 'white', borderRadius: '14px', padding: '15px 20px', marginBottom: '12px', borderLeft: !isStarted ? '5px solid #3b82f6' : '5px solid #10b981' }}>
                <div onClick={() => setExpandedJobId(isExpanded ? null : job.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>#{job.id}</span>
                    <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: '900' }}>👤 {job.customer_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a' }}>₹{getJobFinancials(job).netAmt.toFixed(0)}</div>
                    <span style={{ fontSize: '11px', color: '#000', fontWeight: 'bold' }}>{isExpanded ? t.hide : t.details}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: '15px', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '12px', fontSize: '13px' }}><strong>{t.loc}</strong> {fullAddress}</div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                      {custPhone && <button onClick={() => openSecureCall(custPhone)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>📞 {t.callCust}</button>}
                      <button onClick={() => setMapJob(job)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>{t.viewMap}</button>
                    </div>

                    {!isStarted ? (
                      <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '12px', border: '1px solid #fde68a', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', marginBottom: '8px' }}>{t.pinMsg}</div>
                        <input type="number" placeholder="PIN" value={startOtp[job.id]||''} onChange={e=>setStartOtp({...startOtp, [job.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #fcd34d', marginBottom: '10px', textAlign: 'center', fontSize: '18px', fontWeight: '700' }} />
                        <button onClick={() => startJob(job)} style={{ width: '100%', padding: '12px', background: '#000', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>{t.pinBtn}</button>
                      </div>
                    ) : (
                      <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a', marginBottom: '10px' }}>📸 {t.photoMsg}</div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <label style={{ display: 'block', padding: '10px 5px', background: job.work_in_pic ? '#dcfce7' : 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                              {job.work_in_pic ? t.uploaded : t.upload}
                              <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleJobPhotoUpload(job.id, e.target.files[0], 'work_in_pic')} />
                            </label>
                            {job.work_in_pic && <a href={job.work_in_pic} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>👁️ View</a>}
                          </div>

                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <label style={{ display: 'block', padding: '10px 5px', background: job.work_out_pic ? '#dcfce7' : 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                              {job.work_out_pic ? t.uploaded : t.upload}
                              <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleJobPhotoUpload(job.id, e.target.files[0], 'work_out_pic')} />
                            </label>
                            {job.work_out_pic && <a href={job.work_out_pic} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>👁️ View</a>}
                          </div>

                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <label style={{ display: 'block', padding: '10px 5px', background: job.completed_work_pic ? '#dcfce7' : 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                              {job.completed_work_pic ? t.uploaded : t.upload}
                              <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleJobPhotoUpload(job.id, e.target.files[0], 'completed_work_pic')} />
                            </label>
                            {job.completed_work_pic && <a href={job.completed_work_pic} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>👁️ View</a>}
                          </div>
                        </div>
                        {uploadingJobPic === job.id && <div style={{textAlign: 'center', fontSize: '11px', color: '#d97706', marginBottom: '10px', fontWeight: 'bold'}}>Uploading photo... please wait.</div>}

                        <button onClick={() => handleCompleteJob(job)} style={{ width: '100%', padding: '14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>{t.completeBtn}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )})}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px', fontWeight: '900' }}>{t.history}</h3>
            {filteredHistory.length === 0 ? <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', background: 'white', borderRadius: '12px' }}>{t.emptyHistory}</div> : filteredHistory.map(job => {
              const isExpanded = expandedJobId === job.id;
              const fullAddress = `${job.address || ''} ${job.block ? ', '+job.block : ''} ${job.district ? ', '+job.district : ''} ${job.pincode ? ' - '+job.pincode : ''}`.trim() || 'Address not available';
              return (
              <div key={job.id} style={{ background: 'white', borderRadius: '12px', padding: '15px', marginBottom: '10px', borderLeft: '5px solid #10b981', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                <div onClick={() => setExpandedJobId(isExpanded ? null : job.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <div style={{fontWeight: '900', color: '#0f172a', fontSize: '14px'}}>#{job.id} - {job.customer_name}</div>
                    <div style={{fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: 'bold'}}>{new Date(job.updated_at || job.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '16px' }}>₹{getJobFinancials(job).netAmt.toFixed(0)}</div>
                    <div style={{fontSize: '10px', color: '#38bdf8', marginTop: '2px', fontWeight: 'bold'}}>{isExpanded ? t.hide : t.details}</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '15px', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#334155', marginBottom: '12px' }}>
                      <strong>{t.loc}</strong> {fullAddress}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {job.work_in_pic ? <a href={job.work_in_pic} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '11px', textDecoration: 'none', fontWeight: 'bold' }}>📸 Start Pic</a> : <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#f1f5f9', color: '#94a3b8', borderRadius: '6px', fontSize: '11px' }}>No Start Pic</div>}
                      {job.work_out_pic ? <a href={job.work_out_pic} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '11px', textDecoration: 'none', fontWeight: 'bold' }}>📸 Mid Pic</a> : <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#f1f5f9', color: '#94a3b8', borderRadius: '6px', fontSize: '11px' }}>No Mid Pic</div>}
                      {job.completed_work_pic ? <a href={job.completed_work_pic} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '11px', textDecoration: 'none', fontWeight: 'bold' }}>📸 End Pic</a> : <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#f1f5f9', color: '#94a3b8', borderRadius: '6px', fontSize: '11px' }}>No End Pic</div>}
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}

        {/* TAB 4: WALLET */}
        {activeTab === 'wallet' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px', fontWeight: '900' }}>{t.tab5}</h3>
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #000 100%)', borderRadius: '16px', padding: '20px', color: 'white', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{t.walletBal}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#eab308' }}>₹{walletBalance}</div>
              <button onClick={() => setShowWithdrawModal(true)} style={{ background: '#eab308', color: '#000', padding: '14px', border: 'none', borderRadius: '10px', fontWeight: '900', marginTop: '12px', cursor: 'pointer', width: '100%' }}>{t.withdraw}</button>
            </div>

            <div style={{ background: 'white', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>{t.passbook}</h4>
              {walletTransactions.length === 0 ? <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>{t.noTx}</p> :
                walletTransactions.map(tx => (
                  <div key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{tx.reason}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: tx.type === 'credit' ? '#16a34a' : '#dc2626' }}>
                        {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', background: tx.status === 'completed' ? '#dcfce7' : '#fef3c7', color: tx.status === 'completed' ? '#16a34a' : '#d97706' }}>
                        {tx.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px', fontWeight: '900' }}>{t.tab4}</h3>

            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                {workerProfile.profile_pic && <img src={workerProfile.profile_pic} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px auto', border: '2px solid #e2e8f0' }} alt="Profile" />}
                <h2 style={{ margin: 0 }}>{workerProfile.name}</h2>
                <p style={{ color: '#64748b', fontWeight: 'bold', margin: '4px 0' }}>+91 {workerProfile.phone}</p>
              </div>

              <button onClick={() => { if(!workerProfile.id_card_paid) setShowIdPayment(true); else executeDownloadIDCardWithGuidelines(); }} style={{ width: '100%', padding: '14px', border: 'none', background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: '#000', fontWeight: '900', borderRadius: '10px', cursor: 'pointer', marginBottom: '15px' }}>
                {workerProfile.id_card_paid ? t.downloadId : t.downloadId}
              </button>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>{t.manageSkills}</strong>
                  <button onClick={() => setIsEditingSkills(!isEditingSkills)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{isEditingSkills ? 'Done' : 'Edit'}</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {!isEditingSkills ? mySkills.map(s => <span key={s} style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold' }}>{s}</span>) :
                    availableSkillsList.map(skill => {
                      const isSelected = mySkills.includes(skill);
                      return (
                        <div key={skill} onClick={() => handleToggleSkill(skill)} style={{ background: isSelected ? '#16a34a' : '#fff', color: isSelected ? '#fff' : '#000', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {isSelected ? '✓ ' : '+ '}{skill}
                        </div>
                      );
                    })
                  }
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>{t.aadhaarDoc}</strong>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', background: workerProfile.aadhaar_verified === 'Verified' ? '#dcfce7' : '#fef3c7', color: workerProfile.aadhaar_verified === 'Verified' ? '#16a34a' : '#d97706', padding: '2px 8px', borderRadius: '6px' }}>{workerProfile.aadhaar_verified || 'Pending'}</span>
                </div>
                <input type="text" placeholder="12 Digit Aadhaar Number" defaultValue={workerProfile.aadhaar_number} onBlur={e => saveAadhaarNumber(e.target.value)} style={inputStyle} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ flex: 1, padding: '10px', background: workerProfile.aadhaar_front ? '#f0fdf4' : 'white', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', fontSize: '11px', cursor: 'pointer' }}>
                    {workerProfile.aadhaar_front ? t.uploaded : t.frontPic}
                    <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleDocumentUpload(e.target.files[0], 'aadhaar_front')} />
                  </label>
                  <label style={{ flex: 1, padding: '10px', background: workerProfile.aadhaar_back ? '#f0fdf4' : 'white', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', fontSize: '11px', cursor: 'pointer' }}>
                    {workerProfile.aadhaar_back ? t.uploaded : t.backPic}
                    <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleDocumentUpload(e.target.files[0], 'aadhaar_back')} />
                  </label>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', padding: '10px', background: workerProfile.profile_pic ? '#f0fdf4' : 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', fontSize: '11px', cursor: 'pointer' }}>
                    {workerProfile.profile_pic ? t.uploaded : t.profilePic}
                    <input type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleDocumentUpload(e.target.files[0], 'profile_pic')} />
                  </label>
                </div>
              </div>

              <button onClick={() => setShowPasswordModal(true)} style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#000', fontWeight: 'bold', borderRadius: '10px', border: 'none', marginBottom: '10px', cursor: 'pointer' }}>{t.changePassword}</button>
              <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>{t.logout}</button>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div onClick={() => setIsHelpOpen(!isHelpOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <h3 style={{ margin: 0, fontSize: '15px' }}>{t.helpSupport}</h3>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b' }}>{isHelpOpen ? t.hide : '▼ Open'}</span>
              </div>
              {isHelpOpen && (
                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => openSecureCall(adminOfficePhone)} style={{ width: '100%', padding: '10px', background: '#fefce8', color: '#ca8a04', border: '1px solid #fde047', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>📞 {t.callOffice} ({adminOfficePhone})</button>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', height: '120px', overflowY: 'auto', marginBottom: '10px' }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} style={{ fontSize: '12px', marginBottom: '5px' }}><strong>{msg.sender}:</strong> {msg.message}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" placeholder={t.writeMessage} value={supportMessage} onChange={e => setSupportMessage(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <button onClick={handleSendSupportMessage} style={{ background: '#000', color: '#fff', border: 'none', padding: '0 14px', borderRadius: '8px', fontWeight: 'bold' }}>➤</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '500px', background: 'white', display: 'flex', justifyContent: 'space-around', padding: '12px 0', borderTop: '1px solid #e2e8f0', boxSizing: 'border-box', zIndex: 1000 }}>
        {bottomNavItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} onClick={() => setActiveTab(item.id as any)} style={{ textAlign: 'center', cursor: 'pointer', color: isActive ? '#000' : '#94a3b8', fontWeight: isActive ? '900' : '500' }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span><br/><span style={{ fontSize: '10px' }}>{lang === 'hi' ? item.labelHi : item.labelEn}</span>
            </div>
          );
        })}
      </div>

      {/* Map Modal */}
      {mapJob && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, maxWidth: '400px' }}>
            <JobMap 
              destination={`${mapJob.address || ''} ${mapJob.block || ''} ${mapJob.district || ''}`.trim()} 
              coords={workerCoords} 
              onClose={() => setMapJob(null)} 
              t={t} 
            />
          </div>
        </div>
      )}

      {showIdPayment && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Professional ID Card & Kit (₹200)</h3>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${idCardUpi}&pn=Admin&am=200&cu=INR`} alt="QR Code" style={{ width: '150px', display: 'block', margin: '10px auto' }} />
            <input type="text" placeholder="Enter UTR No." value={utrNumber} onChange={e => setUtrNumber(e.target.value)} style={inputStyle} />
            <button onClick={() => processPaymentSuccess('id_card')} style={btnStyle}>Submit UTR</button>
            <button onClick={() => setShowIdPayment(false)} style={{...btnStyle, background: '#ccc', marginTop: '6px'}}>{t.cancel}</button>
          </div>
        </div>
      )}

      {showPrimePayment && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>VIP Prime Membership (₹499)</h3>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${premiumUpi}&pn=Admin&am=499&cu=INR`} alt="QR Code" style={{ width: '150px', display: 'block', margin: '10px auto' }} />
            <input type="text" placeholder="Enter UTR No." value={utrNumber} onChange={e => setUtrNumber(e.target.value)} style={inputStyle} />
            <button onClick={() => processPaymentSuccess('prime')} style={btnStyle}>Submit UTR</button>
            <button onClick={() => setShowPrimePayment(false)} style={{...btnStyle, background: '#ccc', marginTop: '6px'}}>{t.cancel}</button>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>{t.withdrawTitle}</h3>
            <input type="number" placeholder={t.amountLbl} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} style={inputStyle} />
            <input type="text" placeholder={t.upiLbl} value={withdrawUpi} onChange={e => setWithdrawUpi(e.target.value)} style={inputStyle} />
            <button onClick={handleWithdrawRequest} style={btnStyle}>{t.sendRequest}</button>
            <button onClick={() => setShowWithdrawModal(false)} style={{...btnStyle, background: '#f1f5f9', color: '#000', marginTop: '8px'}}>{t.cancel}</button>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>{t.changePassword}</h3>
            <input type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
            <button onClick={handleChangePassword} style={btnStyle}>Save</button>
            <button onClick={() => setShowPasswordModal(false)} style={{...btnStyle, background: '#f1f5f9', color: '#000', marginTop: '8px'}}>{t.cancel}</button>
          </div>
        </div>
      )}

      {chatJob && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>{t.acceptTitle}</h3>
            <label style={modalLabel}>{t.dateLbl}</label><input type="date" value={acceptDate} onChange={e => setAcceptDate(e.target.value)} style={inputStyle} />
            <label style={modalLabel}>{t.timeLbl}</label><input type="time" value={acceptTime} onChange={e => setAcceptTime(e.target.value)} style={inputStyle} />
            <label style={modalLabel}>{t.rateLbl}</label><input type="number" placeholder="Agreed Rate (₹)" value={negotiatedPrice} onChange={e => setNegotiatedPrice(e.target.value)} style={inputStyle} />
            <button onClick={handleAcceptJob} style={btnStyle}>{t.confirm}</button>
            <button onClick={() => setChatJob(null)} style={{...btnStyle, background: '#ccc', marginTop: '8px'}}>{t.cancel}</button>
          </div>
        </div>
      )}

    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' as const, background: '#f8fafc', marginBottom: '10px' };
const modalLabel = { fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' };
const btnStyle = { width: '100%', padding: '12px', background: '#000', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' };
const modalContent = { background: 'white', padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '350px' };