"use client";
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 

interface ChatMessage {
  sender: 'user' | 'ai';
  text?: string;
  image?: File;
  imageUrl?: string; 
}

interface LabourViewProps {
  setAppStep: (step: any) => void;
  labourCategoriesList: any[]; 
  labourCategory: string;
  setLabourCategory: (cat: string) => void;
  labourType: string;
  setLabourType: (type: string) => void;
  processLabourBooking: (chatHistoryData: ChatMessage[], finalRate: number, selectedState: string) => void;
  selectedLanguage?: string; // 🔥 LANGUAGE PROP ADDED
}

const indiaStatesList = ["Bihar", "Uttar Pradesh", "Delhi", "Maharashtra", "Karnataka"];

const EXPANDED_LABOUR_CATEGORIES = [
  { name: "General Labour (Helper)", icon: "👷", hi: "मज़दूर (हेल्पर)" },
  { name: "Raj Mistri (Mason)", icon: "🧱", hi: "राज मिस्त्री (चिनाई)" },
  { name: "Electrician", icon: "⚡", hi: "इलेक्ट्रीशियन" },
  { name: "Plumber", icon: "🔧", hi: "प्लंबर" },
  { name: "Furniture / Carpenter", icon: "🪚", hi: "कारपेंटर (बढ़ई)" },
  { name: "Painter & Waterproofing", icon: "🎨", hi: "पेंटर और वाटरप्रूफिंग" },
  { name: "Iron Welder & Steel Work", icon: "🏗️", hi: "वेल्डर और स्टील वर्क" },
  { name: "Aluminium & UPVC Windows", icon: "🪟", hi: "एल्युमीनियम और UPVC वर्क" },
  { name: "Salon for Men & Massage", icon: "💇‍♂️", hi: "मेन्स सैलून और मसाज" },
  { name: "Salon for Women (Beauty Parlor)", icon: "💅", hi: "ब्यूटी पार्लर (महिलाएं)" },
  { name: "AC Repair & Servicing", icon: "❄️", hi: "AC रिपेयर और सर्विसिंग" },
  { name: "RO & Water Purifier Repair", icon: "💧", hi: "RO और वाटर प्यूरीफायर" },
  { name: "Washing Machine & Fridge Repair", icon: "🧺", hi: "वाशिंग मशीन / फ्रिज रिपेयर" },
  { name: "Home Deep Cleaning", icon: "🧹", hi: "होम डीप क्लीनिंग" },
  { name: "Bathroom & Kitchen Cleaning", icon: "🧽", hi: "बाथरूम और किचन क्लीनिंग" },
  { name: "Pest Control Services", icon: "🐛", hi: "पेस्ट कण्ट्रोल (कीट नियंत्रण)" },
  { name: "Car & Bike Washing Center", icon: "🚗", hi: "कार और बाइक वाशिंग" },
  { name: "Packers & Movers", icon: "📦", hi: "पैकर्स और मूवर्स" },
  { name: "CCTV Installation & Repair", icon: "📹", hi: "CCTV कैमरा इंस्टालेशन" }
];

