import React from 'react';
import { Link } from 'react-router-dom';

function Card({ place }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img 
          src={place.imageUrl} 
          alt={place.name} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {place.popular && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Popular
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{place.name}</h3>
          <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0">
            {place.category}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          {place.state}, {place.country}
        </p>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-grow">
          {place.description}
        </p>
        
        <Link 
          to={`/place/${place._id}`} 
          className="w-full mt-auto bg-gray-50 hover:bg-blue-600 text-blue-600 hover:text-white font-medium py-2.5 rounded-xl transition-colors text-center border border-blue-100 hover:border-transparent"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default Card;
