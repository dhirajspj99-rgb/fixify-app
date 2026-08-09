"use client";
import React, { useState } from 'react';

export default function CustomerSupportTab({ currentShop }: any) {
  // Demo Data: Jab aapka backend ready ho jaye, toh ise Supabase se fetch kar lijiyega
  const [supportTickets, setSupportTickets] = useState([
    {
      id: 'TKT-9012',
      customer_name: 'Rajesh Kumar',
      phone: '9876543210',
      product_name: 'UltraTech Cement OPC 43',
      order_no: 'ORD-5541',
      rating: 2,
      feedback: 'Cement ki bori phati hui thi aur thoda jam gaya hai andar se. Mujhe replacement chahiye.',
      status: 'Open',
      ai_chat_history: [
        { sender: 'bot', time: '10:05 AM', text: 'Namaste Rajesh ji, Fixifiy Support mein aapka swagat hai. Main AI assistant hoon. Aapki complaint order #ORD-5541 ke baare mein hai, kya problem aayi hai?' },
        { sender: 'customer', time: '10:06 AM', text: 'Mera cement kharab nikla, bori phati hui hai aur maal damage hai.' },
        { sender: 'bot', time: '10:06 AM', text: 'Maafi chahta hoon Rajesh ji. Main aapki shikayat seedhe us shop owner ko bhej raha hoon jinhone ye order deliver kiya tha. Kripya line par bane rahein, shop owner aapse abhi baat karenge.' }
      ],
      owner_replies: []
    }
  ]);

  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    // Update local state to show reply visually
    const updatedTickets = supportTickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          owner_replies: [...t.owner_replies, { sender: 'shop', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: replyText }]
        };
      }
      return t;
    });

    setSupportTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id));
    setReplyText('');
    
    // Yahan Supabase ka insert code aayega jab DB connect karenge
    // alert("Message sent to customer!");
  };

  const closeTicket = (id: string) => {
    setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
    setSelectedTicket(null);
    alert("✅ Ticket marked as Resolved!");
  };

  return (
    <div>
      <h2 style={{ color: '#38bdf8', marginBottom: '20px' }}>🎧 Customer Support & Feedback (AI Escalated)</h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* LEFT PANEL: Ticket List */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#0f172a', padding: '15px', borderRadius: '10px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginTop: 0 }}>Active Complaints</h3>
          
          {supportTickets.length === 0 ? <p style={{color: '#64748b'}}>Koi nayi complaint nahi hai.</p> : 
            supportTickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => setSelectedTicket(ticket)}
                style={{ backgroundColor: selectedTicket?.id === ticket.id ? '#1e293b' : '#0f172a', padding: '15px', borderRadius: '8px', border: selectedTicket?.id === ticket.id ? '1px solid #38bdf8' : '1px solid #334155', cursor: 'pointer', marginBottom: '10px', transition: '0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong style={{ color: '#f8fafc', fontSize: '15px' }}>{ticket.customer_name}</strong>
                  <span style={{ backgroundColor: ticket.status === 'Open' ? '#f43f5e' : '#10b981', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '5px' }}>📦 {ticket.product_name}</div>
                <div style={{ fontSize: '13px', color: '#facc15', fontWeight: 'bold' }}>
                  Rating: {'⭐'.repeat(ticket.rating)}{'☆'.repeat(5 - ticket.rating)}
                </div>
              </div>
            ))
          }
        </div>

        {/* RIGHT PANEL: Chat & Feedback Details */}
        {selectedTicket ? (
          <div style={{ flex: '2', minWidth: '400px', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid #38bdf8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ backgroundColor: '#0284c7', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'white', fontSize: '16px', display: 'block' }}>Ticket {selectedTicket.id} | {selectedTicket.customer_name}</strong>
                <span style={{ color: '#bae6fd', fontSize: '13px' }}>📞 +91 {selectedTicket.phone} | Order: {selectedTicket.order_no}</span>
              </div>
              <button onClick={() => closeTicket(selectedTicket.id)} style={{ backgroundColor: '#10b981', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                ✅ Mark Resolved
              </button>
            </div>

            {/* Product & Feedback Section */}
            <div style={{ padding: '15px', backgroundColor: '#1e293b', borderBottom: '2px dashed #334155' }}>
              <strong style={{ color: '#38bdf8', fontSize: '14px', display: 'block', marginBottom: '5px' }}>🛒 Problem with Product:</strong>
              <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>{selectedTicket.product_name}</div>
              
              <div style={{ marginTop: '10px', backgroundColor: '#450a0a', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ color: '#facc15', fontSize: '14px', marginBottom: '5px' }}>
                  <strong>Customer Rating:</strong> {'⭐'.repeat(selectedTicket.rating)}{'☆'.repeat(5 - selectedTicket.rating)}
                </div>
                <div style={{ color: '#fca5a5', fontSize: '14px' }}>
                  <strong>Feedback/Issue:</strong> "{selectedTicket.feedback}"
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div style={{ padding: '15px', flex: 1, overflowY: 'auto', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '300px' }}>
              
              <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <span style={{ backgroundColor: '#334155', color: '#94a3b8', fontSize: '11px', padding: '4px 10px', borderRadius: '10px' }}>--- AI Chat History (Escalated) ---</span>
              </div>

              {/* AI & Customer History */}
              {selectedTicket.ai_chat_history.map((msg: any, idx: number) => (
                <div key={idx} style={{ alignSelf: msg.sender === 'customer' ? 'flex-start' : 'center', maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px', alignSelf: msg.sender === 'customer' ? 'flex-start' : 'flex-start', marginLeft: '5px' }}>
                    {msg.sender === 'bot' ? '🤖 AI Assistant' : '👤 Customer'} • {msg.time}
                  </span>
                  <div style={{ backgroundColor: msg.sender === 'bot' ? '#1e293b' : '#334155', padding: '10px 15px', borderRadius: '10px', color: msg.sender === 'bot' ? '#38bdf8' : '#cbd5e1', border: msg.sender === 'bot' ? '1px solid #0284c7' : 'none', fontSize: '14px' }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '10px', fontWeight: 'bold' }}>--- Shop Owner Joined The Chat ---</span>
              </div>

              {/* Shop Owner Replies */}
              {selectedTicket.owner_replies.map((msg: any, idx: number) => (
                <div key={`reply-${idx}`} style={{ alignSelf: 'flex-end', maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px', alignSelf: 'flex-end', marginRight: '5px' }}>
                    🏪 You • {msg.time}
                  </span>
                  <div style={{ backgroundColor: '#0284c7', padding: '10px 15px', borderRadius: '15px 15px 0 15px', color: 'white', fontSize: '14px' }}>
                    {msg.text}
                  </div>
                </div>
              ))}

            </div>

            {/* Chat Input */}
            <div style={{ padding: '15px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Type your reply to customer..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                disabled={selectedTicket.status === 'Resolved'}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none' }} 
              />
              <button 
                onClick={handleSendReply} 
                disabled={selectedTicket.status === 'Resolved'}
                style={{ backgroundColor: selectedTicket.status === 'Resolved' ? '#64748b' : '#38bdf8', border: 'none', borderRadius: '8px', padding: '0 20px', color: '#0f172a', fontWeight: 'bold', cursor: selectedTicket.status === 'Resolved' ? 'not-allowed' : 'pointer' }}
              >
                Send
              </button>
            </div>

          </div>
        ) : (
          <div style={{ flex: '2', minWidth: '400px', backgroundColor: '#1e293b', borderRadius: '10px', border: '1px dashed #334155', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
            <p>Select a ticket from the left to view details and chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}