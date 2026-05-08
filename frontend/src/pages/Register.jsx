// Trip Crafter - Register & Login Pages (React + Tailwind)
// Assumes you are using React Router and Axios

import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

// ================= REGISTER =================
function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/auth/register", form , {
        withCredentials : true
      });
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Trip Crafter Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full p-3 mb-4 border rounded-lg"
          onChange={handleChange}
          required
        />

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

        <button className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600">
          Register
        </button>

        <p className="text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
