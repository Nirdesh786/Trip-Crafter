import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import BusCard from "../components/BusCard";
import { BusCardSkeleton } from "../components/Skeletons";

function Buses() {
  const [allBuses, setAllBuses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Search/filter state
  const [origin, setOrigin]           = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate]   = useState("");
  const [sortBy, setSortBy]           = useState("departure");
  const [searched, setSearched]       = useState(false);

  // Fetch all buses on mount
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/buses?limit=200");
        setAllBuses(res.data);
      } catch {
        setError("Failed to fetch buses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  // Client-side filter
  const filtered = useMemo(() => {
    let result = [...allBuses];

    if (origin.trim()) {
      const q = origin.trim().toLowerCase();
      result = result.filter((b) => b.origin?.toLowerCase().includes(q));
    }
    if (destination.trim()) {
      const q = destination.trim().toLowerCase();
      result = result.filter((b) => b.destination?.toLowerCase().includes(q));
    }
    if (travelDate) {
      result = result.filter((b) => {
        const dep = new Date(b.departureTime).toISOString().split("T")[0];
        return dep === travelDate;
      });
    }

    if (sortBy === "departure") result.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    if (sortBy === "price_asc")  result.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    if (sortBy === "price_desc") result.sort((a, b) => b.pricePerSeat - a.pricePerSeat);

    return result;
  }, [allBuses, origin, destination, travelDate, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
  };

  const clearSearch = () => {
    setOrigin(""); setDestination(""); setTravelDate(""); setSortBy("departure"); setSearched(false);
  };

  const displayBuses = searched ? filtered : allBuses.sort ? 
    [...allBuses].sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime)) 
    : allBuses;

  const hasActiveSearch = origin || destination || travelDate;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Hero */}
      <div className="bg-emerald-900 text-white pt-16 pb-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-500 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Book Intercity Buses</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-10">
            Comfortable, safe, and affordable bus travel to your favorite destinations.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white p-4 rounded-3xl shadow-2xl max-w-5xl mx-auto border-4 border-white/20">
            <div className="flex flex-col md:flex-row gap-3 items-end">

              {/* Origin */}
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide text-left mb-1.5">From</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <input
                    type="text" placeholder="Leaving from..."
                    value={origin} onChange={(e) => setOrigin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-emerald-500 text-gray-800 font-semibold transition"
                  />
                </div>
              </div>

              {/* Swap icon */}
              <div className="hidden md:flex bg-gray-100 w-10 h-10 rounded-full items-center justify-center text-gray-400 flex-shrink-0 mb-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              </div>

              {/* Destination */}
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide text-left mb-1.5">To</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <input
                    type="text" placeholder="Going to..."
                    value={destination} onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-emerald-500 text-gray-800 font-semibold transition"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="w-full md:w-44">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide text-left mb-1.5">Travel Date</label>
                <input
                  type="date" value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-emerald-500 text-gray-800 font-semibold transition"
                />
              </div>

              <button type="submit" className="w-full md:w-auto flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-7 rounded-xl transition-all shadow-lg hover:shadow-xl">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">

        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <p className="text-gray-600 font-medium">
              {searched
                ? <>Found <span className="text-emerald-600 font-bold">{filtered.length}</span> buses</>
                : <>All <span className="text-emerald-600 font-bold">{allBuses.length}</span> buses</>
              }
            </p>
            {hasActiveSearch && (
              <button onClick={clearSearch} className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition">
                Clear
              </button>
            )}
          </div>
          <select
            value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            <option value="departure">Sort: Earliest Departure</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => <BusCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block font-medium">{error}</div>
          </div>
        ) : displayBuses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Buses Found</h3>
            <p className="text-gray-500 mb-4">Try different locations or date.</p>
            <button onClick={clearSearch} className="text-emerald-600 font-bold hover:text-emerald-700">
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {displayBuses.map((bus) => <BusCard key={bus._id} bus={bus} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default Buses;
