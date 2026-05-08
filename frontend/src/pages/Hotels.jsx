import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import { HotelCardSkeleton } from "../components/Skeletons";

function Hotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const placeFilter = searchParams.get("place") || "";
  const placeName   = searchParams.get("placeName") || "";

  const [allHotels, setAllHotels]   = useState([]);   // raw from API
  const [filtered, setFiltered]     = useState([]);   // after client filters
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Filter state
  const [cityInput, setCityInput]   = useState("");
  const [minPrice, setMinPrice]     = useState("");
  const [maxPrice, setMaxPrice]     = useState("");
  const [minRating, setMinRating]   = useState("");
  const [sortBy, setSortBy]         = useState("recommended");

  // Fetch all hotels (once per placeFilter change)
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        let url = "http://localhost:4000/api/hotels?limit=200";
        if (placeFilter) url += `&place=${encodeURIComponent(placeFilter)}`;
        const res = await axios.get(url);
        setAllHotels(res.data);
      } catch {
        setError("Failed to fetch hotels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [placeFilter]);

  // Re-filter whenever allHotels or any filter changes
  useEffect(() => {
    let result = [...allHotels];

    if (cityInput.trim()) {
      const q = cityInput.trim().toLowerCase();
      result = result.filter(
        (h) =>
          h.location?.city?.toLowerCase().includes(q) ||
          h.location?.state?.toLowerCase().includes(q) ||
          h.name?.toLowerCase().includes(q)
      );
    }

    if (minPrice !== "") result = result.filter((h) => h.pricePerNight >= Number(minPrice));
    if (maxPrice !== "") result = result.filter((h) => h.pricePerNight <= Number(maxPrice));
    if (minRating !== "") result = result.filter((h) => h.rating >= Number(minRating));

    if (sortBy === "price_asc")  result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sortBy === "price_desc") result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    if (sortBy === "rating")     result.sort((a, b) => b.rating - a.rating);

    setFiltered(result);
  }, [allHotels, cityInput, minPrice, maxPrice, minRating, sortBy]);

  const clearFilters = () => {
    setCityInput(""); setMinPrice(""); setMaxPrice(""); setMinRating(""); setSortBy("recommended");
    if (placeFilter) setSearchParams({});
  };

  const hasActiveFilters = cityInput || minPrice || maxPrice || minRating || placeFilter;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Hero */}
      <div className="bg-slate-900 text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {placeFilter ? `Stays in ${placeName || "Your Destination"}` : "Find Your Perfect Stay"}
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            {placeFilter
              ? "Handpicked hotels for the destination you selected."
              : "From luxury resorts to cozy local retreats — discover the best accommodations."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-end">

            {/* City / Name search */}
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">City or Hotel Name</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Goa..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Min Price */}
            <div className="w-full md:w-36">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Min Price (₹)</label>
              <input
                type="number" min="0" placeholder="0"
                value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Max Price */}
            <div className="w-full md:w-36">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Max Price (₹)</label>
              <input
                type="number" min="0" placeholder="Any"
                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Min Rating */}
            <div className="w-full md:w-36">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Min Rating ⭐</label>
              <select
                value={minRating} onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="">Any</option>
                <option value="3">3+</option>
                <option value="3.5">3.5+</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>

            {/* Sort */}
            <div className="w-full md:w-44">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Sort By</label>
              <select
                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-shrink-0 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing <span className="font-bold text-blue-600">{loading ? "..." : filtered.length}</span> of{" "}
              <span className="font-bold text-gray-700">{allHotels.length}</span> properties
            </span>
            {hasActiveFilters && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                Filters active
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => <HotelCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block font-medium">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Hotels Match</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters.</p>
            <button onClick={clearFilters} className="text-blue-600 font-bold hover:text-blue-800">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default Hotels;
