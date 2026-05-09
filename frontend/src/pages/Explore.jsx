import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../components/Card";
import Loader from "../components/Loader";

const PLACES_CACHE_TTL_MS = 5 * 60 * 1000;

function Explore() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Hill Station", "Beach", "Temple", "Historical", "Adventure"];

  useEffect(() => {
    const fetchPlaces = async () => {
      const cacheKey = `cache:places:${activeCategory}:v1`;

      try {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (Date.now() - cached.timestamp < PLACES_CACHE_TTL_MS) {
            setPlaces(cached.data);
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (cacheError) {
        console.warn("Places cache read failed", cacheError);
      }

      try {
        setLoading(true);
        // Build URL based on category
        let url = "https://trip-crafter.onrender.com/api/places?limit=120";
        if (activeCategory !== "All") {
          url += `&category=${encodeURIComponent(activeCategory)}`;
        }
        
        const res = await axios.get(url);
        setPlaces(res.data);
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data: res.data, timestamp: Date.now() })
          );
        } catch (cacheWriteError) {
          console.warn("Places cache write failed", cacheWriteError);
        }
        setError(null);
      } catch (err) {
        setError("Failed to load destinations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [activeCategory]);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Explore Destinations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your next adventure from our curated list of beautiful locations across India.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm ${
                activeCategory === cat
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center max-w-2xl mx-auto mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <Loader />
        ) : (
          /* Places Grid */
          <>
            {places.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No destinations found</h3>
                <p className="text-gray-500">We couldn't find any places in the "{activeCategory}" category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {places.map((place) => (
                  <Card key={place._id} place={place} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default Explore;
