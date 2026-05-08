import { useCallback } from "react";

/**
 * Dynamically loads the Razorpay checkout script and returns
 * an `openCheckout` function to trigger the payment popup.
 */
const useRazorpay = () => {
  const loadScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Opens the Razorpay checkout popup.
   *
   * @param {object} options
   * @param {string} options.keyId        - Razorpay Key ID (from backend)
   * @param {string} options.orderId      - Razorpay Order ID (from backend)
   * @param {number} options.amount       - Amount in paise (e.g. 50000 = ₹500)
   * @param {string} options.currency     - "INR"
   * @param {string} options.name         - App / Hotel / Bus name shown in popup
   * @param {string} options.description  - Booking description
   * @param {object} options.prefill      - { name, email } pre-filled for user
   * @param {function} options.onSuccess  - Called with Razorpay response on success
   * @param {function} options.onFailure  - Called with error message on failure
   */
  const openCheckout = useCallback(async (options) => {
    const loaded = await loadScript();
    if (!loaded) {
      options.onFailure?.("Failed to load Razorpay checkout. Check your internet connection.");
      return;
    }

    const rzp = new window.Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency || "INR",
      name: options.name || "Trip Crafter",
      description: options.description || "Booking Payment",
      order_id: options.orderId,
      prefill: {
        name: options.prefill?.name || "",
        email: options.prefill?.email || "",
      },
      theme: { color: "#2563EB" },
      handler: (response) => {
        // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        options.onSuccess?.(response);
      },
      modal: {
        ondismiss: () => {
          options.onFailure?.("Payment cancelled by user.");
        },
      },
    });

    rzp.on("payment.failed", (response) => {
      options.onFailure?.(response.error?.description || "Payment failed.");
    });

    rzp.open();
  }, []);

  return { openCheckout };
};

export default useRazorpay;
