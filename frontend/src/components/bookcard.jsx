import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * BookCard
 * variant="grid" → home/discovery grid
 * variant="row"  → history/saved rows
 */
const BookCard = ({
  book,
  variant = "grid",
  showDate,
  dateLabel,
  darkMode = false,
}) => {
  const navigate = useNavigate();

  const id = book.id || book._id;
  const cover =
    book.cover || "https://via.placeholder.com/180x270?text=No+Cover";

  const handleClick = () => navigate(`/book/${id}`);

  const theme = {
    bg: darkMode ? "#1C1917" : "#f3ebe3",
    surface: darkMode ? "#292524" : "#efe5dc",
    text: darkMode ? "#F5F0EB" : "#000000",
    textMuted: darkMode ? "#A8A29E" : "#00000099",
    textSubtle: darkMode ? "#57534E" : "#00000066",
    border: darkMode ? "#292524" : "#0000001a",
    accent: "#f57c00",
  };

  if (variant === "row") {
    return (
      <div
        onClick={handleClick}
        className="group flex cursor-pointer gap-4 rounded-[24px] border p-3 transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: theme.bg,
          borderColor: theme.border,
        }}
      >
        <div className="relative w-16 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
          <div className="aspect-[2/3]">
            <img
              src={cover}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/180x270?text=No+Cover";
              }}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <h3
            className="line-clamp-2 text-sm font-semibold leading-snug"
            style={{ color: theme.text }}
          >
            {book.title}
          </h3>

          <p
            className="line-clamp-1 text-xs font-medium"
            style={{ color: theme.textMuted }}
          >
            {book.author}
          </p>

          {book.genre && (
            <span
              className="w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                background: theme.surface,
                color: theme.textSubtle,
              }}
            >
              {book.genre}
            </span>
          )}

          {showDate && dateLabel && (
            <p className="text-[11px]" style={{ color: theme.textSubtle }}>
              {dateLabel}
            </p>
          )}
        </div>

        {book.rating && (
          <div className="ml-auto flex flex-shrink-0 items-start">
            <div
              className="rounded-full px-2 py-1 text-xs font-bold"
              style={{
                background: theme.surface,
                color: theme.text,
              }}
            >
              <span style={{ color: theme.accent }}>★</span> {book.rating}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group w-full cursor-pointer" onClick={handleClick}>
      <div className="relative mb-3 overflow-hidden rounded-[22px] shadow-sm transition-all duration-300 group-hover:shadow-lg">
        <div
          className="aspect-[2/3]"
          style={{ background: theme.surface }}
        >
          <img
            src={cover}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/180x270?text=No+Cover";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {book.rating && (
          <div className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            <span style={{ color: theme.accent }}>★</span> {book.rating}
          </div>
        )}

        {book.genre && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/85 backdrop-blur-sm">
              {book.genre}
            </span>
          </div>
        )}
      </div>

      <h3
        className="mb-1 line-clamp-2 text-[13px] font-semibold leading-snug transition-colors duration-200 group-hover:text-[#f57c00]"
        style={{ color: theme.text }}
      >
        {book.title}
      </h3>

      <p
        className="line-clamp-1 text-[11px] font-medium"
        style={{ color: theme.textMuted }}
      >
        {book.author}
      </p>
    </div>
  );
};

export default BookCard;