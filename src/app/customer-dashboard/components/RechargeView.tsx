"use client";
import React, { useState } from 'react';
import { supabase } from '@/supabase';
import { useAppContext } from './AppContext'; // 🔥 Language fetch karne ke liye

export default function RechargeView({ userProfile, setAppStep }: { userProfile: any; setAppStep: (step: string) => any }) {
  
  // 🔥 Global Language System
  const { selectedLanguage } = useAppContext();
  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));

  const t = {
    back: isHindi ? "← डैशबोर्ड पर वापस" : "← Back to Dashboard",
    title: isHindi ? "यूटिलिटी और बिल पेमेंट (BBPS)" : "Utility & Bill Payments (BBPS)",
    walletBalance: isHindi ? "Fixifiy वॉलेट बैलेंस" : "Fixifiy Wallet Balance",
    addMoney: isHindi ? "पैसे डालें ➔" : "Add Money ➔",
    selectOperator: isHindi ? "ऑपरेटर / बोर्ड चुनें" : "Select Operator / Board",
    amountLabel: isHindi ? "राशि (₹)" : "Amount (₹)",
    amountPlaceholder: isHindi ? "बिल की राशि डालें" : "Enter bill amount",
    processing: isHindi ? "⏳ पेमेंट प्रोसेस हो रहा है..." : "⏳ Processing Payment...",
    securePay: (amt: string) => isHindi ? `सुरक्षित पेमेंट करें ₹${amt || '0'}` : `Secure Pay ₹${amt || '0'}`,
    disclaimer: isHindi ? "*पार्टनर गेटवे के माध्यम से सुरक्षित और जीरो-फीस चेकआउट" : "*Secure zero-fee checkout via Partner Gateway",
    alertId: (label: string) => isHindi ? `कृपया सही ${label} डालें!` : `Please enter a valid ${label}!`,
    alertBiller: isHindi ? "कृपया ऑपरेटर/बिलर बोर्ड चुनें!" : "Please select an Operator/Biller Board!",
    alertAmount: isHindi ? "कृपया सही बिल/रिचार्ज राशि डालें!" : "Please enter a valid bill/recharge amount!",
    confirmPay: (biller: string, id: string, amt: string) => isHindi 
      ? `क्या आप ${biller} के अकाउंट "${id}" पर ₹${amt} का पेमेंट करना चाहते हैं?\n\n(आपको सुरक्षित पार्टनर पोर्टल पर रीडायरेक्ट किया जाएगा)` 
      : `Do you want to process payment of ₹${amt} for ${biller} account "${id}"?\n\n(You will be redirected to the secure partner portal)`
  };

  const [activeCategory, setActiveCategory] = useState('Mobile');
  const [accountId, setAccountId] = useState('');
  const [biller, setBiller] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. All BBPS Categories (Bilingual Labels & Placeholders)
  const categories = [
    { 
      name: 'Mobile', icon: '📱', 
      label: isHindi ? 'मोबाइल नंबर' : 'Mobile Number', 
      placeholder: isHindi ? '10-अंकों का मोबाइल नंबर डालें' : 'Enter 10-digit mobile number' 
    },
    { 
      name: 'DTH', icon: '📺', 
      label: isHindi ? 'सब्सक्राइबर ID' : 'Subscriber ID', 
      placeholder: isHindi ? 'DTH अकाउंट / MAC ID डालें' : 'Enter DTH Account / MAC ID' 
    },
    { 
      name: 'Electricity', icon: '⚡', 
      label: isHindi ? 'कंज्यूमर नंबर' : 'Consumer Number', 
      placeholder: isHindi ? 'CA नंबर / कंज्यूमर ID डालें' : 'Enter CA Number / Consumer ID' 
    },
    { 
      name: 'Insurance', icon: '🛡️', 
      label: isHindi ? 'पॉलिसी नंबर' : 'Policy Number', 
      placeholder: isHindi ? 'LIC / पॉलिसी नंबर डालें' : 'Enter LIC / Policy Number' 
    },
    { 
      name: 'Broadband', icon: '🌐', 
      label: isHindi ? 'लैंडलाइन / अकाउंट' : 'Landline / Account', 
      placeholder: isHindi ? 'ब्रॉडबैंड अकाउंट नंबर डालें' : 'Enter Broadband Account No.' 
    },
    { 
      name: 'Gas/Water', icon: '💧', 
      label: isHindi ? 'कस्टमर ID' : 'Customer ID', 
      placeholder: isHindi ? 'गैस / वाटर बोर्ड ID डालें' : 'Enter Gas / Water Board ID' 
    },
  ];

  // 2. Operators & Boards mapping based on Category
  const billersMap: Record<string, string[]> = {
    'Mobile': ['Jio', 'Airtel', 'Vi', 'BSNL'],
    'DTH': ['Tata Play', 'Airtel DTH', 'Dish TV', 'Videocon D2H', 'Sun Direct'],
    'Electricity': ['NBPDCL (North Bihar)', 'SBPDCL (South Bihar)', 'UPPCL', 'Tata Power', 'Adani Elec'],
    'Insurance': ['LIC of India', 'SBI Life', 'HDFC Life', 'ICICI Pru', 'Max Life'],
    'Broadband': ['JioFiber', 'Airtel Xstream', 'BSNL Fiber', 'Excitel'],
    'Gas/Water': ['IGL (Indraprastha)', 'Delhi Jal Board', 'Patna Jal Board', 'Adani Gas']
  };

  const handleCategoryChange = (catName: string) => {
    setActiveCategory(catName);
    setBiller('');
    setAccountId('');
    setAmount('');
  };

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeCatData = categories.find(c => c.name === activeCategory);
    
    if (!accountId) {
      alert(t.alertId(activeCatData?.label || 'ID'));
      return;
    }
    if (!biller) {
      alert(t.alertBiller);
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert(t.alertAmount);
      return;
    }

    if (!window.confirm(t.confirmPay(biller, accountId, amount))) {
      return;
    }

    // Processing animation start
    setIsProcessing(true);

    let redirectLink = "";

    // 🔗 Link Routing: Mobile & DTH ke liye Flipkart Link, baaki ke liye Amazon Direct Link
    switch (activeCategory) {
      case 'Mobile':
        redirectLink = "https://fktr.in/Iab6zsd"; // Flipkart EarnKaro Link
        break;
      case 'DTH':
        redirectLink = "https://fktr.in/Iab6zsd"; // Flipkart EarnKaro Link
        break;
      case 'Electricity':
        redirectLink = "https://www.amazon.in/hfc/bill/electricity";
        break;
      case 'Insurance':
        redirectLink = "https://www.amazon.in/hfc/insurance";
        break;
      case 'Broadband':
        redirectLink = "https://www.amazon.in/hfc/broadband";
        break;
      case 'Gas/Water':
        redirectLink = "https://www.amazon.in/hfc/bill/water";
        break;
      default:
        redirectLink = "https://fktr.in/Iab6zsd";
    }

    setTimeout(() => {
      setIsProcessing(false);
      
      // Pop-up blocker fix ke sath redirect
      const newWindow = window.open(redirectLink, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        window.location.href = redirectLink;
      }
      
      // Form reset
      setAccountId('');
      setAmount('');
      setBiller('');
    }, 1500);
  };

  const currentCatData = categories.find(c => c.name === activeCategory);

  return (
    <div className="glass-card no-print" style={{ maxWidth: '600px', margin: '40px auto', padding: '25px' }}>
      <button 
        type="button"
        onClick={() => setAppStep('home')} 
        style={{ background: 'transparent', border: 'none', color: '#2874f0', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', padding: 0 }}
      >
        {t.back}
      </button>

      <h2 style={{ fontSize: '22px', borderBottom: '2px solid #2874f0', paddingBottom: '10px', marginBottom: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>⚡</span> {t.title}
      </h2>

      {/* Wallet Balance Banner */}
      <div style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.1)' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.walletBalance}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#15803d', marginTop: '2px' }}>₹{Number(userProfile?.balance || 0).toLocaleString('en-IN')}</div>
        </div>
        <button type="button" onClick={() => setAppStep('wallet_passbook')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)' }}>
          {t.addMoney}
        </button>
      </div>

      {/* BBPS Category Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '25px' }}>
        {categories.map(cat => (
          <div 
            key={cat.name}
            onClick={() => handleCategoryChange(cat.name)}
            style={{
              padding: '12px 5px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer', transition: '0.2s',
              background: activeCategory === cat.name ? '#eff6ff' : '#f8fafc',
              border: activeCategory === cat.name ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              boxShadow: activeCategory === cat.name ? '0 4px 10px rgba(59, 130, 246, 0.15)' : 'none'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{cat.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: activeCategory === cat.name ? '#1d4ed8' : '#64748b' }}>
              {isHindi ? (
                cat.name === 'Mobile' ? 'मोबाइल' :
                cat.name === 'Electricity' ? 'बिजली' :
                cat.name === 'Insurance' ? 'बीमा' :
                cat.name === 'Broadband' ? 'ब्रॉडबैंड' :
                cat.name === 'Gas/Water' ? 'गैस/पानी' : cat.name
              ) : cat.name}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleRechargeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        {/* Dynamic Label & Input for Account ID */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{currentCatData?.label}</label>
          <input 
            type={activeCategory === 'Mobile' ? 'tel' : 'text'} 
            maxLength={activeCategory === 'Mobile' ? 10 : 30} 
            placeholder={currentCatData?.placeholder} 
            value={accountId} 
            onChange={(e) => setAccountId(activeCategory === 'Mobile' ? e.target.value.replace(/\D/g, '') : e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {/* Dynamic Biller Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{t.selectOperator}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {billersMap[activeCategory].map((op) => (
              <button 
                type="button" 
                key={op} 
                onClick={() => setBiller(op)}
                style={{ 
                  padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s',
                  border: biller === op ? '2px solid #2874f0' : '1px solid #cbd5e1',
                  background: biller === op ? '#eff6ff' : 'white',
                  color: biller === op ? '#1e3a8a' : '#475569'
                }}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{t.amountLabel}</label>
          <input 
            type="number" 
            placeholder={t.amountPlaceholder} 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 'bold', outline: 'none', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isProcessing}
          className="primary-btn" 
          style={{ width: '100%', background: '#16a34a', padding: '16px', borderRadius: '8px', fontSize: '16px', fontWeight: '900', marginTop: '5px', cursor: isProcessing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)', border: 'none', color: 'white' }}
        >
          {isProcessing ? t.processing : t.securePay(amount)}
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', margin: '0' }}>
          {t.disclaimer}
        </p>
      </form>
    </div>
  );
}