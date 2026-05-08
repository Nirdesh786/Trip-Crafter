import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import useRazorpay from "../hooks/useRazorpay";
import { createBooking, initiatePayment, verifyPayment } from "../services/paymentService";

function BusCard({ bus }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { openCheckout } = useRazorpay();
  const [bookingLoading, setBookingLoading] = useState(false);

  // Use first image or a placeholder
  const imageUrl = bus.images && bus.images.length > 0 
    ? bus.images[0] 
    : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957";

  const handleBookBus = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (bookingLoading || bus.availableSeats <= 0) {
      return;
    }

    setBookingLoading(true);
    try {
      // Step 1: Create a pending booking
      const booking = await createBooking({
        bookingType: "Bus",
        busId: bus._id,
        travelDate: bus.departureTime,
        totalPrice: bus.pricePerSeat,
      });

      // Step 2: Create a Razorpay order
      const orderData = await initiatePayment(booking._id);

      // Step 3: Open Razorpay checkout popup
      openCheckout({
        keyId: orderData.keyId,
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: bus.operatorName,
        description: `Bus Ticket — ${bus.origin} → ${bus.destination}`,
        prefill: { name: user.name, email: user.email },
        onSuccess: async (razorpayResponse) => {
          try {
            // Step 4: Verify payment signature on backend
            await verifyPayment(booking._id, {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });
            toast.success("Bus booked! Redirecting...");
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Bus booking failed");
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row">
      
      {/* Left: Image (hidden on small mobile, visible on tablet+) */}
      <div className="hidden sm:block w-full md:w-64 h-48 md:h-auto relative flex-shrink-0">
        <img
          src={imageUrl}
          alt={bus.operatorName}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        {bus.availableSeats <= 5 && bus.availableSeats > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
            Only {bus.availableSeats} left!
          </div>
        )}
        {bus.availableSeats === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-lg transform -rotate-12 shadow-xl border-2 border-red-500">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Right: Content */}
      <div className="p-6 md:p-8 flex flex-col justify-between flex-grow w-full">
        
        {/* Top Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{bus.operatorName}</h3>
            <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
              {bus.busType}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-3xl font-extrabold text-blue-600">Rs. {bus.pricePerSeat}</span>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="flex items-center justify-between mb-6 relative">
          {/* Origin */}
          <div className="text-center w-1/3">
            <p className="text-2xl font-bold text-gray-800">
              {new Date(bus.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-gray-500 font-medium">{bus.origin}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(bus.departureTime).toLocaleDateString()}
            </p>
          </div>

          {/* Dotted Line */}
          <div className="w-1/3 flex flex-col items-center relative">
            <div className="w-full border-t-2 border-dashed border-gray-300 absolute top-1/2 -translate-y-1/2"></div>
            <div className="bg-white px-2 relative z-10 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
            </div>
            <span className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
              {Math.round((new Date(bus.arrivalTime) - new Date(bus.departureTime)) / (1000 * 60 * 60))}h Journey
            </span>
          </div>

          {/* Destination */}
          <div className="text-center w-1/3">
            <p className="text-2xl font-bold text-gray-800">
              {new Date(bus.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-gray-500 font-medium">{bus.destination}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(bus.arrivalTime).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span className={`${bus.availableSeats === 0 ? "text-red-500" : "text-emerald-600"} font-bold`}>
              {bus.availableSeats} Seats Available
            </span>
          </div>
          <button 
            onClick={handleBookBus}
            disabled={bus.availableSeats === 0 || bookingLoading}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md ${
              bus.availableSeats > 0 && !bookingLoading
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {bookingLoading ? "Booking..." : bus.availableSeats > 0 ? "Book Ticket" : "Sold Out"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default BusCard;


