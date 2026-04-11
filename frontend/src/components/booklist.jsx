import React, { useState, useEffect, useMemo } from "react";
import BookCard from "./bookcard";
import { useAuth } from "../authContext";

// Normalize Genres
const normalizeGenres = (book) => {
  let genres = [];

  if (Array.isArray(book.genres)) {
    genres = book.genres;
  } else if (typeof book.genre === "string") {
    genres = book.genre.split(",");
  }

  return genres
    .map(g => g.trim().toLowerCase())
    .filter(Boolean);
};

// Generate Dynamic Tabs
const getGenreTabs = (books) => {
  const set = new Set();

  books.forEach(book => {
    book.genres?.forEach(g => set.add(g));
  });

  return ["All", ...Array.from(set).map(
    g => g.charAt(0).toUpperCase() + g.slice(1)
  )];
};

// Mock Data
const MOCK_BOOKS = [
  {
    _id: "1",
    title: "Frankenstein",
    author: "Mary Shelley",
    genre: "Gothic Fiction, Horror",
    rating: 4.6,
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
  },
  {
    _id: "2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    rating: 4.5,
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
  },
  {
    _id: "3",
    title: "Wuthering Heights",
    author: "Emily Brontë",
    genre: "Romance, Gothic Fiction",
    rating: 4.4,
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388212715i/6185.jpg",
  },
  {
    _id: "4",
    title: "Sherlock Holmes",
    author: "Arthur Conan Doyle",
    genre: "Mystery",
    rating: 4.7,
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1529189088i/3590.jpg",
  },
  {
    _id: "5",
    title: "Moby Dick",
    author: "Herman Melville",
    genre: "Adventure, Philosophy",
    rating: 4.2,
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327940656i/153747.jpg",
  },
];

const BookList = ({ searchQuery = "", darkMode = false }) => {
  const { currentUser } = useAuth?.() || {};

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Theme colors - directly computed from darkMode prop
  const bgColor = darkMode ? '#111110' : '#efe5dc';
  const textColor = darkMode ? '#F5F0EB' : '#000000';
  const textMuted = darkMode ? '#A8A29E' : '#00000099';
  const borderColor = darkMode ? '#292524' : '#0000001a';

  console.log('BookList darkMode:', darkMode); // Debug log

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:8090/api/books");
        const data = await res.json();

        const formatted = data.map(b => ({
          ...b,
          genres: normalizeGenres(b),
        }));

        setBooks(formatted);
      } catch {
        const fallback = MOCK_BOOKS.map(b => ({
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

  if (loading) {
    return (
      <div className="flex justify-center py-20" style={{ background: bgColor }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" 
             style={{ borderColor: borderColor, borderTopColor: '#f57c00' }} />
      </div>
    );
  }

  // Filter books
  const filtered = books.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q)
    );
  });

  const tabFiltered =
    activeTab === "All"
      ? filtered
      : filtered.filter(book =>
          book.genres?.some(g =>
            g.includes(activeTab.toLowerCase())
          )
        );

  const username =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Reader";

  const sections = [
    {
      title: "Popular",
      books: [...tabFiltered]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6),
    },
    {
      title: "Top Rated",
      books: tabFiltered
        .filter(b => (b.rating || 0) >= 4.6)
        .slice(0, 6),
    },
    {
      title: "Explore",
      books: [...tabFiltered]
        .sort(() => 0.5 - Math.random())
        .slice(0, 6),
    },
  ];

  return (
    <div style={{ background: bgColor, minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: textColor }}>
            Hello,{" "}
            <span style={{ color: '#f57c00' }}>
              {username}
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: textMuted }}>
            Discover something worth reading
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {genreTabs.map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: isActive ? "#f57c00" : "transparent",
                    color: isActive ? "#000000" : textMuted,
                    border: `1px solid ${isActive ? "#f57c00" : borderColor}`,
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Book Sections */}
        {sections.map((sec, i) => (
          sec.books?.length > 0 && (
            <section key={i} className="mb-10">
              <div className="mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: textColor }}>
                  {sec.title}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {sec.books.map(book => (
                  <BookCard key={book._id || book.id} book={book} darkMode={darkMode} />
                ))}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );
};

export default BookList;