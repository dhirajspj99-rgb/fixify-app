"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

const STATE_DISTRICT_DATA: { [key: string]: string[] } = {
  "Bihar": [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Nalanda", "Saran", 
    "Rohtas", "Purnia", "Samastipur", "Begusarai", "Supaul", "Sitamarhi", "Kishanganj", 
    "Madhepura", "Saharsa", "Araria", "Katihar", "Siwan", "Gopalganj", "Vaishali", 
    "West Champaran", "East Champaran", "Munger", "Banka", "Jamui", "Khagaria", 
    "Lakhisarai", "Sheikhpura", "Buxar", "Kaimur", "Bhojpur", "Jehanabad", "Aurangabad", 
    "Arwal", "Nawada", "Madubani", "Sheohar"
  ].sort(),
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Ghaziabad", "Noida", 
    "Prayagraj", "Gorakhpur", "Jhansi", "Ayodhya", "Aligarh", "Bareilly", 
    "Moradabad", "Saharanpur", "Mathura", "Firozabad"
  ].sort(),
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"].sort(),
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai"].sort(),
  "Karnataka": ["Bengaluru", "Mysore", "Mangalore", "Hubli", "Belagavi", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"].sort()
};

const COMMON_BLOCKS = [
  "Sadar", "Town", "City", "Rural", "North Zone", "South Zone", "East Zone", "West Zone",
  "Tajpur", "Pusa", "Morwa", "Kalyanpur", "Rosera", "Dalsinghsarai", "Hasanpur", "Mohiuddinagar", "Sector-1", "Sector-2"
].sort();

