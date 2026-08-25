"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase'; 
import { useRouter } from 'next/navigation';
import { App as CapacitorApp } from '@capacitor/app';

// Context & Components
import { AppProvider, useAppContext } from './components/AppContext'; 
import Header from './components/Header';
import LabourView from './components/LabourView';
import CartView from './components/CartView';
import OrderView from './components/OrderView';
import ShopView from './components/ShopView'; 
import WalletPassbook from './components/WalletPassbook'; 
import RechargeView from './components/RechargeView'; 
import TravelBookingView from './components/TravelBookingView'; 
import Footer from './components/Footer';
import LegalPages from './components/LegalPages'; 

// Split Components
import HomeFeed from './components/HomeFeedExtras'; 
import ProductDetailView from './components/ProductDetailView';
import ProfileView from './components/ProfileView';
import FloatingWidgets from './components/FloatingWidgets';

function MainCustomerScreen() {
  const router = useRouter(); 
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  
  const [userProfile, setUserProfile] = useState({ 
    id: null, name: '', phone: '', address: '', state: '', district: '', block: '', pincode: '', saved_addresses: [], is_vip: false, upi_id: '', balance: 0 
  });

  const [appStep, setAppStep] = useState<string>('home'); 

  // 🔥 ANDROID HARDWARE BACK BUTTON LOGIC
  useEffect(() => {
    let backListener: any = null;
    const setupBackButton = async () => {
      backListener = await CapacitorApp.addListener('backButton', () => {
        if (appStep !== 'home') {
          setAppStep('home');
        } else {
          CapacitorApp.exitApp();
        }
      });
    };
    setupBackButton();
    return () => { if (backListener) backListener.remove(); };
  }, [appStep]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mistriSearchTerm, setMistriSearchTerm] = useState('');
  const [mainCart, setMainCart] = useState<any[]>([]); 
  
  const { deliveryCharge, setDeliveryCharge, selectedLanguage } = useAppContext(); 
  
  const [totalCartWeight, setTotalCartWeight] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lon: number} | null>(null);
  
  const [appSettings, setAppSettings] = useState<any>({ deliveryChargePerKm: 15, deliveryChargePerKg: 2, transportChargePerKm: 10, shoppingUpi: '', labourUpi: '', shoppingQr: '', labourQr: '', isFreeDeliveryActive: false });
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [userLocation, setUserLocation] = useState('Fetching Location...');
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(5);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const [cartModalItem, setCartModalItem] = useState<any>(null);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0);
  const [buyType, setBuyType] = useState<'weight' | 'piece'>('piece'); 
  const [buyValue, setBuyValue] = useState<number | string>('');
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeCall, setActiveCall] = useState<{roomId: string, title: string} | null>(null);

  const [labourCategory, setLabourCategory] = useState<string>('');
  const [labourType, setLabourType] = useState<string>('Daily Wage (Dihari)');
  const [workNote, setWorkNote] = useState<string>(''); 
  const [workImage, setWorkImage] = useState<File | null>(null);
  
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [availableShops, setAvailableShops] = useState<any[]>([]);
  const [availableLabours, setAvailableLabours] = useState<any[]>([]);
  const [featuredMistris, setFeaturedMistris] = useState<any[]>([]); 
  
  const [savedDraftOrder, setSavedDraftOrder] = useState<any>(null);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]); 
  
  const [finalInvoice, setFinalInvoice] = useState<any>(null); 
  const [pastOrders, setPastOrders] = useState<any[]>([]); 
  const [notifications, setNotifications] = useState<any[]>([{ title: 'Welcome to Fixifiy', message: 'Aapka account ready hai!', orderId: null }]);
  const [orderTab, setOrderTab] = useState<'history' | 'drafts'>('history');

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showUpiGateway, setShowUpiGateway] = useState(false); 
  const [showQrScan, setShowQrScan] = useState(false); 
  const [showAdvanceUpiModal, setShowAdvanceUpiModal] = useState(false); 
  const [pendingPaymentMode, setPendingPaymentMode] = useState<string>('');
  const [isHelpdeskOpen, setIsHelpdeskOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatUploading, setIsChatUploading] = useState(false);
  const [isOrderChatOpen, setIsOrderChatOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const homeCategories = [ { name: 'Old Vehicles (Sell/Buy)', icon: '🚗🏍️', type: 'vehicles' }, { name: 'Mobiles & Accessories', icon: '📱', type: 'electronics' }, { name: 'Laptops & Printers', icon: '💻', type: 'electronics' }, { name: 'Cameras', icon: '📷', type: 'electronics' }, { name: 'Iron', icon: '🏗️', type: 'material' }, { name: 'Cement', icon: '🧱', type: 'material' }, { name: 'Hardware', icon: '🛠️', type: 'material' }, { name: 'Electric', icon: '⚡', type: 'material' }, { name: 'UPVC Windows', icon: '🪟', type: 'material' }, { name: 'Aluminium & Steel', icon: '⛓️', type: 'material' }, { name: 'Furniture', icon: '🪑', type: 'material' }, { name: 'Paints', icon: '🎨', type: 'material' }, { name: 'General Store', icon: '🛒', type: 'groceries' }, { name: 'Iron Welder', icon: '🔥', type: 'material' }, { name: 'Electrician', icon: '⚡', type: 'material' }, { name: 'Plumber', icon: '🚰', type: 'material' } ];
  const labourCategoriesList = [ { name: 'Laptop Repairing Mistri', icon: '💻', rate: 450 }, { name: 'Printer Repairing Mistri', icon: '🖨️', rate: 400 }, { name: 'Mobile Repairing Mistri', icon: '📱', rate: 350 }, { name: 'Rajmistri (Mason)', icon: '🧱', rate: 750 }, { name: 'Iron Welder', icon: '🔥', rate: 800 }, { name: 'Carpenter (Furniture)', icon: '🚚', rate: 700 }, { name: 'Aluminium Worker', icon: '🪟', rate: 800 }, { name: 'Electrician', icon: '⚡', rate: 500 }, { name: 'Plumber', icon: '🚰', rate: 600 }, { name: 'Painter', icon: '🎨', rate: 600 }, { name: 'Helper/Majdoor', icon: '💪', rate: 400 } ];

  const getLabourTransportCharge = () => appSettings.isFreeDeliveryActive ? 0 : (appSettings.transportChargePerKm || 10) * 10; 
  const getActiveUpiId = () => appStep === 'cart_checkout' ? (appSettings.shoppingUpi || 'admin@upi') : (appSettings.labourUpi || 'admin@upi');
  const getActiveQrCode = () => appStep === 'cart_checkout' ? appSettings.shoppingQr : appSettings.labourQr;

  useEffect(() => { if (appStep !== 'orders' && appStep !== 'product_detail') { setFinalInvoice(null); setIsOrderChatOpen(false); } }, [appStep]);
  useEffect(() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition((position) => { setUserLocation('Location Synced 🟢'); setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude }); }, () => { setUserLocation('All India Region'); }); } }, []);

  const fetchPastOrders = async (phoneNo: string) => {
    if(!phoneNo) return;
    
    const { data: userProductOrders } = await supabase.from('orders').select('*').eq('phone', phoneNo);
    const { data: userLabourOrders } = await supabase.from('labour_bookings').select('*').eq('phone', phoneNo);
    
    let combinedHistory: any[] = [];
    
    if (userProductOrders) {
        combinedHistory = [...combinedHistory, ...userProductOrders.map(o => {
            let parsedItems = o.items;
            if (typeof parsedItems === 'string') {
                try { parsedItems = JSON.parse(parsedItems); } catch { parsedItems = []; }
            }
            return { 
                ...o, 
                invoiceNo: o.id, 
                displayDate: o.date || o.created_at, 
                type: o.type || 'Product Order', 
                totalAmount: o.total_amount,
                items: parsedItems 
            };
        })];
    }
    
    if (userLabourOrders) {
        combinedHistory = [...combinedHistory, ...userLabourOrders.map(o => ({ 
            ...o, 
            invoiceNo: o.order_no || o.id, 
            displayDate: o.date || o.created_at, 
            type: 'Labour Booking', 
            totalAmount: o.total_amount, 
            delivery_charge: o.transport_charge || 0,
            transport_charge: o.transport_charge || 0,
            items: [{ name: o.labour_type, price: o.charge, quantity: 1, unit: 'Booking' }] 
        }))];
    }
    
    combinedHistory.sort((a, b) => new Date(b.created_at || b.displayDate).getTime() - new Date(a.created_at || a.displayDate).getTime());
    
    setPastOrders(combinedHistory.filter(o => o.status !== 'Draft')); 
    setSavedDrafts(combinedHistory.filter(o => o.status === 'Draft'));
  };

  const fetchAuthAndData = async () => {
    try {
      if (typeof window === 'undefined') return;
      const { data: settingsData } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      
      if (settingsData) {
        setAppSettings({ 
            ...settingsData, 
            isFreeDeliveryActive: settingsData.deliveryChargePerKm === 0 && settingsData.deliveryChargePerKg === 0,
            shoppingUpi: settingsData.shopping_upi || settingsData.shoppingUpi || 'admin@upi',
            labourUpi: settingsData.labour_upi || settingsData.labourUpi || 'admin@upi',
            shoppingQr: settingsData.shopping_qr || settingsData.shoppingQr || '',
            labourQr: settingsData.labour_qr || settingsData.labourQr || ''
        });
      }
      
      const { data: shopsData } = await supabase.from('shops').select('*').eq('status', 'Approved');
      if (shopsData) setAvailableShops(shopsData);
      
      const { data: laboursData } = await supabase.from('labours').select('*').eq('status', 'Approved');
      if (laboursData) {
        setAvailableLabours(laboursData);
        const premiumLabours = laboursData.filter(l => l.is_premium === true);
        setFeaturedMistris(premiumLabours.length > 0 ? premiumLabours : [{ id: 1, name: 'Raju Rajmistri', labour_type: 'Rajmistri (Mason)', base_rate: 750, rating: 4.8, exp: '8 Yrs Exp', phone: '000' }]);
      }

      // 🔥 FIX: Direct read from 'fixifiy_customer' LocalStorage
      let phoneNo = '';
      let cachedCustomer = null;
      const savedLocalCustomer = localStorage.getItem('fixifiy_customer');
      if (savedLocalCustomer) {
         try {
             cachedCustomer = JSON.parse(savedLocalCustomer);
             phoneNo = cachedCustomer.phone;
         } catch(e) {}
      }

      if (cachedCustomer) {
        setAuthUser(cachedCustomer); 
        setWalletBalance(Number(cachedCustomer.balance) || 0);
        setUserProfile({ 
           id: cachedCustomer.id, 
           name: cachedCustomer.name || '', 
           phone: cachedCustomer.phone || '', 
           address: cachedCustomer.address || '', 
           state: cachedCustomer.state || '', 
           district: cachedCustomer.district || '', 
           block: cachedCustomer.block || '', 
           pincode: cachedCustomer.pincode || '', 
           saved_addresses: cachedCustomer.saved_addresses || [], 
           is_vip: cachedCustomer.is_vip || false, 
           upi_id: cachedCustomer.upi_id || '', 
           balance: cachedCustomer.balance || 0 
        });
        setCheckoutAddress(cachedCustomer.address || '');
      }

      if (phoneNo) {
        // Fresh fetch from Supabase to keep balance & data updated
        const { data: custData } = await supabase.from('customers').select('*').eq('phone', phoneNo);
        if (custData && custData.length > 0) {
          setAuthUser(custData[0]); 
          setWalletBalance(Number(custData[0].balance) || 0);
          setUserProfile({ 
             id: custData[0].id, 
             name: custData[0].name || '', 
             phone: custData[0].phone || '', 
             address: custData[0].address || '', 
             state: custData[0].state || '', 
             district: custData[0].district || '', 
             block: custData[0].block || '', 
             pincode: custData[0].pincode || '', 
             saved_addresses: custData[0].saved_addresses || [], 
             is_vip: custData[0].is_vip || false, 
             upi_id: custData[0].upi_id || '', 
             balance: custData[0].balance || 0 
          });
          setCheckoutAddress(custData[0].address || '');
          localStorage.setItem('fixifiy_customer', JSON.stringify(custData[0]));
        }
        await fetchPastOrders(phoneNo);
      }
      
      const { data: prodData } = await supabase.from('products').select('*').limit(3000).order('id', { ascending: false });
      if (prodData && prodData.length > 0) {
        const validProducts = prodData.filter(p => {
          const stockNum = Number(p.stock || p.total_stock);
          const hasShop = p.shop_id !== null && p.shop_id !== undefined && p.shop_id !== '';
          return hasShop && !isNaN(stockNum) && stockNum > 0;
        });
        setAllProducts(validProducts);
      } else {
        setAllProducts([]);
      }

      setIsCheckingAuth(false); 
    } catch (err: any) { setIsCheckingAuth(false); }
  };
  
  useEffect(() => { fetchAuthAndData(); }, []);

  useEffect(() => {
    if(!authUser) return;
    const realtimeBalance = supabase.channel('customer-balance-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'customers', filter: `id=eq.${authUser.id}` }, (payload) => {
         setWalletBalance(Number(payload.new.balance) || 0);
         setUserProfile(prev => ({...prev, balance: Number(payload.new.balance) || 0}));
      }).subscribe();

    return () => { supabase.removeChannel(realtimeBalance); };
  }, [authUser]);

  useEffect(() => {
    if (appStep === 'cart_checkout' && mainCart.length > 0) {
      handleDeliveryGpsTrace();
    }
  }, [appStep, mainCart]);

  const handleVipUpgrade = () => {
    const adminUpi = appSettings.shoppingUpi || 'admin@upi';
    const amount = 299;
    const link = document.createElement('a'); link.href = `upi://pay?pa=${adminUpi}&pn=Fixifiy&am=${amount}&cu=INR&tn=VIP_Membership_Upgrade`; link.style.display = 'none'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    alert("UPI app open ho rahi hai. Payment successful hone ke baad Admin aapko VIP list mein verify kar ke add kar denge!");
  };

  const handleCheckoutClick = async (mode: string) => {
    if (!userProfile?.phone) return alert("Pehle Login/Signup karein!");
    
    const isProduct = appStep === 'cart_checkout';
    const customOrderId = 'FIX-' + Math.floor(100000 + Math.random() * 900000);
    const finalAddress = isNewAddress ? checkoutAddress : userProfile.address;

    try {
        if (isProduct) {
            const selectedItems = mainCart.filter(i => i.selected);
            if (selectedItems.length === 0) return alert("Kam se kam ek item select karein!");

            const productTotal = selectedItems.reduce((s: number, i: any) => s + i.price, 0);
            const finalAmount = productTotal + (deliveryCharge || 0);

            const finalPayload = {
                id: customOrderId,
                customer_name: userProfile.name || 'Customer',
                phone: userProfile.phone,
                address: finalAddress || 'Store Pickup',
                state: userProfile.state || '',
                district: userProfile.district || '',
                block: userProfile.block || '',
                pincode: userProfile.pincode || '', 
                items: selectedItems, 
                total_amount: finalAmount,
                delivery_charge: deliveryCharge || 0,
                payment_mode: mode,
                status: 'Pending', 
                type: 'Product Order',
                shop_id: selectedItems[0]?.shop_id || null,
                date: new Date().toISOString()
            };

            let { error } = await supabase.from('orders').insert([finalPayload]);
            
            if (error && error.message?.toLowerCase().includes('json')) {
                finalPayload.items = JSON.stringify(selectedItems) as any;
                const retry = await supabase.from('orders').insert([finalPayload]);
                if(retry.error) throw retry.error;
            } else if (error) {
                throw error;
            }
            setMainCart(mainCart.filter(i => !i.selected));

        } else {
            if (!savedDraftOrder) return alert("Booking data nahi mila, kripya dobara try karein!");
            
            const transport = appSettings?.isFreeDeliveryActive ? 0 : (appSettings?.transportChargePerKm || 10) * 10;
            const finalAmount = savedDraftOrder.charge + transport;

            const labourPayload = {
                id: customOrderId,      
                order_no: customOrderId, 
                customer_name: userProfile.name || 'Customer',
                phone: userProfile.phone,
                address: finalAddress || 'Location not provided',
                state: savedDraftOrder.state || userProfile.state || '',  
                district: userProfile.district || '',                     
                block: userProfile.block || '',                          
                pincode: userProfile.pincode || '', 
                labour_type: savedDraftOrder.labour_type,
                charge: savedDraftOrder.charge,
                transport_charge: transport,
                total_amount: finalAmount,
                payment_mode: mode,
                status: 'Pending', 
                date: new Date().toISOString()
            };

            const { error: labourError } = await supabase.from('labour_bookings').insert([labourPayload]);
            
            if (labourError) {
                const fallbackPayload = {
                    id: customOrderId,
                    customer_name: userProfile.name || 'Customer',
                    phone: userProfile.phone,
                    address: finalAddress || 'Location not provided',
                    state: savedDraftOrder.state || userProfile.state || '',
                    district: userProfile.district || '', 
                    block: userProfile.block || '',       
                    pincode: userProfile.pincode || '', 
                    items: [{ name: savedDraftOrder.labour_type, price: savedDraftOrder.charge, quantity: 1, unit: 'Booking' }], 
                    total_amount: finalAmount,
                    delivery_charge: transport,
                    payment_mode: mode,
                    status: 'Pending', 
                    type: 'Labour Booking',
                    date: new Date().toISOString()
                };
                
                let { error: fallbackError } = await supabase.from('orders').insert([fallbackPayload]);
                if (fallbackError && fallbackError.message?.toLowerCase().includes('json')) {
                    fallbackPayload.items = JSON.stringify(fallbackPayload.items) as any;
                    const fallbackRetry = await supabase.from('orders').insert([fallbackPayload]);
                    if(fallbackRetry.error) throw fallbackRetry.error;
                } else if (fallbackError) {
                    throw fallbackError;
                }
            }

            setSavedDraftOrder(null); 
        }

        await fetchPastOrders(userProfile.phone); 
        
        if (!mode.includes('UPI') && !mode.includes('Draft')) {
            alert(`✅ ${isProduct ? 'Order' : 'Booking'} Placed Successfully via ${mode}!`);
        }
        
    } catch (e: any) {
        console.error("Save Booking Error:", e);
        alert(`❌ Error: ${e.message}`);
    }
  };

  const handleNativeUpiPayment = (upiApp: string) => {
      const adminUpi = getActiveUpiId();
      let totalAmount = 0;
      if (appStep === 'cart_checkout') {
          totalAmount = mainCart.filter(i => i.selected).reduce((s, i) => s + i.price, 0) + (deliveryCharge || 0);
      } else {
          totalAmount = savedDraftOrder?.charge || 0;
      }
      
      const link = document.createElement('a'); 
      link.href = `upi://pay?pa=${adminUpi}&pn=Fixifiy&am=${totalAmount}&cu=INR&tn=Order_Payment`; 
      link.style.display = 'none'; 
      document.body.appendChild(link); 
      link.click(); 
      document.body.removeChild(link);
  };

  const handleSaveAsDraft = async () => {
      if (!userProfile?.phone) return alert("Pehle Login/Signup karein!");
      const isProduct = appStep === 'cart_checkout';
      const customOrderId = 'DRAFT-' + Math.floor(100000 + Math.random() * 900000);
      const finalAddress = isNewAddress ? checkoutAddress : userProfile.address;

      try {
          if (isProduct) {
              const selectedItems = mainCart.filter(i => i.selected);
              if (selectedItems.length === 0) return alert("Kam se kam ek item select karein!");
              const productTotal = selectedItems.reduce((s: number, i: any) => s + i.price, 0);
              const finalAmount = productTotal + (deliveryCharge || 0);

              const finalPayload = {
                  id: customOrderId,
                  customer_name: userProfile.name || 'Customer',
                  phone: userProfile.phone,
                  address: finalAddress || 'Store Pickup',
                  state: userProfile.state || '',
                  district: userProfile.district || '',
                  block: userProfile.block || '',
                  pincode: userProfile.pincode || '', 
                  items: selectedItems, 
                  total_amount: finalAmount,
                  delivery_charge: deliveryCharge || 0,
                  payment_mode: 'Draft',
                  status: 'Draft', 
                  type: 'Product Order',
                  shop_id: selectedItems[0]?.shop_id || null,
                  date: new Date().toISOString()
              };

              let { error } = await supabase.from('orders').insert([finalPayload]);
              if (error && error.message?.toLowerCase().includes('json')) {
                  finalPayload.items = JSON.stringify(selectedItems) as any;
                  await supabase.from('orders').insert([finalPayload]);
              }
              setMainCart(mainCart.filter(i => !i.selected));

          } else {
              if (!savedDraftOrder) return alert("Booking data nahi mila!");
              const transport = appSettings?.isFreeDeliveryActive ? 0 : (appSettings?.transportChargePerKm || 10) * 10;
              const finalAmount = savedDraftOrder.charge + transport;

              const labourPayload = {
                  id: customOrderId,      
                  order_no: customOrderId, 
                  customer_name: userProfile.name || 'Customer',
                  phone: userProfile.phone,
                  address: finalAddress || 'Location not provided',
                  state: savedDraftOrder.state || userProfile.state || '', 
                  district: userProfile.district || '',                     
                  block: userProfile.block || '',                          
                  pincode: userProfile.pincode || '', 
                  labour_type: savedDraftOrder.labour_type,
                  charge: savedDraftOrder.charge,
                  transport_charge: transport,
                  total_amount: finalAmount,
                  payment_mode: 'Draft',
                  status: 'Draft', 
                  date: new Date().toISOString()
              };

              const { error: labourError } = await supabase.from('labour_bookings').insert([labourPayload]);
              
              if (labourError) {
                  const fallbackPayload = {
                      id: customOrderId,
                      customer_name: userProfile.name || 'Customer',
                      phone: userProfile.phone,
                      address: finalAddress || 'Location not provided',
                      state: savedDraftOrder.state || userProfile.state || '', 
                      district: userProfile.district || '',                     
                      block: userProfile.block || '',                          
                      pincode: userProfile.pincode || '', 
                      items: [{ name: savedDraftOrder.labour_type, price: savedDraftOrder.charge, quantity: 1, unit: 'Booking' }], 
                      total_amount: finalAmount,
                      delivery_charge: transport,
                      payment_mode: 'Draft',
                      status: 'Draft', 
                      type: 'Labour Booking',
                      date: new Date().toISOString()
                  };
                  let { error: fallbackError } = await supabase.from('orders').insert([fallbackPayload]);
                  if (fallbackError && fallbackError.message?.toLowerCase().includes('json')) {
                      fallbackPayload.items = JSON.stringify(fallbackPayload.items) as any;
                      await supabase.from('orders').insert([fallbackPayload]);
                  }
              }
              setSavedDraftOrder(null); 
          }

          await fetchPastOrders(userProfile.phone); 
          alert("📝 Draft Saved Successfully!");
          setOrderTab('drafts');
          setAppStep('orders');
          
      } catch (e: any) {
          console.error("Save Draft Error:", e);
          alert(`❌ Error: ${e.message}`);
      }
  };

  const resumeDraft = (draft: any) => {
      if (!draft) return;
      if (draft.type === 'Labour Booking') {
          const charge = draft.items && draft.items[0] ? draft.items[0].price : draft.charge || draft.totalAmount;
          const labourType = draft.items && draft.items[0] ? draft.items[0].name : draft.labour_type || 'Mistri Booking';
          setSavedDraftOrder({
              labour_type: labourType,
              charge: charge,
              state: draft.state || '',
              district: draft.district || '',
              block: draft.block || '',
              pincode: draft.pincode || '',
              chat_history: draft.chat_history || []
          });
          setAppStep('labour_checkout');
      } else {
          const itemsToResume = Array.isArray(draft.items) ? draft.items.map((i:any) => ({...i, selected: true})) : [];
          setMainCart(itemsToResume);
          setAppStep('cart_checkout'); 
      }
  };

  const handleDeleteOrder = async (orderId: string, orderType: string) => {
      if (!orderId) return;
      const confirmCancel = window.confirm(`Kya aap sach mein is ${orderType} ko CANCEL karna chahte hain?`);
      if (!confirmCancel) return;

      try {
          let tableName = orderType === 'Labour Booking' ? 'labour_bookings' : 'orders';
          let columnToMatch = orderType === 'Labour Booking' ? 'order_no' : 'id';
          
          let { data: orderData } = await supabase.from(tableName).select('*').eq(columnToMatch, orderId).single();
          if (!orderData && orderType === 'Labour Booking') {
              const { data: fallbackData } = await supabase.from('orders').select('*').eq('id', orderId).single();
              if (fallbackData) {
                  orderData = fallbackData;
                  tableName = 'orders';
                  columnToMatch = 'id';
              }
          }

          if (!orderData) return alert("❌ Order database mein nahi mila!");
          if (orderData.status === 'Completed' || orderData.status === 'Delivered') return alert("❌ Completed kaam cancel nahi ho sakta.");
          if (orderData.status === 'Cancelled') return alert("⚠️ Yeh order pehle hi cancel ho chuka hai.");

          let refundMsg = "";
          const paymentMode = String(orderData.payment_mode || '').toLowerCase();
          const amountToRefund = Number(orderData.total_amount || orderData.booking_amount || orderData.charge || 0);

          if (!paymentMode.includes('cod') && !paymentMode.includes('draft') && !paymentMode.includes('cash') && amountToRefund > 0) {
              const newBalance = (userProfile.balance || 0) + amountToRefund;
              await supabase.from('customers').update({ balance: newBalance }).eq('phone', userProfile.phone);
              await supabase.from('wallet_transactions').insert({
                 user_type: 'customer',
                 customer_id: userProfile.id,
                 amount: amountToRefund,
                 type: 'credit',
                 status: 'completed',
                 reason: `Refund for Cancelled ${orderType} (${orderId})`
              });

              setUserProfile(prev => ({ ...prev, balance: newBalance }));
              setWalletBalance(newBalance);
              refundMsg = `💳 ₹${amountToRefund} aapke Fixifiy Wallet mein turant Refund ho gaye hain!`;
          }

          const updatePayload = {
              status: 'Cancelled',
              refund_status: (!paymentMode.includes('cod') && !paymentMode.includes('draft') && !paymentMode.includes('cash')) ? 'Refunded to Wallet' : 'No Refund Needed'
          };

          const { error: updateErr } = await supabase.from(tableName).update(updatePayload).eq(columnToMatch, orderId);
          if (updateErr) throw updateErr;

          alert(`✅ Order Cancelled Successfully!\n${refundMsg}`);
          await fetchPastOrders(userProfile.phone);

      } catch (err: any) {
          console.error("Cancel Error:", err);
          alert("❌ Cancel karne mein problem aayi: " + err.message);
      }
  };

  const handleDeliveryGpsTrace = async () => {
    setIsGpsLoading(true);
    try {
      const calculatedDistance = distanceKm > 0 ? distanceKm : (Math.floor(Math.random() * 20) + 2); 
      setDistanceKm(calculatedDistance);

      const ratePerKm = Number(appSettings?.deliveryChargePerKm || 15);
      const ratePerKg = Number(appSettings?.deliveryChargePerKg || 2);
      const selectedCartItems = mainCart.filter(i => i.selected);
      
      let ironWeight = 0;
      let cementBags = 0;

      selectedCartItems.forEach(item => {
          const cat = String(item.category || '').toLowerCase();
          const name = String(item.name || '').toLowerCase();
          if (cat.includes('cement') || name.includes('cement')) {
              cementBags += Number(item.quantity || 1);
          } else if (
            cat.includes('iron') || cat.includes('loha') || cat.includes('steel') || cat.includes('tmt') || cat.includes('hardware') ||
            name.includes('iron') || name.includes('loha') || name.includes('steel') || name.includes('tmt') || item.is_heavy
          ) {
              ironWeight += Number(item.weight || 1);
          }
      });

      const ironCharge = ironWeight > 0 ? (calculatedDistance * ratePerKm) + (ironWeight * ratePerKg) : 0;
      const cementCharge = cementBags * 50;
      const heavyDeliveryFee = ironCharge + cementCharge;
      
      setDeliveryCharge(Math.round(heavyDeliveryFee));
      setIsGpsLoading(false);
    } catch(e) {
       setIsGpsLoading(false);
    }
  };

  const processLabourBooking = async (chatHistoryData: any[], finalRate: number, selectedState: string) => {
    if (!userProfile?.phone) return alert("Kripya pehle profile icon se Login/Signup karein!");
    if (!labourCategory) return alert("Kripya ek Mistri category select karein!");
    
    setSavedDraftOrder({
        labour_type: `${labourCategory} (${labourType})`,
        charge: finalRate,
        state: selectedState,
        chat_history: chatHistoryData
    });
    setAppStep('labour_checkout');
  };

  const handleCategoryClick = (cat: any) => { 
    setSelectedCategory(cat.name); setAppStep('shop_items'); setSearchTerm(''); 
  };
  
  const getImagesArray = (item: any) => {
    if (!item) return [];
    if (item.isMistri) return item.avatar ? [item.avatar] : ['https://placehold.co/400x300?text=No+Image'];
    if (!item.image_url || item.image_url.trim() === '') return [];
    return item.image_url.split(',');
  };

  const openCartModal = (item: any) => { 
    setCartModalItem(item); 
    setActiveModalImageIndex(0); 
    const actualUnit = item.unit ? String(item.unit).toLowerCase() : '';
    const isWeight = actualUnit === 'kg' || actualUnit === 'ltr' || actualUnit === 'meter' || actualUnit === 'ton';
    if (item.unit) {
       setBuyType(isWeight ? 'weight' : 'piece');
    } else {
       setBuyType((['Mobiles & Accessories', 'Laptops & Printers', 'Cameras', 'Old Vehicles (Sell/Buy)'].includes(item.category)) ? 'piece' : 'weight');
    }
    setBuyValue(''); setShowReviewForm(false); setSearchTerm(''); setAppStep('product_detail'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCartItemSelection = (id: number) => { setMainCart(mainCart.map(item => item.id === id ? { ...item, selected: !item.selected } : item)); };

  const handleConfirmAddToCart = () => { 
    const qty = Number(buyValue); if (!qty || qty <= 0) return alert('Kripya sahi Quantity daalein!');
    const availableStock = cartModalItem.stock || cartModalItem.total_stock || 999; 
    if (qty > availableStock) return alert(`Sirf ${availableStock} items hi stock!`);
    
    const finalPrice = Math.round(qty * cartModalItem.price); 
    const itemWeight = buyType === 'weight' ? qty : (qty * 0.5); 
    setTotalCartWeight(prev => prev + itemWeight);
    
    const unitDisplay = cartModalItem.unit || (buyType === 'weight' ? 'Kg' : 'Pc');
    const cleanName = cartModalItem.name.replace(/\(.*Kg\/Mtr\/Ton.*\)/i, '').replace(/\(.*Pcs.*\)/i, '').replace(/\(.*Pc.*\)/i, '').trim();
    const finalNameWithQty = `${cleanName} (${qty} ${unitDisplay})`;

    setMainCart([...mainCart, { 
        id: Math.random(), 
        product_id: cartModalItem.id, 
        shop_id: cartModalItem.shop_id, 
        name: finalNameWithQty, 
        unit: unitDisplay, 
        price: finalPrice, 
        weight: itemWeight, 
        isLabour: false, 
        ratePerUnit: cartModalItem.price, 
        quantity: qty, 
        is_cod_available: cartModalItem.is_cod_available, 
        return_policy: cartModalItem.return_policy || 'No Return', 
        selected: true 
    }]);
    setCartModalItem(null); setBuyValue(''); alert('Item Cart mein add ho gaya hai!'); setAppStep('cart_checkout'); 
  };

  const displayProducts = allProducts.filter((product) => {
    if (!product || !product.name) return false; 
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedCategory ? product.category?.toLowerCase() === selectedCategory.toLowerCase() : true);
  });
  
  const getRelatedItems = () => {
    if (!cartModalItem || !allProducts) return [];
    const sameCategory = allProducts.filter(item => item.id !== cartModalItem.id && String(item.category).toLowerCase() === String(cartModalItem.category).toLowerCase());
    const otherCategory = allProducts.filter(item => item.id !== cartModalItem.id && String(item.category).toLowerCase() !== String(cartModalItem.category).toLowerCase());
    return [...sameCategory, ...otherCategory].slice(0, 15); 
  };

  const handleSecureCall = (callObject: {roomId: string, title: string} | null) => {
    if (!callObject) { setActiveCall(null); return; }
    setActiveCall({ roomId: callObject.roomId, title: callObject.title });
  };

  const estDeliveryTimeForCart = distanceKm > 0 ? (distanceKm <= 30 ? "Within 24 Hours 🚀" : "2-3 Days 🚚") : "2-4 Days 📦";

  if (isCheckingAuth) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#38bdf8' }}><h2>Loading Customer Portal...</h2></div>;

  const sharedStyles = `
    .main-bg { background: #f8fafc; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; color: #0f172a; padding-bottom: 50px; }
    .glass-card { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); padding: 25px; max-width: 1200px; margin: 0 auto; }
    .primary-btn { background: #fb641b; color: white; border: none; padding: 14px; border-radius: 4px; font-weight: 700; cursor: pointer; width: 100%; font-size: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.2); transition: 0.2s; text-align: center; display: block; }
    .primary-btn:hover { background: #f05a13; } .btn-blue { background: #2874f0; } .btn-blue:hover { background: #1a61d5; }
    .input-pill { border: 1px solid #c2c2c2; outline: none; width: 100%; font-size: 14px; color: #212121; padding: 12px; border-radius: 4px; box-sizing: border-box; }
    .feed-card { background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; transition: transform 0.2s; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; height: 100%; position: relative;}
    .feed-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .hide-scrollbar::-webkit-scrollbar { height: 6px; } 
    .hide-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .vip-button { background: linear-gradient(90deg, #facc15, #f59e0b); color: #0f172a; padding: 8px 16px; border-radius: 30px; font-weight: 900; font-size: 13px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4); }
    @media print { * { overflow: visible !important; } .no-print { display: none !important; } body, html, .main-bg { background: white !important; margin: 0; padding: 0; height: auto !important; } }
  `;

  return (
    <div className="main-bg">
      <style>{sharedStyles}</style>

      <div className="no-print">
        <div style={{ background: '#0f172a', color: 'white', padding: '8px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '12px' }}>
          <div>📞 Customer Care: 1800-XXX-XXXX & +919709740882</div>
        </div>

        <Header appStep={appStep} setAppStep={setAppStep} setSelectedCategory={setSelectedCategory} notifications={notifications} setLabourCategory={setLabourCategory} supabase={supabase} router={router} pastOrders={pastOrders} setFinalInvoice={setFinalInvoice} setOrderTab={setOrderTab} walletBalance={walletBalance} />
      </div>

      {appStep === 'home' && (
        <HomeFeed userProfile={userProfile} userLocation={userLocation} handleVipUpgrade={handleVipUpgrade} searchTerm={searchTerm} setSearchTerm={setSearchTerm} displayProducts={displayProducts} openCartModal={openCartModal} homeCategories={homeCategories} handleCategoryClick={handleCategoryClick} setAppStep={setAppStep} setSelectedCategory={setSelectedCategory} featuredMistris={featuredMistris} mistriSearchTerm={mistriSearchTerm} setMistriSearchTerm={setMistriSearchTerm} processDirectMistriBook={() => {}} />
      )}

      {appStep === 'recharge' && <div className="no-print"><RechargeView userProfile={userProfile} setAppStep={setAppStep} /></div>}
      {appStep === 'travel' && <div className="no-print"><TravelBookingView setAppStep={setAppStep} /></div>}
      {(appStep === 'about' || appStep === 'terms' || appStep === 'refund' || appStep === 'privacy') && <LegalPages pageType={appStep} setAppState={setAppStep} />}

      {appStep === 'product_detail' && cartModalItem && (
        <ProductDetailView 
           cartModalItem={cartModalItem} 
           setAppStep={setAppStep} 
           selectedItemImages={getImagesArray(cartModalItem)} 
           activeModalImageIndex={activeModalImageIndex} 
           setActiveModalImageIndex={setActiveModalImageIndex} 
           buyType={buyType} setBuyType={setBuyType} 
           buyValue={buyValue} setBuyValue={setBuyValue} 
           setShowReviewsModal={setShowReviewsModal} 
           handleConfirmAddToCart={handleConfirmAddToCart} 
           getRelatedItems={getRelatedItems} 
           openCartModal={openCartModal} 
           shopDetails={availableShops.find(s => s.id === cartModalItem.shop_id) || null}
           userProfile={userProfile}
           setUserProfile={setUserProfile}
           selectedLanguage={selectedLanguage} 
        />
      )}

      {appStep === 'shop_items' && <div className="no-print"><ShopView selectedCategory={selectedCategory} setAppStep={setAppStep} displayProducts={displayProducts} openCartModal={openCartModal} mainCart={mainCart} totalCartWeight={totalCartWeight} handleDeliveryGpsTrace={handleDeliveryGpsTrace} isGpsLoading={isGpsLoading} distanceKm={distanceKm} deliveryCharge={deliveryCharge} processProductCheckout={() => setAppStep('cart_checkout')} /></div>}
      
      {appStep === 'hire_labour' && <div className="no-print"><LabourView setAppStep={setAppStep} labourCategoriesList={labourCategoriesList} labourCategory={labourCategory} setLabourCategory={setLabourCategory} labourType={labourType} setLabourType={setLabourType} processLabourBooking={processLabourBooking} selectedLanguage={selectedLanguage} /></div>}

      {appStep === 'profile' && <ProfileView userProfile={userProfile} setUserProfile={setUserProfile} setAppStep={setAppStep} />}
      
      {appStep === 'wallet_passbook' && <div className="no-print"><WalletPassbook supabase={supabase} user={authUser} setAppStep={setAppStep} /></div>}

      {(appStep === 'cart_checkout' || appStep === 'labour_checkout') && (
        <CartView appStep={appStep} setAppStep={setAppStep} mainCart={mainCart} setMainCart={setMainCart} savedDraftOrder={savedDraftOrder} deliveryCharge={deliveryCharge} setDeliveryCharge={setDeliveryCharge} isNewAddress={isNewAddress} setIsNewAddress={setIsNewAddress} userProfile={userProfile} setUserProfile={setUserProfile} checkoutAddress={checkoutAddress} setCheckoutAddress={setCheckoutAddress} isGpsLoading={isGpsLoading} appSettings={appSettings} acceptedTerms={acceptedTerms} setAcceptedTerms={setAcceptedTerms} showUpiGateway={showUpiGateway} setShowUpiGateway={setShowUpiGateway} showQrScan={showQrScan} setShowQrScan={setShowQrScan} showAdvanceUpiModal={showAdvanceUpiModal} setShowAdvanceUpiModal={setShowAdvanceUpiModal} pendingPaymentMode={pendingPaymentMode} setPendingPaymentMode={setPendingPaymentMode} getActiveUpiId={getActiveUpiId} getActiveQrCode={getActiveQrCode} getLabourTransportCharge={getLabourTransportCharge} toggleCartItemSelection={toggleCartItemSelection} handleDeliveryGpsTrace={handleDeliveryGpsTrace} handleCheckoutClick={handleCheckoutClick} handleNativeUpiPayment={handleNativeUpiPayment} handleSaveAsDraft={handleSaveAsDraft} estDeliveryTime={estDeliveryTimeForCart} setOrderTab={setOrderTab} selectedLanguage={selectedLanguage} />
      )}

      {appStep === 'orders' && (
        <OrderView appStep={appStep} setAppStep={setAppStep} finalInvoice={finalInvoice} setFinalInvoice={setFinalInvoice} orderTab={orderTab} setOrderTab={setOrderTab} pastOrders={pastOrders} savedDrafts={savedDrafts} visibleOrdersCount={visibleOrdersCount} setVisibleOrdersCount={setVisibleOrdersCount} userProfile={userProfile} isOrderChatOpen={isOrderChatOpen} setIsOrderChatOpen={setIsOrderChatOpen} chatMessage={chatMessage} setChatMessage={setChatMessage} isChatUploading={isChatUploading} resumeDraft={resumeDraft} handleChatImageUpload={() => {}} handleSendMessage={() => {}} setActiveCall={handleSecureCall} handleDeleteOrder={handleDeleteOrder} selectedLanguage={selectedLanguage} />
      )}

      <Footer setAppState={setAppStep} />
      <FloatingWidgets appStep={appStep} mainCart={mainCart} setAppStep={setAppStep} activeCall={activeCall} setActiveCall={setActiveCall} userProfile={userProfile} isHelpdeskOpen={isHelpdeskOpen} setIsHelpdeskOpen={setIsHelpdeskOpen} />
    </div>
  );
}

export default function CustomerPortalPage() {
  return (
    <AppProvider>
      <MainCustomerScreen />
    </AppProvider>
  );
}