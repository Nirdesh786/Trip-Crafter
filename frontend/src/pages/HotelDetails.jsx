import { useState, useEffect, useContext, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import useRazorpay from "../hooks/useRazorpay";
import { createBooking, initiatePayment, verifyPayment } from "../services/paymentService";

// Helper: format a Date to "YYYY-MM-DD" for <input type="date">
const toInputDate = (date) => date.toISOString().split("T")[0];

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { openCheckout } = useRazorpay();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [dateError, setDateError] = useState("");

  // Date state — default: today → tomorrow
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const [checkIn, setCheckIn] = useState(toInputDate(today));
  const [checkOut, setCheckOut] = useState(toInputDate(tomorrow));

  // Derived values
  const nights = useMemo(() => {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const basePrice = hotel ? hotel.pricePerNight * nights : 0;
  const taxes = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + taxes;

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`https://trip-crafter.onrender.com/api/hotels/${id}`);
        setHotel(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load hotel details");
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    setDateError("");
    // If check-out is now before or equal to new check-in, push it forward by 1 day
    if (new Date(checkOut) <= new Date(val)) {
      const next = new Date(val);
      next.setDate(next.getDate() + 1);
      setCheckOut(toInputDate(next));
    }
  };

  const handleCheckOutChange = (e) => {
    const val = e.target.value;
    if (new Date(val) <= new Date(checkIn)) {
      setDateError("Check-out must be after check-in.");
      return;
    }
    setDateError("");
    setCheckOut(val);
  };

  const handleBook = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (nights === 0) {
      setDateError("Please select at least 1 night.");
      return;
    }

    setBookingLoading(true);
    try {
      // Step 1: Create a pending booking with user-selected dates
      const booking = await createBooking({
        bookingType: "Hotel",
        hotelId: hotel._id,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        totalPrice,
      });

      // Step 2: Create a Razorpay order on the backend
      const orderData = await initiatePayment(booking._id);

      // Step 3: Open Razorpay checkout popup
      openCheckout({
        keyId: orderData.keyId,
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: hotel.name,
        description: `${nights} Night${nights > 1 ? "s" : ""} — ${hotel.location?.city}`,
        prefill: { name: user?.user?.name, email: user?.user?.email },
        onSuccess: async (razorpayResponse) => {
          try {
            await verifyPayment(booking._id, {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });
            toast.success("Booking confirmed! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1200);
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.message || "Payment verification failed");
            setBookingLoading(false);
          }
        },
        onFailure: (msg) => {
          toast.error(msg);
          setBookingLoading(false);
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
      setBookingLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/explore" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Hero Image */}
      <div className="w-full h-[50vh] md:h-[60vh] relative">
        <img
          src={hotel.images && hotel.images.length > 0 ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945"}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {hotel.isPopular && (
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4 inline-block">
              Top Rated Hotel
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{hotel.name}</h1>
          <div className="flex items-center text-gray-200 gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              {hotel.rating} ({hotel.numReviews} Reviews)
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {hotel.location?.city}, {hotel.location?.state}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left — About & Amenities */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About this Hotel</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">{hotel.description}</p>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                <div>
                  <h3 className="font-bold text-gray-800">Full Address</h3>
                  <p className="text-gray-600">{hotel.address}, {hotel.location?.city}, {hotel.location?.state}, {hotel.location?.country}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Amenities</h2>
              {hotel.amenities && hotel.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <span className="font-medium text-gray-700 capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No amenities listed.</p>
              )}
            </div>
          </div>

          {/* Right — Sticky Booking Card */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">

              {/* Price header */}
              <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-6">
                <div>
                  <span className="text-3xl font-extrabold text-gray-800">₹{hotel.pricePerNight}</span>
                  <span className="text-gray-500 text-lg"> / night</span>
                </div>
                <div>
                  {hotel.roomsAvailable > 0 ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                      {hotel.roomsAvailable} Rooms Left!
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>

              {/* ── Date Pickers ── */}
              <div className="mb-6 space-y-3">
                <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
                  {/* Check-In */}
                  <div className="bg-white rounded-xl p-3 border border-gray-200 focus-within:border-blue-500 transition-colors">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      min={toInputDate(today)}
                      onChange={handleCheckInChange}
                      className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none cursor-pointer"
                    />
                  </div>
                  {/* Check-Out */}
                  <div className="bg-white rounded-xl p-3 border border-gray-200 focus-within:border-blue-500 transition-colors">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={handleCheckOutChange}
                      className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Date error */}
                {dateError && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {dateError}
                  </p>
                )}

                {/* Nights badge */}
                {nights > 0 && (
                  <div className="flex items-center justify-center gap-2 py-2 bg-blue-50 rounded-xl">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                    <span className="text-sm font-bold text-blue-700">{nights} Night{nights > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>₹{hotel.pricePerNight} × {nights} night{nights > 1 ? "s" : ""}</span>
                  <span>₹{basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Taxes & Fees (18%)</span>
                  <span>₹{taxes.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-800 font-bold text-lg pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-600">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Book / Login button */}
              {user ? (
                <button
                  onClick={handleBook}
                  disabled={hotel.roomsAvailable === 0 || bookingLoading || nights === 0}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-md flex justify-center items-center ${
                    hotel.roomsAvailable > 0 && !bookingLoading && nights > 0
                      ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {bookingLoading ? (
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  ) : hotel.roomsAvailable > 0 ? (
                    nights > 0 ? "Reserve Now" : "Select Dates"
                  ) : (
                    "Unavailable"
                  )}
                </button>
              ) : (
                <Link to="/login">
                  <button className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md">
                    Login to Book
                  </button>
                </Link>
              )}

              <p className="text-center text-xs text-gray-400 mt-4">
                Free cancellation before check-in · No hidden charges
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
