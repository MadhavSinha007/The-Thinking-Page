import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import BookCard from "./bookcard";
import { useAuth } from "../authContext";

// ── Normalize Genres ──────────────────────────────────────
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

// ── Generate Dynamic Tabs ─────────────────────────────────
const getGenreTabs = (books) => {
  const set = new Set();

  books.forEach(book => {
    book.genres?.forEach(g => set.add(g));
  });

  return ["All", ...Array.from(set).map(
    g => g.charAt(0).toUpperCase() + g.slice(1)
  )];
};

// ── Category Tabs ─────────────────────────────────────────
const CategoryTabs = ({ active, onChange, theme, tabs }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
    {tabs.map(tab => {
      const isActive = active === tab;
      return (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
          style={{
            background: isActive ? theme.pillActive : "transparent",
            color: isActive ? theme.pillActiveFg : theme.fgMuted,
            border: `1px solid ${theme.border}`,
          }}
        >
          {tab}
        </button>
      );
    })}
  </div>
);

// ── Section Header ────────────────────────────────────────
const SectionHeader = ({ title, theme }) => (
  <div className="mb-4">
    <h2
      className="text-sm font-semibold uppercase tracking-wider"
      style={{ color: theme.fg }}
    >
      {title}
    </h2>
  </div>
);

// ── Book Section ──────────────────────────────────────────
const BookSection = ({ title, books, theme }) => {
  if (!books?.length) return null;

  return (
    <section className="mb-10">
      <SectionHeader title={title} theme={theme} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
        {books.map(book => (
          <BookCard key={book._id || book.id} book={book} />
        ))}
      </div>
    </section>
  );
};

// ── Greeting ──────────────────────────────────────────────
const Greeting = ({ username, theme }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-semibold" style={{ color: theme.fg }}>
      Hello,{" "}
      <span style={{ color: theme.accent }}>
        {username || "Reader"}
      </span>
    </h1>
    <p className="text-sm mt-1" style={{ color: theme.fgMuted }}>
      Discover something worth reading
    </p>
  </div>
);

// ── Mock Data ─────────────────────────────────────────────
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

// ── Main Component ────────────────────────────────────────
const BookList = ({ searchQuery = "" }) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth?.() || {};

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

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
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.border, borderTopColor: theme.accent }}
        />
      </div>
    );
  }

  // ── Search Filter ───────────────────────────────────────
  const filtered = books.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q)
    );
  });

  // ── Genre Filter ────────────────────────────────────────
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
    currentUser?.email?.split("@")[0];

  // ── Sections ────────────────────────────────────────────
  const sections = [
    {
      title: "Popular",
      books: [...tabFiltered]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6),
    },
    {
      title: "Top Rated",
      books: tabFiltered
        .filter(b => b.rating >= 4.6)
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
    <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8">
      <Greeting username={username} theme={theme} />

      <div className="mb-6">
        <CategoryTabs
          active={activeTab}
          onChange={setActiveTab}
          theme={theme}
          tabs={genreTabs}
        />
      </div>

      {sections.map((sec, i) => (
        <BookSection
          key={i}
          title={sec.title}
          books={sec.books}
          theme={theme}
        />
      ))}
    </div>
  );
};

export default BookList;