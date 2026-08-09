"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const createSupabaseClient = () => {
  try {
    const { createClient } = window.supabase;
    const supabaseUrl = "https://pscjrxinuezsjumybuza.supabase.co";
    const supabaseAnonKey = "sb_publishable_rHK6HsACswJM96HNRstYKQ_3MzY_y4b";
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    return null;
  }
};

// 🔥 LOCATION DATA (Same as Admin Dashboard) 🔥
const indiaLocationData = {
  "Bihar": {
    "Patna": ["Patna Sadar", "Danapur", "Barh", "Masaurhi", "Paliganj", "Bihta", "Phulwari Sharif", "Mokama", "Fatuha"],
    "Begusarai": ["Begusarai Sadar", "Barauni", "Teghra", "Bakhri", "Ballia", "Cheria Bariarpur", "Bhagwanpur", "Sahebpur Kamal"],
    "Samastipur": ["Samastipur Sadar", "Dalsinghsarai", "Patori", "Rosera", "Tajpur", "Kalyanpur", "Morwa", "Sarairanjan"],
    "Gaya": ["Gaya Sadar", "Bodh Gaya", "Sherghati", "Tekari", "Belaganj", "Dobhi", "Imamganj"],
    "Muzaffarpur": ["Muzaffarpur Sadar", "Kanti", "Motipur", "Paroo", "Bochahan", "Minapur", "Kurhani", "Sakra"],
    "Bhagalpur": ["Bhagalpur Sadar", "Kahalgaon", "Naugachia", "Sultanganj", "Colgong"],
    "Darbhanga": ["Darbhanga Sadar", "Benipur", "Biraul", "Baheri", "Kewati", "Jale"],
    "Saran (Chhapra)": ["Chhapra", "Marhaura", "Sonepur", "Parsa", "Baniapur", "Amnour", "Taraiya"],
    "Vaishali (Hajipur)": ["Hajipur", "Mahnar", "Mahua", "Lalganj", "Bidupur", "Patepur", "Jandaha"],
    "Bhojpur (Ara)": ["Ara", "Jagdishpur", "Piro", "Koilwar", "Bihiya", "Udwantnagar"],
    "Rohtas (Sasaram)": ["Sasaram", "Dehri", "Bikramganj", "Kochas", "Nokha", "Karakat"],
    "Nalanda (Bihar Sharif)": ["Bihar Sharif", "Rajgir", "Hilsa", "Rahui", "Islampur", "Noorsarai"],
    "East Champaran (Motihari)": ["Motihari", "Areraj", "Raxaul", "Sikrahna", "Pakridayal", "Chakia", "Sugauli"],
    "West Champaran (Bettiah)": ["Bettiah", "Bagaha", "Narkatiaganj", "Ramnagar", "Lauriya"],
    "Sitamarhi": ["Sitamarhi Sadar", "Belsand", "Pupri", "Dumra", "Runnisaidpur", "Sonbarsa"],
    "Siwan": ["Siwan Sadar", "Maharajganj", "Mairwa", "Darauli", "Hasanpura", "Ziradei"],
    "Madhubani": ["Madhubani", "Jhanjharpur", "Benipatti", "Phulparas", "Jainagar", "Khajauli", "Pandaul"],
    "Purnia": ["Purnia East", "Banmankhi", "Dhamdaha", "Baisi", "Kasba", "Amour"],
    "Katihar": ["Katihar", "Barsoi", "Manihari", "Korha", "Kadwa", "Barari"],
    "Saharsa": ["Saharsa Sadar", "Simri Bakhtiarpur", "Saur Bazar", "Sonbarsa", "Kahara"],
    "Munger": ["Munger Sadar", "Jamalpur", "Tarapur", "Kharagpur", "Bariarpur"],
    "Jamui": ["Jamui", "Jhajha", "Sikandra", "Chakai", "Khaira"],
    "Lakhisarai": ["Lakhisarai", "Surajgarha", "Halsi", "Barahiya", "Pipariya"],
    "Khagaria": ["Khagaria", "Gogri", "Chautham", "Mansi", "Alauli"],
    "Araria": ["Araria", "Forbesganj", "Raniganj", "Narpatganj", "Jokihat"],
    "Kishanganj": ["Kishanganj", "Thakurganj", "Bahadurganj", "Pothia"],
    "Banka": ["Banka Sadar", "Amarpur", "Bounsi", "Katoria", "Belhar"],
    "Gopalganj": ["Gopalganj", "Hathua", "Barauli", "Mirganj", "Kuchaikote"],
    "Nawada": ["Nawada", "Rajauli", "Hisua", "Pakribarawan", "Warisaliganj"]
  },
  "Uttar Pradesh": {
    "Lucknow": ["Gomti Nagar", "Alambagh", "Hazratganj", "Indira Nagar", "Chowk", "Aminabad", "Ashiyana"],
    "Kanpur": ["Kakadeo", "Kidwai Nagar", "Civil Lines", "Govind Nagar", "Swaroop Nagar", "Kalyanpur"],
    "Varanasi": ["Lanka", "Cantt", "Dashashwamedh", "Bhelupur", "Sigra", "Ramnagar", "Pandeypur"],
    "Prayagraj (Allahabad)": ["Civil Lines", "Kydganj", "Jhunsi", "Allahapur", "Phaphamau", "Kareli"],
    "Gorakhpur": ["Gorakhnath", "Golghar", "Mohaddipur", "Bargadwa", "Medical College Road"],
    "Agra": ["Tajganj", "Sikandra", "DayalBagh", "Kamla Nagar", "Fatehabad Road"],
    "Noida (GB Nagar)": ["Sector 15", "Sector 62", "Greater Noida", "Dadri", "Jewar", "Sector 18", "Noida Extension"],
    "Ghaziabad": ["Indirapuram", "Vaishali", "Raj Nagar", "Sahibabad", "Vasundhara", "Loni"]
  },
  "Delhi": {
    "Delhi": ["Central Delhi", "South Delhi", "West Delhi", "East Delhi", "North Delhi", "New Delhi"]
  },
  "Jharkhand": {
    "Ranchi": ["Kanke", "Ratu", "Hatia"],
    "Dhanbad": ["Dhanbad Sadar", "Jharia"],
    "Jamshedpur": ["Golmuri", "Jugsalai"]
  }
};

