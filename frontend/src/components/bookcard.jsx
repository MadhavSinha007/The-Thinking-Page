import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * BookCard — two visual modes:
 *   variant="grid"   → portrait cover + title/author below  (default, grid usage)
 *   variant="row"    → horizontal thumbnail + info          (history, saved lists)
 */
const BookCard = ({ book, variant = "grid", showDate, dateLabel, darkMode = false }) => {
  const navigate = useNavigate();

  const id = book.id || book._id;
  const cover = book.cover || "https://via.placeholder.com/180x270?text=No+Cover";

  const handleClick = () => navigate(`/book/${id}`);

  // Theme colors based on dark mode
  const bgColor = darkMode ? '#1C1917' : '#f3ebe3';
  const borderColor = darkMode ? '#292524' : '#0000001a';
  const textColor = darkMode ? '#F5F0EB' : '#000000';
  const textMuted = darkMode ? '#A8A29E' : '#00000099';
  const textSubtle = darkMode ? '#57534E' : '#00000066';
  const surfaceColor = darkMode ? '#292524' : '#efe5dc';

  if (variant === "row") {
    return (
      <div
        onClick={handleClick}
        className="group flex gap-4 cursor-pointer rounded-2xl p-3 transition-all duration-200"
        style={{ 
          background: bgColor, 
          border: `1px solid ${borderColor}`,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#f57c00'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = borderColor; }}
      >
        <div className="relative flex-shrink-0 w-16 rounded-xl overflow-hidden shadow-md">
          <div className="aspect-[2/3]">
            <img
              src={cover}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => { e.target.src = "https://via.placeholder.com/180x270?text=No+Cover"; }}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-1 min-w-0">
          <h3
            className="text-sm font-semibold line-clamp-2 leading-snug"
            style={{ color: textColor }}
          >
            {book.title}
          </h3>
          <p className="text-xs font-medium line-clamp-1" style={{ color: textMuted }}>
            {book.author}
          </p>
          {book.genre && (
            <span
              className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full w-fit"
              style={{ background: surfaceColor, color: textSubtle }}
            >
              {book.genre}
            </span>
          )}
          {showDate && dateLabel && (
            <p className="text-[11px]" style={{ color: textSubtle }}>
              {dateLabel}
            </p>
          )}
        </div>
        {book.rating && (
          <div className="ml-auto flex-shrink-0 flex flex-col items-end justify-center gap-1">
            <div
              className="flex items-center gap-1 text-xs font-bold"
              style={{ color: textColor }}
            >
              <span style={{ color: '#f57c00' }}>★</span>
              {book.rating}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default grid variant
  return (
    <div
      className="group cursor-pointer w-full"
      onClick={handleClick}
    >
      {/* Cover */}
      <div className="relative mb-3 overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-300">
        <div className="aspect-[2/3]" style={{ background: surfaceColor }}>
          <img
            src={cover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
            onError={e => { e.target.src = "https://via.placeholder.com/180x270?text=No+Cover"; }}
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Rating badge */}
        {book.rating && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
            <span style={{ color: '#f57c00' }}>★</span>
            {book.rating}
          </div>
        )}

        {/* Genre tag bottom-right */}
        {book.genre && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] font-semibold tracking-wide uppercase text-white/80 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {book.genre}
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <h3
        className="text-[13px] font-semibold line-clamp-2 mb-1 leading-snug transition-colors duration-200 group-hover:text-[#f57c00]"
        style={{ color: textColor }}
      >
        {book.title}
      </h3>
      <p className="text-[11px] line-clamp-1 font-medium" style={{ color: textMuted }}>
        {book.author}
      </p>
    </div>
  );
};

export default BookCard;