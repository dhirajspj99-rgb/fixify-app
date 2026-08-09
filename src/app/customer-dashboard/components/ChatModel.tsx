"use client";
import { useState, useRef, useEffect } from 'react';

// 🔥 Interface mein selectedLanguage add kar diya
export default function ChatModel({ userProfile, selectedLanguage = 'English' }: { userProfile: any, selectedLanguage?: string }) {
  
  // 🌐 MULTI-LANGUAGE SYSTEM
  const isHindi = selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी');

  // Translation Strings
  const botGreeting = isHindi 
    ? `नमस्ते ${userProfile?.name || 'दोस्त'}! मैं Fixifiy हेल्पडेस्क से बोल रहा हूँ। आपकी क्या मदद कर सकता हूँ?`
    : `Namaste ${userProfile?.name || 'Dost'}! I am from Fixifiy Helpdesk. How can I help you today?`;

  const botReply = isHindi
    ? "शुक्रिया! हमारी टीम जल्द ही आपकी क्वेरी चेक करके आपसे संपर्क करेगी।"
    : "Thank you! Our team will check your query and contact you shortly.";

  const placeholderText = isHindi ? "अपना मैसेज यहाँ लिखें..." : "Type your message here...";

  // State initialization
  const [messages, setMessages] = useState([
    { sender: 'bot', text: botGreeting }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔥 Agar user ne bina chat shuru kiye language badli, toh Pehla message update ho jayega
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'bot') {
        setMessages([{ sender: 'bot', text: botGreeting }]);
    }
  }, [selectedLanguage, userProfile?.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            background: msg.sender === 'user' ? '#2874f0' : '#e0e0e0',
            color: msg.sender === 'user' ? 'white' : '#212121',
            padding: '10px 14px', borderRadius: '15px', maxWidth: '80%', fontSize: '14px'
          }}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '10px', borderTop: '1px solid #ddd', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder={placeholderText} 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #c2c2c2', outline: 'none' }} 
        />
        <button 
          onClick={handleSend} 
          style={{ background: '#2874f0', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}