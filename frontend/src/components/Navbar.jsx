import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!user) { setBookingCount(0); setWishlistCount(0); return; }
    axios.get("http://localhost:4000/api/auth/me", { withCredentials: true })
      .then((res) => { setBookingCount(res.data.bookingCount || 0); setWishlistCount(res.data.wishlistCount || 0); })
      .catch(() => {});
  }, [user, location.pathname]);

  const handleLogout = async () => {
    try { await axios.post("http://localhost:4000/api/auth/logout", {}, { withCredentials: true }); } catch {}
    logout(); navigate("/login");
  };

  const navLinkBase = "font-medium transition-colors hover:text-blue-600";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight flex-shrink-0">
            Trip<span className="text-green-500">Crafter</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-5">
            <Link to="/explore" className={`${navLinkBase} text-gray-700`}>Destinations</Link>
            <Link to="/hotels"  className={`${navLinkBase} text-gray-700`}>Hotels</Link>
            <Link to="/bus"     className={`${navLinkBase} text-gray-700`}>Buses</Link>

            {user ? (
              <>
                {user.user?.role === "admin" && (
                  <Link to="/admin" className="text-blue-600 hover:text-blue-800 font-bold">Admin Panel</Link>
                )}
                <Link to="/dashboard" className={`${navLinkBase} text-gray-700 relative`}>
                  Dashboard
                  {bookingCount > 0 && (
                    <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-[10px] font-extrabold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1">
                      {bookingCount > 9 ? "9+" : bookingCount}
                    </span>
                  )}
                </Link>
                <Link to="/wishlist" className={`${navLinkBase} text-gray-700 relative`}>
                  <span className="relative">
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2.5 -right-4 bg-rose-500 text-white text-[10px] font-extrabold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </span>
                </Link>
                <Link to="/profile" title={user.user?.name}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold hover:shadow-md transition-shadow flex-shrink-0">
                  {user.user?.name?.charAt(0).toUpperCase() || "?"}
                </Link>
                <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className={`${navLinkBase} text-gray-700`}>Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-colors">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg px-4 py-4 space-y-1">
          {[
            { to: "/explore", label: "🗺️ Destinations" },
            { to: "/hotels",  label: "🏨 Hotels" },
            { to: "/bus",     label: "🚌 Buses" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">
              {label}
            </Link>
          ))}

          {user ? (
            <>
              {user.user?.role === "admin" && (
                <Link to="/admin" className="block px-4 py-3 rounded-xl text-blue-600 font-bold hover:bg-blue-50 transition">⚙️ Admin Panel</Link>
              )}
              <Link to="/dashboard" className="flex justify-between px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">
                📊 Dashboard
                {bookingCount > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{bookingCount}</span>}
              </Link>
              <Link to="/wishlist" className="flex justify-between px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">
                ❤️ Wishlist
                {wishlistCount > 0 && <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>}
              </Link>
              <Link to="/profile" className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">👤 Profile</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition">
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">Login</Link>
              <Link to="/register" className="block px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-center hover:bg-blue-700 transition mt-2">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
