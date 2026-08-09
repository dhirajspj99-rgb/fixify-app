export default function Contact() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">
        Humse Sampark Karein
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Address aur Phone Number */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Hamara Pata</h2>
          <div className="space-y-4 text-gray-700 font-medium">
            <p>📍 Loha Market, </p>
            <p>📞 +91 9709740882 (Apna asli number yahan daalein)</p>
            <p>✉️ fixifiyenterprisesspj@gmail.com.com</p>
            <p className="mt-4 text-sm text-gray-500">
              Dukan khulne ka samay: Subah 9:00 baje se Shaam 8:00 baje tak.
            </p>
          </div>
        </div>

        {/* Right Side: Customer Enquiry Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Message Bhejein</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Aapka Naam</label>
              <input type="text" className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-600" placeholder="Naam likhein" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
              <input type="text" className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-600" placeholder="10 digit number" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Aapki Zaroorat</label>
              <textarea className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-600" rows={3} placeholder="Loha chahiye ya fabrication ka kaam hai?"></textarea>
            </div>
            <button type="button" className="w-full bg-blue-700 text-white font-bold py-2 px-4 rounded hover:bg-blue-800 transition">
              Message Send Karein
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}