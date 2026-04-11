import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import BookCard from '../../components/bookcard';

const History = () => {
  const { darkMode = false } = useOutletContext();
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme colors
  const bgColor = darkMode ? '#111110' : '#efe5dc';
  const textColor = darkMode ? '#F5F0EB' : '#000000';
  const textMuted = darkMode ? '#A8A29E' : '#00000099';
  const textSubtle = darkMode ? '#57534E' : '#00000066';

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
      <div className="min-h-screen w-full bg-black">
        <div className="w-full min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#f57c00] mb-4" />
            <p className="font-medium" style={{ color: textColor }}>Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full min-h-screen" style={{ background: bgColor }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8">
          <h1 className="text-2xl font-black mb-8" style={{ color: textColor }}>
            Reading History
          </h1>

          {historyBooks.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <FiClock size={48} style={{ color: textSubtle }} />
              <p className="text-sm" style={{ color: textMuted }}>
                No reading history yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
              {historyBooks.map(book => (
                <div key={book._id} className="relative group">
                  <button
                    onClick={() => handleRemoveBook(book._id)}
                    className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-md bg-red-500 hover:bg-red-600"
                  >
                    <FiTrash2 size={13} />
                  </button>

                  <BookCard book={book} darkMode={darkMode} />

                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: textMuted }}>
                    <FiClock size={12} />
                    {formatDate(book.lastRead)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;