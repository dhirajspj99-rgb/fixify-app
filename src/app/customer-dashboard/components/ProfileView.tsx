"use client";
import React, { useState } from 'react';
import { supabase } from '@/supabase';
import { useAppContext } from './AppContext';
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

export default function ProfileView({ userProfile, setUserProfile, setAppStep }: any) {
  
  // 🔥 Global Language System
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));
  const currentLang = isHindi ? "hi" : "en"; // Transliteration ke liye language

  const t = {
    back: isHindi ? "← वापस" : "← Back",
    title: isHindi ? "👤 मेरी प्रोफाइल" : "👤 My Profile",
    fullName: isHindi ? "पूरा नाम" : "Full Name",
    enterName: isHindi ? "नाम दर्ज करें" : "Enter Name",
    regMobile: isHindi ? "रजिस्टर्ड मोबाइल" : "Registered Mobile",
    primaryAddr: isHindi ? "प्राथमिक डिलीवरी का पता" : "Primary Delivery Address",
    enterAddr: isHindi ? "पूरा पता दर्ज करें" : "Enter complete address",
    state: isHindi ? "राज्य" : "State",
    district: isHindi ? "ज़िला" : "District",
    block: isHindi ? "ब्लॉक / शहर" : "Block / City",
    pincode: isHindi ? "पिनकोड" : "Pincode",
    pinPlaceholder: isHindi ? "6-अंकों का पिनकोड" : "6-digit Pincode",
    upiIdLabel: isHindi ? "UPI ID (रिफंड और निकासी के लिए)" : "UPI ID (For Refunds & Withdrawals)",
    saveBtn: isHindi ? "प्रोफाइल सेव करें" : "Save Profile Details",
    savedAddrTitle: isHindi ? "📍 मेरे सेव किए गए पते" : "📍 My Saved Addresses",
    address: isHindi ? "पता" : "Address",
    noSavedAddr: isHindi ? "अभी तक कोई अतिरिक्त पता सेव नहीं किया गया है। चेकआउट के दौरान जोड़ने पर वे यहाँ दिखाई देंगे।" : "No additional addresses saved yet. They will appear here when you add them during checkout.",
    securityTitle: isHindi ? "🔐 सुरक्षा सेटिंग्स" : "🔐 Security Settings",
    changePass: isHindi ? "लॉगिन पासवर्ड बदलें" : "Change Login Password",
    oldPass: isHindi ? "पुराना पासवर्ड" : "Old Password",
    newPass: isHindi ? "नया पासवर्ड" : "New Password",
    confirmPass: isHindi ? "नया पासवर्ड कन्फर्म करें" : "Confirm New Password",
    passRule: isHindi ? "*पासवर्ड में 1 बड़ा अक्षर, 1 छोटा अक्षर, 1 नंबर और 1 सिंबल (@,#,$) होना चाहिए।" : "*Password must have 1 Uppercase, 1 Lowercase, 1 Number, and 1 Symbol (@,#,$).",
    updating: isHindi ? "अपडेट हो रहा है..." : "Updating...",
    updatePassBtn: isHindi ? "पासवर्ड अपडेट करें" : "Update Password",
    changePin: isHindi ? "वॉलेट पिन बदलें" : "Change Wallet PIN",
    oldPin: isHindi ? "पुराना 4-अंकों का पिन (डिफ़ॉल्ट 1234)" : "Old 4-Digit PIN (Default is 1234)",
    newPin: isHindi ? "नया 4-अंकों का पिन" : "New 4-Digit PIN",
    confirmPin: isHindi ? "नया पिन कन्फर्म करें" : "Confirm New 4-Digit PIN",
    updatePinBtn: isHindi ? "वॉलेट पिन अपडेट करें" : "Update Wallet PIN",

    // Address Edit/Delete text
    btnEdit: isHindi ? "✏️ एडिट" : "✏️ Edit",
    btnDelete: isHindi ? "🗑️ डिलीट" : "🗑️ Delete",
    btnUpdateAddr: isHindi ? "पता अपडेट करें" : "Update Address",
    btnCancel: isHindi ? "कैंसल" : "Cancel",
    confirmDelete: isHindi ? "क्या आप सच में इस पते को हटाना चाहते हैं?" : "Are you sure you want to delete this address?",

    // Alerts
    errInvalidSession: isHindi ? "❌ यूज़र सेशन अमान्य है। कृपया दोबारा लॉगिन करें।" : "❌ User session is invalid. Please login again.",
    successProfile: isHindi ? "✅ प्रोफ़ाइल सफलतापूर्वक सेव हो गई!" : "✅ Profile Saved Successfully!",
    errSave: isHindi ? "❌ सेव करने में विफल: " : "❌ Save failed: ",
    errFillPass: isHindi ? "कृपया सभी पासवर्ड फील्ड भरें!" : "Please fill all password fields!",
    errPassMatch: isHindi ? "नया पासवर्ड और कन्फर्म पासवर्ड मैच नहीं कर रहे हैं!" : "New and Confirm Password do not match!",
    errPassFormat: isHindi ? "पासवर्ड कम से कम 8 कैरेक्टर का होना चाहिए जिसमें 1 बड़ा अक्षर (A-Z), 1 छोटा अक्षर (a-z), 1 नंबर (0-9) और 1 विशेष चिन्ह (@, #, $ आदि) हो।" : "Password must be at least 8 characters with 1 Uppercase, 1 Lowercase, 1 Number, and 1 Symbol.",
    errNoSession: isHindi ? "यूज़र सेशन नहीं मिला!" : "User session not found!",
    errOldPass: isHindi ? "पुराना पासवर्ड गलत है!" : "Old Password is incorrect!",
    successPass: isHindi ? "🔐 पासवर्ड सफलतापूर्वक बदल गया है!" : "🔐 Password successfully changed!",
    errFillPin: isHindi ? "कृपया सभी पिन फील्ड भरें!" : "Please fill all PIN fields!",
    errPinLength: isHindi ? "नया पिन सिर्फ 4 अंकों का होना चाहिए!" : "New PIN must be exactly 4 digits!",
    errPinMatch: isHindi ? "नया पिन और कन्फर्म पिन मैच नहीं कर रहे हैं!" : "New PIN and Confirm PIN do not match!",
    errOldPin: isHindi ? "पुराना पिन गलत है!" : "Old PIN is incorrect!",
    successPin: isHindi ? "💳 वॉलेट पिन सफलतापूर्वक बदल गया है!" : "💳 Wallet PIN successfully changed!",
    successDelAddr: isHindi ? "✅ पता सफलतापूर्वक हटा दिया गया!" : "✅ Address deleted successfully!",
    successUpdateAddr: isHindi ? "✅ पता अपडेट हो गया!" : "✅ Address updated successfully!"
  };

  // States for Password Change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // States for PIN Change
  const [showPinSection, setShowPinSection] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // 🔥 States for Saved Address Editing 🔥
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [editAddrForm, setEditAddrForm] = useState({ street: '', block: '', district: '', state: '', pincode: '' });

  // 🔥 Profile Save Handler
  const handleSaveProfile = async () => {
    try {
      if (!userProfile?.phone && !userProfile?.id) return alert(t.errInvalidSession);

      const updateData = { 
        name: userProfile.name, 
        address: userProfile.address, 
        state: userProfile.state, 
        district: userProfile.district, 
        block: userProfile.block,
        pincode: userProfile.pincode, 
        upi_id: userProfile.upi_id 
      };

      let query = supabase.from('customers').update(updateData);
      if (userProfile.id) query = query.eq('id', userProfile.id);
      else query = query.eq('phone', userProfile.phone);

      const { error } = await query;
      if (error) throw error;
      
      alert(t.successProfile);
    } catch(e: any) { 
      alert(t.errSave + e.message); 
    }
  };

  // 🔥 Handle Delete Saved Address 🔥
  const handleDeleteSavedAddress = async (idx: number) => {
    if (!window.confirm(t.confirmDelete)) return;
    
    // safe parsing before delete
    let newSaved = [];
    if (Array.isArray(userProfile.saved_addresses)) {
      newSaved = [...userProfile.saved_addresses];
    } else if (typeof userProfile.saved_addresses === 'string') {
      try { newSaved = JSON.parse(userProfile.saved_addresses); } catch (e) { newSaved = []; }
    }
    
    newSaved.splice(idx, 1);
    
    try {
      let query = supabase.from('customers').update({ saved_addresses: newSaved });
      if (userProfile.id) query = query.eq('id', userProfile.id);
      else query = query.eq('phone', userProfile.phone);

      const { error } = await query;
      if (error) throw error;

      setUserProfile({ ...userProfile, saved_addresses: newSaved });
      alert(t.successDelAddr);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // 🔥 Handle Edit Button Click 🔥
  const handleEditSavedAddress = (idx: number, addr: any) => {
    setEditingAddressIndex(idx);
    setEditAddrForm({
      street: addr.address || addr.street || addr.full_address || '',
      block: addr.block || '',
      district: addr.district || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    });
  };

  // 🔥 Save Edited Address 🔥
  const handleUpdateSavedAddress = async () => {
    if (!editAddrForm.street || !editAddrForm.pincode) {
      return alert(isHindi ? "कृपया जरूरी जानकारी भरें!" : "Please fill required fields!");
    }

    // safe parsing before update
    let newSaved = [];
    if (Array.isArray(userProfile.saved_addresses)) {
      newSaved = [...userProfile.saved_addresses];
    } else if (typeof userProfile.saved_addresses === 'string') {
      try { newSaved = JSON.parse(userProfile.saved_addresses); } catch (e) { newSaved = []; }
    }

    newSaved[editingAddressIndex as number] = {
      street: editAddrForm.street,
      block: editAddrForm.block,
      district: editAddrForm.district,
      state: editAddrForm.state,
      pincode: editAddrForm.pincode
    };

    try {
      let query = supabase.from('customers').update({ saved_addresses: newSaved });
      if (userProfile.id) query = query.eq('id', userProfile.id);
      else query = query.eq('phone', userProfile.phone);

      const { error } = await query;
      if (error) throw error;

      setUserProfile({ ...userProfile, saved_addresses: newSaved });
      setEditingAddressIndex(null);
      alert(t.successUpdateAddr);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Password Change Handler
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) return alert(t.errFillPass);
    if (newPassword !== confirmPassword) return alert(t.errPassMatch);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) return alert(t.errPassFormat);

    setIsUpdatingPassword(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error(t.errNoSession);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) throw new Error(t.errOldPass);

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      alert(t.successPass);
      setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setShowPasswordSection(false);
    } catch (e: any) { alert("❌ Error: " + e.message); } 
    finally { setIsUpdatingPassword(false); }
  };

  // Wallet PIN Change Handler
  const handlePinChange = async () => {
    if (!oldPin || !newPin || !confirmPin) return alert(t.errFillPin);
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return alert(t.errPinLength);
    if (newPin !== confirmPin) return alert(t.errPinMatch);

    setIsUpdatingPin(true);
    try {
      const { data: customerData, error: fetchErr } = await supabase.from('customers').select('wallet_pin').eq('phone', userProfile.phone).single();
      if (fetchErr) throw fetchErr;

      const actualOldPin = customerData?.wallet_pin || '1234';
      if (oldPin !== actualOldPin) throw new Error(t.errOldPin);

      const { error: updateErr } = await supabase.from('customers').update({ wallet_pin: newPin }).eq('phone', userProfile.phone);
      if (updateErr) throw updateErr;

      alert(t.successPin);
      setOldPin(''); setNewPin(''); setConfirmPin(''); setShowPinSection(false);
    } catch (e: any) { alert("❌ Error: " + e.message); } 
    finally { setIsUpdatingPin(false); }
  };

  // 🔥 1. SAFE PARSING LOGIC TO PREVENT .map() ERROR 🔥
  let safeAddresses: any[] = [];
  if (Array.isArray(userProfile?.saved_addresses)) {
    safeAddresses = userProfile.saved_addresses;
  } else if (typeof userProfile?.saved_addresses === 'string') {
    try {
      safeAddresses = JSON.parse(userProfile.saved_addresses);
    } catch (e) {
      console.error("Address parsing error:", e);
      safeAddresses = [];
    }
  }

  return (
    <div className="glass-card no-print" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <button onClick={() => setAppStep('home')} style={{ background: 'transparent', border: 'none', color: '#2874f0', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>{t.back}</button>
      <h2 style={{ borderBottom: '2px solid #2874f0', paddingBottom: '10px', marginBottom: '20px' }}>{t.title}</h2>
      
      {/* 🔥 TRANSLITERATED FULL NAME 🔥 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>{t.fullName}</label>
        <ReactTransliterate
          value={userProfile.name || ''}
          onChangeText={(text) => setUserProfile({...userProfile, name: text})}
          lang={currentLang}
          placeholder={t.enterName}
          className="input-pill"
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>{t.regMobile}</label>
        <input type="text" className="input-pill" value={userProfile.phone || ''} disabled style={{ background: '#f5f5f5' }} />
      </div>
      
      {/* 🔥 TRANSLITERATED ADDRESS 🔥 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>{t.primaryAddr}</label>
        <ReactTransliterate
          value={userProfile.address || ''}
          onChangeText={(text) => setUserProfile({...userProfile, address: text})}
          lang={currentLang}
          placeholder={t.enterAddr}
          className="input-pill"
          renderComponent={(props) => <textarea {...props} rows={3} />}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>{t.state}</label>
          <ReactTransliterate
            value={userProfile.state || ''}
            onChangeText={(text) => setUserProfile({...userProfile, state: text})}
            lang={currentLang}
            placeholder={t.state}
            className="input-pill"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>{t.district}</label>
          <ReactTransliterate
            value={userProfile.district || ''}
            onChangeText={(text) => setUserProfile({...userProfile, district: text})}
            lang={currentLang}
            placeholder={t.district}
            className="input-pill"
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>{t.block}</label>
          <ReactTransliterate
            value={userProfile.block || ''}
            onChangeText={(text) => setUserProfile({...userProfile, block: text})}
            lang={currentLang}
            placeholder={t.block.split(' /')[0]}
            className="input-pill"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>{t.pincode}</label>
          <input type="text" maxLength={6} className="input-pill" value={userProfile.pincode || ''} onChange={(e) => setUserProfile({...userProfile, pincode: e.target.value.replace(/[^0-9]/g, '')})} placeholder={t.pinPlaceholder} />
        </div>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>{t.upiIdLabel}</label>
        <input type="text" className="input-pill" value={userProfile.upi_id || ''} onChange={(e) => setUserProfile({...userProfile, upi_id: e.target.value})} placeholder="e.g. mobile@upi" />
      </div>

      <button onClick={handleSaveProfile} className="primary-btn btn-blue" style={{ marginBottom: '30px' }}>{t.saveBtn}</button>

      {/* 📍 SAVED ADDRESSES SECTION WITH EDIT & DELETE */}
      <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', color: '#1e293b' }}>{t.savedAddrTitle}</h3>
      {/* 🔥 2. USING safeAddresses HERE INSTEAD OF userProfile.saved_addresses 🔥 */}
      {safeAddresses && safeAddresses.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
          {safeAddresses.map((addr: any, idx: number) => (
            <div key={idx} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: editingAddressIndex === idx ? '#eff6ff' : '#f8fafc' }}>
              
              {editingAddressIndex === idx ? (
                /* 🔥 EDIT ADDRESS FORM 🔥 */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <ReactTransliterate value={editAddrForm.street} onChangeText={(v) => setEditAddrForm({...editAddrForm, street: v})} lang={currentLang} placeholder={t.enterAddr} className="input-pill" />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <ReactTransliterate value={editAddrForm.state} onChangeText={(v) => setEditAddrForm({...editAddrForm, state: v})} lang={currentLang} placeholder={t.state} className="input-pill" />
                    <ReactTransliterate value={editAddrForm.district} onChangeText={(v) => setEditAddrForm({...editAddrForm, district: v})} lang={currentLang} placeholder={t.district} className="input-pill" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <ReactTransliterate value={editAddrForm.block} onChangeText={(v) => setEditAddrForm({...editAddrForm, block: v})} lang={currentLang} placeholder={t.block} className="input-pill" />
                    <input type="text" maxLength={6} value={editAddrForm.pincode} onChange={(e) => setEditAddrForm({...editAddrForm, pincode: e.target.value.replace(/[^0-9]/g, '')})} placeholder={t.pincode} className="input-pill" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button onClick={handleUpdateSavedAddress} style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{t.btnUpdateAddr}</button>
                    <button onClick={() => setEditingAddressIndex(null)} style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{t.btnCancel}</button>
                  </div>
                </div>
              ) : (
                /* 👁️ VIEW ADDRESS MODE 👁️ */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#334155' }}>{t.address} {idx + 1}</strong>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEditSavedAddress(idx, addr)} style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#b45309' }}>{t.btnEdit}</button>
                      <button onClick={() => handleDeleteSavedAddress(idx)} style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>{t.btnDelete}</button>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                    {addr.address || addr.street || addr.full_address || 'Address details'}<br/>
                    {addr.block || ''} {addr.district ? `, ${addr.district}` : ''} {addr.state ? `, ${addr.state}` : ''} {addr.pincode ? `- ${addr.pincode}` : ''}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '30px', fontStyle: 'italic' }}>{t.noSavedAddr}</p>
      )}

      {/* 🔐 SECURITY SETTINGS SECTION */}
      <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', color: '#1e293b' }}>{t.securityTitle}</h3>

      {/* CHANGE PASSWORD TOGGLE */}
      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
        <div 
          onClick={() => setShowPasswordSection(!showPasswordSection)} 
          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}
        >
          <span>{t.changePass}</span>
          <span>{showPasswordSection ? '▲' : '▼'}</span>
        </div>
        
        {showPasswordSection && (
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="password" placeholder={t.oldPass} value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="input-pill" />
            <input type="password" placeholder={t.newPass} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-pill" />
            <input type="password" placeholder={t.confirmPass} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-pill" />
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0' }}>{t.passRule}</p>
            <button onClick={handlePasswordChange} disabled={isUpdatingPassword} className="primary-btn" style={{ background: '#10b981', marginTop: '5px' }}>
              {isUpdatingPassword ? t.updating : t.updatePassBtn}
            </button>
          </div>
        )}
      </div>

      {/* CHANGE WALLET PIN TOGGLE */}
      <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '15px' }}>
        <div 
          onClick={() => setShowPinSection(!showPinSection)} 
          style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold', color: '#b45309' }}
        >
          <span>{t.changePin}</span>
          <span>{showPinSection ? '▲' : '▼'}</span>
        </div>
        
        {showPinSection && (
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="password" placeholder={t.oldPin} maxLength={4} value={oldPin} onChange={e => setOldPin(e.target.value.replace(/[^0-9]/g, ''))} className="input-pill" />
            <input type="password" placeholder={t.newPin} maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))} className="input-pill" />
            <input type="password" placeholder={t.confirmPin} maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))} className="input-pill" />
            <button onClick={handlePinChange} disabled={isUpdatingPin} className="primary-btn" style={{ background: '#f59e0b', marginTop: '5px' }}>
              {isUpdatingPin ? t.updating : t.updatePinBtn}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}