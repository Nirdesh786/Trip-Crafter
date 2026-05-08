import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:4000/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔐</div>
          <h1 className="text-2xl font-extrabold text-gray-800">Forgot Password?</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
              <p className="text-emerald-700 font-semibold">✅ Reset link sent!</p>
              <p className="text-gray-500 text-sm mt-1">Check your inbox (and spam folder). The link expires in 1 hour.</p>
            </div>
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800">← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition text-gray-800"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Remember it?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800">Log in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
