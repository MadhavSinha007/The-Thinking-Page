import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

/**
 * BookCard — two visual modes:
 *   variant="grid"   → portrait cover + title/author below  (default, grid usage)
 *   variant="row"    → horizontal thumbnail + info          (history, saved lists)
 */
const BookCard = ({ book, variant = "grid", showDate, dateLabel }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const id = book.id || book._id;
  const cover = book.cover || "https://via.placeholder.com/180x270?text=No+Cover";

  const handleClick = () => navigate(`/book/${id}`);

  if (variant === "row") {
    return (
      <div
        onClick={handleClick}
        className="group flex gap-4 cursor-pointer rounded-2xl p-3 transition-all duration-200"
        style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = theme.accent)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = theme.border)}
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
            style={{ color: theme.fg }}
          >
            {book.title}
          </h3>
          <p className="text-xs font-medium line-clamp-1" style={{ color: theme.fgMuted }}>
            {book.author}
          </p>
          {book.genre && (
            <span
              className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full w-fit"
              style={{ background: theme.surface2, color: theme.fgSubtle }}
            >
              {book.genre}
            </span>
          )}
          {showDate && dateLabel && (
            <p className="text-[11px]" style={{ color: theme.fgSubtle }}>
              {dateLabel}
            </p>
          )}
        </div>
        {book.rating && (
          <div className="ml-auto flex-shrink-0 flex flex-col items-end justify-center gap-1">
            <div
              className="flex items-center gap-1 text-xs font-bold"
              style={{ color: theme.fg }}
            >
              <span style={{ color: '#F59E0B' }}>★</span>
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
        <div className="aspect-[2/3]" style={{ background: theme.surface2 }}>
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
            <span style={{ color: '#FBBF24' }}>★</span>
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
        className="text-[13px] font-semibold line-clamp-2 mb-1 leading-snug transition-colors duration-200 group-hover:text-[--accent]"
        style={{ color: theme.fg, '--accent': theme.accent }}
      >
        {book.title}
      </h3>
      <p className="text-[11px] line-clamp-1 font-medium" style={{ color: theme.fgMuted }}>
        {book.author}
      </p>
    </div>
  );
};

export default BookCard;