const textDict = {
  en: {
    loginTitle: "👥 Customer Login",
    signupTitle: "✨ Create Account",
    subtitleLogin: "Please log in to manage your orders.",
    subtitleSignup: "Register to start shopping with us.",
    name: "Full Name",
    phone: "Phone Number",
    state: "Select State",
    district: "Select District",
    block: "Select Block/Area",
    address: "Local Address (Village/Street/House No)",
    password: "Password (Min 6 chars)",
    loginBtn: "Log In",
    signupBtn: "Create Account",
    switchModeToSignup: "Don't have an account? Sign Up",
    switchModeToLogin: "Already have an account? Log In",
    switchLang: "हिंदी में बदलें"
  },
  hi: {
    loginTitle: "👥 ग्राहक लॉग इन",
    signupTitle: "✨ नया खाता बनाएँ",
    subtitleLogin: "अपने ऑर्डर मैनेज करने के लिए कृपया लॉग इन करें।",
    subtitleSignup: "हमारे साथ खरीदारी शुरू करने के लिए रजिस्टर करें।",
    name: "पूरा नाम",
    phone: "फ़ोन नंबर",
    state: "राज्य (State) चुनें",
    district: "ज़िला (District) चुनें",
    block: "प्रखंड/क्षेत्र (Block) चुनें",
    address: "स्थानीय पता (गाँव/मोहल्ला/मकान नंबर)",
    password: "पासवर्ड (कम से कम 6 अक्षर)",
    loginBtn: "लॉग इन करें",
    signupBtn: "खाता बनाएँ",
    switchModeToSignup: "खाता नहीं है? नया बनाएँ",
    switchModeToLogin: "पहले से खाता है? लॉग इन करें",
    switchLang: "Switch to English"
  }
};

