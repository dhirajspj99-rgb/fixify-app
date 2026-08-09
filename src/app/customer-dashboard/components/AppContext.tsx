"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  
  // 🔥 Sirf Global State yahan rakhenge (Taaki Delivery 0 na ho)
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);

  // 🌐 MULTI-LANGUAGE GLOBAL STATE 
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  // Page load hone par purani save ki hui bhasha uthayega
  useEffect(() => {
    const savedLang = localStorage.getItem('fixifiy_language');
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  // Bhasha badalne aur save karne ka function
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem('fixifiy_language', lang);
  };

  const value = {
    deliveryCharge, 
    setDeliveryCharge,
    selectedLanguage,         // 🔥 Ab ye poore app mein available hai
    setSelectedLanguage: handleLanguageChange // 🔥 Isey call karke language change hogi
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};