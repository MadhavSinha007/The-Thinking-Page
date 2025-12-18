import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const defaultCover = "https://via.placeholder.com/180x270?text=No+Cover";
  
  const handleClick = () => {
    console.log('BookCard clicked! Book ID:', book.id);
    console.log('Navigating to:', `/book/${book.id}`);
    navigate(`/book/${book.id}`);
  };
  
  return (
    <div className="group cursor-pointer w-full" onClick={handleClick}>
      {/* Book Cover */}
      <div className="relative mb-3 overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200">
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
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-purple-600 transition-colors leading-tight">
        {book.title}
      </h3>
      
      {/* Author */}
      <p className="text-xs text-gray-600 line-clamp-1 font-medium">
        {book.author}
      </p>
    </div>
  );
};

export default BookCard;  