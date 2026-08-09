"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { useAppContext } from './AppContext'; // 🔥 Language fetch karne ke liye

export default function TravelBookingView({ setAppStep }: { setAppStep: (step: string) => any }) {
  
  // 🔥 Global Language System
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  // Translation Object
  const t = {
    back: isHindi ? "← डैशबोर्ड पर वापस" : "← Back to Dashboard",
    title: isHindi ? "लाइव ट्रेन, बस और लोकल टिकट बुकिंग" : "Live Train, Bus & Local Ticket Booking",
    tabTrain: isHindi ? "🚆 IRCTC ट्रेन" : "🚆 IRCTC Train",
    tabBus: isHindi ? "🚌 बस टिकट" : "🚌 Bus Ticket",
    tabLocal: isHindi ? "🎫 लोकल / RailOne" : "🎫 Local / RailOne",
    localTitle: isHindi ? "लोकल ट्रेन और अनारक्षित टिकट (RailOne वेब)" : "Local Train & Unreserved Tickets (RailOne Web)",
    localDesc: isHindi 
      ? "बिना ऐप डाउनलोड किए, ब्राउज़र के अंदर ही अनारक्षित और लोकल ट्रेन टिकट बुक करने के लिए आपको आधिकारिक वेब पोर्टल पर ले जाया जाएगा।" 
      : "Bina app download kiye, browser ke andar hi unreserved aur local train ticket book karne ke liye official web portal par redirect kiya jayega.",
    fromLabel: isHindi ? "कहाँ से (स्टेशन / कोड)" : "From (Source Station / Code)",
    fromPlaceholder: isHindi ? "1-2 अक्षर टाइप करें (जैसे PNBE, पटना)" : "Type 1-2 letters (e.g. PNBE, Patna)",
    toLabel: isHindi ? "कहाँ तक (गंतव्य स्टेशन / कोड)" : "To (Destination Station / Code)",
    toPlaceholder: isHindi ? "1-2 अक्षर टाइप करें (जैसे DLI, दिल्ली)" : "Type 1-2 letters (e.g. DLI, Delhi)",
    journeyDate: isHindi ? "यात्रा की तारीख (Journey Date)" : "Journey Date",
    alertValidation: isHindi 
      ? "कृपया ड्रॉपडाउन से सही स्टेशन चुनें और यात्रा की तारीख भरें!" 
      : "Kripya dropdown se sahi Source aur Destination station select karein aur Journey Date bharein!",
    btnLocal: isHindi ? "🎫 RailOne वेब पोर्टल खोलें" : "🎫 Open RailOne Web Portal",
    btnSearchTrain: isHindi ? "🔍 सर्च करें और लाइव ट्रेन की सीटें देखें" : "🔍 Search & View Live Train Seats",
    btnSearchBus: isHindi ? "🔍 सर्च करें और लाइव बस की सीटें देखें" : "🔍 Search & View Live Bus Seats"
  };

  const [travelType, setTravelType] = useState<'train' | 'bus' | 'local_train'>('train');
  
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [selectedDest, setSelectedDest] = useState<any>(null);
  
  const [sourceSuggestions, setSourceSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  
  const [journeyDate, setJourneyDate] = useState('');

  // Source Station Live Search from Supabase
  useEffect(() => {
    const fetchSourceStations = async () => {
      if (!sourceQuery || sourceQuery.length < 1) {
        setSourceSuggestions([]);
        return;
      }
      const { data } = await supabase
        .from('stations')
        .select('*')
        .or(`station_name.ilike.%${sourceQuery}%,station_code.ilike.%${sourceQuery}%,city_name.ilike.%${sourceQuery}%`)
        .limit(10);
      
      if (data) setSourceSuggestions(data);
    };
    const timer = setTimeout(fetchSourceStations, 300);
    return () => clearTimeout(timer);
  }, [sourceQuery]);

  // Destination Station Live Search from Supabase
  useEffect(() => {
    const fetchDestStations = async () => {
      if (!destQuery || destQuery.length < 1) {
        setDestSuggestions([]);
        return;
      }
      const { data } = await supabase
        .from('stations')
        .select('*')
        .or(`station_name.ilike.%${destQuery}%,station_code.ilike.%${destQuery}%,city_name.ilike.%${destQuery}%`)
        .limit(10);
      
      if (data) setDestSuggestions(data);
    };
    const timer = setTimeout(fetchDestStations, 300);
    return () => clearTimeout(timer);
  }, [destQuery]);

  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();

    let redirectLink = "";

    if (travelType === 'local_train') {
      // UTS Web Portal / RailOne Web booking link
      redirectLink = `https://www.utsonmobile.indianrail.gov.in/`;
    } else {
      if (!selectedSource || !selectedDest || !journeyDate) {
        alert(t.alertValidation);
        return;
      }

      if (travelType === 'train') {
        // ✅ Train Affiliate Link
        redirectLink = "https://bitli.in/rr62wid";
      } else {
        // ✅ Bus Affiliate Link
        redirectLink = "https://bitli.in/nkvsypz";
      }
    }

    window.open(redirectLink, '_blank');
  };

  return (
    <div className="glass-card no-print" style={{ maxWidth: '650px', margin: '40px auto', padding: '25px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <button 
        type="button"
        onClick={() => setAppStep('home')} 
        style={{ background: 'transparent', border: 'none', color: '#2874f0', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', padding: 0 }}
      >
        {t.back}
      </button>

      <h2 style={{ fontSize: '22px', borderBottom: '2px solid #f59e0b', paddingBottom: '10px', marginBottom: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>🚆🚌🎫</span> {t.title}
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
        <button 
          type="button"
          onClick={() => setTravelType('train')} 
          style={{ 
            flex: 1, padding: '10px 8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
            border: travelType === 'train' ? '2px solid #2874f0' : '1px solid #cbd5e1', 
            background: travelType === 'train' ? '#eff6ff' : 'white', 
            color: travelType === 'train' ? '#1d4ed8' : '#475569' 
          }}
        >
          {t.tabTrain}
        </button>
        <button 
          type="button"
          onClick={() => setTravelType('bus')} 
          style={{ 
            flex: 1, padding: '10px 8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
            border: travelType === 'bus' ? '2px solid #f59e0b' : '1px solid #cbd5e1', 
            background: travelType === 'bus' ? '#fffbeb' : 'white', 
            color: travelType === 'bus' ? '#b45309' : '#475569' 
          }}
        >
          {t.tabBus}
        </button>
        <button 
          type="button"
          onClick={() => setTravelType('local_train')} 
          style={{ 
            flex: 1, padding: '10px 8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
            border: travelType === 'local_train' ? '2px solid #10b981' : '1px solid #cbd5e1', 
            background: travelType === 'local_train' ? '#ecfdf5' : 'white', 
            color: travelType === 'local_train' ? '#047857' : '#475569' 
          }}
        >
          {t.tabLocal}
        </button>
      </div>

      <form onSubmit={handleExecuteSearch} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        {travelType === 'local_train' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span style={{ fontSize: '48px' }}>🎫</span>
            <h3 style={{ color: '#0f172a', margin: '10px 0 5px 0' }}>{t.localTitle}</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
              {t.localDesc}
            </p>
          </div>
        ) : (
          <>
            {/* Source Station Field */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{t.fromLabel}</label>
              <input 
                type="text" 
                placeholder={t.fromPlaceholder} 
                value={selectedSource ? `${selectedSource.station_name} (${selectedSource.station_code})` : sourceQuery} 
                onChange={(e) => {
                  setSelectedSource(null);
                  setSourceQuery(e.target.value);
                }}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
              />
              {sourceSuggestions.length > 0 && !selectedSource && (
                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '0 0 8px 8px', listStyle: 'none', margin: 0, padding: 0, zIndex: 100, maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                  {sourceSuggestions.map((st: any) => (
                    <li 
                      key={st.id} 
                      onClick={() => {
                        setSelectedSource(st);
                        setSourceQuery('');
                        setSourceSuggestions([]);
                      }}
                      style={{ padding: '12px 15px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <span style={{ fontWeight: '600' }}>📍 {st.station_name}</span>
                      <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>{st.station_code}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Destination Station Field */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{t.toLabel}</label>
              <input 
                type="text" 
                placeholder={t.toPlaceholder} 
                value={selectedDest ? `${selectedDest.station_name} (${selectedDest.station_code})` : destQuery} 
                onChange={(e) => {
                  setSelectedDest(null);
                  setDestQuery(e.target.value);
                }}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
              />
              {destSuggestions.length > 0 && !selectedDest && (
                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '0 0 8px 8px', listStyle: 'none', margin: 0, padding: 0, zIndex: 100, maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                  {destSuggestions.map((st: any) => (
                    <li 
                      key={st.id} 
                      onClick={() => {
                        setSelectedDest(st);
                        setDestQuery('');
                        setDestSuggestions([]);
                      }}
                      style={{ padding: '12px 15px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <span style={{ fontWeight: '600' }}>📍 {st.station_name}</span>
                      <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>{st.station_code}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{t.journeyDate}</label>
              <input 
                type="date" 
                value={journeyDate} 
                onChange={(e) => setJourneyDate(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 'bold', outline: 'none', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}

        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            background: travelType === 'local_train' ? '#10b981' : '#f59e0b', 
            color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' 
          }}
        >
          {travelType === 'local_train' ? t.btnLocal : (travelType === 'train' ? t.btnSearchTrain : t.btnSearchBus)}
        </button>
      </form>
    </div>
  );
}