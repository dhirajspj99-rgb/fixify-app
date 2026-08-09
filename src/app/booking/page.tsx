"use client";
import { useState } from "react";

export default function Booking() {
  // Customer ne kya select kiya hai uski details
  const [service, setService] = useState("Iron Welder (Loha)");
  const [need, setNeed] = useState("Mistri + Saaman Dono");

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center border-b-2 pb-4">
          Apni Zaroorat Book Karein
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Side: Booking Form */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Details Bharein</h2>
            <form className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Kaunsa Kaam Hai?</label>
                  <select 
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option>Iron Welder (Loha)</option>
                    <option>Steel Mistri (SS)</option>
                    <option>Aluminium Mistri</option>
                    <option>Electrician</option>
                    <option>Carpenter</option>
                    <option>Plumber</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Kya Chahiye?</label>
                  <select 
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                  >
                    <option>Sirf Mistri (Visiting)</option>
                    <option>Sirf Daily Labour</option>
                    <option>Sirf Saaman / Material</option>
                    <option>Mistri + Saaman Dono</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Kaam ka Pata (Address)</label>
                <textarea 
                  rows={3} 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600" 
                  placeholder="Apna poora pata likhein (Jaise: Kankarbagh, Patna)"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Kis Din Mistri Chahiye?</label>
                <input 
                  type="date" 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600"
                />
              </div>

            </form>
          </div>

          {/* Right Side: Bill Summary & Wallet Payment */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-500 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Summary</h2>
            
            <div className="space-y-3 text-gray-600 mb-6 border-b pb-4">
              <p className="flex justify-between"><span>Service:</span> <span className="font-bold text-gray-800 text-right">{service}</span></p>
              <p className="flex justify-between"><span>Type:</span> <span className="font-bold text-gray-800 text-right">{need}</span></p>
              <p className="flex justify-between text-sm text-gray-500 mt-2">Visiting Charge: <span className="text-gray-800 font-bold">₹199</span></p>
            </div>

            {/* Wallet Balance Box */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <p className="text-sm text-blue-800 font-bold flex justify-between mb-1">
                <span>Wallet Balance:</span> <span>₹50</span>
              </p>
              <p className="text-xs text-green-600 font-bold">✅ ₹50 Wallet se discount mila!</p>
            </div>

            {/* Final Button */}
            <button 
              onClick={() => alert("Booking Confirm ho gayi! Mistri jald hi aapse sampark karega.")} 
              className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-lg"
            >
              Book Now (Pay ₹149)
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">Cancel karne par paise Wallet mein wapas aa jayenge.</p>
          </div>

        </div>
      </div>
    </div>
  );
}