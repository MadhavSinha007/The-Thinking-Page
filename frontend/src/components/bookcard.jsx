import React from "react";
import { FiStar, FiBookOpen, FiUser, FiHeart } from "react-icons/fi";

const BookCard = ({ 
  book,
  onFavoriteClick,
  onBookClick 
}) => {
  const {
    id,
    title,
    author,
    coverImage,
    rating,
    genre,
    description,
    isNew = false,
    isRecommended = false,
    isExclusive = false,
    isFavorite = false
  } = book;

  return (
    <div 
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
      onClick={() => onBookClick && onBookClick(book)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isNew && (
          <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            NEW
          </span>
        )}
        {isRecommended && (
          <span className="bg-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            RECOMMENDED
          </span>
        )}
        {isExclusive && (
          <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            EXCLUSIVE
          </span>
        )}
      </div>

      {/* Favorite Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteClick && onFavoriteClick(id, !isFavorite);
        }}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
      >
        <FiHeart 
          className={isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"} 
          size={18} 
        />
      </button>

      {/* Book Cover */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiBookOpen className="text-purple-300" size={48} />
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i}
                size={14}
                className={i < Math.floor(rating) ? "fill-current" : ""}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>

        {/* Author */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiUser size={12} className="mr-1" />
          <span className="line-clamp-1">{author}</span>
        </div>

        {/* Genre */}
        {genre && (
          <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
            {genre}
          </span>
        )}

        {/* Description Preview */}
        {description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookCard;