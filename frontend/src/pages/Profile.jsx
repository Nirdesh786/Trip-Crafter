import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

function Profile() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Name edit state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/auth/me", { withCredentials: true });
        setProfile(res.data);
        setNameInput(res.data.name);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) { toast.error("Name cannot be empty"); return; }
    if (nameInput.trim() === profile.name) { setEditingName(false); return; }
    setNameLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:4000/api/auth/profile",
        { name: nameInput.trim() },
        { withCredentials: true }
      );
      setProfile((p) => ({ ...p, name: res.data.user.name }));
      // Sync AuthContext & localStorage
      login({ ...user, user: { ...user.user, name: res.data.user.name } });
      setEditingName(false);
      toast.success("Name updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update name");
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("New passwords do not match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setPasswordLoading(true);
    try {
      await axios.put(
        "http://localhost:4000/api/auth/profile",
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success("Password changed successfully!");
      setShowPasswordForm(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <Loader />;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const initials = profile?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* Header Banner */}
      <div className="bg-slate-900 pt-12 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white mb-1">My Profile</h1>
          <p className="text-blue-300">Manage your account details and security</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-14 space-y-6">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">{profile?.name}</h2>
              <p className="text-gray-500">{profile?.email}</p>
              <span className={`inline-block mt-1 text-xs font-bold px-3 py-0.5 rounded-full ${
                profile?.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              }`}>
                {profile?.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Active Bookings", value: profile?.bookingCount ?? 0, color: "blue" },
              { label: "Wishlist Items", value: profile?.wishlistCount ?? 0, color: "rose" },
              { label: "Member Since", value: new Date(profile?.createdAt).getFullYear(), color: "emerald" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-${color}-50 rounded-2xl p-4 text-center`}>
                <p className={`text-2xl font-extrabold text-${color}-600`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Info rows */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            {/* Name row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Full Name</p>
                {editingName ? (
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    autoFocus
                    className="mt-1 text-gray-800 font-semibold border-b-2 border-blue-500 outline-none bg-transparent text-lg w-64"
                  />
                ) : (
                  <p className="text-gray-800 font-semibold text-lg mt-0.5">{profile?.name}</p>
                )}
              </div>
              {editingName ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveName}
                    disabled={nameLoading}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {nameLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameInput(profile.name); }}
                    className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit
                </button>
              )}
            </div>

            {/* Email row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Email Address</p>
                <p className="text-gray-800 font-semibold text-lg mt-0.5">{profile?.email}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">Cannot change</span>
            </div>

            {/* Member Since */}
            <div className="py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Member Since</p>
              <p className="text-gray-800 font-semibold text-lg mt-0.5">{memberSince}</p>
            </div>
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Password & Security</h3>
                <p className="text-sm text-gray-500">Keep your account secure</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm((v) => !v)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 transition pr-11"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                  {showCurrent
                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 transition pr-11"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                  {showNew
                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-800 focus:outline-none transition ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition disabled:opacity-60"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
