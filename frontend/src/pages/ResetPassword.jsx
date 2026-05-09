import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await axios.post(`https://trip-crafter.onrender.com/api/auth/reset-password/${token}`, { password });
      toast.success("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔑</div>
          <h1 className="text-2xl font-extrabold text-gray-800">Set New Password</h1>
          <p className="text-gray-500 mt-2 text-sm">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
            <input
              type={showPass ? "text" : "password"} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition text-gray-800 pr-11"
            />
            <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showPass
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              }
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type="password" required
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition text-gray-800 ${
                confirm && confirm !== password ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
              }`}
            />
            {confirm && confirm !== password && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p className="text-center text-sm text-gray-500">
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800">← Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
