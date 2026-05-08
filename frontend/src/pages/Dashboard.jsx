import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/Card";
import Loader from "../components/Loader";
import { BookingCardSkeleton } from "../components/Skeletons";
import ConfirmModal from "../components/ConfirmModal";

const RECOMMENDED_CACHE_KEY = "cache:dashboard:recommended:v1";
const RECOMMENDED_CACHE_TTL_MS = 5 * 60 * 1000;

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [removingWishlistId, setRemovingWishlistId] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const cachedRecommendedRaw = sessionStorage.getItem(RECOMMENDED_CACHE_KEY);
        if (cachedRecommendedRaw) {
          const cachedRecommended = JSON.parse(cachedRecommendedRaw);
          if (Date.now() - cachedRecommended.timestamp < RECOMMENDED_CACHE_TTL_MS && isMounted) {
            setRecommendedPlaces(cachedRecommended.data);
            setLoading(false);
          }
        }
      } catch (cacheError) {
        console.warn("Recommended places cache read failed", cacheError);
      }

      const [placesResult, bookingsResult, wishlistResult] = await Promise.allSettled([
        axios.get("http://localhost:4000/api/places?popular=true&limit=8"),
        axios.get("http://localhost:4000/api/bookings/mybookings", { withCredentials: true }),
        axios.get("http://localhost:4000/api/wishlist", { withCredentials: true }),
      ]);

      if (!isMounted) return;

      if (placesResult.status === "fulfilled") {
        const topRecommended = placesResult.value.data.slice(0, 4);
        setRecommendedPlaces(topRecommended);
        setLoading(false);
        try {
          sessionStorage.setItem(
            RECOMMENDED_CACHE_KEY,
            JSON.stringify({ data: topRecommended, timestamp: Date.now() })
          );
        } catch (cacheWriteError) {
          console.warn("Recommended places cache write failed", cacheWriteError);
        }
      } else {
        console.error("Failed to load recommended places", placesResult.reason);
        setLoading(false);
      }

      if (bookingsResult.status === "fulfilled") {
        setBookings(bookingsResult.value.data);
        setLoadingBookings(false);
      } else {
        console.error("Failed to load bookings", bookingsResult.reason);
        setLoadingBookings(false);
      }

      if (wishlistResult.status === "fulfilled") {
        setWishlist(wishlistResult.value.data);
        setLoadingWishlist(false);
      } else {
        console.error("Failed to load wishlist", wishlistResult.reason);
        setLoadingWishlist(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatReadableDate = (value) => {
    if (!value) return "TBA";
    return new Date(value).toLocaleDateString();
  };

  const formatReadableTime = (value) => {
    if (!value) return "--:--";
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Confirmed") return "bg-emerald-100 text-emerald-700";
    if (status === "Pending") return "bg-amber-100 text-amber-700";
    if (status === "Refunded") return "bg-blue-100 text-blue-700";
    return "bg-gray-200 text-gray-700";
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    if (paymentStatus === "Paid") return "bg-emerald-50 text-emerald-700";
    if (paymentStatus === "Pending") return "bg-amber-50 text-amber-700";
    if (paymentStatus === "Refunded") return "bg-blue-50 text-blue-700";
    if (paymentStatus === "Processing") return "bg-indigo-50 text-indigo-700";
    return "bg-gray-100 text-gray-600";
  };

  const loadBookings = async () => {
    const bookingRes = await axios.get("http://localhost:4000/api/bookings/mybookings", {
      withCredentials: true,
    });
    setBookings(bookingRes.data);
    setLoadingBookings(false);
  };

  const handleCancelBooking = async (bookingId) => {
    if (cancellingBookingId) return;
    setCancelModal({ open: true, bookingId });
  };

  const confirmCancel = async () => {
    const bookingId = cancelModal.bookingId;
    setCancellingBookingId(bookingId);
    setCancelModal({ open: false, bookingId: null });
    try {
      await axios.post(
        `http://localhost:4000/api/bookings/${bookingId}/cancel`,
        {},
        { withCredentials: true }
      );
      toast.success("Booking cancelled.");
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleRemoveWishlist = async (placeId) => {
    if (removingWishlistId) return;
    setRemovingWishlistId(placeId);
    try {
      await axios.delete(`http://localhost:4000/api/wishlist/${placeId}`, {
        withCredentials: true,
      });
      setWishlist((prev) => prev.filter((p) => p._id !== placeId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove from wishlist");
    } finally {
      setRemovingWishlistId(null);
    }
  };

  const activeBookings = bookings.filter(
    (booking) => booking.status !== "Cancelled" && booking.status !== "Refunded"
  );

  return (
    <>
      <ConfirmModal
        isOpen={cancelModal.open}
        title="Cancel Booking?"
        message="This action cannot be undone. Your booking will be cancelled and may be eligible for a refund."
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        confirmVariant="danger"
        loading={!!cancellingBookingId}
        onConfirm={confirmCancel}
        onCancel={() => setCancelModal({ open: false, bookingId: null })}
      />
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-slate-900 text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              Welcome back, {user?.user?.name || "Explorer"}!
            </h1>
            <p className="text-blue-200 text-lg">Ready for your next adventure?</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link
            to="/explore"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </div>
            <h3 className="font-bold text-gray-800">Plan Trip</h3>
          </Link>

          <Link
            to="/hotels"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <h3 className="font-bold text-gray-800">Book Hotel</h3>
          </Link>

          <Link
            to="/bus"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            </div>
            <h3 className="font-bold text-gray-800">Bus Tickets</h3>
          </Link>

          <Link
            to="/wishlist"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </div>
            <h3 className="font-bold text-gray-800">Wishlist</h3>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
              <span className="text-2xl">My Bookings</span>
            </h2>

            {loadingBookings ? (
              <div className="space-y-4">
                {[1,2].map(i => <BookingCardSkeleton key={i} />)}
              </div>
            ) : activeBookings.length > 0 ? (
              <div className="space-y-4">
                {activeBookings.map((booking) => {
                  const isBusBooking =
                    booking.bookingType === "Bus" || (!!booking.bus && booking.bookingType !== "Hotel");

                  if (isBusBooking) {
                    return (
                      <div
                        key={booking._id}
                        className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="bg-emerald-50 border-b border-dashed border-emerald-200 px-6 py-4 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                              Digital Bus Ticket
                            </p>
                            <h3 className="text-xl font-bold text-gray-800">
                              {booking.bus?.operatorName || "Bus Operator"}
                            </h3>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`${getStatusBadgeClass(
                                booking.status
                              )} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}
                            >
                              {booking.status}
                            </span>
                            <span
                              className={`${getPaymentBadgeClass(
                                booking.paymentStatus
                              )} text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide`}
                            >
                              Payment: {booking.paymentStatus || "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div className="text-left">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">From</p>
                              <p className="text-lg font-bold text-gray-800">{booking.bus?.origin || "TBA"}</p>
                              <p className="text-sm text-gray-500">
                                {formatReadableTime(booking.bus?.departureTime)}
                              </p>
                            </div>
                            <div className="flex-1 mx-5 border-t-2 border-dashed border-gray-200 relative">
                              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-gray-400">
                                BUS
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">To</p>
                              <p className="text-lg font-bold text-gray-800">
                                {booking.bus?.destination || "TBA"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatReadableTime(booking.bus?.arrivalTime)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Travel Date</p>
                              <p className="font-semibold text-gray-800">
                                {formatReadableDate(booking.travelDate || booking.bus?.departureTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Bus Type</p>
                              <p className="font-semibold text-gray-800">{booking.bus?.busType || "Standard"}</p>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Fare Paid</p>
                              <p className="text-xl font-extrabold text-blue-600">Rs. {booking.totalPrice}</p>
                            </div>
                          </div>

                          {(booking.status === "Pending" || booking.status === "Confirmed") && (
                            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                              <Link
                                to={`/bookings/${booking._id}`}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                View Receipt
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                              </Link>
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                disabled={cancellingBookingId === booking._id}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                  cancellingBookingId === booking._id
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                                }`}
                              >
                                {cancellingBookingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={booking._id}
                      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow"
                    >
                      <img
                        src={
                          booking.hotel?.images?.[0] ||
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945"
                        }
                        alt={booking.hotel?.name || "Hotel"}
                        loading="lazy"
                        decoding="async"
                        className="w-full sm:w-48 h-48 sm:h-auto object-cover"
                      />
                      <div className="p-6 flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-800">
                              {booking.hotel?.name || "Hotel Booking"}
                            </h3>
                            <div className="flex flex-col items-end gap-1.5">
                              <span
                                className={`${getStatusBadgeClass(
                                  booking.status
                                )} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}
                              >
                                {booking.status}
                              </span>
                              <span
                                className={`${getPaymentBadgeClass(
                                  booking.paymentStatus
                                )} text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide`}
                              >
                                Payment: {booking.paymentStatus || "Pending"}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-500 mb-4 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                            {booking.hotel?.location?.city || "City TBA"},{" "}
                            {booking.hotel?.place?.name || "Destination TBA"}
                          </p>
                        </div>
                        <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                          <div>
                            <p className="text-sm text-gray-500">Dates</p>
                            <p className="font-semibold text-gray-800">
                              {formatReadableDate(booking.checkInDate)} -{" "}
                              {formatReadableDate(booking.checkOutDate)}
                            </p>
                            <Link
                              to={`/bookings/${booking._id}`}
                              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                            >
                              View Receipt
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </Link>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Paid</p>
                            <p className="text-xl font-extrabold text-blue-600">Rs. {booking.totalPrice}</p>
                            {(booking.status === "Pending" || booking.status === "Confirmed") && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                disabled={cancellingBookingId === booking._id}
                                className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                  cancellingBookingId === booking._id
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                                }`}
                              >
                                {cancellingBookingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center h-64">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No upcoming trips</h3>
                <p className="text-gray-500 mb-4 max-w-sm">
                  You have not booked any hotels or buses yet. Start planning your next vacation.
                </p>
                <Link
                  to="/explore"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Explore Destinations
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
              <span className="text-2xl">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="text-sm font-semibold bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </h2>

            {loadingWishlist ? (
              <Loader />
            ) : wishlist.length > 0 ? (
              <div className="space-y-3">
                {wishlist.map((place) => (
                  <div
                    key={place._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 p-3 hover:shadow-md transition-shadow group"
                  >
                    <img
                      src={place.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}
                      alt={place.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <Link to={`/places/${place._id}`} className="font-bold text-gray-800 hover:text-blue-600 transition-colors truncate block">
                        {place.name}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">{place.state} · {place.category}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveWishlist(place._id)}
                      disabled={removingWishlistId === place._id}
                      title="Remove from wishlist"
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      {removingWishlistId === place._id ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      )}
                    </button>
                  </div>
                ))}
                <Link
                  to="/wishlist"
                  className="block text-center text-sm text-blue-600 hover:text-blue-800 font-semibold mt-2 py-2"
                >
                  View full wishlist →
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center h-64">
                <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Your wishlist is empty</h3>
                <p className="text-gray-500 text-sm mb-4">Save your favorite places and they'll appear here.</p>
                <Link to="/explore" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Explore destinations →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">Recommended Places</span>
            </h2>
            <Link to="/explore" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : recommendedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedPlaces.map((place) => (
                <Card key={place._id} place={place} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No recommendations found yet.</p>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default Dashboard;

