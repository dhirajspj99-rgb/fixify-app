"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsManager({ appSettings, setAppSettings, commissionRate, setCommissionRate, deliveryBoyCommRate, setDeliveryBoyCommRate, fetchData }: any) {
  const [uploadingQr, setUploadingQr] = useState(false);

  const saveCompanySettings = async () => {
    const { error } = await supabase.from('app_settings').update({ 
      ...appSettings, commission_rate: commissionRate, delivery_boy_comm_rate: deliveryBoyCommRate 
    }).eq('id', 1);
    if (error) alert(error.message); else alert("✅ Company & Commission Updated!");
  };

  const handleSaveUpi = async (upiField: string) => {
    try {
      // @ts-ignore
      const upiValue = appSettings[upiField];
      // Map frontend state name to database column name
      let dbField = upiField;
      if (upiField === 'deliveryBoyUpi') dbField = 'delivery_boy_upi';
      
      const { error } = await supabase.from('app_settings').update({ [dbField]: upiValue }).eq('id', 1);
      if (error) throw error; 
      alert(`✅ UPI ID Successfully Saved!`);
    } catch (err: any) { alert("Error saving UPI: " + err.message); }
  };

  const handleDynamicQrUpload = async (e: any, type: string) => {
    const file = e.target.files[0]; if (!file) return; setUploadingQr(true);
    try {
      const fileExt = file.name.split('.').pop(); const fileName = `${type}_qr_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('admin_documents').upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('admin_documents').getPublicUrl(fileName);
      setAppSettings((prev:any) => ({ ...prev, [`${type}Qr`]: publicUrl }));
      await supabase.from('app_settings').update({ [`${type}Qr`]: publicUrl }).eq('id', 1);
      alert(`✅ ${type.toUpperCase()} QR Code Uploaded & Saved!`);
    } catch (err: any) { alert("Error: " + err.message); } setUploadingQr(false);
  };

  return (
    <div className="fade-in">
      <h2 style={{ color: '#f59e0b', marginTop: 0 }}>⚙️ Company, GST & Payment Gateways (UPI/QR)</h2>
      
      {/* Company Info */}
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#f59e0b' }}>🏢 Guest App Company Details (GST & Address)</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input placeholder="Company Name" value={appSettings.company_name || ''} onChange={e=>setAppSettings({...appSettings, company_name:e.target.value})} style={inpStyle} />
          <input placeholder="Customer Care Phone" value={appSettings.company_phone || ''} onChange={e=>setAppSettings({...appSettings, company_phone:e.target.value})} style={inpStyle} />
          <input placeholder="GST No." value={appSettings.company_gst || ''} onChange={e=>setAppSettings({...appSettings, company_gst:e.target.value})} style={inpStyle} />
          <input placeholder="Registered Office Address" value={appSettings.company_address || ''} onChange={e=>setAppSettings({...appSettings, company_address:e.target.value})} style={{...inpStyle, flex: '2'}} />
        </div>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div><label style={{fontSize:'12px', color:'#94a3b8', display:'block'}}>Admin Commission %</label><input type="number" value={commissionRate} onChange={e=>setCommissionRate(Number(e.target.value))} style={inpStyle} /></div>
          <div><label style={{fontSize:'12px', color:'#94a3b8', display:'block'}}>Delivery Boy Commission %</label><input type="number" value={deliveryBoyCommRate} onChange={e=>setDeliveryBoyCommRate(Number(e.target.value))} style={inpStyle} /></div>
        </div>
        <button onClick={saveCompanySettings} style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save Info & Commissions</button>
      </div>

      {/* UPI & QR Section */}
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#38bdf8' }}>🏦 Dedicated UPI IDs & QR Code Scanners</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* 1. Wallet Recharge UPI */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '14px' }}>💳 Wallet Recharge UPI</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input value={appSettings.wallet_upi || ''} onChange={e=>setAppSettings({...appSettings, wallet_upi:e.target.value})} placeholder="wallet@upi" style={inpStyle} />
              <button onClick={() => handleSaveUpi('wallet_upi')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold' }}>Save</button>
            </div>
          </div>

          {/* 2. Shopping Checkout UPI & QR */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#38bdf8', fontSize: '14px' }}>🛒 Shopping Checkout UPI & QR</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input value={appSettings.shoppingUpi || ''} onChange={e=>setAppSettings({...appSettings, shoppingUpi:e.target.value})} placeholder="shop@upi" style={inpStyle} />
              <button onClick={() => handleSaveUpi('shoppingUpi')} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold' }}>Save</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize:'12px' }}>
                {uploadingQr ? 'Uploading...' : 'Upload QR Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDynamicQrUpload(e, 'shopping')} disabled={uploadingQr} />
              </label>
              {appSettings.shoppingQr && <img src={appSettings.shoppingQr} alt="QR" style={{ width: '35px', height: '35px', borderRadius: '4px' }} />}
            </div>
          </div>

          {/* 3. Labour Booking UPI & QR */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#34d399', fontSize: '14px' }}>👷 Labour Booking UPI & QR</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input value={appSettings.labourUpi || ''} onChange={e=>setAppSettings({...appSettings, labourUpi:e.target.value})} placeholder="labour@upi" style={inpStyle} />
              <button onClick={() => handleSaveUpi('labourUpi')} style={{ background: '#34d399', color: '#0f172a', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold' }}>Save</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid #34d399', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize:'12px' }}>
                {uploadingQr ? 'Uploading...' : 'Upload QR Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDynamicQrUpload(e, 'labour')} disabled={uploadingQr} />
              </label>
              {appSettings.labourQr && <img src={appSettings.labourQr} alt="QR" style={{ width: '35px', height: '35px', borderRadius: '4px' }} />}
            </div>
          </div>

          {/* 4. ID Card Download UPI & QR */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#a78bfa', fontSize: '14px' }}>🪪 ID Card Download UPI & QR</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input value={appSettings.idCardUpi || ''} onChange={e=>setAppSettings({...appSettings, idCardUpi:e.target.value})} placeholder="idcard@upi" style={inpStyle} />
              <button onClick={() => handleSaveUpi('idCardUpi')} style={{ background: '#a78bfa', color: '#0f172a', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold' }}>Save</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid #a78bfa', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize:'12px' }}>
                {uploadingQr ? 'Uploading...' : 'Upload QR Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDynamicQrUpload(e, 'idCard')} disabled={uploadingQr} />
              </label>
              {appSettings.idCardQr && <img src={appSettings.idCardQr} alt="QR" style={{ width: '35px', height: '35px', borderRadius: '4px' }} />}
            </div>
          </div>

          {/* 5. Premium Subscription UPI & QR */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#f59e0b', fontSize: '14px' }}>⭐ Premium Subscription UPI & QR</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input value={appSettings.premiumUpi || ''} onChange={e=>setAppSettings({...appSettings, premiumUpi:e.target.value})} placeholder="premium@upi" style={inpStyle} />
              <button onClick={() => handleSaveUpi('premiumUpi')} style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold' }}>Save</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid #f59e0b', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize:'12px' }}>
                {uploadingQr ? 'Uploading...' : 'Upload QR Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDynamicQrUpload(e, 'premium')} disabled={uploadingQr} />
              </label>
              {appSettings.premiumQr && <img src={appSettings.premiumQr} alt="QR" style={{ width: '35px', height: '35px', borderRadius: '4px' }} />}
            </div>
          </div>

          {/* 6. Delivery Boy COD Scanner / UPI */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ec4899', fontSize: '14px' }}>🚚 Delivery Boy COD Scanner UPI</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input value={appSettings.delivery_boy_upi || appSettings.deliveryBoyUpi || ''} onChange={e=>setAppSettings({...appSettings, deliveryBoyUpi:e.target.value})} placeholder="delivery@upi" style={inpStyle} />
              <button onClick={() => handleSaveUpi('deliveryBoyUpi')} style={{ background: '#ec4899', color: 'white', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold' }}>Save</button>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>* Delivery boy iska use Cash on Delivery (COD) collect karne ke liye karenge.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

const inpStyle = { padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', flex: 1, minWidth: '160px', boxSizing: 'border-box' as const };