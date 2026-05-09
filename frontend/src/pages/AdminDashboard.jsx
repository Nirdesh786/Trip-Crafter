import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import toast from "react-hot-toast";

// Re-export the original form-based AdminDashboard content as a sub-component
import AdminForms from "./AdminForms";

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${color}-50`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (activeTab !== "analytics") return;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await axios.get("https://trip-crafter.onrender.com/api/auth/admin/stats", { withCredentials: true });
        setStats(res.data);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [activeTab]);

  const tabs = [
    { id: "analytics", label: "📊 Analytics" },
    { id: "destination", label: "🌍 Add Destination" },
    { id: "hotel", label: "🏨 Add Hotel" },
    { id: "bus", label: "🚌 Add Bus" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {/* Header */}
          <div className="bg-slate-900 px-8 py-10 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white/20 p-3 rounded-2xl">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <h1 className="text-3xl font-extrabold">Admin Control Center</h1>
            </div>
            <p className="text-slate-300 ml-16">Manage your platform and view real-time analytics.</p>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-4 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* ── ANALYTICS TAB ── */}
            {activeTab === "analytics" && (
              <div>
                {statsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                  </div>
                ) : stats ? (
                  <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      <StatCard icon="📋" label="Total Bookings" value={stats.totalBookings} color="blue" />
                      <StatCard icon="✅" label="Confirmed" value={stats.confirmedBookings} color="emerald" />
                      <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} color="yellow" />
                      <StatCard icon="👥" label="Registered Users" value={stats.userCount} color="indigo" />
                      <StatCard icon="🏨" label="Hotels Listed" value={stats.hotelCount} color="rose" />
                      <StatCard icon="🚌" label="Bus Routes" value={stats.busCount} color="orange" />
                    </div>

                    {stats.chartData.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Revenue Bar Chart */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue (Last 6 Months)</h3>
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                              <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                              <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Bookings Line Chart */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                          <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings (Last 6 Months)</h3>
                          <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} allowDecimals={false} />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-3xl mb-3">📊</p>
                        <p className="text-gray-500 font-medium">No paid bookings yet. Charts will appear here once bookings come in.</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* ── FORM TABS ── */}
            {activeTab !== "analytics" && <AdminForms initialTab={activeTab} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;