export default function CustomerAuth() {
  const router = useRouter(); 
  
  const [lang, setLang] = useState('hi'); 
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // 🔥 New Location States
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [address, setAddress] = useState(''); // Only for street/house no
  
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [loading, setLoading] = useState(false);

  const t = textDict[lang];

  // 🔥 Dropdown Data Generation
  const availableStates = Object.keys(indiaLocationData).sort();
  const availableDistricts = selectedState ? Object.keys(indiaLocationData[selectedState] || {}).sort() : [];
  const availableBlocks = selectedDistrict ? (indiaLocationData[selectedState]?.[selectedDistrict] || []).sort() : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ msg: lang === 'hi' ? 'कृपया प्रतीक्षा करें...' : 'Processing...', type: 'info' });

    const supabase = createSupabaseClient();
    if (!supabase) {
      setStatus({ msg: 'Database connection failed!', type: 'error' });
      setLoading(false);
      return;
    }

    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('+91')) {
      cleanPhone = cleanPhone.replace('+91', '').trim();
    } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.slice(2).trim();
    }

    const fakeEmail = `${cleanPhone}@fixifiy.in`;

    try {
      if (isLoginMode) {
        // ================= LOGIN LOGIC =================
        const { error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: password,
        });

        if (error) {
           throw new Error(lang === 'hi' ? 'फ़ोन नंबर या पासवर्ड गलत है।' : 'Invalid phone number or password.');
        }

        setStatus({ msg: '✅ लॉग इन सफल! डैशबोर्ड खुल रहा है...', type: 'success' });
        
        setTimeout(() => { 
          router.push('/customer-portal'); 
        }, 1500); 

      } else {
        // ================= SIGNUP LOGIC =================
        
        // Full Address generate karna (Database mein save karne ke liye)
        const fullAddress = `${address}, ${selectedBlock}, ${selectedDistrict}, ${selectedState}`;

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: fakeEmail,
          password: password,
          options: {
            data: {
              role: 'Customer',
              phone: cleanPhone,
              name: name
            }
          }
        });

        if (authError) {
            throw new Error(lang === 'hi' ? 'यह नंबर पहले से रजिस्टर है या पासवर्ड 6 अक्षरों से कम है।' : 'Number already registered or password too short.');
        }

        const { error: insertError } = await supabase.from('customers').insert([{
          name: name,
          phone: cleanPhone, 
          address: fullAddress, // 🔥 Yahan Pura location ke sath address jayega
          password: password 
        }]);

        if (insertError) throw insertError;

        setStatus({ 
          msg: lang === 'hi' 
            ? '✅ आपका खाता तुरंत बन गया है! अब आप अपना नंबर और पासवर्ड डालकर लॉग इन करें।' 
            : '✅ Account created instantly! Please log in now.', 
          type: 'success' 
        });
        
        setTimeout(() => { 
          setName('');
          setAddress('');
          setSelectedState('');
          setSelectedDistrict('');
          setSelectedBlock('');
          setPassword('');
          setIsLoginMode(true); 
          setStatus({msg: '', type: ''});
        }, 2500);
      }
    } catch (err) {
      setStatus({ msg: '❌ ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '14px', fontSize: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: 'white' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px', border: '1px solid #e2e8f0' }}>
        
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <button type="button" onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '13px', fontWeight: 'bold' }}>
            🌐 {t.switchLang}
          </button>
        </div>

        <h1 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#0f172a', fontSize: '24px' }}>{isLoginMode ? t.loginTitle : t.signupTitle}</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>{isLoginMode ? t.subtitleLogin : t.subtitleSignup}</p>

        {status.msg && (
          <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', backgroundColor: status.type === 'error' ? '#fee2e2' : '#dcfce7', color: status.type === 'error' ? '#ef4444' : '#10b981' }}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* LOGIN AND SIGNUP SHARED FIELDS */}
          {!isLoginMode && (
            <input type="text" placeholder={t.name} required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          )}

          <input type="tel" placeholder={t.phone} required value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
          
          <input type="password" minLength={6} placeholder={t.password} required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

          {/* SIGNUP ONLY LOCATION FIELDS */}
          {!isLoginMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '5px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
              
              <select required value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedBlock(''); }} style={inputStyle}>
                <option value="">📍 {t.state}</option>
                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select required disabled={!selectedState} value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedBlock(''); }} style={inputStyle}>
                <option value="">🏙️ {t.district}</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select required disabled={!selectedDistrict} value={selectedBlock} onChange={(e) => setSelectedBlock(e.target.value)} style={inputStyle}>
                <option value="">🏘️ {t.block}</option>
                {availableBlocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <textarea placeholder={t.address} required value={address} onChange={(e) => setAddress(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} />
            </div>
          )}

          <button type="submit" disabled={loading} style={{ padding: '14px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : (isLoginMode ? t.loginBtn : t.signupBtn)}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setStatus({msg: '', type: ''}); }} style={{ background: 'none', border: 'none', color: '#0070f3', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            {isLoginMode ? t.switchModeToSignup : t.switchModeToLogin}
          </button>
        </div>

      </div>
    </div>
  );
}