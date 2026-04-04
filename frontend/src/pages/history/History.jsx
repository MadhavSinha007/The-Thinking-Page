import React, { useState, useEffect } from 'react';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import BookCard from '../../components/bookcard';
import { useTheme } from '../../context/ThemeContext';

const History = () => {
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/user/history');
      const data = await res.json();
      setHistoryBooks(data);
    } catch {
      const mock = [
        {
          _id: "1",
          title: "Frankenstein",
          author: "Mary Shelley",
          rating: "4.6",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1669159060i/63555343.jpg",
          lastRead: "2024-01-15T10:30:00"
        }
      ];
      setHistoryBooks(mock);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBook = (id) => {
    setHistoryBooks(prev => prev.filter(b => b._id !== id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.border, borderTopColor: theme.accent }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: theme.fg }}>
        Reading History
      </h1>

      {historyBooks.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <FiClock size={48} style={{ color: theme.fgSubtle }} />
          <p className="text-sm" style={{ color: theme.fgMuted }}>
            No reading history yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {historyBooks.map(book => (
            <div key={book._id} className="relative group">
              <button
                onClick={() => handleRemoveBook(book._id)}
                className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-md"
                style={{ background: '#EF4444' }}
              >
                <FiTrash2 size={13} />
              </button>

              <BookCard book={book} />

              <p className="text-xs mt-2 flex items-center gap-1" style={{ color: theme.fgMuted }}>
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