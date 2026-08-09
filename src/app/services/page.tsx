"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* Upar ka Header Area */}
      <div className="bg-blue-800 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Fix & Fab Services</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Patna mein ab Saaman, Expert Mistri, aur Labour - Sab milega ek click par!
        </p>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center border-b-2 border-gray-200 pb-4">
          Aapko Kiski Zaroorat Hai?
        </h2>
        
        {/* Grid Shuru */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Iron Welder */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-gray-600 hover:-translate-y-2 hover:shadow-2xl transition duration-300">
            <div className="text-5xl mb-4">👨‍🏭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Iron Welder</h3>
            <div className="space-y-3 mt-4 text-gray-600 font-medium border-t pt-4">
              <p className="flex items-center">📦 <span>Loha & MS Pipes</span></p>
              <p className="flex items-center">🛠️ <span>Gate / Grill Mistri</span></p>
              <p className="flex items-center">💪 <span>Daily Labour</span></p>
            </div>
            <button 
              onClick={() => router.push("/booking")} 
              className="w-full mt-6 bg-gray-800 text-white py-2 rounded font-bold hover:bg-gray-900 transition cursor-pointer"
            >
              Details Dekhein
            </button>
          </div>

          {/* 2. Steel Mistri (SS) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-teal-500 hover:-translate-y-2 hover:shadow-2xl transition duration-300">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Steel Mistri (SS)</h3>
            <div className="space-y-3 mt-4 text-gray-600 font-medium border-t pt-4">
              <p className="flex items-center">📦 <span>SS Pipes & Sheets</span></p>
              <p className="flex items-center">🛠️ <span>Railing / Balcony Mistri</span></p>
              <p className="flex items-center">💪 <span>Helper / Labour</span></p>
            </div>
            <button 
              onClick={() => router.push("/booking")} 
              className="w-full mt-6 bg-teal-500 text-white py-2 rounded font-bold hover:bg-teal-600 transition cursor-pointer"
            >
              Details Dekhein
            </button>
          </div>

          {/* 3. Aluminium Mistri */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-400 hover:-translate-y-2 hover:shadow-2xl transition duration-300">
            <div className="text-5xl mb-4">🪟</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Aluminium Mistri</h3>
            <div className="space-y-3 mt-4 text-gray-600 font-medium border-t pt-4">
              <p className="flex items-center">📦 <span>Alu. Section & Glass</span></p>
              <p className="flex items-center">🛠️ <span>Window / Partition Mistri</span></p>
              <p className="flex items-center">💪 <span>Helper / Labour</span></p>
            </div>
            <button 
              onClick={() => router.push("/booking")} 
              className="w-full mt-6 bg-indigo-500 text-white py-2 rounded font-bold hover:bg-indigo-600 transition cursor-pointer"
            >
              Details Dekhein
            </button>
          </div>

          {/* 4. Electrician */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 hover:-translate-y-2 hover:shadow-2xl transition duration-300">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Electrician</h3>
            <div className="space-y-3 mt-4 text-gray-600 font-medium border-t pt-4">
              <p className="flex items-center">📦 <span>Taar & Switches</span></p>
              <p className="flex items-center">🛠️ <span>Expert Mistri</span></p>
              <p className="flex items-center">💪 <span>Helper / Labour</span></p>
            </div>
            <button 
              onClick={() => router.push("/booking")} 
              className="w-full mt-6 bg-yellow-500 text-white py-2 rounded font-bold hover:bg-yellow-600 transition cursor-pointer"
            >
              Details Dekhein
            </button>
          </div>

          {/* 5. Carpenter */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-700 hover:-translate-y-2 hover:shadow-2xl transition duration-300">
            <div className="text-5xl mb-4">🪚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Carpenter</h3>
            <div className="space-y-3 mt-4 text-gray-600 font-medium border-t pt-4">
              <p className="flex items-center">📦 <span>Lakdi & Sunmica</span></p>
              <p className="flex items-center">🛠️ <span>Badhai / Mistri</span></p>
              <p className="flex items-center">💪 <span>Helper / Labour</span></p>
            </div>
            <button 
              onClick={() => router.push("/booking")} 
              className="w-full mt-6 bg-amber-700 text-white py-2 rounded font-bold hover:bg-amber-800 transition cursor-pointer"
            >
              Details Dekhein
            </button>
          </div>

          {/* 6. Plumber */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:-translate-y-2 hover:shadow-2xl transition duration-300">
            <div className="text-5xl mb-4">🔧</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Plumber</h3>
            <div className="space-y-3 mt-4 text-gray-600 font-medium border-t pt-4">
              <p className="flex items-center">📦 <span>Pipes & Fittings</span></p>
              <p className="flex items-center">🛠️ <span>Expert Plumber</span></p>
              <p className="flex items-center">💪 <span>Helper / Labour</span></p>
            </div>
            <button 
              onClick={() => router.push("/booking")} 
              className="w-full mt-6 bg-blue-500 text-white py-2 rounded font-bold hover:bg-blue-600 transition cursor-pointer"
            >
              Details Dekhein
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}