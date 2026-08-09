"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// 🔥 FIX: ProfileField ko main function ke bahar nikala taaki typing mein focus na hate
const ProfileField = ({ label, value, isEditing, onChange, type="text", placeholder="" }: any) => (
  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
    {isEditing ? (
      type === 'textarea' ? (
        <textarea value={value} onChange={onChange} style={{...inputStyle, height: '80px', resize: 'none'}} placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={onChange} style={inputStyle} placeholder={placeholder} />
      )
    ) : (
      <div style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 'bold', padding: '8px 0', borderBottom: '1px dashed #334155' }}>
        {value || <span style={{ color: '#64748b', fontStyle: 'italic', fontWeight: 'normal' }}>Not Provided</span>}
      </div>
    )}
  </div>
);

export default function ShopProfile({ currentShop, setCurrentShop, onClose, fetchAuthAndData, idCardUpi, registrationUpi }: any) {
  
  // 🔥 View / Edit States 🔥
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Editable States (Pre-filled with existing shop data)
  const [editShopName, setEditShopName] = useState(currentShop?.name || '');
  const [editGstNumber, setEditGstNumber] = useState(currentShop?.gst_number || ''); 
  const [editUpiId, setEditUpiId] = useState(currentShop?.upi_id || '');
  const [editBankAccount, setEditBankAccount] = useState(currentShop?.bank_account || '');
  
  // Location States
  const [editState, setEditState] = useState(currentShop?.state || '');
  const [editDistrict, setEditDistrict] = useState(currentShop?.district || '');
  const [editBlock, setEditBlock] = useState(currentShop?.block || '');
  const [editPincode, setEditPincode] = useState(currentShop?.pincode || '');
  const [editAddress, setEditAddress] = useState(currentShop?.address || '');

  // Photo & Upload States
  const [profilePic, setProfilePic] = useState(currentShop?.profile_pic || '');
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Other Existing States
  const [referralCode, setReferralCode] = useState(''); 
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [isCertPaymentModalOpen, setIsCertPaymentModalOpen] = useState(false); 

  // 🔥 NAYA: PASSWORD CHANGE STATES 🔥
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // 🔥 1. SECURE EDIT VERIFICATION 🔥
  const handleEditClick = () => {
    setShowAuthModal(true);
  };

  const verifyPassword = async () => {
    if (!authPassword) {
      return alert("❌ Kripya password dalein.");
    }
    
    setIsVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let isSuccess = false;

      if (session?.user?.email) {
        const { error } = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: authPassword,
        });
        if (!error) isSuccess = true;
      }

      if (!isSuccess) {
        const { data: verifyData } = await supabase.from('shops').select('password').eq('id', currentShop?.id).single();
        if (verifyData && authPassword === verifyData.password) isSuccess = true;
      }

      if (isSuccess) {
        setIsEditing(true);
        setShowAuthModal(false);
        setAuthPassword(''); 
      } else {
        alert("❌ Galat Password! Kripya apna sahi login password dalein.");
      }
    } catch (err: any) {
      alert("❌ Password verify karne mein error: " + err.message);
    }
    setIsVerifying(false);
  };

  // 🔥 2. PASSWORD CHANGE HANDLER 🔥
  const handlePasswordChange = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      return alert("Kripya sabhi password fields bharein!");
    }
    if (newPass !== confirmPass) {
      return alert("Naya Password aur Confirm Password match nahi kar rahe hain!");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPass)) {
      return alert("Password kam se kam 8 character ka hona chahiye, jisme 1 Bada akshar (A-Z), 1 Chota akshar (a-z), 1 Number (0-9) aur 1 Unique symbol (@, #, $) hona zaroori hai.");
    }

    setIsUpdatingPass(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) throw new Error("User session nahi mila!");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: oldPass,
      });

      if (signInError) throw new Error("Purana Password galat hai!");

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPass
      });

      if (updateError) throw updateError;

      alert("🔐 Password successfully change ho gaya hai!");
      setOldPass(''); setNewPass(''); setConfirmPass('');
      setShowPasswordSection(false);

    } catch (e: any) {
      alert("❌ Error: " + e.message);
    } finally {
      setIsUpdatingPass(false);
    }
  };

  // 🔥 3. PROFILE PHOTO UPLOAD 🔥
  const handlePhotoUpload = async (e: any) => {
    if (!currentShop?.id) return alert("Pehle basic details daal kar Save karein, phir photo upload hogi!");
    
    const file = e.target.files[0]; 
    if (!file) return;
    
    setIsUploadingPic(true);
    try {
      const fileName = `shop_pic_${currentShop.phone}_${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('labour_documents').upload(fileName, file);
      const { data } = supabase.storage.from('labour_documents').getPublicUrl(fileName);
      
      const newPicUrl = data.publicUrl;
      await supabase.from('shops').update({ profile_pic: newPicUrl }).eq('id', currentShop.id);
      
      setProfilePic(newPicUrl);
      setCurrentShop((prev: any) => ({ ...prev, profile_pic: newPicUrl }));
      alert("✅ Profile Photo Updated!");
    } catch (err: any) { 
      alert("Photo Upload Error: " + err.message); 
    }
    setIsUploadingPic(false);
  };

  // 🔥 4. SAVE ALL DETAILS 🔥
  const handleUpdateProfile = async () => {
    if (!editShopName || !editState || !editDistrict || !editPincode) {
        return alert("❌ Name, State, District aur Pincode bharna zaroori hai!");
    }

    setIsSaving(true);
    const payload = { 
      name: editShopName, 
      gst_number: editGstNumber,
      upi_id: editUpiId, 
      bank_account: editBankAccount,
      state: editState,
      district: editDistrict,
      block: editBlock,
      pincode: editPincode,
      address: editAddress
    };
    
    try {
      if (currentShop.id) { 
        const { error } = await supabase.from('shops').update(payload).eq('id', currentShop.id); 
        if (error) throw error;
        setCurrentShop((prev:any) => ({ ...prev, ...payload }));
      } else { 
        const { data, error } = await supabase.from('shops').insert([{ ...payload, phone: currentShop.phone }]).select().single(); 
        if (error) throw error;
        if (data) setCurrentShop(data); 
      }
      
      alert("✅ Profile Details Saved Successfully!"); 
      setIsEditing(false); 
      if(fetchAuthAndData) fetchAuthAndData(); 
    } catch (err: any) {
      alert("Error saving profile: " + err.message);
    }
    setIsSaving(false);
  };

  const handleApplyReferral = () => {
    if (!referralCode.trim()) return alert("Kripya ek valid referral code dalein!");
    alert(`✅ Referral Code '${referralCode}' Applied! Rs 25 Cashback will be credited to your Admin Wallet shortly.`);
    setReferralCode('');
  };

  const handleDocUpload = async (e: any, field: string) => {
    if (!currentShop?.id) return alert("Pehle Text Details save karein!");
    const file = e.target.files[0]; if (!file) return;
    setUploadingDoc(field);
    try {
      const fileName = `${currentShop.phone}_${field}_${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('labour_documents').upload(fileName, file);
      const { data } = supabase.storage.from('labour_documents').getPublicUrl(fileName);
      await supabase.from('shops').update({ [field]: data.publicUrl }).eq('id', currentShop.id);
      setCurrentShop((prev: any) => ({ ...prev, [field]: data.publicUrl }));
      alert(`✅ Upload Successful!`);
    } catch (err: any) { alert("Error: " + err.message); }
    setUploadingDoc(null);
  };

  // 🔥 5. A4 CERTIFICATE DOWNLOAD 🔥
  const handleConfirmCertificateDownload = async () => {
    alert("✅ Payment of ₹200 recorded! Generating your Certificate in A4 Size...");
    setIsCertPaymentModalOpen(false);
    
    const element = document.getElementById('print-certificate-container');
    if (!element) return;
    
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = { 
        margin: 0, 
        filename: `Fixifiy_Certificate_${currentShop.phone}.pdf`, 
        image: { type: 'jpeg', quality: 1.0 }, 
        html2canvas: { scale: 3, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };

    await html2pdf().set(opt).from(element).save();
    alert("🎉 Certificate Downloaded! Aap ise A4 paper par print nikalwa kar dukan mein laga sakte hain.");
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{...modalContentStyle, maxWidth: '600px'}}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #334155', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: '#38bdf8', margin: 0 }}>
            {isEditing ? '✏️ Edit Shop Profile' : '🏪 Shop Profile'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '24px', cursor: 'pointer' }}>✖</button>
        </div>

        {/* 🔥 PHOTO SECTION 🔥 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px' }}>
          <div style={{ position: 'relative' }}>
            {profilePic ? (
              <img src={profilePic} alt="Shop" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #38bdf8' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#334155', border: '4px solid #38bdf8', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }}>🏪</div>
            )}
            
            {isEditing && (
              <label style={{ position: 'absolute', bottom: '0', right: '0', background: '#10b981', color: 'white', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                {isUploadingPic ? '⏳' : '📷'}
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPic} />
              </label>
            )}
          </div>
          {isEditing && <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>Tap camera icon to update photo</p>}
        </div>
        
        {/* 🔥 BUSINESS DETAILS 🔥 */}
        <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
          <h3 style={{ color: '#38bdf8', fontSize: '15px', marginTop: 0, marginBottom: '15px', borderBottom: '1px dashed #334155', paddingBottom: '8px' }}>Business & Payment Details</h3>
          
          <ProfileField label="Shop Name (Dukan ka Naam)" value={editShopName} isEditing={isEditing} onChange={(e:any) => setEditShopName(e.target.value)} placeholder="e.g. Sharma Hardware" />
          <ProfileField label="GST Number" value={editGstNumber} isEditing={isEditing} onChange={(e:any) => setEditGstNumber(e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <ProfileField label="UPI ID" value={editUpiId} isEditing={isEditing} onChange={(e:any) => setEditUpiId(e.target.value)} placeholder="example@ybl" />
            <ProfileField label="Bank Account Details" value={editBankAccount} isEditing={isEditing} onChange={(e:any) => setEditBankAccount(e.target.value)} placeholder="A/C No. & IFSC" />
          </div>
        </div>

        {/* 🔥 LOCATION DETAILS 🔥 */}
        <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
          <h3 style={{ color: '#38bdf8', fontSize: '15px', marginTop: 0, marginBottom: '15px', borderBottom: '1px dashed #334155', paddingBottom: '8px' }}>Location Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <ProfileField label="State (Rajya)" value={editState} isEditing={isEditing} onChange={(e:any) => setEditState(e.target.value)} placeholder="e.g. Bihar" />
            <ProfileField label="District (Zila)" value={editDistrict} isEditing={isEditing} onChange={(e:any) => setEditDistrict(e.target.value)} placeholder="e.g. Patna" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <ProfileField label="Block / Area" value={editBlock} isEditing={isEditing} onChange={(e:any) => setEditBlock(e.target.value)} placeholder="e.g. Danapur" />
            <ProfileField label="Pincode" value={editPincode} isEditing={isEditing} onChange={(e:any) => setEditPincode(e.target.value)} placeholder="e.g. 800001" type="number" />
          </div>

          <ProfileField label="Full Address (Pura Pata)" value={editAddress} isEditing={isEditing} onChange={(e:any) => setEditAddress(e.target.value)} placeholder="Gali number, Landmark, etc." type="textarea" />
        </div>

        {/* 🔥 SECURITY & PASSWORD SETTINGS 🔥 */}
        <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
          <div 
            onClick={() => setShowPasswordSection(!showPasswordSection)} 
            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold', color: '#f8fafc' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🔒 Change Login Password</span>
            <span style={{ color: '#94a3b8' }}>{showPasswordSection ? '▲' : '▼'}</span>
          </div>
          
          {showPasswordSection && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px', display: 'block' }}>Old Password</label>
                <input type="password" placeholder="Purana password dalein" value={oldPass} onChange={e => setOldPass(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px', display: 'block' }}>New Password</label>
                <input type={showPass ? "text" : "password"} placeholder="Naya password dalein" value={newPass} onChange={e => setNewPass(e.target.value)} style={inputStyle} />
                <span onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '15px', top: '35px', cursor: 'pointer', fontSize: '16px' }}>{showPass ? "🙈" : "👁️"}</span>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px', display: 'block' }}>Confirm New Password</label>
                <input type={showPass ? "text" : "password"} placeholder="Dobara naya password dalein" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} style={inputStyle} />
                <span onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '15px', top: '35px', cursor: 'pointer', fontSize: '16px' }}>{showPass ? "🙈" : "👁️"}</span>
              </div>

              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '5px 0' }}>*Password: Min 8 chars, 1 Capital, 1 Small, 1 Number, 1 Special Char (@,#,$)</p>
              
              <button onClick={handlePasswordChange} disabled={isUpdatingPass} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: isUpdatingPass ? 'not-allowed' : 'pointer', marginTop: '5px' }}>
                {isUpdatingPass ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ marginBottom: '30px' }}>
          {!isEditing ? (
            <button onClick={handleEditClick} style={{ backgroundColor: '#3b82f6', color: 'white', width: '100%', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
              ✏️ EDIT PROFILE
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsEditing(false)} style={{ backgroundColor: '#475569', color: 'white', flex: 1, padding: '15px', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                ❌ Cancel
              </button>
              <button onClick={handleUpdateProfile} disabled={isSaving || isUploadingPic} style={{ backgroundColor: '#10b981', color: 'white', flex: 2, padding: '15px', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                {isSaving ? '⏳ Saving...' : '💾 SAVE UPDATES'}
              </button>
            </div>
          )}
        </div>

        {/* REFERRAL & UPLOAD SECTIONS */}
        <div style={{ backgroundColor: '#064e3b', padding: '20px', borderRadius: '12px', border: '1px solid #10b981', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>🎁 Refer & Earn Cashback</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#a7f3d0' }}>
            Share your code: <strong style={{ background: '#022c22', padding: '4px 8px', borderRadius: '4px', border: '1px dashed #34d399' }}>FIXIFIY-{currentShop?.phone}</strong>
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Enter Friend's Code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} style={{ ...inputStyle, margin: 0, flex: 1, backgroundColor: '#022c22', border: '1px solid #059669', color: '#fff' }} />
            <button onClick={handleApplyReferral} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Apply</button>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e3a8a', padding: '20px', borderRadius: '12px', border: '1px solid #3b82f6', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '15px' }}>Upload Shop Documents</h3>
          {['profile_pic', 'aadhar_card', 'upi_qr'].map(doc => (
            <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{doc.replace('_', ' ')} {currentShop?.[doc] && '✅'}</span>
              <label style={{backgroundColor: '#38bdf8', color: '#000', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}>
                {uploadingDoc === doc ? '⏳...' : 'Upload'}
                <input type="file" style={{display: 'none'}} onChange={(e) => handleDocUpload(e, doc)} />
              </label>
            </div>
          ))}
        </div>

        {/* 🔥 NEW CERTIFICATE PREVIEW AND DOWNLOAD 🔥 */}
        {currentShop?.id && (
          <div style={{ borderTop: '2px dashed #334155', paddingTop: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: '#facc15', fontSize: '18px', marginBottom: '5px', textAlign: 'center' }}>📜 Certified Partner Document</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>Aapki Dukan ka Verified Certificate aur Terms & Conditions</p>
            
            <button onClick={() => setIsCertPaymentModalOpen(true)} style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', color: 'white', padding: '15px 25px', border: 'none', borderRadius: '10px', marginBottom: '20px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', width: '100%' }}>
              💳 Pay ₹200 & Download Certificate (PDF)
            </button>
          </div>
        )}

      </div>

      {/* 🔥 HIDDEN A4 CERTIFICATE (FOR PDF EXPORT) 🔥 */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <div id="print-certificate-container" style={{ width: '210mm', backgroundColor: '#fff', color: '#000', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
          
          <div style={{ width: '210mm', height: '297mm', padding: '15mm', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ border: '5px double #1e3a8a', padding: '15mm', height: '100%', boxSizing: 'border-box', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '45px', color: '#1e3a8a', fontWeight: '900', marginBottom: '10px', letterSpacing: '2px' }}>FIXIFIY</div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '40px', letterSpacing: '4px', textTransform: 'uppercase' }}>Digital Commerce Technology</div>
                
                <div style={{ fontSize: '28px', color: '#d97706', marginBottom: '30px', fontWeight: 'bold', letterSpacing: '1px', borderBottom: '2px solid #d97706', display: 'inline-block', paddingBottom: '10px' }}>VERIFIED PARTNER CERTIFICATE</div>
                
                <div style={{ margin: '30px 0' }}><span style={{ fontSize: '80px' }}>🛡️</span></div>
                
                <p style={{ fontSize: '20px', fontStyle: 'italic', marginBottom: '15px', color: '#475569' }}>This is to certify that</p>
                <h2 style={{ fontSize: '38px', color: '#0f172a', margin: '0 0 20px 0', textTransform: 'uppercase', fontWeight: '900' }}>{editShopName || 'YOUR SHOP NAME'}</h2>
                
                <p style={{ fontSize: '18px', color: '#334155', lineHeight: '1.6', marginBottom: '40px' }}>
                  Owned / Managed by: <strong>{currentShop?.phone}</strong><br/><br/>
                  Located at:<br/>
                  <strong style={{ fontSize: '22px', color: '#1e293b' }}>
                    {editAddress ? `${editAddress},` : ''} {editBlock ? `${editBlock},` : ''} <br/>
                    {editDistrict ? `${editDistrict},` : ''} {editState} - {editPincode || 'XXXXXX'}
                  </strong><br/><br/>
                  is an authorized and trusted shop partner of <strong>Fixifiy Technology</strong>.
                </p>
                
                <div style={{ marginTop: '50px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', padding: '0 20px', borderTop: '2px dashed #cbd5e1', paddingTop: '20px' }}>
                    <div>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Partner ID:</strong> MHDV-{currentShop?.id || 'NEW'}</p>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>GST No:</strong> {editGstNumber || 'Not Provided'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Date of Issue:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                      <p style={{ margin: '5px 0', fontSize: '16px', color: currentShop?.is_prime ? '#d97706' : '#10b981', fontWeight: 'bold' }}>
                        <strong>Status:</strong> {currentShop?.is_prime ? 'Premium Partner ⭐' : 'Verified Partner ✅'}
                      </p>
                    </div>
                </div>
                
                <div style={{ position: 'absolute', bottom: '30mm', width: 'calc(100% - 30mm)', left: '15mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ borderTop: '2px solid #000', width: '200px', paddingTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>Authorized Signatory</div>
                    <div style={{ borderTop: '2px solid #000', width: '200px', paddingTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>Fixifiy Admin</div>
                </div>
            </div>
          </div>

          <div style={{ pageBreakBefore: 'always' }}></div>

          <div style={{ width: '210mm', height: '297mm', padding: '20mm', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#1e3a8a', textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', fontSize: '28px' }}>Fixifiy Technology Partner Terms & Conditions</h2>
            <div style={{ fontSize: '16px', lineHeight: '2', color: '#334155', textAlign: 'justify' }}>
                <p><strong>1. Partnership Agreement:</strong> By accepting orders via Fixifiy Technology, the Shop Owner agrees to maintain the highest standards of product quality, ethical pricing, and customer service.</p>
                <p><strong>2. Order Fulfillment:</strong> The partner must ensure that all accepted orders are packed properly, billed accurately, and handed over to the assigned Fixifiy Delivery Partner in a timely manner to ensure rapid delivery.</p>
                <p><strong>3. Commission & Payouts:</strong> Fixifiy Technology will deduct a standard platform commission (currently fixed at 5%) from the gross item value. Delivery charges (if any) are collected separately. Net payouts will be settled directly to the Shop Owner's registered Bank or UPI account via the Ledger Wallet.</p>
                <p><strong>4. Inventory Management:</strong> The Shop Owner is strictly responsible for maintaining accurate live stock levels on the platform dashboard to avoid order cancellations and negative customer experiences.</p>
                <p><strong>5. Return & Refund Policy:</strong> The Shop Owner must honor the return policy (24 Hours, 7 Days, or No Return) selected and communicated during the order packing. In case of verified returns picked up by our delivery partners, the refund amount will be auto-deducted from the shop's ledger balance and restocked to the digital inventory.</p>
                <p><strong>6. Compliance & Legal:</strong> The partner must comply with all local tax (GST) laws, trading standards, and Fixifiy Technology guidelines. Fixifiy Technology reserves the right to suspend or terminate the partnership permanently in case of fraud, fake products, or severe violation of policies.</p>
                <br/><br/><br/><br/>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', borderTop: '1px dashed #cbd5e1', paddingTop: '20px' }}>
                  This is a digitally generated document and agreement by Fixifiy Technology. No physical signature is required for these terms to be legally binding.
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 PASSWORD AUTH MODAL FOR EDITING 🔥 */}
      {showAuthModal && (
        <div style={{...modalOverlayStyle, zIndex: 10005}}>
          <div style={{...modalContentStyle, textAlign: 'center', maxWidth: '350px'}}>
            <h2 style={{color: '#f8fafc', marginTop: 0}}>🔒 Security Check</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Profile update karne ke liye apna Login Password dalein.</p>
            <input type="password" placeholder="Enter Password..." value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ ...inputStyle, textAlign: 'center', letterSpacing: '2px', fontSize: '16px', marginBottom: '25px' }} />
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setShowAuthModal(false)} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#334155', color: 'white', flex: 1, fontWeight: 'bold', cursor: 'pointer' }}>❌ Cancel</button>
              <button onClick={verifyPassword} disabled={isVerifying} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#0f172a', flex: 1, fontWeight: 'bold', cursor: isVerifying ? 'not-allowed' : 'pointer' }}>
                {isVerifying ? '⏳ Verifying...' : '✅ Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE PAYMENT MODAL */}
      {isCertPaymentModalOpen && (
        <div style={{...modalOverlayStyle, zIndex: 10005}}>
          <div style={{...modalContentStyle, textAlign: 'center', border: '2px solid #f59e0b'}}>
            <h2 style={{color: '#f59e0b', marginTop: 0}}>Partner Certificate Download</h2>
            <p style={{color: '#cbd5e1'}}>PDF Certificate Generate karne ke liye Admin ko <strong>₹200</strong> pay karein.</p>
            <div style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'inline-block', margin: '20px 0' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${idCardUpi}&pn=Fixifiy&am=200&cu=INR`} alt="QR ₹200" style={{width: '180px', height: '180px'}} />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setIsCertPaymentModalOpen(false)} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#334155', color: 'white', flex: 1, fontWeight: 'bold', cursor: 'pointer' }}>❌ Cancel</button>
              <button onClick={handleConfirmCertificateDownload} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', flex: 1, fontWeight: 'bold', cursor: 'pointer' }}>✅ Paid? Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '12px', margin: '0', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', boxSizing: 'border-box', outline: 'none', transition: '0.3s' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px', overflowY: 'auto' };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', width: '100%', border: '1px solid #38bdf8', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', margin: 'auto', overflowY: 'auto', maxHeight: '90vh' };