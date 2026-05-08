import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import HotelCard from "../components/HotelCard";
import { AuthContext } from "../context/AuthContext";

function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [place, setPlace] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch place details
        const placeRes = await axios.get(`http://localhost:4000/api/places/${id}`);
        setPlace(placeRes.data);

        // Fetch hotels linked to this place
        const hotelRes = await axios.get(`http://localhost:4000/api/hotels?place=${id}`);
        setHotels(hotelRes.data);

        if (user) {
          try {
            const wishlistCheckRes = await axios.get(
              `http://localhost:4000/api/wishlist/check/${id}`,
              { withCredentials: true }
            );
            setIsSaved(wishlistCheckRes.data?.isSaved || false);
          } catch (wishlistError) {
            console.warn("Wishlist status check failed", wishlistError);
          }
        } else {
          setIsSaved(false);
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load place details");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleStartPlanning = () => {
    navigate(`/hotels?place=${id}&placeName=${encodeURIComponent(place?.name || "")}`);
  };

  const handleSaveForLater = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (saveLoading) return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        await axios.delete(`http://localhost:4000/api/wishlist/${id}`, {
          withCredentials: true,
        });
        setIsSaved(false);
      } else {
        await axios.post(
          `http://localhost:4000/api/wishlist/${id}`,
          {},
          { withCredentials: true }
        );
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update wishlist");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/explore" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  if (!place) return null;

  return (
    <div className="bg-gray-50 pb-12">
      {/* Hero Image Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-gray-900">
        <img 
          src={place.imageUrl} 
          alt={place.name} 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        {/* Floating Content over Hero */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
              {place.category}
            </span>
            {place.popular && (
              <span className="bg-amber-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                Popular
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
            {place.name}
          </h1>
          <div className="flex items-center text-gray-200 font-medium text-lg drop-shadow-sm">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {place.state}, {place.country}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <section className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Overview
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
              {place.description}
            </p>
          </section>

          {/* Activities */}
          <section className="bg-white p-8 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Top Activities
            </h2>
            {place.activities && place.activities.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {place.activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-xl font-medium border border-green-100/60 shadow-sm transition-transform hover:scale-105 cursor-default">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    {activity}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic bg-gray-50 p-4 rounded-xl">No specific activities listed yet.</p>
            )}
          </section>
        </div>

        {/* Right Column: Action Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 sticky top-24">
            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to visit {place.name}?</h3>
            <p className="text-gray-500 mb-8 text-base">Start planning your dream trip today. Add hotels, buses, and craft your perfect itinerary.</p>
            
            <button
              onClick={handleStartPlanning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Start Planning
            </button>
            <button
              onClick={handleSaveForLater}
              disabled={saveLoading}
              className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all border flex items-center justify-center gap-2 ${
                saveLoading
                  ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                  : isSaved
                  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              {saveLoading ? "Updating..." : isSaved ? "Remove from Wishlist" : "Save for later"}
            </button>
          </div>
        </div>

      </div>

      {/* Linked Hotels Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">🏨</span> Places to stay in {place.name}
          </h2>
          <Link to="/hotels" className="text-blue-600 font-bold hover:text-blue-800">
            View All Hotels &rarr;
          </Link>
        </div>

        {hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No hotels found</h3>
            <p className="text-gray-500">We are currently looking for the best places to stay in {place.name}.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default PlaceDetails;
