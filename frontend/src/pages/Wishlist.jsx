import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/wishlist", {
          withCredentials: true,
        });
        setWishlist(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (placeId) => {
    if (removingId) return;

    setRemovingId(placeId);
    try {
      await axios.delete(`http://localhost:4000/api/wishlist/${placeId}`, {
        withCredentials: true,
      });
      setWishlist((prev) => prev.filter((item) => item._id !== placeId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove from wishlist");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">Saved places for your future trips.</p>
          </div>
          <Link
            to="/explore"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Explore More
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">{error}</div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save places from the details page to plan them later.</p>
            <Link
              to="/explore"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Places
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((place) => (
              <div
                key={place._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-48 object-cover"
                />
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{place.name}</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-semibold">
                      {place.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {place.state}, {place.country}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-5 flex-grow">{place.description}</p>

                  <div className="flex gap-2">
                    <Link
                      to={`/place/${place._id}`}
                      className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleRemove(place._id)}
                      disabled={removingId === place._id}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        removingId === place._id
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {removingId === place._id ? "..." : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
