"use client";

import React, { useState, useEffect } from 'react';

// ==========================================
// 1. YAHAN AAPKA BUTTON COMPONENT HAI
// ==========================================
function AcceptOrderButton({ orderId, userId, resolutionType, onAcceptSuccess, isDisabled }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAcceptClick = async (e) => {
    if (e) e.stopPropagation(); 
    
    setLoading(true);
    setMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const isSuccess = true; 

      if (isSuccess) {
        setMessage('✅ Order Accepted!');
        onAcceptSuccess(orderId); 
      } else {
        setMessage('❌ Kisi aur dukandar ne le liya!');
      }
    } catch (error) {
      setMessage('Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button 
        onClick={handleAcceptClick} 
        disabled={loading || message.includes('✅') || isDisabled}
        className={`w-full px-4 py-2 font-bold text-white rounded-lg transition-colors shadow-sm ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : message.includes('✅')
              ? 'bg-green-500 cursor-default'
              : isDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {loading ? 'Accept ho raha hai...' : message.includes('✅') ? 'Order Aapka Hua!' : 'Accept Order'}
      </button>
      
      {message && (
        <p className={`text-sm font-medium mt-2 text-center ${message.includes('✅') ? 'text-green-700' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 2. YEH AAPKA SHOP OWNER DASHBOARD HAI
// ==========================================
export default function App() {
  const [orders, setOrders] = useState([
    { 
      id: 'ORD-1001', 
      details: 'Monthly Grocery Items', 
      price: '₹1,250', 
      status: 'pending',
      customerName: 'Rahul Kumar',
      phone: '+91 98765 43210',
      address: 'Flat 402, Shanti Apartments, MG Road',
      items: [
        { name: '5kg Aashirvaad Atta', inStock: true },
        { name: '2kg Daal', inStock: true },
        { name: '1L Fortune Oil', inStock: true }
      ],
      distance: '1.5 km',
      deliveryType: 'Shop Delivery'
    },
    { 
      id: 'ORD-1002', 
      details: 'Fresh Vegetables & Fruits', 
      price: '₹450', 
      status: 'pending',
      customerName: 'Priya Sharma',
      phone: '+91 87654 32109',
      address: 'House No 12, Block B, Sector 4',
      items: [
        { name: '1kg Apple', inStock: true },
        { name: '2kg Potato', inStock: true },
        { name: '1kg Onion', inStock: false },
        { name: 'Fresh Coriander', inStock: true }
      ],
      distance: '0.8 km',
      deliveryType: 'Customer Pickup'
    },
    { 
      id: 'ORD-1003', 
      details: 'Stationery Items', 
      price: '₹320', 
      status: 'pending',
      customerName: 'Amit Singh',
      phone: '+91 76543 21098',
      address: 'Tech Hub Building, 3rd Floor, IT Park',
      items: [
        { name: '4x Classmate Notebooks', inStock: true },
        { name: '2x Blue Pens', inStock: false },
        { name: '1x Geometry Box', inStock: true }
      ],
      distance: '2.0 km',
      deliveryType: 'Shop Delivery'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [resolutionOption, setResolutionOption] = useState('');

  const [activeTab, setActiveTab] = useState('pending');
  const [acceptedOrders, setAcceptedOrders] = useState([]);

  const currentShopOwnerId = 'shop_owner_789';

  const handleOrderAccepted = (acceptedOrderId) => {
    setTimeout(() => {
      setOrders(prevOrders => {
        const orderToMove = prevOrders.find(o => o.id === acceptedOrderId);
        if (orderToMove) {
          const hasOutOfStock = orderToMove.items.some(item => !item.inStock);
          const finalResolution = hasOutOfStock ? resolutionOption : 'all_in_stock';
          
          setAcceptedOrders(prev => [{ ...orderToMove, status: 'accepted', resolution_type: finalResolution }, ...prev]);
        }
        return prevOrders.filter(o => o.id !== acceptedOrderId);
      });
    }, 2000);
  };

  useEffect(() => {
    if (selectedOrder) {
      const hasOutOfStock = selectedOrder.items.some(item => !item.inStock);
      setResolutionOption(hasOutOfStock ? '' : 'all_in_stock');
    }
  }, [selectedOrder]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto">
        
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-slate-900">Shop Dashboard</h1>
          <p className="text-slate-500 mt-1">Live Customer Orders - Stock check karein aur order accept karein!</p>
          
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-slate-800 text-white' : 'bg-gray-200 text-slate-600 hover:bg-gray-300'}`}
            >
              New Orders ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('accepted')}
              className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'accepted' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-slate-600 hover:bg-gray-300'}`}
            >
              My Accepted Orders ({acceptedOrders.length})
            </button>
          </div>
        </header>

        {activeTab === 'pending' && (
          <>
            {orders.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-700">Koi naya order nahi hai 😴</h3>
                <p className="text-gray-500">Jab koi customer order karega tab yahan dikhega...</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {orders.map((order) => {
                const hasOutOfStock = order.items.some(item => !item.inStock);
                
                return (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-lg text-white ${order.deliveryType === 'Customer Pickup' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                      {order.deliveryType}
                    </div>

                    <div className="flex justify-between items-start mb-2 mt-2">
                      <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full uppercase tracking-wide">
                        {order.status}
                      </span>
                      {hasOutOfStock && (
                        <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                          ⚠️ Stock Issue
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-lg font-semibold mb-1 truncate">{order.details}</h2>
                    <p className="font-bold text-green-600 text-lg mb-2">Total: {order.price}</p>
                    <p className="text-xs text-gray-400 mt-1">📍 {order.distance} away</p>

                    <AcceptOrderButton 
                      orderId={order.id} 
                      userId={currentShopOwnerId} 
                      resolutionType={hasOutOfStock ? '' : 'all_in_stock'}
                      onAcceptSuccess={handleOrderAccepted}
                      isDisabled={hasOutOfStock} 
                    />
                    
                    {hasOutOfStock && (
                      <p className="text-[10px] text-red-500 mt-1 text-center font-semibold">Tap to resolve stock issue before accepting</p>
                    )}

                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'accepted' && (
          <div className="space-y-4">
            {acceptedOrders.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-700">Koi order accept nahi kiya hai</h3>
                <p className="text-gray-500">Aapke accept kiye hue orders yahan dikhenge.</p>
              </div>
            )}
            {acceptedOrders.map((order) => (
              <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-800 rounded-full uppercase tracking-wide">
                      {order.status}
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full text-white ${order.deliveryType === 'Customer Pickup' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                      {order.deliveryType}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold mb-1">{order.details}</h2>
                  <p className="text-sm text-gray-500 font-mono">ID: {order.id} • {order.customerName}</p>
                  
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm inline-block">
                    <span className="font-bold text-slate-700">Fulfillment: </span>
                    {order.resolution_type === 'all_in_stock' && <span className="text-green-600 font-medium">Sab items in-stock the</span>}
                    {order.resolution_type === 'partial_delivery' && <span className="text-orange-600 font-medium">Partial Delivery (Bache hue item chhod diye)</span>}
                    {order.resolution_type === 'delayed_delivery' && <span className="text-blue-600 font-medium">Delayed Delivery (1-2 din mein poora karenge)</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Earnings</p>
                  <p className="text-2xl font-extrabold text-green-600">{order.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="mb-5 pr-8">
              <span className={`inline-block mb-2 text-xs font-bold px-2 py-1 rounded-md text-white ${selectedOrder.deliveryType === 'Customer Pickup' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                {selectedOrder.deliveryType}
              </span>
              <h2 className="text-2xl font-bold text-slate-800">{selectedOrder.details}</h2>
              <p className="text-sm text-gray-500 font-mono mt-1">Order ID: {selectedOrder.id}</p>
            </div>

            <div className="space-y-4 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
              
              <div className="flex items-start gap-3">
                <span className="text-xl">🛒</span>
                <div className="w-full">
                  <p className="font-semibold text-slate-900 mb-2">Stock Check</p>
                  <ul className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <li 
                        key={index} 
                        className={`flex justify-between items-center p-2 rounded border ${
                          item.inStock 
                            ? 'bg-white border-gray-100 text-slate-700' 
                            : 'bg-red-50 border-red-200 text-red-700 font-medium'
                        }`}
                      >
                        <span>{item.name}</span>
                        {!item.inStock && (
                          <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-1 rounded uppercase tracking-wider">
                            Out of Stock
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedOrder.items.some(item => !item.inStock) && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-1">
                    <span>⚠️</span> Kuch items aapke paas nahi hain. Kripya action chunein:
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="resolution" 
                        value="partial_delivery" 
                        checked={resolutionOption === 'partial_delivery'}
                        onChange={(e) => setResolutionOption(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">Available items bhej dunga</span>
                        <span className="text-xs text-slate-500">Bache hue items skip karke order complete karunga (Customer ki sahamti se).</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="resolution" 
                        value="delayed_delivery" 
                        checked={resolutionOption === 'delayed_delivery'}
                        onChange={(e) => setResolutionOption(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">1-2 Din mein pura bhejunga</span>
                        <span className="text-xs text-slate-500">Samaan stock room/market se laakar poora order thoda late dunga.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                <span className="text-xl">👤</span>
                <div>
                  <p className="font-semibold text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-slate-500">{selectedOrder.phone}</p>
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <AcceptOrderButton 
                orderId={selectedOrder.id} 
                userId={currentShopOwnerId} 
                resolutionType={resolutionOption} 
                onAcceptSuccess={(id) => {
                  handleOrderAccepted(id);
                  setSelectedOrder(null); 
                }}
                isDisabled={!resolutionOption} 
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}