import React from "react";
import { Link } from "react-router-dom";

function HotelCard({ hotel }) {
  // Use first image or a placeholder
  const imageUrl = hotel.images && hotel.images.length > 0 
    ? hotel.images[0] 
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945";

  return (
    <Link to={`/hotel/${hotel._id}`} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative">
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {hotel.isPopular && (
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
              Top Rated
            </span>
          )}
          {hotel.roomsAvailable === 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Bottom Left Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-bold mb-1 truncate">{hotel.name}</h3>
            <div className="flex items-center text-sm text-gray-200">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {hotel.location?.city}, {hotel.location?.state}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-sm font-bold">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span>{hotel.rating}</span>
                <span className="text-blue-400 font-normal ml-0.5">({hotel.numReviews})</span>
              </div>
            </div>
            
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md capitalize">
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    +{hotel.amenities.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <span className="text-gray-500 text-sm">Starts from</span>
              <div className="text-xl font-bold text-gray-900">
                ₹{hotel.pricePerNight}
                <span className="text-sm font-normal text-gray-500"> /night</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default HotelCard;
