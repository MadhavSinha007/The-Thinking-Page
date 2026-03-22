import React, { useState, useEffect } from 'react';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import BookCard from '../../components/bookcard';

const History = () => {
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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

    } catch {
      console.log('Using mock history data');

      const mockHistory = [
        {
          _id: "1",
          title: "Frankenstein",
          author: "Mary Shelley",
          rating: "4.6",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
          lastRead: "2024-01-15T10:30:00"
        }
      ];

      setHistoryBooks(mockHistory);
      setLoading(false);
    }
  };

  const handleRemoveBook = (bookId) => {
    setHistoryBooks(historyBooks.filter(book => book._id !== bookId));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 w-full">

      <h1 className="text-3xl font-bold mb-8">Reading History</h1>

      {historyBooks.length === 0 ? (
        <div className="text-center py-20">
          <FiClock className="mx-auto text-gray-400 mb-4" size={64} />
          <p>No reading history yet</p>
        </div>
      ) : (

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">

          {historyBooks.map(book => (
            <div key={book._id} className="relative group">

              <button
                onClick={() => handleRemoveBook(book._id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"
              >
                <FiTrash2 size={14} />
              </button>

              <BookCard book={book} />

              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <FiClock size={12} />
                {formatDate(book.lastRead)}
              </p>

            </div>
          ))}

        </div>

      )}

    </div>
  );
};

export default History;