export default function DeliveryEstimator({ shopPincode, userProfile, setUserProfile, selectedLanguage = 'English' }: { shopPincode: string, userProfile?: any, setUserProfile?: any, selectedLanguage?: string }) {
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // UI States
  const [showAddressSelector, setShowAddressSelector] = useState<boolean>(false);
  const [selectedAddrIndex, setSelectedAddrIndex] = useState<number | null>(null);
  const [manualPincode, setManualPincode] = useState<string>(''); 
  const [tempPincode, setTempPincode] = useState<string>(''); 

  // Address Add/Edit States
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newAddr, setNewAddr] = useState({ name: '', address: '', block: '', district: '', state: '', pincode: '' });

  // Custom Fields States
  const [customState, setCustomState] = useState<boolean>(false);
  const [customDistrict, setCustomDistrict] = useState<boolean>(false);
  const [customBlock, setCustomBlock] = useState<boolean>(false);

  // 🔥 100% FIXED ADDRESS LIST STATE 🔥
  const [parsedAddresses, setParsedAddresses] = useState<any[]>([]);

  const isHindi = selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी');
  const currentLang = isHindi ? "hi" : "en";
  
  const t = {
    estDelivery: isHindi ? "डिलीवरी का समय" : "Estimated Delivery",
    deliveringTo: isHindi ? "📍 यहाँ डिलीवरी होगी:" : "📍 Delivering to:",
    change: isHindi ? "बदलें" : "Change",
    close: isHindi ? "बंद करें" : "Close",
    selectAddress: isHindi ? "सेव किया हुआ पता चुनें:" : "Select a saved address:",
    addNewAddrBtn: isHindi ? "➕ नया पता जोड़ें" : "➕ Add a new address",
    updateAddrBtn: isHindi ? "पता अपडेट करें" : "Update Address",
    orNewPincode: isHindi ? "या सिर्फ पिनकोड चेक करें:" : "Or just check a pincode:",
    checkBtn: isHindi ? "चेक करें" : "Check",
    calculating: isHindi ? "डिलीवरी का समय चेक हो रहा है..." : "Calculating delivery time...",
    sameDay: isHindi ? "⚡ आज ही डिलीवरी (5-6 घंटे)" : "⚡ Same Day Delivery",
    in24h: isHindi ? "🕒 24 घंटे में डिलीवरी" : "🕒 Delivery in 24 Hours",
    in2Days: isHindi ? "📅 2 दिन में डिलीवरी" : "📅 Delivery in 2 Days",
    in7Days: isHindi ? "🚚 3-7 दिन में डिलीवरी" : "🚚 Delivery in 3-7 Days",
    enterPincode: isHindi ? "पिनकोड डालें (e.g 800001)" : "Enter Pincode (e.g 800001)",
    customLocation: isHindi ? "नया पिनकोड एरिया" : "Custom Pincode Area",
    saveAddress: isHindi ? "सेव करें और चुनें" : "Save & Select",
    otherTypeNew: isHindi ? "अन्य (नया लिखें)" : "Other (Type New)"
  };

  // 🔥 POWERFUL ADDRESS MERGING LOGIC 🔥
  useEffect(() => {
    let addrs: any[] = [];
    
    // 1. Agar profile mein main address hai toh usko top pe rakho
    if (userProfile?.address || userProfile?.pincode) {
      addrs.push({
        name: userProfile.name || 'My Profile Address',
        address: userProfile.address || '',
        block: userProfile.block || '',
        district: userProfile.district || '',
        state: userProfile.state || '',
        pincode: userProfile.pincode || '',
        isMain: true // Yeh main profile address hai, ise delete nahi kar sakte yahan se
      });
    }

    // 2. Extra saved addresses ko DB se nikalo
    if (userProfile?.saved_addresses) {
      try {
        const dbAddrs = typeof userProfile.saved_addresses === 'string' 
          ? JSON.parse(userProfile.saved_addresses) 
          : userProfile.saved_addresses;
        if (Array.isArray(dbAddrs)) {
          addrs = [...addrs, ...dbAddrs];
        }
      } catch (error) {
        console.error("Parse Error:", error);
      }
    }

    // Duplicate addresses ko hatao
    const uniqueAddrs = addrs.filter((obj, index, self) => 
      index === self.findIndex((t) => (t.address === obj.address && t.pincode === obj.pincode))
    );

    setParsedAddresses(uniqueAddrs);

    // Auto-select the first address if nothing is selected
    if (uniqueAddrs.length > 0 && selectedAddrIndex === null && !manualPincode) {
       setSelectedAddrIndex(0);
    }
  }, [userProfile]);

  const calculateDeliveryTime = (km: number) => {
    if (km <= 10) return { text: t.sameDay, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    if (km <= 20) return { text: t.in24h, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
    if (km <= 40) return { text: t.in2Days, color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    return { text: t.in7Days, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
  };

  const getActiveAddressDisplay = () => {
    if (selectedAddrIndex !== null && parsedAddresses[selectedAddrIndex]) {
      const addr = parsedAddresses[selectedAddrIndex];
      return {
        title: addr.name || 'Customer',
        line1: addr.address || addr.street || addr.full_address || '',
        line2: `${addr.block ? addr.block + ', ' : ''}${addr.district ? addr.district + ', ' : ''}${addr.state || ''}`,
        pincode: addr.pincode || ''
      };
    }
    if (manualPincode) return { title: t.customLocation, line1: '', line2: '', pincode: manualPincode };
    return null;
  };

  const activeDisplay = getActiveAddressDisplay();
  const currentPincode = activeDisplay ? activeDisplay.pincode : '';

  useEffect(() => {
    const runEstimation = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!currentPincode || String(currentPincode).length < 6) {
        setDeliveryData({ text: "📅 Standard Delivery", color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' });
        setLoading(false); return;
      }
      if (!shopPincode) {
        setDeliveryData({ text: "📅 Standard Delivery", color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' });
        setLoading(false); return;
      }

      if (String(shopPincode) === String(currentPincode)) {
        setDeliveryData(calculateDeliveryTime(5));
      } else {
        const diff = Math.abs(Number(shopPincode) - Number(currentPincode));
        let calculatedKm = 0;
        if (diff < 10) calculatedKm = 15; 
        else if (diff < 50) calculatedKm = 35; 
        else calculatedKm = 90; 
        setDeliveryData(calculateDeliveryTime(calculatedKm));
      }
      setLoading(false);
    };

    runEstimation();
  }, [shopPincode, currentPincode, selectedLanguage]);


  // 🔥 DELETE ADDRESS LOGIC 🔥
  const handleDeleteAddress = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (parsedAddresses[index].isMain) {
      alert(isHindi ? "आप अपना मुख्य प्रोफ़ाइल पता यहाँ से डिलीट नहीं कर सकते!" : "You cannot delete your main profile address from here!");
      return;
    }

    const confirmDelete = window.confirm(isHindi ? "क्या आप इस पते को डिलीट करना चाहते हैं?" : "Are you sure you want to delete this address?");
    if (!confirmDelete) return;

    // Database mein sirf non-main (jo isMain: true nahi hain) wahi save hone chahiye
    const updatedDBAddresses = parsedAddresses.filter((_, i) => i !== index && !parsedAddresses[i].isMain);
    
    try {
      const { error } = await supabase.from('customers').update({ saved_addresses: updatedDBAddresses }).eq('phone', userProfile.phone);
      if (error) throw error;
      
      if (setUserProfile) setUserProfile({ ...userProfile, saved_addresses: updatedDBAddresses });
      
      if (selectedAddrIndex === index) {
        setSelectedAddrIndex(0);
      } else if (selectedAddrIndex !== null && selectedAddrIndex > index) {
        setSelectedAddrIndex(selectedAddrIndex - 1);
      }
      
      alert(isHindi ? "✅ पता डिलीट हो गया!" : "✅ Address deleted successfully!");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }
  };

  const handleEditAddress = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const addrToEdit = parsedAddresses[index];
    setEditingIndex(index);
    setNewAddr({
      name: addrToEdit.name || '',
      address: addrToEdit.address || addrToEdit.street || '',
      block: addrToEdit.block || '',
      district: addrToEdit.district || '',
      state: addrToEdit.state || '',
      pincode: addrToEdit.pincode || ''
    });
    
    if (addrToEdit.state && !Object.keys(STATE_DISTRICT_DATA).includes(addrToEdit.state)) setCustomState(true);
    else setCustomState(false);
    
    setIsAddingNew(true);
  };

  // 🔥 SAVE OR UPDATE LOGIC 🔥
  const handleSaveNewAddress = async () => {
    if (!newAddr.address || !newAddr.state || !newAddr.district || !newAddr.pincode || newAddr.pincode.length < 6) {
      return alert(isHindi ? "कृपया पूरा पता, राज्य, जिला और सही 6-अंकों का पिनकोड भरें!" : "Please provide State, District, complete address and valid 6-digit pincode!");
    }
    if (!userProfile?.phone) return alert(isHindi ? "पहले लॉगिन करें!" : "Please login first!");

    const dbSavedOnly = parsedAddresses.filter(a => !a.isMain); // Sirf database wale extract kiye

    if (editingIndex === null && dbSavedOnly.length >= 4) {
      return alert(isHindi ? "आप अधिकतम 4 पते सेव कर सकते हैं!" : "You can save a maximum of 4 extra addresses!");
    }

    setIsSaving(true);
    try {
      const newAddressObj = { ...newAddr, name: newAddr.name || userProfile?.name || 'Customer', phone: userProfile?.phone || '' };
      let updatedToDB = [...dbSavedOnly];

      if (editingIndex !== null) {
        if (parsedAddresses[editingIndex].isMain) {
           updatedToDB.push(newAddressObj); // Agar main edit kiya, toh as naya address save hoga
        } else {
           // Purane wale ko dhundho aur update karo
           const dbIndex = updatedToDB.findIndex(a => a.address === parsedAddresses[editingIndex].address && a.pincode === parsedAddresses[editingIndex].pincode);
           if (dbIndex >= 0) updatedToDB[dbIndex] = newAddressObj;
           else updatedToDB.push(newAddressObj);
        }
      } else {
        updatedToDB.push(newAddressObj);
      }

      const { error } = await supabase.from('customers').update({ saved_addresses: updatedToDB }).eq('phone', userProfile.phone);
      if (error) throw error;

      if (setUserProfile) setUserProfile({ ...userProfile, saved_addresses: updatedToDB });

      setManualPincode('');
      resetForm();
      alert(isHindi ? "✅ पता सफलतापूर्वक सेव हो गया!" : "✅ Address Saved Successfully!");
    } catch (err: any) {
      alert("❌ Error saving address: " + err.message);
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    setShowAddressSelector(false);
    setCustomState(false);
    setCustomDistrict(false);
    setCustomBlock(false);
    setNewAddr({ name: '', address: '', block: '', district: '', state: '', pincode: '' });
  };

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)', width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '18px' }}>📦</span>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>{t.estDelivery}</h3>
      </div>

      {/* ACTIVE ADDRESS DISPLAY */}
      {activeDisplay ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', color: '#334155', flex: '1 1 70%', minWidth: '150px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>{t.deliveringTo}</div>
            <strong style={{ color: '#0f172a', display: 'block', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeDisplay.title}</strong>
            {activeDisplay.line1} <br/>
            {activeDisplay.line2} {activeDisplay.pincode ? `- ${activeDisplay.pincode}` : ''}
          </div>
          
          <button onClick={() => { setShowAddressSelector(!showAddressSelector); setIsAddingNew(false); }} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#2874f0', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', transition: '0.2s', whiteSpace: 'nowrap' }}>
            {showAddressSelector ? t.close : t.change}
          </button>
        </div>
      ) : (
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '15px' }}>
          <button onClick={() => setShowAddressSelector(!showAddressSelector)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
            {t.enterPincode}
          </button>
        </div>
      )}

      {/* 🟢 ADDRESS SELECTOR SECTION 🟢 */}
      {showAddressSelector && (
        <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #cbd5e1' }}>
          
          {parsedAddresses.length > 0 && !isAddingNew && (
            <>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>{t.selectAddress}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', maxHeight: '250px', overflowY: 'auto' }}>
                {parsedAddresses.map((addr: any, idx: number) => (
                  <div key={idx} onClick={() => { setSelectedAddrIndex(idx); setManualPincode(''); setShowAddressSelector(false); }} style={{ padding: '10px 12px', background: selectedAddrIndex === idx ? '#e0f2fe' : '#ffffff', border: selectedAddrIndex === idx ? '2px solid #0284c7' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s' }}>
                    <div style={{ fontSize: '16px' }}>📍</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', marginBottom: '2px' }}>
                        {addr.name || 'Address'} 
                        {addr.isMain && <span style={{ background: '#fef08a', color: '#b45309', padding: '2px 6px', fontSize: '10px', borderRadius: '4px', marginLeft: '6px' }}>Main Profile</span>}
                        {selectedAddrIndex === idx && <span style={{ color: '#0284c7', fontSize: '11px', marginLeft: '5px' }}>✓</span>}
                      </strong>
                      <span style={{ color: '#475569' }}>{addr.address || addr.street} <br/> {addr.block ? addr.block + ', ' : ''}{addr.district ? addr.district + ', ' : ''}{addr.state} {addr.pincode ? `- ${addr.pincode}` : ''}</span>
                    </div>
                    {/* EDIT & DELETE BUTTONS */}
                    <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                      <button onClick={(e) => handleEditAddress(idx, e)} style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#2563eb' }}>✏️</button>
                      {!addr.isMain && <button onClick={(e) => handleDeleteAddress(idx, e)} style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#ef4444' }}>🗑️</button>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* 🔥 ADD / EDIT FORM 🔥 */}
          {!isAddingNew ? (
            <button onClick={() => { setIsAddingNew(true); setEditingIndex(null); setNewAddr({ name: '', address: '', block: '', district: '', state: '', pincode: '' }); }} style={{ background: '#ffffff', color: '#2874f0', border: '1px dashed #2874f0', padding: '10px', width: '100%', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>
              {t.addNewAddrBtn}
            </button>
          ) : (
            <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>{editingIndex !== null ? t.updateAddrBtn : t.addNewAddrBtn}</div>
              
              <ReactTransliterate 
                value={newAddr.name} 
                onChangeText={(text) => setNewAddr({...newAddr, name: text})} 
                lang={currentLang} 
                placeholder={isHindi ? "पूरा नाम" : "Full Name"} 
                style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
              />
              <ReactTransliterate 
                value={newAddr.address} 
                onChangeText={(text) => setNewAddr({...newAddr, address: text})} 
                lang={currentLang} 
                placeholder={isHindi ? "घर का पूरा पता (Gali, Landmark)" : "Complete Address"} 
                renderComponent={(props) => <textarea {...props} rows={2} />}
                style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
              />
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  {!customState ? (
                    <select 
                      value={newAddr.state} 
                      onChange={(e) => {
                        if(e.target.value === 'OTHER') { setCustomState(true); setNewAddr({...newAddr, state: '', district: '', block: ''}); setCustomDistrict(true); }
                        else { setNewAddr({...newAddr, state: e.target.value, district: '', block: ''}); setCustomDistrict(false); }
                      }} 
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                    >
                      <option value="">-- {isHindi ? "राज्य चुनें" : "State"} --</option>
                      {Object.keys(STATE_DISTRICT_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="OTHER" style={{fontWeight: 'bold', color: '#fb641b'}}>➕ {t.otherTypeNew}</option>
                    </select>
                  ) : (
                    <div style={{display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden'}}>
                      <ReactTransliterate value={newAddr.state} onChangeText={(text) => setNewAddr({...newAddr, state: text})} lang={currentLang} placeholder={isHindi ? "राज्य का नाम" : "State"} style={{ flex: 1, padding: '10px', border: 'none', outline: 'none' }} />
                      <button onClick={() => {setCustomState(false); setCustomDistrict(false); setNewAddr({...newAddr, state: '', district: ''});}} style={{background: '#f8fafc', borderLeft: '1px solid #cbd5e1', borderTop: 'none', borderBottom: 'none', borderRight: 'none', padding: '0 10px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold'}}>✖</button>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  {(!customState && !customDistrict) ? (
                    <select 
                      value={newAddr.district} 
                      onChange={(e) => {
                        if(e.target.value === 'OTHER') { setCustomDistrict(true); setNewAddr({...newAddr, district: '', block: ''}); }
                        else { setNewAddr({...newAddr, district: e.target.value, block: ''}); }
                      }} 
                      disabled={!newAddr.state}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: !newAddr.state ? '#f1f5f9' : '#fff' }}
                    >
                      <option value="">-- {isHindi ? "जिला चुनें" : "District"} --</option>
                      {newAddr.state && STATE_DISTRICT_DATA[newAddr.state]?.map(d => <option key={d} value={d}>{d}</option>)}
                      {newAddr.state && <option value="OTHER" style={{fontWeight: 'bold', color: '#fb641b'}}>➕ {t.otherTypeNew}</option>}
                    </select>
                  ) : (
                    <div style={{display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden'}}>
                      <ReactTransliterate value={newAddr.district} onChangeText={(text) => setNewAddr({...newAddr, district: text})} lang={currentLang} placeholder={isHindi ? "जिले का नाम" : "District"} style={{ flex: 1, padding: '10px', border: 'none', outline: 'none' }} />
                      {!customState && <button onClick={() => {setCustomDistrict(false); setNewAddr({...newAddr, district: ''});}} style={{background: '#f8fafc', borderLeft: '1px solid #cbd5e1', borderTop: 'none', borderBottom: 'none', borderRight: 'none', padding: '0 10px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold'}}>✖</button>}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  {!customBlock ? (
                    <select 
                      value={newAddr.block} 
                      onChange={(e) => {
                        if(e.target.value === 'OTHER') { setCustomBlock(true); setNewAddr({...newAddr, block: ''}); }
                        else { setNewAddr({...newAddr, block: e.target.value}); }
                      }} 
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                    >
                      <option value="">-- {isHindi ? "ब्लॉक चुनें" : "Block"} --</option>
                      {COMMON_BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
                      <option value="OTHER" style={{fontWeight: 'bold', color: '#fb641b'}}>➕ {t.otherTypeNew}</option>
                    </select>
                  ) : (
                    <div style={{display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden'}}>
                      <ReactTransliterate value={newAddr.block} onChangeText={(text) => setNewAddr({...newAddr, block: text})} lang={currentLang} placeholder={isHindi ? "ब्लॉक का नाम" : "Block"} style={{ flex: 1, padding: '10px', border: 'none', outline: 'none' }} />
                      <button onClick={() => {setCustomBlock(false); setNewAddr({...newAddr, block: ''});}} style={{background: '#f8fafc', borderLeft: '1px solid #cbd5e1', borderTop: 'none', borderBottom: 'none', borderRight: 'none', padding: '0 10px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold'}}>✖</button>
                    </div>
                  )}
                </div>

                <input type="number" maxLength={6} placeholder={isHindi ? "पिनकोड*" : "Pincode*"} value={newAddr.pincode} onChange={(e) => setNewAddr({...newAddr, pincode: e.target.value.replace(/[^0-9]/g, '')})} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={resetForm} style={{ flex: 1, background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button onClick={handleSaveNewAddress} disabled={isSaving} style={{ flex: 1, background: '#fb641b', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isSaving ? "Saving..." : (editingIndex !== null ? t.updateAddrBtn : t.saveAddress)}
                </button>
              </div>
            </div>
          )}

          {!isAddingNew && (
            <>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>{t.orNewPincode}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input type="number" maxLength={6} placeholder={t.enterPincode} value={tempPincode} onChange={(e) => { if (e.target.value.length <= 6) setTempPincode(e.target.value); }} style={{ flex: '1 1 150px', padding: '10px 12px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '14px', outline: 'none' }} />
                <button onClick={() => { setManualPincode(tempPincode); setSelectedAddrIndex(null); setShowAddressSelector(false); }} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>
                  {t.checkBtn}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ⏳ LOADING */}
      {loading && (
        <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="loader" style={{ width: '14px', height: '14px', border: '2px solid #cbd5e1', borderTop: '2px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>{t.calculating}</span>
        </div>
      )}

      {/* ✅ FINAL DELIVERY TIME RESULT */}
      {!loading && deliveryData && (
        <div style={{ padding: '12px 15px', background: deliveryData.bg, borderRadius: '8px', border: `1px solid ${deliveryData.border}`, display: 'flex', alignItems: 'center' }}>
           <div style={{ fontSize: '16px', fontWeight: '900', color: deliveryData.color }}>
             {deliveryData.text}
           </div>
        </div>
      )}

    </div>
  );
}