import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const defaultCover = "https://via.placeholder.com/180x270?text=No+Cover";
  
  const handleClick = () => {
    navigate(`/book/${book.id || book._id}`);
  };
  
  return (
    <div className="group cursor-pointer w-full" onClick={handleClick}>
      {/* Book Cover */}
      <div className="relative mb-3 overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className={`aspect-[2/3] ${darkMode ? 'bg-[#1a1a1a]' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}>
          <img 
            src={book.cover || defaultCover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = defaultCover;
            }}
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {/* Rating badge */}
        {book.rating && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            {book.rating}
          </div>
        )}
      </div>
      
      {/* Book Title */}
      <h3 className={`text-sm font-semibold line-clamp-2 mb-1.5 transition-colors leading-tight ${
        darkMode ? 'text-gray-200 group-hover:text-purple-400' : 'text-gray-900 group-hover:text-purple-600'
      }`}>
        {book.title}
      </h3>
      
      {/* Author */}
      <p className={`text-xs line-clamp-1 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
        {book.author}
      </p>
    </div>
  );
};

export default BookCard;