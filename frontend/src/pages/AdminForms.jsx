import { useState } from "react";
import axios from "axios";

function AdminForms({ initialTab = "destination" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const [placeData, setPlaceData] = useState({ name: "", state: "", category: "Hill Station", description: "", imageUrl: "", popular: false, activities: "" });
  const [hotelData, setHotelData] = useState({ name: "", place: "", city: "", state: "", country: "India", address: "", description: "", images: "", pricePerNight: "", rating: 0, numReviews: 0, amenities: "", roomsAvailable: "", isPopular: false });
  const [busData, setBusData] = useState({ operatorName: "", busType: "AC Sleeper", origin: "", destination: "", departureTime: "", arrivalTime: "", pricePerSeat: "", totalSeats: "", images: "" });

  const placeCategories = ["Hill Station", "Beach", "Temple", "Historical", "Adventure"];

  const handlePlaceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlaceData({ ...placeData, [name]: type === "checkbox" ? checked : value });
  };

  const submitPlace = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus({ type: "", message: "" });
    try {
      const activitiesArray = placeData.activities.split(",").map((i) => i.trim()).filter(Boolean);
      await axios.post("https://trip-crafter.onrender.com/api/places", { ...placeData, activities: activitiesArray }, { withCredentials: true });
      setStatus({ type: "success", message: "Destination added successfully!" });
      setPlaceData({ name: "", state: "", category: "Hill Station", description: "", imageUrl: "", popular: false, activities: "" });
      const res = await axios.get("https://trip-crafter.onrender.com/api/places");
      setPlaces(res.data);
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Failed to add destination" });
    } finally { setLoading(false); }
  };

  const handleHotelChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHotelData({ ...hotelData, [name]: type === "checkbox" ? checked : value });
  };

  const submitHotel = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus({ type: "", message: "" });
    try {
      if (!hotelData.place) throw new Error("Please select a Destination Place!");
      const imagesArray = hotelData.images.split(",").map((i) => i.trim()).filter(Boolean);
      const amenitiesArray = hotelData.amenities.split(",").map((i) => i.trim()).filter(Boolean);
      const payload = { name: hotelData.name, place: hotelData.place, location: { city: hotelData.city, state: hotelData.state, country: hotelData.country }, address: hotelData.address, description: hotelData.description, images: imagesArray, pricePerNight: Number(hotelData.pricePerNight), rating: Number(hotelData.rating), numReviews: Number(hotelData.numReviews), amenities: amenitiesArray, roomsAvailable: Number(hotelData.roomsAvailable), isPopular: hotelData.isPopular };
      await axios.post("https://trip-crafter.onrender.com/api/hotels", payload, { withCredentials: true });
      setStatus({ type: "success", message: "Hotel added successfully!" });
      setHotelData({ name: "", place: "", city: "", state: "", country: "India", address: "", description: "", images: "", pricePerNight: "", rating: 0, numReviews: 0, amenities: "", roomsAvailable: "", isPopular: false });
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || err.message || "Failed to add hotel" });
    } finally { setLoading(false); }
  };

  const handleBusChange = (e) => setBusData({ ...busData, [e.target.name]: e.target.value });

  const submitBus = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus({ type: "", message: "" });
    try {
      const imagesArray = busData.images.split(",").map((i) => i.trim()).filter(Boolean);
      const payload = { operatorName: busData.operatorName, busType: busData.busType, origin: busData.origin, destination: busData.destination, departureTime: busData.departureTime, arrivalTime: busData.arrivalTime, pricePerSeat: Number(busData.pricePerSeat), totalSeats: Number(busData.totalSeats), images: imagesArray };
      await axios.post("https://trip-crafter.onrender.com/api/buses", payload, { withCredentials: true });
      setStatus({ type: "success", message: "Bus added successfully!" });
      setBusData({ operatorName: "", busType: "AC Sleeper", origin: "", destination: "", departureTime: "", arrivalTime: "", pricePerSeat: "", totalSeats: "", images: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || err.message || "Failed to add bus" });
    } finally { setLoading(false); }
  };

  // Load places when switching to hotel tab
  const handleTabChange = async (tab) => {
    setActiveTab(tab); setStatus({ type: "", message: "" });
    if (tab === "hotel" && places.length === 0) {
      try { const res = await axios.get("https://trip-crafter.onrender.com/api/places"); setPlaces(res.data); } catch {}
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {["destination", "hotel", "bus"].map((t) => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t === "destination" ? "🌍 Destination" : t === "hotel" ? "🏨 Hotel" : "🚌 Bus"}
          </button>
        ))}
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl mb-6 font-medium text-sm ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {status.message}
        </div>
      )}

      {activeTab === "destination" && (
        <form onSubmit={submitPlace} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Place Name</label><input type="text" name="name" value={placeData.name} onChange={handlePlaceChange} required className={inputClass} placeholder="e.g. Manali" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">State</label><input type="text" name="state" value={placeData.state} onChange={handlePlaceChange} required className={inputClass} placeholder="e.g. Himachal Pradesh" /></div>
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label><select name="category" value={placeData.category} onChange={handlePlaceChange} className={`${inputClass} bg-white`}>{placeCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Image URL</label><input type="url" name="imageUrl" value={placeData.imageUrl} onChange={handlePlaceChange} required className={inputClass} placeholder="https://..." /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label><textarea name="description" value={placeData.description} onChange={handlePlaceChange} required rows="3" className={inputClass} /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Activities (comma-separated)</label><input type="text" name="activities" value={placeData.activities} onChange={handlePlaceChange} className={inputClass} placeholder="Trekking, Skiing" /></div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"><input type="checkbox" name="popular" id="popular-dest" checked={placeData.popular} onChange={handlePlaceChange} className="w-5 h-5 text-blue-600 rounded" /><label htmlFor="popular-dest" className="text-gray-700 font-bold cursor-pointer">Mark as Popular Destination</label></div>
          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>{loading ? "Adding..." : "Add Destination"}</button>
        </form>
      )}

      {activeTab === "hotel" && (
        <form onSubmit={submitHotel} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Hotel Name</label><input type="text" name="name" value={hotelData.name} onChange={handleHotelChange} required className={inputClass} placeholder="e.g. Taj Mahal Palace" /></div>
            <div><label className="block text-sm font-bold text-blue-600 mb-1.5">Link to Destination (Required)</label><select name="place" value={hotelData.place} onChange={handleHotelChange} required className={`${inputClass} bg-blue-50 border-blue-200`}><option value="">-- Select a Destination --</option>{places.map((p) => <option key={p._id} value={p._id}>{p.name}, {p.state}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">City</label><input type="text" name="city" value={hotelData.city} onChange={handleHotelChange} className={inputClass} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">State</label><input type="text" name="state" value={hotelData.state} onChange={handleHotelChange} className={inputClass} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Country</label><input type="text" name="country" value={hotelData.country} onChange={handleHotelChange} className={inputClass} /></div>
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Full Address</label><input type="text" name="address" value={hotelData.address} onChange={handleHotelChange} className={inputClass} /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label><textarea name="description" value={hotelData.description} onChange={handleHotelChange} required rows="3" className={inputClass} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Price Per Night (₹)</label><input type="number" name="pricePerNight" value={hotelData.pricePerNight} onChange={handleHotelChange} required min="0" className={inputClass} placeholder="5000" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Rooms Available</label><input type="number" name="roomsAvailable" value={hotelData.roomsAvailable} onChange={handleHotelChange} min="0" className={inputClass} placeholder="10" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Rating (0-5)</label><input type="number" name="rating" value={hotelData.rating} onChange={handleHotelChange} step="0.1" min="0" max="5" className={inputClass} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Number of Reviews</label><input type="number" name="numReviews" value={hotelData.numReviews} onChange={handleHotelChange} min="0" className={inputClass} /></div>
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Images (comma-separated URLs)</label><textarea name="images" value={hotelData.images} onChange={handleHotelChange} rows="2" className={inputClass} placeholder="https://img1.jpg, https://img2.jpg" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Amenities (comma-separated)</label><input type="text" name="amenities" value={hotelData.amenities} onChange={handleHotelChange} className={inputClass} placeholder="wifi, pool, parking, ac" /></div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"><input type="checkbox" name="isPopular" id="popular-hotel" checked={hotelData.isPopular} onChange={handleHotelChange} className="w-5 h-5 text-blue-600 rounded" /><label htmlFor="popular-hotel" className="text-gray-700 font-bold cursor-pointer">Mark as Popular Hotel</label></div>
          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${loading ? "bg-slate-400" : "bg-slate-900 hover:bg-black"}`}>{loading ? "Adding Hotel..." : "Add Hotel"}</button>
        </form>
      )}

      {activeTab === "bus" && (
        <form onSubmit={submitBus} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Operator Name</label><input type="text" name="operatorName" value={busData.operatorName} onChange={handleBusChange} required className={inputClass} placeholder="e.g. Zingbus, VRL Travels" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Bus Type</label><select name="busType" value={busData.busType} onChange={handleBusChange} className={`${inputClass} bg-white`}><option>AC Sleeper</option><option>Non-AC Sleeper</option><option>AC Seater</option><option>Volvo Multi-Axle</option></select></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Origin City</label><input type="text" name="origin" value={busData.origin} onChange={handleBusChange} required className={inputClass} placeholder="e.g. Delhi" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Destination City</label><input type="text" name="destination" value={busData.destination} onChange={handleBusChange} required className={inputClass} placeholder="e.g. Manali" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Departure Time</label><input type="datetime-local" name="departureTime" value={busData.departureTime} onChange={handleBusChange} required className={inputClass} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Arrival Time</label><input type="datetime-local" name="arrivalTime" value={busData.arrivalTime} onChange={handleBusChange} required className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Price Per Seat (₹)</label><input type="number" name="pricePerSeat" value={busData.pricePerSeat} onChange={handleBusChange} required min="0" className={inputClass} placeholder="1200" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Total Seats</label><input type="number" name="totalSeats" value={busData.totalSeats} onChange={handleBusChange} required min="1" className={inputClass} placeholder="40" /></div>
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Images (comma-separated URLs)</label><textarea name="images" value={busData.images} onChange={handleBusChange} rows="2" className={inputClass} placeholder="https://img1.jpg" /></div>
          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${loading ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"}`}>{loading ? "Adding Bus..." : "Add Bus"}</button>
        </form>
      )}
    </div>
  );
}

export default AdminForms;
