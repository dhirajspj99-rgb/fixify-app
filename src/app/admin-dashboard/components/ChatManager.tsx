"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ChatManager({ chats, customers, fetchData }: any) {
  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Unique users jinhone chat ki hai unki list nikalna
  const uniqueChatPhones = Array.from(new Set(chats.map((c: any) => c.user_phone))).filter(Boolean);

  const handleSendAdminChat = async () => {
    if (!chatInput.trim() || !selectedUserPhone) return;
    try {
      const { error } = await supabase.from('support_chats').insert([{
        sender: 'Master Admin',
        role: 'admin',
        msg: chatInput.trim(),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        user_phone: selectedUserPhone
      }]);
      if (error) throw error;
      setChatInput('');
      fetchData();
    } catch (e: any) { alert("Error sending message: " + e.message); }
  };

  const activeChatList = selectedUserPhone ? chats.filter((c: any) => c.user_phone === selectedUserPhone) : [];
  const activeCustomer = customers.find((c: any) => c.phone === selectedUserPhone) || { name: 'Guest / User', phone: selectedUserPhone };

  return (
    <div className="fade-in">
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>💬 Live Support Chat Center</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', height: '65vh', background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        
        {/* User list */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', fontSize: '13px', color: '#94a3b8' }}>Active Conversations ({uniqueChatPhones.length})</div>
          {uniqueChatPhones.map((phone: any) => {
            const cust = customers.find((c: any) => c.phone === phone);
            return (
              <div key={phone} onClick={() => setSelectedUserPhone(phone)} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', background: selectedUserPhone === phone ? 'rgba(56,189,248,0.1)' : 'transparent', transition: 'background 0.2s' }}>
                <div style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '14px' }}>{cust ? cust.name : 'User'}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>📞 {phone}</div>
              </div>
            );
          })}
          {uniqueChatPhones.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No chats initiated.</div>}
        </div>

        {/* Chat window */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#111827' }}>
          {selectedUserPhone ? (
            <>
              <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0f172a' }}>
                <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{activeCustomer.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Phone: {selectedUserPhone}</div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {activeChatList.map((msg: any) => (
                  <div key={msg.id} style={{ alignSelf: msg.role === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', textAlign: msg.role === 'admin' ? 'right' : 'left' }}>{msg.sender} • {msg.time}</div>
                    <div style={{ background: msg.role === 'admin' ? '#38bdf8' : '#1e293b', color: msg.role === 'admin' ? '#0f172a' : '#f8fafc', padding: '10px 15px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.4' }}>{msg.msg}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '15px', background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Type reply as Admin..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendAdminChat()} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', flex: 1, outline: 'none' }} />
                <button onClick={handleSendAdminChat} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
              👈 Left side se kisi customer ki chat select karein.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}