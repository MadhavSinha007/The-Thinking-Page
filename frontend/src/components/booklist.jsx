import React, { useState, useEffect } from "react";
import { FiChevronRight } from "react-icons/fi";
import BookCard from "./bookcard";
import { useTheme } from "../context/ThemeContext";

/* -------------------------------
   Section Component
-------------------------------- */
const BookSection = ({ title, books, onViewAll, darkMode }) => {
  if (!books || books.length === 0) return null;

  const displayBooks = books.slice(0, 7);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className={`text-lg font-bold uppercase tracking-wide ${
          darkMode ? 'text-gray-300' : 'text-gray-900'
        }`}>
          {title}
        </h2>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm text-purple-600 font-semibold group"
          >
            View all
            <FiChevronRight
              size={18}
              className="group-hover:translate-x-1 transition"
            />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
        {displayBooks.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------
   Main BookList
-------------------------------- */
const BookList = ({ searchQuery = "" }) => {
  const { darkMode } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  /* -------------------------------
     Mock Books
  -------------------------------- */
  const generateMockBooks = () => [
    {
      _id: "1",
      title: "Frankenstein",
      author: "Mary Shelley",
      genre: "Gothic Fiction",
      rating: "4.6",
      cover:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
    },
    {
      _id: "2",
      title: "Good Omens",
      author: "Neil Gaiman",
      genre: "Comedy",
      rating: "4.7",
      cover:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1392528568i/12067.jpg",
    },
    {
      _id: "3",
      title: "1984",
      author: "George Orwell",
      genre: "Dystopian",
      rating: "4.7",
      cover:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg",
    },
    {
      _id: "4",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      genre: "Romance",
      rating: "4.5",
      cover:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
    },
    {
      _id: "5",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      genre: "Fantasy",
      rating: "4.7",
      cover:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
    },
  ];

  /* -------------------------------
     Fetch Books
  -------------------------------- */
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8090/api/books");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBooks(data);
    } catch {
      console.warn("Using mock books");
      setBooks(generateMockBooks());
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
     Search Filter
  -------------------------------- */
  const filteredBooks = books.filter((b) => {
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();

    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.genre?.toLowerCase().includes(q)
    );
  });

  /* -------------------------------
     Categories (Netflix Pattern)
  -------------------------------- */
  const categories = [
    {
      key: "latest",
      title: "LATEST",
      books: filteredBooks.slice(0, 14),
    },
    {
      key: "recommended",
      title: "RECOMMENDED BOOKS",
      books: filteredBooks.filter((b) => parseFloat(b.rating) >= 4.6),
    },
    {
      key: "exclusive",
      title: "EXCLUSIVE BOOKS",
      books: filteredBooks.filter(
        (b) => b.genre === "Romance" || b.genre === "Fantasy"
      ),
    },
    {
      key: "highlyRated",
      title: "HIGHLY RATED",
      books: filteredBooks
        .filter((b) => parseFloat(b.rating) >= 4.5)
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)),
    },
    {
      key: "classics",
      title: "CLASSICS",
      books: filteredBooks.filter((b) =>
        b.genre?.toLowerCase().includes("classic")
      ),
    },
    {
      key: "fantasy",
      title: "FANTASY",
      books: filteredBooks.filter((b) => b.genre === "Fantasy"),
    },
    {
      key: "dystopian",
      title: "DYSTOPIAN",
      books: filteredBooks.filter((b) => b.genre === "Dystopian"),
    },
    {
      key: "romance",
      title: "ROMANCE",
      books: filteredBooks.filter((b) => b.genre === "Romance"),
    },
    {
      key: "gothic",
      title: "GOTHIC FICTION",
      books: filteredBooks.filter((b) =>
        b.genre?.toLowerCase().includes("gothic")
      ),
    },
    {
      key: "comedy",
      title: "COMEDY",
      books: filteredBooks.filter((b) =>
        b.genre?.toLowerCase().includes("comedy")
      ),
    },
  ];

  /* -------------------------------
     Loading
  -------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  /* -------------------------------
     Search Results
  -------------------------------- */
  if (searchQuery.trim()) {
    return (
      <div className="mb-10">
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Search results for{" "}
          <span className="text-purple-600">"{searchQuery}"</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------
     Expanded Category
  -------------------------------- */
  if (expandedCategory) {
    const category = categories.find((c) => c.key === expandedCategory);

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-lg font-bold uppercase ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {category.title}
          </h2>

          <button
            onClick={() => setExpandedCategory(null)}
            className="flex items-center gap-1 text-sm text-purple-600"
          >
            <FiChevronRight size={18} className="rotate-180" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
          {category.books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </div>
    );
  }

  /* -------------------------------
     Normal Sections
  -------------------------------- */
  return (
    <>
      {categories.map((cat) => (
        <BookSection
          key={cat.key}
          title={cat.title}
          books={cat.books}
          onViewAll={() => setExpandedCategory(cat.key)}
          darkMode={darkMode}
        />
      ))}
    </>
  );
};

export default BookList;