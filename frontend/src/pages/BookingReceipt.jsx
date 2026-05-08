import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

function BookingReceipt() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/bookings/${id}`, {
          withCredentials: true,
        });
        setBooking(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handlePrint = () => window.print();

  const formatDate = (val) =>
    val ? new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "TBA";

  const formatTime = (val) =>
    val ? new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";

  const statusColor = {
    Confirmed: "text-emerald-700 bg-emerald-100",
    Pending:   "text-amber-700 bg-amber-100",
    Cancelled: "text-red-700 bg-red-100",
    Refunded:  "text-blue-700 bg-blue-100",
  };

  const paymentColor = {
    Paid:       "text-emerald-700 bg-emerald-100",
    Pending:    "text-amber-700 bg-amber-100",
    Processing: "text-indigo-700 bg-indigo-100",
    Failed:     "text-red-700 bg-red-100",
    Refunded:   "text-blue-700 bg-blue-100",
  };

  if (loading) return <Loader />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow max-w-md text-center">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <Link to="/dashboard" className="text-blue-600 font-semibold hover:underline">← Back to Dashboard</Link>
      </div>
    </div>
  );

  const isHotel = booking.bookingType === "Hotel";
  const isBus   = booking.bookingType === "Bus";

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #receipt-zone, #receipt-zone * { visibility: visible !important; }
          #receipt-zone { position: fixed; inset: 0; padding: 32px; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 pb-16">

        {/* Header */}
        <div className="bg-slate-900 text-white pt-10 pb-20 px-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <Link to="/dashboard" className="no-print text-blue-300 hover:text-white text-sm font-medium flex items-center gap-1 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold">Booking Receipt</h1>
              <p className="text-blue-300 mt-1">Your booking confirmation details</p>
            </div>
            <button
              onClick={handlePrint}
              className="no-print flex items-center gap-2 bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              Download / Print
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 -mt-12">
          <div id="receipt-zone" ref={printRef} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

            {/* Status Banner */}
            <div className={`px-8 py-4 flex items-center justify-between border-b border-dashed ${
              booking.status === "Confirmed" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
            }`}>
              <div className="flex items-center gap-3">
                {booking.status === "Confirmed" ? (
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                )}
                <div>
                  <p className="font-extrabold text-gray-800">{booking.status === "Confirmed" ? "Booking Confirmed!" : `Status: ${booking.status}`}</p>
                  <p className="text-xs text-gray-500">Booked on {formatDate(booking.createdAt)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${statusColor[booking.status] || "bg-gray-100 text-gray-600"}`}>
                  {booking.status}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${paymentColor[booking.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                  Payment: {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="p-8">

              {/* Booking ID */}
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Booking Reference</p>
                <p className="font-mono text-lg font-bold text-gray-800 break-all">{booking._id}</p>
                {booking.paymentId && (
                  <>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-2 mb-1">Payment ID</p>
                    <p className="font-mono text-sm font-semibold text-gray-600 break-all">{booking.paymentId}</p>
                  </>
                )}
              </div>

              {/* Hotel Details */}
              {isHotel && booking.hotel && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Hotel Details</p>
                  <div className="flex gap-4 items-start">
                    <img
                      src={booking.hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945"}
                      alt={booking.hotel.name}
                      className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-800">{booking.hotel.name}</h2>
                      <p className="text-gray-500 text-sm">{booking.hotel.location?.city}, {booking.hotel.location?.state}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5">
                    {[
                      { label: "Check-In",  value: formatDate(booking.checkInDate) },
                      { label: "Check-Out", value: formatDate(booking.checkOutDate) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">{label}</p>
                        <p className="text-gray-800 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bus Details */}
              {isBus && booking.bus && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bus Details</p>
                  <div className="bg-emerald-50 rounded-2xl p-5">
                    <h2 className="text-xl font-extrabold text-gray-800 mb-1">{booking.bus.operatorName}</h2>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">{booking.bus.busType}</span>

                    <div className="flex items-center justify-between mt-5">
                      <div>
                        <p className="text-2xl font-extrabold text-gray-800">{formatTime(booking.bus.departureTime)}</p>
                        <p className="text-gray-600 font-semibold">{booking.bus.origin}</p>
                        <p className="text-xs text-gray-400">{formatDate(booking.bus.departureTime)}</p>
                      </div>
                      <div className="flex flex-col items-center text-gray-300">
                        <div className="border-t-2 border-dashed border-gray-300 w-24 relative">
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold bg-emerald-50 px-1 text-gray-400">BUS</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-gray-800">{formatTime(booking.bus.arrivalTime)}</p>
                        <p className="text-gray-600 font-semibold">{booking.bus.destination}</p>
                        <p className="text-xs text-gray-400">{formatDate(booking.bus.arrivalTime)}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-emerald-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">Travel Date</p>
                      <p className="text-gray-800 font-semibold">{formatDate(booking.travelDate || booking.bus.departureTime)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="border-t border-dashed border-gray-200 pt-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Paid</p>
                    <p className="text-4xl font-extrabold text-blue-600">₹{booking.totalPrice?.toLocaleString("en-IN")}</p>
                  </div>
                  {booking.paidAt && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paid On</p>
                      <p className="font-semibold text-gray-700">{formatDate(booking.paidAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer note */}
              <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
                <p className="font-bold text-gray-500 mb-1">Thank you for choosing TripCrafter 🌏</p>
                <p>This is your official booking receipt. Keep it for your records.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookingReceipt;
