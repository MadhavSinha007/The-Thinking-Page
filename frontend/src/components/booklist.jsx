
import React, { useState, useEffect } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import BookCard from './bookcard';

/* ----------------------------------------
   BookSection Component
----------------------------------------- */
const BookSection = ({ title, books, viewAllLink, onViewAll }) => {
  if (!books || books.length === 0) return null;

  const displayBooks = books.slice(0, 7);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          {title}
        </h2>
        {viewAllLink && (
          <button 
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors group"
          >
            View all
            <FiChevronRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-5 pb-4">
          {displayBooks.map((book) => (
            <div key={book._id} className="flex-shrink-0 w-[160px] h-[280px]">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------------
   Main BookList Component
----------------------------------------- */
const BookList = ({ searchQuery = "" }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  /* ---------- Mock Data ---------- */
  const generateMockBooks = () => [
    {
      _id: "1",
      title: "Frankenstein",
      author: "Mary Shelley",
      genre: "Gothic Fiction",
      rating: "4.6",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
    },
    {
      _id: "2",
      title: "Good Omens",
      author: "Neil Gaiman",
      genre: "Comedy",
      rating: "4.7",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1392528568i/12067.jpg",
    },
    {
      _id: "3",
      title: "1984",
      author: "George Orwell",
      genre: "Dystopian",
      rating: "4.7",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg",
    },
    {
      _id: "4",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      genre: "Romance",
      rating: "4.5",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
    },
    {
      _id: "5",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      genre: "Fantasy",
      rating: "4.7",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
    },
    {
      _id: "6",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      genre: "Classic Fiction",
      rating: "4.8",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
    },
  ];

  /* ---------- Fetch Books ---------- */
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8090/api/books');
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setBooks(data);
    } catch {
      console.warn('Using mock data');
      setBooks(generateMockBooks());
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Search Filter ---------- */
  const getFilteredBooks = () => {
    if (!searchQuery.trim()) return books;

    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.genre?.toLowerCase().includes(q)
    );
  };

  /* ---------- Categories ---------- */
  const categorizeBooks = () => {
    const filtered = getFilteredBooks();

    if (searchQuery.trim()) {
      return { searchResults: filtered };
    }

    const knownGenres = [
      'romance',
      'fantasy',
      'dystopian',
      'classic',
      'gothic',
      'comedy',
    ];

    return {
      latest: filtered.slice(0, 14),

      recommended: filtered.filter(
        (b) => parseFloat(b.rating) >= 4.6
      ),

      exclusive: filtered.filter(
        (b) => b.genre === 'Romance' || b.genre === 'Fantasy'
      ),

      highlyRated: filtered
        .filter((b) => parseFloat(b.rating) >= 4.5)
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)),

      classics: filtered.filter((b) =>
        b.genre?.toLowerCase().includes('classic')
      ),

      fantasy: filtered.filter((b) => b.genre === 'Fantasy'),

      dystopian: filtered.filter((b) => b.genre === 'Dystopian'),

      romance: filtered.filter((b) => b.genre === 'Romance'),

      gothicFiction: filtered.filter((b) =>
        b.genre?.toLowerCase().includes('gothic')
      ),

      comedy: filtered.filter((b) =>
        b.genre?.toLowerCase().includes('comedy')
      ),

      others: filtered.filter(
        (b) =>
          !knownGenres.some((g) =>
            b.genre?.toLowerCase().includes(g)
          )
      ),
    };
  };

  const handleViewAll = (categoryName) => {
    setExpandedCategory(categoryName);
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  const categories = categorizeBooks();

  /* ---------- Render ---------- */
  return (
    <div className="w-full bg-white">
      {searchQuery.trim() ? (
        <div className="px-6 mb-10">
          <h2 className="text-2xl font-bold mb-6">
            Search results for{" "}
            <span className="text-purple-600">"{searchQuery}"</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {categories.searchResults.length > 0 ? (
              categories.searchResults.map((book) => (
                <BookCard key={book._id} book={book} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No books found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-6">
          {expandedCategory === 'latest' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">LATEST</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.latest.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'recommended' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">RECOMMENDED BOOKS</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.recommended.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'exclusive' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">EXCLUSIVE BOOKS</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.exclusive.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'highlyRated' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">HIGHLY RATED</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.highlyRated.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'classics' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">CLASSICS</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.classics.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'fantasy' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">FANTASY</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.fantasy.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'dystopian' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">DYSTOPIAN</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.dystopian.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'romance' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">ROMANCE</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.romance.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'gothicFiction' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">GOTHIC FICTION</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.gothicFiction.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'comedy' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">COMEDY</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.comedy.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : expandedCategory === 'others' ? (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">OTHERS</h2>
                <button 
                  onClick={() => setExpandedCategory(null)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <FiChevronRight size={18} className="rotate-180" />
                  Back
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categories.others.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <BookSection title="LATEST" books={categories.latest} viewAllLink onViewAll={() => handleViewAll('latest')} />
              <BookSection title="RECOMMENDED BOOKS" books={categories.recommended} viewAllLink onViewAll={() => handleViewAll('recommended')} />
              <BookSection title="EXCLUSIVE BOOKS" books={categories.exclusive} viewAllLink onViewAll={() => handleViewAll('exclusive')} />
              <BookSection title="HIGHLY RATED" books={categories.highlyRated} viewAllLink onViewAll={() => handleViewAll('highlyRated')} />

              <BookSection title="CLASSICS" books={categories.classics} viewAllLink onViewAll={() => handleViewAll('classics')} />
              <BookSection title="FANTASY" books={categories.fantasy} viewAllLink onViewAll={() => handleViewAll('fantasy')} />
              <BookSection title="DYSTOPIAN" books={categories.dystopian} viewAllLink onViewAll={() => handleViewAll('dystopian')} />
              <BookSection title="ROMANCE" books={categories.romance} viewAllLink onViewAll={() => handleViewAll('romance')} />
              <BookSection title="GOTHIC FICTION" books={categories.gothicFiction} viewAllLink onViewAll={() => handleViewAll('gothicFiction')} />
              <BookSection title="COMEDY" books={categories.comedy} viewAllLink onViewAll={() => handleViewAll('comedy')} />
              <BookSection title="OTHERS" books={categories.others} viewAllLink onViewAll={() => handleViewAll('others')} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BookList;
