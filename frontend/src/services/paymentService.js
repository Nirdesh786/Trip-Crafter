import axios from "axios";

const BASE = "http://localhost:4000/api/bookings";

/**
 * Step 1: Create a booking (status: Pending) and return the booking ID.
 */
export const createBooking = async (payload) => {
  const res = await axios.post(BASE, payload, { withCredentials: true });
  return res.data; // { _id, totalPrice, ... }
};

/**
 * Step 2: Create a Razorpay order for a booking.
 * Returns { orderId, amount, currency, keyId }
 */
export const initiatePayment = async (bookingId) => {
  const res = await axios.post(
    `${BASE}/${bookingId}/payment/initiate`,
    {},
    { withCredentials: true }
  );
  return res.data;
};

/**
 * Step 3: Verify Razorpay payment signature on the backend.
 * Sends { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = async (bookingId, verificationData) => {
  const res = await axios.post(
    `${BASE}/${bookingId}/payment/verify`,
    verificationData,
    { withCredentials: true }
  );
  return res.data;
};
