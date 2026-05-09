// Trip Crafter - Register & Login Pages (React + Tailwind)
// Assumes you are using React Router and Axios

import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


// ================= LOGIN =================
function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://trip-crafter.onrender.com/api/auth/login", form, {
        withCredentials: true,
      });

      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Trip Crafter Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg"
          onChange={handleChange}
          required
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Login
        </button>

        <div className="flex justify-between items-center text-sm mt-1">
          <Link to="/forgot-password" className="text-blue-500 hover:text-blue-700 font-medium">
            Forgot password?
          </Link>
          <Link to="/register" className="text-gray-600 hover:text-blue-600">
            Create account →
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
