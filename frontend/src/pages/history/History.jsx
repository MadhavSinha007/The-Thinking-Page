import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiTrash2 } from 'react-icons/fi';

const History = () => {
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/user/history');
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await response.json();
      setHistoryBooks(data);
      setLoading(false);
    } catch (err) {
      console.log('Using mock history data');
      const mockHistory = [
        {
          _id: "1",
          title: "101 cách của đồ đại lão hằng xóm",
          author: "Đồng Vũ",
          genre: "Romance",
          rating: "4.8",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1660145160i/62022434.jpg",
          lastRead: "2024-01-15T10:30:00"
        },
        {
          _id: "2",
          title: "Frankenstein; Or, The Modern Prometheus",
          author: "Mary Wollstonecraft Shelley",
          genre: "Gothic Fiction",
          rating: "4.6",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
          lastRead: "2024-01-14T15:20:00"
        },
        {
          _id: "7",
          title: "Harry Potter and the Sorcerer's Stone",
          author: "J.K. Rowling",
          genre: "Fantasy",
          rating: "4.9",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1598823299i/42844155.jpg",
          lastRead: "2024-01-13T09:15:00"
        },
        {
          _id: "8",
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          genre: "Fantasy",
          rating: "4.7",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
          lastRead: "2024-01-12T14:30:00"
        },
        {
          _id: "3",
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          genre: "Classic Fiction",
          rating: "4.8",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
          lastRead: "2024-01-11T08:45:00"
        }
      ];
      setHistoryBooks(mockHistory);
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all reading history?')) {
      setHistoryBooks([]);
      // TODO: Call API to clear history
    }
  };

  const handleRemoveBook = (bookId) => {
    setHistoryBooks(historyBooks.filter(book => book._id !== bookId));
    // TODO: Call API to remove book from history
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reading History</h1>
          <p className="text-gray-600">
            {historyBooks.length} {historyBooks.length === 1 ? 'book' : 'books'} in your history
          </p>
        </div>
        {historyBooks.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <FiTrash2 size={18} />
            Clear History
          </button>
        )}
      </div>

      {/* History Grid */}
      {historyBooks.length === 0 ? (
        <div className="text-center py-20">
          <FiClock className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No reading history yet</h3>
          <p className="text-gray-500">Books you read will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
          {historyBooks.map((book) => (
            <div key={book._id} className="relative group">
              {/* Remove Button - Top Right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBook(book._id);
                }}
                className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from history"
              >
                <FiTrash2 size={14} />
              </button>

              {/* Book Card */}
              <div className="cursor-pointer" onClick={() => navigate(`/book/${book._id}`)}>
                {/* Book Cover */}
                <div className="relative mb-3 overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200">
                    <img 
                      src={book.cover || "https://via.placeholder.com/180x270?text=No+Cover"}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/180x270?text=No+Cover";
                      }}
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {/* Rating badge */}
                  {book.rating && (
                    <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1">
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
                <p className="text-xs text-gray-600 line-clamp-1 font-medium mb-1">
                  {book.author}
                </p>

                {/* Last Read Date */}
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FiClock size={12} />
                  {formatDate(book.lastRead)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;