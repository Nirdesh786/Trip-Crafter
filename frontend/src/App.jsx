import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PlaceDetails from "./pages/PlaceDetails";
import HotelDetails from "./pages/HotelDetails";
import Explore from "./pages/Explore";
import Hotels from "./pages/Hotels";
import Buses from "./pages/Buses";
import AdminDashboard from "./pages/AdminDashboard";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import BookingReceipt from "./pages/BookingReceipt";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/bus" element={<Buses />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/place/:id" element={<PlaceDetails />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route
            path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/wishlist"
            element={<ProtectedRoute><Wishlist /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/bookings/:id"
            element={<ProtectedRoute><BookingReceipt /></ProtectedRoute>}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
