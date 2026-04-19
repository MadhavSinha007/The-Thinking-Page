import React, { useState, useEffect, useMemo } from "react";
import BookCard from "./bookcard";
import { useAuth } from "../authContext";

// Normalize genres from backend
const normalizeGenres = (book) => {
  let genres = [];

  if (Array.isArray(book.genres)) {
    genres = book.genres;
  } else if (typeof book.genre === "string") {
    genres = book.genre.split(",");
  }

  return genres
    .map((g) => g.trim().toLowerCase())
    .filter(Boolean);
};

// Build tabs from normalized genres
const getGenreTabs = (books) => {
  const set = new Set();

  books.forEach((book) => {
    book.genres?.forEach((g) => {
      if (g) set.add(g);
    });
  });

  return [
    "All",
    ...Array.from(set).map(
      (g) => g.charAt(0).toUpperCase() + g.slice(1)
    ),
  ];
};

// Fallback data
const MOCK_BOOKS = [
  {
    _id: "1",
    title: "Frankenstein",
    author: "Mary Shelley",
    genre: "Gothic Fiction, Horror",
    rating: 4.6,
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
  },
  {
    _id: "2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    rating: 4.5,
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
  },
  {
    _id: "3",
    title: "Wuthering Heights",
    author: "Emily Brontë",
    genre: "Romance, Gothic Fiction",
    rating: 4.4,
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388212715i/6185.jpg",
  },
  {
    _id: "4",
    title: "Sherlock Holmes",
    author: "Arthur Conan Doyle",
    genre: "Mystery",
    rating: 4.7,
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1529189088i/3590.jpg",
  },
  {
    _id: "5",
    title: "Moby Dick",
    author: "Herman Melville",
    genre: "Adventure, Philosophy",
    rating: 4.2,
    cover:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327940656i/153747.jpg",
  },
];

const BookList = ({ searchQuery = "", darkMode = false }) => {
  const { currentUser } = useAuth?.() || {};

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const theme = {
    bg: darkMode ? "#111110" : "#efe5dc",
    surface: darkMode ? "#1C1917" : "#f3ebe3",
    surfaceSoft: darkMode ? "#292524" : "#efe5dc",
    text: darkMode ? "#F5F0EB" : "#000000",
    textMuted: darkMode ? "#A8A29E" : "#00000099",
    textSubtle: darkMode ? "#57534E" : "#00000066",
    border: darkMode ? "#292524" : "#0000001a",
    accent: "#f57c00",
    accentSoft: darkMode ? "#3D1410" : "#f57c0015",
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:8090/api/books");
        const data = await res.json();

        const formatted = data.map((b) => ({
          ...b,
          genres: normalizeGenres(b),
        }));

        setBooks(formatted);
      } catch {
        const fallback = MOCK_BOOKS.map((b) => ({
          ...b,
          genres: normalizeGenres(b),
        }));
        setBooks(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const genreTabs = useMemo(() => getGenreTabs(books), [books]);

  const username =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Reader";

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const searched = books.filter((b) => {
      if (!q) return true;
      return (
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.genre?.toLowerCase().includes(q)
      );
    });

    if (activeTab === "All") return searched;

    return searched.filter((book) =>
      book.genres?.some((g) => g.includes(activeTab.toLowerCase()))
    );
  }, [books, searchQuery, activeTab]);

  const sections = useMemo(() => {
    const popular = [...filteredBooks]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);

    const topRated = filteredBooks
      .filter((b) => (b.rating || 0) >= 4.6)
      .slice(0, 6);

    const explore = [...filteredBooks]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    return [
      { title: "Popular", subtitle: "Trending reads right now", books: popular },
      { title: "Top Rated", subtitle: "Reader favorites", books: topRated },
      { title: "Explore", subtitle: "Find something new", books: explore },
    ];
  }, [filteredBooks]);

  if (loading) {
    return (
      <div
        className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
        style={{ background: theme.bg }}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="flex min-h-[300px] items-center justify-center rounded-[28px] border"
            style={{
              background: theme.surface,
              borderColor: theme.border,
            }}
          >
            <div className="text-center">
              <div
                className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
                style={{
                  borderColor: theme.border,
                  borderTopColor: theme.accent,
                }}
              />
              <p
                className="mt-4 text-sm font-medium"
                style={{ color: theme.textMuted }}
              >
                Loading your library...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <section
          className="rounded-[28px] border px-5 py-6 sm:px-6 sm:py-7 lg:px-8"
          style={{
            background: theme.surface,
            borderColor: theme.border,
          }}
        >
          <p
            className="text-xs uppercase tracking-[0.24em]"
            style={{ color: theme.textSubtle }}
          >
            TheThinkingPage
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="text-2xl font-black tracking-tight sm:text-3xl"
                style={{ color: theme.text }}
              >
                Hello, <span style={{ color: theme.accent }}>{username}</span>
              </h1>
              <p
                className="mt-1 text-sm sm:text-base"
                style={{ color: theme.textMuted }}
              >
                Discover something worth reading today.
              </p>
            </div>

            <div
              className="inline-flex self-start rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] sm:self-auto"
              style={{
                background: theme.accentSoft,
                color: theme.accent,
                border: `1px solid ${theme.border}`,
              }}
            >
              {filteredBooks.length} books
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {genreTabs.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: isActive ? theme.accent : theme.surface,
                    color: isActive ? "#000000" : theme.textMuted,
                    border: `1px solid ${isActive ? theme.accent : theme.border}`,
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </section>

        {filteredBooks.length === 0 ? (
          <section
            className="mt-6 rounded-[28px] border px-6 py-12 text-center"
            style={{
              background: theme.surface,
              borderColor: theme.border,
            }}
          >
            <h2
              className="text-xl font-black tracking-tight"
              style={{ color: theme.text }}
            >
              No books found
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: theme.textMuted }}
            >
              Try a different search or switch to another category.
            </p>
          </section>
        ) : (
          sections.map(
            (section, index) =>
              section.books?.length > 0 && (
                <section key={index} className="mt-8">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <h2
                        className="text-lg font-black tracking-tight sm:text-xl"
                        style={{ color: theme.text }}
                      >
                        {section.title}
                      </h2>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: theme.textMuted }}
                      >
                        {section.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {section.books.map((book) => (
                      <BookCard
                        key={book._id || book.id}
                        book={book}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </section>
              )
          )
        )}
      </div>
    </div>
  );
};

export default BookList;