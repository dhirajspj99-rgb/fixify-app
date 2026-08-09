"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from './AppContext'; 
import { supabase } from '@/lib/supabaseClient'; 
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
};

const calculateFallbackDistance = (pin1: string, pin2: string) => {
    if (pin1 === pin2) return 2; 
    const diff = Math.abs(Number(pin1) - Number(pin2));
    if (pin1.substring(0,4) === pin2.substring(0,4)) return diff <= 5 ? 10 : 15; 
    if (pin1.substring(0,3) === pin2.substring(0,3)) return 35; 
    if (pin1.substring(0,2) === pin2.substring(0,2)) return 90; 
    return 250; 
};

export default function CartView(props: any) {
  const { deliveryCharge, setDeliveryCharge, selectedLanguage = 'English' } = useAppContext(); 

  const {
    appStep, setAppStep, mainCart, setMainCart, savedDraftOrder, isNewAddress, setIsNewAddress,
    userProfile, checkoutAddress, setCheckoutAddress, isGpsLoading, appSettings, shopDetails,
    acceptedTerms, setAcceptedTerms, showUpiGateway, setShowUpiGateway, showQrScan, setShowQrScan,
    showAdvanceUpiModal, setShowAdvanceUpiModal, pendingPaymentMode, setPendingPaymentMode, 
    getActiveUpiId, getActiveQrCode, getLabourTransportCharge, toggleCartItemSelection, 
    handleDeliveryGpsTrace, handleCheckoutClick, handleNativeUpiPayment, 
    handleSaveAsDraft, estDeliveryTime, setOrderTab 
  } = props;

  const isHindi = selectedLanguage && (selectedLanguage.includes('Hindi') || selectedLanguage.includes('हिंदी'));
  const currentLang = isHindi ? "hi" : "en"; 

  const t = {
    back: isHindi ? "← वापस" : "← Back",
    cartSummary: isHindi ? `🛒 कार्ट समरी (${mainCart.length} आइटम)` : `🛒 Cart Summary (${mainCart.length} Items)`,
    bookingSummary: isHindi ? "👷‍♂️ बुकिंग समरी" : "👷‍♂️ Booking Summary",
    rate: isHindi ? "रेट:" : "Rate:",
    cartEmpty: isHindi ? "कार्ट खाली है" : "Cart is empty",
    mistriBooking: isHindi ? "मिस्त्री बुकिंग" : "Mistri Booking",
    heavyDelivery: isHindi ? "भारी डिलीवरी (ऑटो-कैलकुलेटेड)" : "Heavy Delivery (Auto-Calculated)",
    safetyDelivery: isHindi ? "सेफ्टी पैकिंग और डिलीवरी" : "Safety Packing & Delivery",
    standardDelivery: isHindi ? "स्टैंडर्ड डिलीवरी" : "Standard Delivery",
    mistriTransport: isHindi ? "मिस्त्री ट्रांसपोर्ट चार्ज" : "Mistri Transport Charge",
    routeTracker: isHindi ? "🟢 रूट ट्रैकर ज़रूरी" : "🟢 Route Tracker Required",
    deliveryChargeTxt: isHindi ? "🟢 डिलीवरी चार्ज" : "🟢 Delivery Charge",
    mistriTravelFee: isHindi ? "🟢 मिस्त्री ट्रैवल फीस" : "🟢 Mistri Travel Fee",
    freeTravel: isHindi ? "फ्री ट्रैवल" : "FREE Travel",
    freeDelivery: isHindi ? "फ्री डिलीवरी" : "FREE DELIVERY",
    packSafety: isHindi ? "पैकिंग/सुरक्षा:" : "Pack/Safety:",
    delivery: isHindi ? "डिलीवरी:" : "Delivery:",
    total: isHindi ? "कुल:" : "Total:",
    autoCalc: isHindi ? "⏳ ऑटो-कैलकुलेट हो रहा है..." : "⏳ Auto-calculating...",
    delAddress: isHindi ? "📍 डिलीवरी का पता" : "📍 Delivery Address",
    changeEdit: isHindi ? "✏️ बदलें / एड्रेस चुनें" : "✏️ Change / Select Address",
    addrNotAdded: isHindi ? "पता नहीं जोड़ा गया" : "Address not added",
    delEstimate: isHindi ? "डिलीवरी का अनुमान:" : "Delivery Estimate:",
    shopDistance: isHindi ? "दुकान की दूरी:" : "Shop Distance:",
    finalBill: isHindi ? "फाइनल बिल राशि:" : "Final Bill Amount:",
    agreeTerms: isHindi ? "मैं नियम व शर्तों से सहमत हूँ और पते की पुष्टि करता हूँ।" : "I agree to terms and confirm the address details.",
    payOnline: isHindi ? "💳 सुरक्षित ऑनलाइन पेमेंट करें" : "💳 PAY SECURELY ONLINE",
    cod: isHindi ? "💵 कैश ऑन डिलीवरी" : "💵 CASH ON DELIVERY",
    cow: isHindi ? "💵 काम के बाद कैश (CASH ON WORK)" : "💵 CASH ON WORK (Pay After Job)",
    saveDraft: isHindi ? "📝 ड्राफ्ट सेव करें और चैट करें" : "📝 SAVE DRAFT & CHAT",
    addMore: isHindi ? "➕ और प्रोडक्ट जोड़ें" : "➕ ADD MORE PRODUCTS",
    cancelEmpty: isHindi ? "❌ कैंसल करें और कार्ट खाली करें" : "❌ CANCEL & EMPTY CART",
    enterNewAddr: isHindi ? "➕ नया पता दर्ज करें" : "➕ Enter New Address Details",
    editAddrDetails: isHindi ? "✏️ पते में सुधार करें" : "✏️ Edit Address Details",
    autoFetchLoc: isHindi ? "📍 मेरी वर्तमान लोकेशन ऑटो-फेच करें" : "📍 Auto-Fetch My Current Location",
    fetching: isHindi ? "⏳ फेच हो रहा है..." : "⏳ Fetching...",
    streetPlaceholder: isHindi ? "सड़क, वार्ड, गली, गाँव..." : "Street, Ward, Gali, Village...",
    blockPlaceholder: isHindi ? "ब्लॉक / शहर" : "Block / City",
    distPlaceholder: isHindi ? "ज़िला" : "District",
    statePlaceholder: isHindi ? "राज्य" : "State",
    pinPlaceholder: isHindi ? "6-अंकों का पिनकोड *" : "6-Digit Pincode *",
    updateAddr: isHindi ? "पता अपडेट करें" : "Update Address",
    saveSelect: isHindi ? "सेव करें और चुनें" : "Save & Select",
    cancelBtn: isHindi ? "कैंसल" : "Cancel",
    addNewAddrBtn: isHindi ? "➕ नया पता जोड़ें" : "➕ Add New Address",
    processing: isHindi ? "ऑर्डर प्रोसेस हो रहा है..." : "Processing Order...",
    securingPay: isHindi ? "कृपया प्रतीक्षा करें, आपका पेमेंट सुरक्षित किया जा रहा है..." : "Please wait, securing your payment...",
    enterPin: isHindi ? "वॉलेट पिन डालें" : "Enter Wallet PIN",
    confirmPay: isHindi ? "अपने Fixifiy वॉलेट से पेमेंट कन्फर्म करें।" : "Confirm payment from your Fixifiy Wallet.",
    defaultPin: isHindi ? "*डिफ़ॉल्ट पिन 1234 है" : "*Default PIN is 1234",
    verifyPay: isHindi ? "वेरीफाई और पे करें" : "Verify & Pay",
    selectPayMode: isHindi ? "पेमेंट मोड चुनें" : "Select Payment Mode",
    toPay: isHindi ? "भुगतान राशि:" : "To Pay:",
    walletBal: isHindi ? "Fixifiy वॉलेट बैलेंस" : "Fixifiy Wallet Balance",
    payNow: isHindi ? "पे नाउ" : "Pay Now",
    upiApps: isHindi ? "UPI ऐप्स" : "UPI Apps",
    qrScanner: isHindi ? "QR स्कैनर" : "QR Scanner",
    payDone: isHindi ? "पेमेंट हो गया?" : "Payment Done?",
    heavyDeliveryTime: isHindi ? "2-7 दिन में डिलीवरी 🚛" : "2-7 Days Delivery 🚛",
    calcAI: isHindi ? "⏳ AI दूरी कैलकुलेट कर रहा है..." : "⏳ AI is calculating distance...",
    selectBtn: isHindi ? "✔ चुनें" : "✔ Select",
    utrPrompt: (app: string, upi: string, amt: string) => isHindi ? `कृपया अपने ${app} ऐप से ₹${amt} का भुगतान करें।` : `Please pay ₹${amt} using your ${app} app.`,
    utrInputPlaceholder: isHindi ? "12-अंकों का UTR/Ref नंबर" : "12-digit UTR/Ref Number",
    submitConfirm: isHindi ? "सबमिट और कन्फर्म" : "Submit & Confirm",
    cancelGoBack: isHindi ? "कैंसल" : "Cancel",
    scanToPay: isHindi ? "पेमेंट के लिए स्कैन करें" : "Scan to Pay",
    payingTo: isHindi ? "भुगतान कर रहे हैं:" : "Paying to:",
    qrNotAvail: isHindi ? "QR उपलब्ध नहीं है" : "QR Not Available",
    scannedSuccess: isHindi ? "मैंने पेमेंट कर दिया है" : "I have paid successfully",
    stdDelivery: isHindi ? "स्टैंडर्ड डिलीवरी" : "Standard Delivery",
    sameDayDel: isHindi ? "आज ही डिलीवरी 🚀" : "Same Day Delivery 🚀",
    within24h: isHindi ? "24 घंटे के अंदर ⚡" : "Within 24 Hours ⚡",
    twoDaysDel: isHindi ? "1-2 दिन में 🚚" : "In 1-2 Days 🚚",
    codNotAvail: isHindi ? "🚫 ऑनलाइन पेमेंट अनिवार्य" : "🚫 Online Payment Mandatory",
    onlinePaymentAlert: isHindi ? "🚫 इस प्रोडक्ट पर कैश ऑन डिलीवरी उपलब्ध नहीं है। कृपया 'PAY SECURELY ONLINE' पर क्लिक करके पूरा पेमेंट (प्रोडक्ट + डिलीवरी) करें।" : "🚫 COD is not available for this product. Please click 'PAY SECURELY ONLINE' to pay the full amount (Product + Delivery)."
  };

  const isProductCheckout = appStep === 'cart_checkout';
  const selectedItems = isProductCheckout ? mainCart.filter((i: any) => i.selected) : [];

  // 🔥 STRICT CHECK FOR ONLINE ONLY ITEMS IN CART 🔥
  const isOnlinePaymentOnly = isProductCheckout && selectedItems.some((item: any) => {
      const codVal = item.is_cod_available;
      return codVal === false || String(codVal).toLowerCase() === 'false' || codVal === 0 || String(codVal) === '0';
  });

  const [liveDistanceKm, setLiveDistanceKm] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const rawShopPin = (selectedItems.length > 0 && selectedItems[0]?.shop_pincode) 
                         || shopDetails?.pincode 
                         || appSettings?.shop_pincode 
                         || '848114';
                         
  const actualShopPincode = String(rawShopPin).replace(/[^0-9]/g, '').trim();

  useEffect(() => {
      const fetchDistance = async () => {
          const userPin = String(userProfile?.pincode || '').replace(/[^0-9]/g, '').trim();
          
          if (!userPin || !actualShopPincode || userPin.length !== 6 || actualShopPincode.length !== 6) {
              setLiveDistanceKm(0); return;
          }

          if (userPin === actualShopPincode) {
              setLiveDistanceKm(2); 
              return;
          }

          setIsCalculatingDistance(true);
          try {
              const headers = { "Accept": "application/json" };
              const [shopRes, userRes] = await Promise.all([
                  fetch(`https://nominatim.openstreetmap.org/search?q=${actualShopPincode}+india&format=json&limit=1`, { headers }),
                  fetch(`https://nominatim.openstreetmap.org/search?q=${userPin}+india&format=json&limit=1`, { headers })
              ]);

              const shopData = await shopRes.json();
              const userData = await userRes.json();

              if (shopData && shopData.length > 0 && userData && userData.length > 0) {
                  const dist = calculateHaversineDistance(
                      parseFloat(shopData[0].lat), parseFloat(shopData[0].lon),
                      parseFloat(userData[0].lat), parseFloat(userData[0].lon)
                  );
                  if (userPin.substring(0,3) === actualShopPincode.substring(0,3) && dist > 50) {
                      setLiveDistanceKm(calculateFallbackDistance(userPin, actualShopPincode));
                  } else {
                      setLiveDistanceKm(dist < 1 ? 1 : dist);
                  }
              } else {
                  setLiveDistanceKm(calculateFallbackDistance(userPin, actualShopPincode));
              }
          } catch (error) {
              setLiveDistanceKm(calculateFallbackDistance(userPin, actualShopPincode));
          } finally {
              setIsCalculatingDistance(false);
          }
      };
      fetchDistance();
  }, [userProfile?.pincode, actualShopPincode]);

  const displayAddresses = useMemo(() => {
      let parsedAddresses: any[] = [];
      try {
          let rawData = userProfile?.saved_addresses;
          if (typeof rawData === 'string') {
              try { rawData = JSON.parse(rawData); } catch(e){}
          }
          if (typeof rawData === 'string') {
              try { rawData = JSON.parse(rawData); } catch(e){}
          }

          if (Array.isArray(rawData)) {
              parsedAddresses = rawData.filter((a: any) => a && typeof a === 'object' && a.street && !String(a.street).includes('[object Object]'));
          }
      } catch(e) { parsedAddresses = []; }

      const currentAddr = userProfile?.address?.trim();
      if (currentAddr && !currentAddr.includes('[object Object]')) {
          const exists = parsedAddresses.some((a: any) => (a.street || a.address)?.trim() === currentAddr);
          if (!exists) {
              parsedAddresses.unshift({
                  street: currentAddr, 
                  state: userProfile?.state || '',
                  district: userProfile?.district || '', 
                  block: userProfile?.block || '',
                  pincode: String(userProfile?.pincode || '').replace(/[^0-9]/g, '')
              });
          }
      }
      return parsedAddresses;
  }, [userProfile?.saved_addresses, userProfile?.address, userProfile?.pincode]);

  const adminHeavyCategories = appSettings?.heavy_categories 
    ? appSettings.heavy_categories.split(',').map((cat: string) => cat.trim().toLowerCase()) 
    : ['hardware', 'loha', 'iron', 'cement', 'steel', 'building', 'pipe', 'heavy', 'tmt', 'paint', 'welder']; 
  
  const selectedProductTotal = selectedItems.reduce((s: number, i: any) => s + i.price, 0);
  const selectedLabourTotal = !isProductCheckout ? (savedDraftOrder?.charge || savedDraftOrder?.total_amount || 0) : 0;
  
  let hasMobile = false; 
  let hasLaptopOrPrinter = false;
  let hasHeavyItems = false;
  let totalBags = 0;
  let totalKg = 0;

  selectedItems.forEach((item: any) => {
      const cat = String(item.category || '').toLowerCase(); 
      const name = String(item.name || '').toLowerCase();
      const unit = String(item.unit || '').toLowerCase(); 
      
      if (cat.includes('mobile') || cat.includes('phone') || name.includes('mobile')) {
          hasMobile = true;
      }
      if (cat.includes('laptop') || cat.includes('computer') || cat.includes('print') || name.includes('laptop') || name.includes('computer')) {
          hasLaptopOrPrinter = true;
      }

      const isCatHeavy = adminHeavyCategories.some((hc: string) => cat.includes(hc) || name.includes(hc));
      if (item.is_heavy === true || isCatHeavy) {
          hasHeavyItems = true;
          const qty = Number(item.qty || item.quantity || 1); 
          if (unit.includes('kg')) {
              totalKg += qty; 
          } else {
              totalBags += qty; 
          }
      }
  });

  const hasSpecialTech = hasMobile || hasLaptopOrPrinter;
  
  let packingCharge = 0;
  if (hasMobile) packingCharge += 100;
  if (hasLaptopOrPrinter) packingCharge += 250;

  const deliveryThreshold = (hasMobile || hasLaptopOrPrinter) ? 12000 : 2000;
  const baseStandardDelivery = selectedProductTotal >= deliveryThreshold ? 0 : 49;

  // 🚚 DYNAMIC TRANSPORT CHARGE CALCULATION
  let exactTransportCharge = 0;
  if (isProductCheckout) {
    if (appSettings?.isFreeDeliveryActive) {
      exactTransportCharge = packingCharge; 
    } else if (hasHeavyItems) {
      const chargePerKg = Number(appSettings?.deliveryChargePerKg || 5);  
      
      let bagCharge = 0;
      if (totalBags > 0) {
          if (totalBags < 10) bagCharge = totalBags * 50;
          else if (totalBags <= 100) bagCharge = totalBags * 25;
          else bagCharge = totalBags * 15;
      }

      let kgCharge = 0;
      if (totalKg > 0) {
          if (totalKg < 100) kgCharge = 500;
          else kgCharge = totalKg * chargePerKg; 
      }

      let calculatedHeavyCharge = bagCharge + kgCharge;
      exactTransportCharge = Math.ceil(calculatedHeavyCharge) + packingCharge; 

    } else {
      exactTransportCharge = baseStandardDelivery + packingCharge; 
    }
  } else {
    exactTransportCharge = Number(getLabourTransportCharge() || 0);
  }

  const baseTotal = Number(isProductCheckout ? selectedProductTotal : selectedLabourTotal);
  const finalAmountToPay = baseTotal + exactTransportCharge; 

  // 🔥 FIX 1: Jab bhi exactTransportCharge update ho, usey global context mein sync karo taaki checkout me 0 na jaye
  useEffect(() => {
    if (typeof setDeliveryCharge === 'function') {
        setDeliveryCharge(exactTransportCharge);
    }
  }, [exactTransportCharge, setDeliveryCharge]);

  const [isProcessingOrder, setIsProcessingOrder] = useState(false); 
  const [liveWalletBalance, setLiveWalletBalance] = useState<number>(Number(userProfile?.balance || 0));

  const [showUtrInput, setShowUtrInput] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [isAdvanceUtr, setIsAdvanceUtr] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingWalletAction, setPendingWalletAction] = useState<'full' | 'advance' | null>(null);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null); 
  const [newStreet, setNewStreet] = useState('');
  const [newState, setNewState] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newBlock, setNewBlock] = useState('');
  const [newPincode, setNewPincode] = useState(''); 
  const [isFetchingLoc, setIsFetchingLoc] = useState(false); 

  let dynamicDeliveryText = t.stdDelivery; 
  if (hasHeavyItems) {
      dynamicDeliveryText = t.heavyDeliveryTime;
  } else if (isCalculatingDistance) {
      dynamicDeliveryText = t.calcAI;
  } else if (liveDistanceKm > 0) {
      if (liveDistanceKm <= 5) dynamicDeliveryText = t.sameDayDel;
      else if (liveDistanceKm <= 20) dynamicDeliveryText = t.within24h;
      else if (liveDistanceKm <= 40) dynamicDeliveryText = t.twoDaysDel;
      else dynamicDeliveryText = t.stdDelivery;
  }

  useEffect(() => {
    if (userProfile?.balance !== undefined) setLiveWalletBalance(Number(userProfile.balance));
    const fetchLiveBalance = async () => {
      const uId = userProfile?.id; const uPhone = userProfile?.phone;
      if (!uId && !uPhone) return;
      try {
        let query = supabase.from('customers').select('balance');
        if (uId) query = query.eq('id', uId); else query = query.eq('phone', uPhone);
        const { data } = await query.single();
        if (data) {
           setLiveWalletBalance(Number(data.balance) || 0);
           if (userProfile) userProfile.balance = Number(data.balance) || 0; 
        }
      } catch (err) {}
    };
    fetchLiveBalance();
  }, [userProfile?.id, userProfile?.phone]);

  const validateBeforeCheckout = () => {
    if (!acceptedTerms) { alert(isHindi ? "कृपया नियम व शर्तों को स्वीकार करें!" : "Please accept Terms & Conditions!"); return false; }
    if (!userProfile?.address || userProfile.address.includes('[object Object]')) { alert(isHindi ? "कृपया डिलीवरी का पता दोबारा चेक करें!" : "Please check your delivery address!"); return false; }
    if (isProductCheckout && selectedItems.length === 0) { alert(isHindi ? "ऑर्डर प्लेस करने के लिए कम से कम एक आइटम चुनें!" : "Please select at least one item to checkout!"); return false; }
    return true;
  };

  const handleAutoFetchLocation = () => {
      if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
      setIsFetchingLoc(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
          try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
              const data = await response.json();
              if (data && data.address) {
                  setNewState(data.address.state || '');
                  setNewDistrict(data.address.state_district || data.address.county || data.address.city || '');
                  setNewBlock(data.address.suburb || data.address.neighbourhood || data.address.town || data.address.village || '');
                  setNewPincode(data.address.postcode || '');
                  setNewStreet(data.display_name || '');
              } else { alert("Failed to fetch exact location."); }
          } catch (error) { alert("Error fetching location."); } 
          finally { setIsFetchingLoc(false); }
      }, () => {
          setIsFetchingLoc(false); alert("Location permission denied.");
      });
  };

  const handleDeleteAddress = async (idx: number, e: any) => {
      e.stopPropagation();
      if(!window.confirm("Are you sure you want to delete this address?")) return;
      const addrToDelete = displayAddresses[idx];
      const newSavedAddresses = displayAddresses.filter(a => (a.street || a.address) !== (addrToDelete.street || addrToDelete.address));
      
      try {
          const stringifiedPayload = JSON.stringify(newSavedAddresses);
          let updatePayload: any = { saved_addresses: stringifiedPayload };
          
          if (userProfile.address === (addrToDelete.street || addrToDelete.address)) {
              updatePayload.address = newSavedAddresses[0]?.street || newSavedAddresses[0]?.address || '';
              updatePayload.state = newSavedAddresses[0]?.state || '';
              updatePayload.district = newSavedAddresses[0]?.district || '';
              updatePayload.block = newSavedAddresses[0]?.block || '';
              updatePayload.pincode = newSavedAddresses[0]?.pincode || '';
          }
          await supabase.from('customers').update(updatePayload).eq('id', userProfile.id);
          if(props.setUserProfile) props.setUserProfile({ ...userProfile, ...updatePayload, saved_addresses: stringifiedPayload });
          alert("✅ Address deleted successfully!");
      } catch(e) { alert("Error deleting address"); }
  };

  const handleEditAddress = (idx: number, addr: any, e: any) => {
      e.stopPropagation();
      setNewStreet(addr.street || addr.address || ''); setNewBlock(addr.block || '');
      setNewDistrict(addr.district || ''); setNewState(addr.state || ''); setNewPincode(addr.pincode || '');
      setEditIndex(idx); setShowNewAddressForm(true);
  };

  const handleSelectAddress = (addr: any) => {
      if(props.setUserProfile) {
          props.setUserProfile({
              ...userProfile,
              address: addr.street || addr.address,
              state: addr.state, district: addr.district,
              block: addr.block, pincode: addr.pincode || ''
          });
      }
      setShowAddressModal(false);
  };

  const handleSaveNewAddress = async () => {
      if(!newStreet || !newState || !newDistrict || !newBlock || !newPincode) return alert("Please fill complete address and Pincode!");
      if(newPincode.length !== 6) return alert("Please enter a valid 6-digit Pincode!");
      
      const newAddr = { 
          street: newStreet.trim(), state: newState.trim(), 
          district: newDistrict.trim(), block: newBlock.trim(), 
          pincode: String(newPincode).replace(/[^0-9]/g, '') 
      };

      let updatedSavedAddresses = [...displayAddresses];
      let updatedProfile = { ...userProfile };

      if (editIndex !== null) {
          const addrBeingEdited = displayAddresses[editIndex];
          const isPrimaryEdit = (addrBeingEdited.street || addrBeingEdited.address) === userProfile.address;
          if (isPrimaryEdit) {
              updatedProfile.address = newAddr.street; updatedProfile.state = newAddr.state;
              updatedProfile.district = newAddr.district; updatedProfile.block = newAddr.block; updatedProfile.pincode = newAddr.pincode;
          }
          const sIdx = updatedSavedAddresses.findIndex(a => (a.street || a.address) === (addrBeingEdited.street || addrBeingEdited.address));
          if (sIdx !== -1) updatedSavedAddresses[sIdx] = newAddr;
      } else {
          updatedSavedAddresses.push(newAddr);
          updatedProfile.address = newAddr.street; updatedProfile.state = newAddr.state;
          updatedProfile.district = newAddr.district; updatedProfile.block = newAddr.block; updatedProfile.pincode = newAddr.pincode;
      }

      const stringifiedPayload = JSON.stringify(updatedSavedAddresses); 
      updatedProfile.saved_addresses = stringifiedPayload;

      try {
          await supabase.from('customers').update({ 
              saved_addresses: stringifiedPayload, 
              address: updatedProfile.address,
              state: updatedProfile.state, 
              district: updatedProfile.district,
              block: updatedProfile.block, 
              pincode: updatedProfile.pincode
          }).eq('id', userProfile.id);

          if(props.setUserProfile) props.setUserProfile(updatedProfile);
          
          setShowNewAddressForm(false); setShowAddressModal(false); setEditIndex(null);
          setNewStreet(''); setNewState(''); setNewDistrict(''); setNewBlock(''); setNewPincode('');
          alert(`✅ Address successfully ${editIndex !== null ? 'updated' : 'saved'}!`);
      } catch(e) { alert("Error saving address"); }
  };

  const executeFinalOrder = async (method: string) => {
      setIsProcessingOrder(true);
      try {
          // 🔥 FIX 2: Double safety ke liye submit se theek pehle ek baar aur update
          if (typeof setDeliveryCharge === 'function') setDeliveryCharge(exactTransportCharge); 
          
          if (typeof handleCheckoutClick === 'function') await handleCheckoutClick(method); 
          if (typeof setOrderTab === 'function') setOrderTab('history');
          setAppStep('orders');
      } catch (error) { console.error("Order failed:", error); } finally { setIsProcessingOrder(false); }
  };

  const executeAdvanceFinal = async (paymentSource: string) => {
      setIsProcessingOrder(true);
      try {
          // 🔥 FIX 3: Safety check here as well
          if (typeof setDeliveryCharge === 'function') setDeliveryCharge(exactTransportCharge); 

          if (typeof handleCheckoutClick === 'function') {
              const baseMode = isProductCheckout ? 'COD' : 'Cash on Work';
              await handleCheckoutClick(`${baseMode} (Advance Paid via ${paymentSource})`); 
          }
          if (typeof setOrderTab === 'function') setOrderTab('history');
          setShowAdvanceUpiModal(false); setAppStep('orders');
      } catch (error) { console.error("Advance pay failed:", error); } finally { setIsProcessingOrder(false); }
  };

  const handleCodClick = async (e: any) => {
    e.preventDefault(); 
    if (isProcessingOrder) return;
    
    if (isOnlinePaymentOnly) {
        alert(t.onlinePaymentAlert);
        return;
    }

    if (!validateBeforeCheckout()) return;

    if (exactTransportCharge > 0) setShowAdvanceUpiModal(true);
    else await executeFinalOrder(isProductCheckout ? 'COD' : 'Cash on Work');
  };

  const initiateWalletPayment = (type: 'full' | 'advance') => {
    setPendingWalletAction(type); setPinInput(''); setShowPinModal(true);
  };

  const confirmWalletPaymentWithPin = async () => {
    if (!pinInput || pinInput.length !== 4) return alert("Please enter a 4-digit PIN!");
    setIsProcessingOrder(true);
    try {
      const uPhone = userProfile?.phone;
      if (!uPhone) throw new Error("Phone number missing!");

      const { data: customerData, error: fetchErr } = await supabase.from('customers').select('id, balance, wallet_pin').eq('phone', uPhone).single();
      if (fetchErr || !customerData) throw new Error("Account check failed. Check internet.");

      const actualPin = customerData.wallet_pin || '1234'; 
      if (pinInput !== actualPin) {
        setIsProcessingOrder(false); return alert("❌ Incorrect PIN! (Default: 1234)");
      }

      const amountToDeduct = pendingWalletAction === 'full' ? finalAmountToPay : exactTransportCharge;
      const currentTrueBalance = Number(customerData.balance) || 0;
      
      if (currentTrueBalance < amountToDeduct) {
        setIsProcessingOrder(false); return alert(`⚠️ Insufficient Balance!\nWallet: ₹${currentTrueBalance}\nRequired: ₹${amountToDeduct}`);
      }

      const newBalance = currentTrueBalance - amountToDeduct;
      await supabase.from('customers').update({ balance: newBalance }).eq('id', customerData.id);
      await supabase.from('wallet_transactions').insert({
        user_type: 'customer', customer_id: customerData.id,
        amount: amountToDeduct, type: 'debit', status: 'completed', 
        reason: pendingWalletAction === 'full' ? `Full Paid for Order` : `Advance Paid`
      });

      setLiveWalletBalance(newBalance); if (userProfile) userProfile.balance = newBalance; 
      setShowPinModal(false);

      if (pendingWalletAction === 'full') {
        setShowUpiGateway(false); await executeFinalOrder('Wallet (Paid)');
      } else {
        await executeAdvanceFinal('Fixifiy Wallet');
      }
    } catch (error: any) { alert("Payment Failed: " + error.message); setIsProcessingOrder(false); }
  };

  const triggerUpiApp = (e: any, appName: string, isAdvance: boolean = false) => {
     e.preventDefault(); 
     if (typeof handleNativeUpiPayment === 'function') handleNativeUpiPayment(appName);
     else { alert(`${appName} unavailable.`); return; }
     setSelectedUpiApp(appName); setIsAdvanceUtr(isAdvance); setShowUtrInput(true);
  };

  const submitUtrAndPlaceOrder = async () => {
    if (!utrNumber || utrNumber.length < 8) return alert("Please enter a valid UTR No.!");
    setIsProcessingOrder(true);
    try {
        if (typeof setDeliveryCharge === 'function') setDeliveryCharge(exactTransportCharge); 

        if (isAdvanceUtr) await executeAdvanceFinal(`UPI UTR: ${utrNumber}`);
        else {
            setShowUpiGateway(false);
            if (typeof handleCheckoutClick === 'function') await handleCheckoutClick(`UPI (${selectedUpiApp}) - UTR: ${utrNumber}`); 
            if (typeof setOrderTab === 'function') setOrderTab('history');
            setAppStep('orders');
        }
    } catch (error) { console.error("Order Failed:", error); } finally { setIsProcessingOrder(false); setShowUtrInput(false); setUtrNumber(''); }
  };

  const premiumOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' };
  const premiumModal: React.CSSProperties = { background: '#ffffff', width: '100%', maxWidth: '550px', borderRadius: '24px', padding: '25px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto', animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' };
  const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' as const, outline: 'none', background: '#f8fafc' };

  return (
    <>
      <style>{`
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .upi-btn { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; font-weight: 700; font-size: 14px; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .upi-btn:hover { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15); transform: translateY(-3px); }
        .wallet-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 20px; color: white; position: relative; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); }
        .wallet-card::before { content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%; }
        .card-chip { width: 40px; height: 28px; background: linear-gradient(135deg, #fbbf24, #d97706); border-radius: 6px; margin-bottom: 12px; opacity: 0.9; box-shadow: inset 0 0 5px rgba(0,0,0,0.3); }
      `}</style>

      {isProcessingOrder && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)', zIndex: 999999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '50px', marginBottom: '15px', animation: 'spin 1s linear infinite' }}>⏳</div>
              <h2 style={{ color: '#16a34a', margin: 0 }}>{t.processing}</h2>
              <p style={{ color: '#64748b', fontWeight: 'bold' }}>{t.securingPay}</p>
          </div>
      )}

      <div className="glass-card no-print" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <button type="button" onClick={() => setAppStep(isProductCheckout ? 'shop_items' : 'hire_labour')} style={{ background: 'transparent', border: 'none', color: '#2874f0', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', padding: 0 }}>{t.back}</button>
        <h2 style={{ fontSize: '22px', borderBottom: '2px solid #2874f0', paddingBottom: '10px', marginBottom: '20px' }}>{isProductCheckout ? t.cartSummary : t.bookingSummary}</h2>

        <div style={{ marginBottom: '25px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          {isProductCheckout ? (
            mainCart.length > 0 ? mainCart.map((item: any) => {
              const displayUnit = item.unit || (item.name.toLowerCase().includes('kg') ? 'Kg' : 'Pc');
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #e2e8f0', background: item.selected ? '#f0fdf4' : 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <input type="checkbox" checked={item.selected} onChange={() => toggleCartItemSelection(item.id)} style={{ transform: 'scale(1.5)', accentColor: '#16a34a', cursor: 'pointer' }} />
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', color: item.selected ? '#0f172a' : '#94a3b8' }}>{item.name}</span>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{t.rate} ₹{item.ratePerUnit} / {displayUnit}</div>
                    </div>
                  </div>
                  <strong style={{ fontSize: '16px', color: item.selected ? '#1e3a8a' : '#94a3b8' }}>₹{item.price.toLocaleString('en-IN')}</strong>
                </div>
              );
            }) : ( <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>{t.cartEmpty}</div> )
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc' }}>
               <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{savedDraftOrder?.labour_type || t.mistriBooking}</span>
               <strong style={{ fontSize: '16px', color: '#1e3a8a' }}>₹{(savedDraftOrder?.charge || 0).toLocaleString('en-IN')}</strong>
            </div>
          )}
        </div>

        <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px dashed #93c5fd' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isProductCheckout ? (
              hasHeavyItems ? <><span>🚛</span> {t.heavyDelivery}</> : hasSpecialTech ? <><span>📦</span> {t.safetyDelivery}</> : <><span>📦</span> {t.standardDelivery}</>
            ) : ( <><span>🛵</span> {t.mistriTransport}</> )}
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                {isProductCheckout ? (hasHeavyItems ? t.routeTracker : t.deliveryChargeTxt) : t.mistriTravelFee}
              </div>
              
              {!isProductCheckout ? (
                 exactTransportCharge === 0 && appSettings?.isFreeDeliveryActive ? <div style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a', background: '#dcfce7', padding: '6px 12px', borderRadius: '4px' }}>{t.freeTravel}</div> : <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>₹{exactTransportCharge}</div>
              ) : (
                 exactTransportCharge === 0 && appSettings?.isFreeDeliveryActive ? (
                   <div style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a', background: '#dcfce7', padding: '6px 12px', borderRadius: '4px' }}>{t.freeDelivery}</div>
                 ) : isCalculatingDistance ? (
                   <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold' }}>{t.autoCalc}</div>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                     {packingCharge > 0 && <span style={{fontSize: '11px', color: '#64748b'}}>{t.packSafety} ₹{packingCharge}</span>}
                     <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>{t.total} ₹{exactTransportCharge}</div>
                   </div>
                 )
              )}
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>{t.delAddress}</h4>
            <button type="button" onClick={(e) => { e.preventDefault(); setShowAddressModal(true); setEditIndex(null); }} style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              {t.changeEdit}
            </button>
          </div>
          
          <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
            <strong style={{ color: '#1e293b' }}>{userProfile?.name}</strong><br/>
            {userProfile?.address || t.addrNotAdded}<br/>
            {userProfile?.block ? userProfile.block + ', ' : ''}
            {userProfile?.district ? userProfile.district + ', ' : ''}
            {userProfile?.state || ''}
            {userProfile?.pincode ? ` - ${userProfile.pincode}` : ''}
          </div>

          {isProductCheckout && (
             <div style={{ marginTop: '15px', padding: '12px', background: '#dcfce7', borderRadius: '8px', color: '#166534', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed #86efac' }}>
               <span style={{ fontSize: '18px' }}>{isCalculatingDistance ? '⏳' : '⚡'}</span> 
               <div>
                  <strong>{t.delEstimate}</strong> <span style={{ color: '#14532d', fontSize: '14px' }}>{dynamicDeliveryText}</span>
               </div>
             </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '25px', background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
          <span>{t.finalBill}</span><span>₹{finalAmountToPay.toLocaleString('en-IN')}</span>
        </div>

        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: '2px', transform: 'scale(1.3)', accentColor: '#1e3a8a' }} />
            <span style={{ fontWeight: '600' }}>{t.agreeTerms}</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
           
           {/* PAY SECURELY ONLINE - ALWAYS ACTIVE, TAKES FULL AMOUNT */}
           <button type="button" disabled={isProcessingOrder} onClick={(e) => { e.preventDefault(); if(validateBeforeCheckout()) { setShowUpiGateway(true); } }} className="primary-btn" style={{ background: '#2563eb', borderRadius: '12px', padding: '16px', fontSize: '16px', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)' }}>{t.payOnline}</button>
           
           {/* 🔥 COD BUTTON - DISABLED VISUALLY BUT CLICKABLE FOR ALERT 🔥 */}
           <button 
             type="button" 
             disabled={isProcessingOrder} 
             onClick={handleCodClick} 
             className="primary-btn" 
             style={{ 
               background: isOnlinePaymentOnly ? '#f1f5f9' : 'white', 
               color: isOnlinePaymentOnly ? '#94a3b8' : '#1e293b', 
               border: `2px solid ${isOnlinePaymentOnly ? '#e2e8f0' : '#cbd5e1'}`, 
               borderRadius: '12px', 
               padding: '16px', 
               fontSize: '16px', 
               cursor: isOnlinePaymentOnly ? 'not-allowed' : 'pointer', 
               fontWeight: 'bold',
               opacity: isOnlinePaymentOnly ? 0.6 : 1,
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               transition: 'all 0.2s ease'
             }}
           >
             {isProductCheckout ? t.cod : t.cow}
             {isOnlinePaymentOnly && <span style={{fontSize: '12px', color: '#ef4444', marginTop: '4px'}}>{t.codNotAvail}</span>}
           </button>

           <button type="button" disabled={isProcessingOrder} onClick={handleSaveAsDraft} className="primary-btn" style={{ background: '#fff7ed', color: '#ea580c', border: '2px dashed #ea580c', borderRadius: '12px', padding: '16px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>{t.saveDraft}</button>
           <button type="button" disabled={isProcessingOrder} onClick={() => setAppStep('shop_items')} className="primary-btn" style={{ background: '#f8fafc', color: '#334155', border: '2px solid #cbd5e1', borderRadius: '12px', padding: '16px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>{t.addMore}</button>
           <button type="button" disabled={isProcessingOrder} onClick={() => { if(window.confirm("Are you sure you want to clear the cart?")) { if(typeof setMainCart === 'function') setMainCart([]); setAppStep('home'); } }} className="primary-btn" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>{t.cancelEmpty}</button>
        </div>
      </div>

      {showAddressModal && (
        <div style={premiumOverlay} onClick={() => { setShowAddressModal(false); setShowNewAddressForm(false); }}>
           <div style={premiumModal} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                  <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '20px', fontWeight: '900' }}>{t.delAddress.replace('📍 ', '')}</h2>
                  <button style={{ background: '#f1f5f9', border: 'none', fontSize: '16px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', color: '#475569' }} onClick={() => { setShowAddressModal(false); setShowNewAddressForm(false); }}>✖</button>
              </div>

              {!showNewAddressForm ? (
                  <>
                      <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                          {displayAddresses.map((addr: any, idx: number) => {
                              const isSelected = userProfile?.address === (addr.street || addr.address);
                              return (
                                  <div key={idx} style={{ padding: '15px', border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px', background: isSelected ? '#eff6ff' : 'white', transition: '0.2s' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                              <strong style={{ color: '#1e293b' }}>Address {idx + 1}</strong>
                                              {isSelected && <span style={{ background: '#2563eb', color: 'white', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Selected</span>}
                                          </div>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                              <button onClick={(e) => handleEditAddress(idx, addr, e)} style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#b45309' }}>✏️</button>
                                              <button onClick={(e) => handleDeleteAddress(idx, e)} style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>🗑️</button>
                                          </div>
                                      </div>
                                      
                                      <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                                          {addr.street || addr.address}<br/>
                                          {addr.block}, {addr.district}, {addr.state} {addr.pincode ? `- ${addr.pincode}` : ''}
                                      </div>
                                      <button onClick={() => handleSelectAddress(addr)} style={{ width: '100%', marginTop: '10px', background: isSelected ? '#2563eb' : '#f1f5f9', color: isSelected ? 'white' : '#0f172a', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                          {t.selectBtn}
                                      </button>
                                  </div>
                              )
                          })}
                      </div>
                      
                      {displayAddresses.length < 4 && (
                          <button onClick={() => { setShowNewAddressForm(true); setEditIndex(null); }} style={{ background: '#f8fafc', color: '#2563eb', padding: '15px', borderRadius: '12px', border: '2px dashed #93c5fd', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px' }}>
                              {t.addNewAddrBtn}
                          </button>
                      )}
                  </>
              ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px' }}>{editIndex !== null ? t.editAddrDetails : t.enterNewAddr}</h3>
                      <button onClick={handleAutoFetchLocation} disabled={isFetchingLoc} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        {isFetchingLoc ? t.fetching : t.autoFetchLoc}
                      </button>

                      <ReactTransliterate value={newStreet} onChangeText={setNewStreet} lang={currentLang} placeholder={t.streetPlaceholder} style={inputStyle} />
                      <ReactTransliterate value={newBlock} onChangeText={setNewBlock} lang={currentLang} placeholder={t.blockPlaceholder} style={inputStyle} />
                      <ReactTransliterate value={newDistrict} onChangeText={setNewDistrict} lang={currentLang} placeholder={t.distPlaceholder} style={inputStyle} />
                      <ReactTransliterate value={newState} onChangeText={setNewState} lang={currentLang} placeholder={t.statePlaceholder} style={inputStyle} />
                      <input type="number" placeholder={t.pinPlaceholder} maxLength={6} value={newPincode} onChange={e => setNewPincode(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
                      
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={handleSaveNewAddress} style={{ flex: 1, background: '#16a34a', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{editIndex !== null ? t.updateAddr : t.saveSelect}</button>
                        <button onClick={() => { setShowNewAddressForm(false); setEditIndex(null); }} style={{ flex: 1, background: '#fee2e2', color: '#ef4444', padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{t.cancelBtn}</button>
                      </div>
                  </div>
              )}
           </div>
        </div>
      )}

      {showPinModal && (
        <div style={premiumOverlay} onClick={() => setShowPinModal(false)}>
           <div style={{...premiumModal, maxWidth: '400px', textAlign: 'center'}} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
              <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.enterPin}</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>
                {t.confirmPay} <strong>₹{pendingWalletAction === 'full' ? finalAmountToPay : exactTransportCharge}</strong>.
                <br/><span style={{fontSize: '11px', color: '#ef4444'}}>{t.defaultPin}</span>
              </p>
              <input type="password" maxLength={4} autoFocus placeholder="****" value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '30px', letterSpacing: '15px', textAlign: 'center', fontWeight: 'bold', marginBottom: '20px', boxSizing: 'border-box', outline: 'none', background: '#f8fafc' }} />
              <button type="button" onClick={confirmWalletPaymentWithPin} disabled={isProcessingOrder} style={{ background: '#16a34a', color: 'white', padding: '16px', fontSize: '16px', fontWeight: '900', borderRadius: '12px', border: 'none', cursor: 'pointer', width: '100%', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)' }}>
                {isProcessingOrder ? '⏳ Verifying...' : t.verifyPay}
              </button>
           </div>
        </div>
      )}

      {showUpiGateway && !showPinModal && (
        <div style={premiumOverlay} onClick={(e) => { e.stopPropagation(); setShowUpiGateway(false); setShowUtrInput(false); }}>
           <div style={premiumModal} onClick={(e) => e.stopPropagation()}>
              {!showUtrInput ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                    <div>
                      <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '20px', fontWeight: '900' }}>{t.selectPayMode}</h2>
                      <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{t.toPay} <strong style={{color: '#16a34a'}}>₹{finalAmountToPay.toLocaleString('en-IN')}</strong></p>
                    </div>
                    <button style={{ background: '#f1f5f9', border: 'none', fontSize: '16px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', color: '#475569' }} onClick={() => setShowUpiGateway(false)}>✖</button>
                  </div>
                  <div className="wallet-card">
                    <div className="card-chip"></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>{t.walletBal}</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: liveWalletBalance >= finalAmountToPay ? '#4ade80' : '#f87171', marginTop: '5px' }}>₹{liveWalletBalance.toLocaleString('en-IN')}</div>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); initiateWalletPayment('full'); }} disabled={isProcessingOrder || liveWalletBalance < finalAmountToPay} style={{background: liveWalletBalance >= finalAmountToPay ? 'white' : 'rgba(255,255,255,0.2)', color: liveWalletBalance >= finalAmountToPay ? '#0f172a' : 'white', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer'}}>{isProcessingOrder ? '⏳' : t.payNow}</button>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '14px', color: '#64748b', margin: '10px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.upiApps}</h3>
                  <div className="payment-grid">
                    <div className="upi-btn" onClick={(e) => triggerUpiApp(e, 'PhonePe', false)}><span style={{fontSize: '28px'}}>🟣</span> PhonePe</div>
                    <div className="upi-btn" onClick={(e) => triggerUpiApp(e, 'GPay', false)}><span style={{fontSize: '28px'}}>🔵</span> Google Pay</div>
                    <div className="upi-btn" onClick={(e) => triggerUpiApp(e, 'Paytm', false)}><span style={{fontSize: '28px'}}>🟦</span> Paytm</div>
                    <div className="upi-btn" onClick={(e) => { e.preventDefault(); setShowUpiGateway(false); setShowQrScan(true); }}><span style={{fontSize: '28px'}}>📷</span> {t.qrScanner}</div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
                   <h2 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900' }}>{t.payDone}</h2>
                   <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.5' }}>{t.utrPrompt(selectedUpiApp, getActiveUpiId(), finalAmountToPay.toLocaleString('en-IN'))}</p>
                   
                   {/* 🔥 ADDED UPI ID DISPLAY BOX 🔥 */}
                   <div style={{ background: '#e0f2fe', border: '1px dashed #38bdf8', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
                       <span style={{ fontSize: '13px', color: '#0284c7', display: 'block', marginBottom: '4px' }}>{isHindi ? 'इस UPI ID पर पेमेंट करें:' : 'Pay to this UPI ID:'}</span>
                       <strong style={{ fontSize: '18px', color: '#0369a1', letterSpacing: '0.5px' }}>{getActiveUpiId()}</strong>
                   </div>

                   <input type="number" placeholder={t.utrInputPlaceholder} value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '18px', textAlign: 'center', fontWeight: 'bold', marginBottom: '25px', outline: 'none', background: '#f8fafc' }} />
                   <button type="button" onClick={submitUtrAndPlaceOrder} disabled={isProcessingOrder} style={{ background: '#16a34a', color: 'white', padding: '18px', fontSize: '16px', fontWeight: '900', borderRadius: '12px', border: 'none', cursor: 'pointer', width: '100%', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)' }}>{isProcessingOrder ? '⏳ Verifying...' : t.submitConfirm}</button>
                   <button type="button" onClick={() => setShowUtrInput(false)} style={{ background: 'transparent', color: '#ef4444', padding: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%', marginTop: '15px' }}>{t.cancelGoBack}</button>
                </div>
              )}
           </div>
        </div>
      )}

      {showAdvanceUpiModal && !showPinModal && (
        <div style={premiumOverlay} onClick={(e) => { e.stopPropagation(); setShowAdvanceUpiModal(false); setShowUtrInput(false); }}>
           <div style={premiumModal} onClick={(e) => e.stopPropagation()}>
              {!showUtrInput ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                    <div>
                      <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '20px', fontWeight: '900' }}>{isHindi ? "एडवांस पेमेंट ज़रूरी है" : "Advance Payment Required"}</h2>
                      <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{isProductCheckout ? t.delivery : t.mistriTransport}: <strong style={{color: '#16a34a'}}>₹{exactTransportCharge}</strong></p>
                    </div>
                    <button style={{ background: '#f1f5f9', border: 'none', fontSize: '16px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', color: '#475569' }} onClick={() => setShowAdvanceUpiModal(false)}>✖</button>
                  </div>
                  <div className="wallet-card" style={{marginTop: '10px'}}>
                    <div className="card-chip"></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>{t.walletBal}</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: liveWalletBalance >= exactTransportCharge ? '#4ade80' : '#f87171', marginTop: '5px' }}>₹{liveWalletBalance.toLocaleString('en-IN')}</div>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); initiateWalletPayment('advance'); }} disabled={isProcessingOrder || liveWalletBalance < exactTransportCharge} style={{background: liveWalletBalance >= exactTransportCharge ? 'white' : 'rgba(255,255,255,0.2)', color: liveWalletBalance >= exactTransportCharge ? '#0f172a' : 'white', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer'}}>{isProcessingOrder ? '⏳' : t.payNow}</button>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '14px', color: '#64748b', margin: '10px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.upiApps}</h3>
                  <div className="payment-grid">
                    <div className="upi-btn" onClick={(e) => triggerUpiApp(e, 'PhonePe', true)}><span style={{fontSize: '28px'}}>🟣</span> PhonePe</div>
                    <div className="upi-btn" onClick={(e) => triggerUpiApp(e, 'GPay', true)}><span style={{fontSize: '28px'}}>🔵</span> Google Pay</div>
                    <div className="upi-btn" onClick={(e) => { e.preventDefault(); setShowAdvanceUpiModal(false); setShowQrScan(true); setIsAdvanceUtr(true); }}><span style={{fontSize: '28px'}}>📷</span> {t.qrScanner}</div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
                   <h2 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900' }}>{t.payDone}</h2>
                   <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.5' }}>{t.utrPrompt(selectedUpiApp, getActiveUpiId(), exactTransportCharge.toLocaleString('en-IN'))}</p>
                   
                   {/* 🔥 ADDED UPI ID DISPLAY BOX 🔥 */}
                   <div style={{ background: '#e0f2fe', border: '1px dashed #38bdf8', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
                       <span style={{ fontSize: '13px', color: '#0284c7', display: 'block', marginBottom: '4px' }}>{isHindi ? 'इस UPI ID पर पेमेंट करें:' : 'Pay to this UPI ID:'}</span>
                       <strong style={{ fontSize: '18px', color: '#0369a1', letterSpacing: '0.5px' }}>{getActiveUpiId()}</strong>
                   </div>

                   <input type="number" placeholder={t.utrInputPlaceholder} value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '18px', textAlign: 'center', fontWeight: 'bold', marginBottom: '25px', outline: 'none', background: '#f8fafc' }} />
                   <button type="button" onClick={submitUtrAndPlaceOrder} disabled={isProcessingOrder} style={{ background: '#16a34a', color: 'white', padding: '18px', fontSize: '16px', fontWeight: '900', borderRadius: '12px', border: 'none', cursor: 'pointer', width: '100%', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)' }}>{isProcessingOrder ? '⏳ Verifying...' : t.submitConfirm}</button>
                   <button type="button" onClick={() => setShowUtrInput(false)} style={{ background: 'transparent', color: '#ef4444', padding: '12px', fontSize: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%', marginTop: '15px' }}>{t.cancelGoBack}</button>
                </div>
              )}
           </div>
        </div>
      )}

      {showQrScan && (
        <div style={premiumOverlay} onClick={(e) => { e.stopPropagation(); setShowQrScan(false); isAdvanceUtr ? setShowAdvanceUpiModal(true) : setShowUpiGateway(true); }}>
           <div style={premiumModal} onClick={(e) => e.stopPropagation()}>
              <button style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => { setShowQrScan(false); isAdvanceUtr ? setShowAdvanceUpiModal(true) : setShowUpiGateway(true); }}>✖</button>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
                 <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.scanToPay}</h2>
                 <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{t.payingTo} <strong style={{color: '#2563eb'}}>{getActiveUpiId()}</strong></p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                  {getActiveQrCode() ? ( <img src={getActiveQrCode()} alt="UPI QR Code" style={{ width: '220px', height: '220px', borderRadius: '10px', margin: 'auto' }} /> ) : ( <div style={{padding: '50px', color: '#94a3b8', fontWeight: 'bold'}}>{t.qrNotAvail}</div> )}
              </div>
              <h1 style={{ color: '#16a34a', fontSize: '32px', textAlign: 'center', margin: '0 0 20px 0', fontWeight: '900' }}>₹{isAdvanceUtr ? exactTransportCharge : finalAmountToPay.toLocaleString('en-IN')}</h1>
              <button type="button" onClick={async (e) => { 
                e.preventDefault(); setShowQrScan(false); setSelectedUpiApp('QR Scanner');
                isAdvanceUtr ? setShowAdvanceUpiModal(true) : setShowUpiGateway(true); setShowUtrInput(true);
              }} style={{ background: '#2563eb', color: 'white', padding: '16px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', border: 'none', cursor: 'pointer', width: '100%' }}>{t.scannedSuccess}</button>
           </div>
        </div>
      )}
    </>
  );
}