export default function LabourView({
  setAppStep, labourCategory, setLabourCategory, 
  labourType, setLabourType, processLabourBooking, selectedLanguage = 'English'
}: LabourViewProps) {

  // 🌐 MULTI-LANGUAGE TRANSLATION
  const isHindi = selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी');

  const t = {
    back: isHindi ? "← होम पर वापस" : "← Back to Home",
    heroTitle: isHindi ? "एक्सपर्ट मिस्त्री बुक करें।" : "Book Expert Mistri.",
    heroSub: isHindi ? "वेरीफाइड प्रोफेशनल्स, पारदर्शी प्राइसिंग, और हर बुकिंग पर Fixifiy की गारंटी।" : "Verified professionals, transparent pricing, and Fixifiy's guarantee on every booking.",
    locTitle: isHindi ? "📍 अपनी लोकेशन चुनें" : "📍 Select Your Location",
    locSub: isHindi ? "रेट आपके शहर के अनुसार तय होते हैं।" : "Rates are adjusted based on your city.",
    step1: isHindi ? "प्रोफेशनल चुनें" : "Select Professional",
    loadingRates: isHindi ? "लाइव प्राइस लोड हो रहे हैं... ⏳" : "Loading Live Prices... ⏳",
    selectedText: isHindi ? "✓ चुना गया" : "✓ Selected",
    perDay: isHindi ? "/दिन" : "/day",
    step2: isHindi ? "हायरिंग का प्रकार" : "Hiring Type",
    dailyWage: isHindi ? "दिहाड़ी (Daily Wage)" : "Daily Wage (Dihari)",
    dailyWageSub: isHindi ? "मिस्त्री को हर दिन के हिसाब से पैसे दें" : "Pay mistri per day (standard hours)",
    contract: isHindi ? "ठेका (Contract)" : "Contract (Theka)",
    contractSub: isHindi ? "पूरे काम के लिए एक फिक्स अमाउंट" : "Fix amount for the complete job",
    step3: isHindi ? "काम समझाएं (लाइव AI चैट)" : "Discuss & Describe Work (Live AI Chat)",
    close: isHindi ? "▲ बंद करें" : "▲ Close",
    expand: isHindi ? "▼ खोलें" : "▼ Expand",
    imgAttached: isHindi ? "फोटो जोड़ दी गई है" : "Image attached",
    typeIssue: isHindi ? "अपनी समस्या यहाँ लिखें..." : "Type your issue here...",
    send: isHindi ? "भेजें" : "Send",
    selectedService: isHindi ? "चुनी गई सर्विस:" : "Selected Service in",
    proceed: isHindi ? "आगे बढ़ें ➔" : "PROCEED ➔",

    // AI Messages Translation
    aiGreeting: isHindi 
      ? 'नमस्ते! Fixifiy AI असिस्टेंट यहाँ है। बुकिंग से पहले, आप अपनी समस्या लिखकर या फोटो भेजकर काम समझा सकते हैं, ताकि हम एस्टीमेट निकाल सकें।' 
      : 'Namaste! Fixifiy AI Assistant yahan hai. Booking se pehle, aap apni issue description aur photo bhej kar kaam samjha sakte hain, taaki hum estimate nikaal saken.',
    aiStep1: isHindi
      ? 'मैंने आपकी डिटेल्स और फोटो देख ली है। क्या आप बता सकते हैं कि कितना काम है या एरिया कितना बड़ा है, ताकि मैं सही एस्टीमेट दे सकूँ?'
      : 'Maine aapki details aur photo samajh li hai. Kya aap bata sakte hain ki kitna kaam hai ya area kitna bada hai, taaki main sahi estimate de saku?',
    aiStep2: isHindi
      ? 'ठीक है। इस काम का अनुमानित खर्च ₹300 से ₹800 के आस-पास आएगा (जो एक्चुअल काम देखकर थोड़ा बदल सकता है)। क्या मैं ये डिटेल्स और चैट हिस्ट्री मिस्त्री को फॉरवर्ड कर दूँ?'
      : 'Theek hai. Is kaam ka approximate estimate ₹300 se ₹800 ke aas-paas aayega (jo actual kaam dekh kar thoda badal sakta hai). Kya main ye details aur chat history Mistri ko forward kar doon?',
    aiStep3: isHindi
      ? "आपका डेटा सेव हो गया है। अब आप नीचे 'आगे बढ़ें' बटन दबाकर अपनी बुकिंग फाइनल कर सकते हैं। ये चैट हिस्ट्री डायरेक्ट मिस्त्री को चली जाएगी!"
      : "Aapka data save ho gaya hai. Ab aap niche 'PROCEED' button dabakar apni booking final kar sakte hain. Ye chat history direct Mistri ko chali jayegi!"
  };

  const [isStep3Open, setIsStep3Open] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const [selectedCustomerState, setSelectedCustomerState] = useState('Bihar'); 
  const [labourRates, setLabourRates] = useState<Record<string, number>>({});
  const [stateMultipliers, setStateMultipliers] = useState<Record<string, number>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: 'ai', text: t.aiGreeting }
  ]);
  const [chatStep, setChatStep] = useState(0); 
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 Update AI greeting if language changes before user interacts
  useEffect(() => {
    if (chatHistory.length === 1 && chatHistory[0].sender === 'ai') {
      setChatHistory([{ sender: 'ai', text: t.aiGreeting }]);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('labour_rates, state_multipliers') 
          .eq('id', 1)
          .single();
          
        if (data) {
          if (data.labour_rates) setLabourRates(data.labour_rates);
          if (data.state_multipliers) setStateMultipliers(data.state_multipliers);
        }
      } catch (err) {
        console.error("Error fetching rates:", err);
      } finally {
        setIsLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setTempImageUrl(url);
    }
  };

  const removeAttachedImage = () => {
    if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
    setSelectedFile(null);
    setTempImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const getFinalCalculatedRate = (skillName: string) => {
    const baseRate = labourRates[skillName] || 500; 
    const multiplierPercentage = stateMultipliers[selectedCustomerState] || 0; 
    const extraAmount = (baseRate * multiplierPercentage) / 100;
    const finalAmount = baseRate + extraAmount;
    return Math.round(finalAmount); 
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() && !selectedFile) return;

    const newHistory = [...chatHistory, { 
      sender: 'user', 
      text: chatInput, 
      image: selectedFile || undefined, 
      imageUrl: tempImageUrl || undefined 
    } satisfies ChatMessage];
    
    setChatHistory(newHistory);
    setChatInput('');
    setSelectedFile(null);
    setTempImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      let aiResponse = "";
      if (chatStep === 0) {
        aiResponse = t.aiStep1;
        setChatStep(1);
      } else if (chatStep === 1) {
        aiResponse = t.aiStep2;
        setChatStep(2);
      } else {
        aiResponse = t.aiStep3;
      }
      setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 1200);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px' }}>
      
      {/* Premium Hero Section */}
      <div style={{
        background: 'linear-gradient(to right, #0f172a, #1e293b)',
        padding: '30px 20px', color: 'white', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <button onClick={() => setAppStep('home')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span>←</span> {t.back.replace('← ', '')}
          </button>
          
          <h1 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '0.5px' }}>
            {t.heroTitle}
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', maxWidth: '400px', lineHeight: '1.5' }}>
            {t.heroSub}
          </p>
        </div>
        <div style={{ position: 'absolute', right: '10%', top: '20%', fontSize: '140px', opacity: 0.1 }}>🛠️</div>
      </div>

      <div style={{ maxWidth: '900px', margin: '-20px auto 0', padding: '0 15px', position: 'relative', zIndex: 3 }}>
        
        {/* STATE SELECTOR */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '15px 20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 'bold', textTransform: 'uppercase' }}>{t.locTitle}</div>
             <div style={{ fontSize: '11px', color: '#d97706' }}>{t.locSub}</div>
           </div>
           <select 
             value={selectedCustomerState} 
             onChange={(e) => setSelectedCustomerState(e.target.value)}
             style={{ background: 'white', border: '1px solid #fcd34d', padding: '10px 15px', borderRadius: '10px', outline: 'none', fontWeight: 'bold', color: '#0f172a' }}
           >
             {indiaStatesList.map(state => <option key={state} value={state}>{state}</option>)}
           </select>
        </div>

        {/* Step 1: Select Professional */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#f1f5f9', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', color: '#2874f0' }}>1</span>
              {t.step1}
            </div>
            {isLoadingRates && <span style={{ fontSize: '12px', color: '#64748b' }}>{t.loadingRates}</span>}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
            {EXPANDED_LABOUR_CATEGORIES.map((labour, idx) => {
              const isSelected = labourCategory === labour.name;
              const calculatedRate = getFinalCalculatedRate(labour.name);
              const displayName = isHindi ? (labour.hi || labour.name) : labour.name;

              return (
                <div 
                  key={idx} 
                  onClick={() => setLabourCategory(labour.name)}
                  style={{
                    border: isSelected ? '2px solid #2874f0' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : 'white',
                    borderRadius: '12px', padding: '15px 10px', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden'
                  }}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#2874f0', color: 'white', fontSize: '10px', padding: '2px 6px', borderBottomLeftRadius: '8px' }}>{t.selectedText}</div>
                  )}
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{labour.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '5px', lineHeight: '1.2' }}>{displayName}</div>
                  <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '900' }}>₹{calculatedRate} <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'normal' }}>{t.perDay}</span></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Hiring Type */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#f1f5f9', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', color: '#2874f0' }}>2</span>
            {t.step2}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div onClick={() => setLabourType('Daily Wage (Dihari)')} style={{ border: labourType === 'Daily Wage (Dihari)' ? '2px solid #fb641b' : '1px solid #e2e8f0', background: labourType === 'Daily Wage (Dihari)' ? '#fff7ed' : 'white', padding: '15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="radio" checked={labourType === 'Daily Wage (Dihari)'} readOnly style={{ accentColor: '#fb641b', width: '18px', height: '18px' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{t.dailyWage}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{t.dailyWageSub}</div>
              </div>
            </div>
            
            <div onClick={() => setLabourType('Contract (Theka)')} style={{ border: labourType === 'Contract (Theka)' ? '2px solid #fb641b' : '1px solid #e2e8f0', background: labourType === 'Contract (Theka)' ? '#fff7ed' : 'white', padding: '15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="radio" checked={labourType === 'Contract (Theka)'} readOnly style={{ accentColor: '#fb641b', width: '18px', height: '18px' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{t.contract}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{t.contractSub}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Discuss & Describe */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <h3 
            onClick={() => setIsStep3Open(!isStep3Open)} 
            style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#f1f5f9', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', color: '#2874f0' }}>3</span>
              {t.step3}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{isStep3Open ? t.close : t.expand}</span>
          </h3>
          
          {isStep3Open && (
            <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '300px', overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{ 
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'user' ? '#2874f0' : '#e2e8f0',
                      color: msg.sender === 'user' ? 'white' : '#1e293b',
                      padding: '10px 14px', borderRadius: '12px', maxWidth: '80%', fontSize: '13px', lineHeight: '1.4',
                      display: 'flex', flexDirection: 'column', gap: msg.sender === 'user' && msg.image ? '8px' : '0'
                    }}>
                      {msg.sender === 'user' && msg.image && msg.imageUrl && (
                        <div style={{ border: '2px solid rgba(255,255,255,0.5)', borderRadius: '8px', overflow: 'hidden', maxWidth: '200px' }}>
                          <img src={msg.imageUrl} alt="attached" style={{ width: '100%', display: 'block' }} />
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                  {selectedFile && tempImageUrl && (
                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img src={tempImageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, fontSize: '12px', color: '#1e3a8a' }}>
                        <div style={{ fontWeight: 'bold' }}>{t.imgAttached}</div>
                        <div style={{ color: '#64748b' }}>{selectedFile.name}</div>
                      </div>
                      <button onClick={removeAttachedImage} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer', padding: '5px' }}>❌</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', padding: '10px', alignItems: 'center' }}>
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      style={{ background: '#cbd5e1', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}
                    >📸</button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={t.typeIssue} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', padding: '8px' }} />
                    <button onClick={handleSendMessage} style={{ background: '#2874f0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}>{t.send}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {labourCategory && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '15px 20px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{t.selectedService} <span style={{color: '#d97706'}}>{selectedCustomerState}</span></div>
              <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '900' }}>
                {isHindi ? (EXPANDED_LABOUR_CATEGORIES.find(l => l.name === labourCategory)?.hi || labourCategory) : labourCategory}
              </div>
              <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '800' }}>₹{getFinalCalculatedRate(labourCategory)} <span style={{fontSize: '10px', color: '#94a3b8', fontWeight: 'normal'}}>{t.perDay}</span></div>
            </div>
            
            <button 
              onClick={() => processLabourBooking(chatHistory, getFinalCalculatedRate(labourCategory), selectedCustomerState)} 
              style={{ background: 'linear-gradient(90deg, #fb641b, #f97316)', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(251, 100, 27, 0.3)' }}
            >
              {t.proceed}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}