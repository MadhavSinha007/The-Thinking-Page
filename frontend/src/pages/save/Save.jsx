import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiBookmark, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../authContext/index';
import BookCard from '../../components/bookcard';

const Save = () => {
  const { darkMode = false } = useOutletContext();
  const { currentUser } = useAuth();
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState(null);

  // Theme colors
  const bgColor = darkMode ? '#111110' : '#efe5dc';
  const textColor = darkMode ? '#F5F0EB' : '#000000';
  const textMuted = darkMode ? '#A8A29E' : '#00000099';
  const textSubtle = darkMode ? '#57534E' : '#00000066';

  useEffect(() => {
    if (!currentUser) { 
      setLoading(false); 
      return; 
    }
    fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`)
      .then(r => r.json())
      .then(user => setMongoUserId(user.id || user._id))
      .catch(() => setLoading(false));
  }, [currentUser]);

  useEffect(() => {
    if (!mongoUserId) return;
    fetch(`http://localhost:8090/api/users/${mongoUserId}/favbooks`)
      .then(r => r.json())
      .then(setSavedBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mongoUserId]);

  const handleRemove = async (bookId) => {
    try {
      await fetch(`http://localhost:8090/api/users/${mongoUserId}/favbooks/${bookId}`, { 
        method: 'DELETE' 
      });
      setSavedBooks(prev => prev.filter(b => (b.id || b._id) !== bookId));
    } catch (error) {
      console.error('Error removing book:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black">
        <div className="w-full min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#f57c00] mb-4" />
            <p className="font-medium" style={{ color: textColor }}>
              Loading saved books...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-black">
        <div className="w-full min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
          <div className="text-center max-w-md px-4">
            <FiBookmark size={48} className="mx-auto mb-4" style={{ color: textSubtle }} />
            <h2 className="text-xl font-black mb-2" style={{ color: textColor }}>
              Sign in to save books
            </h2>
            <p className="mb-6" style={{ color: textMuted }}>
              Create an account or sign in to save your favorite books and access them anytime.
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 rounded-full bg-[#f57c00] text-black font-semibold hover:scale-105 transition-transform"
            >
              Sign In
            </a>
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
            Saved Books
          </h1>

          {savedBooks.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <FiBookmark size={48} style={{ color: textSubtle }} />
              <p className="text-sm" style={{ color: textMuted }}>
                No saved books yet
              </p>
              <a
                href="/home"
                className="mt-4 px-6 py-2 rounded-full bg-[#f57c00] text-black font-semibold hover:scale-105 transition-transform"
              >
                Browse Books
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
              {savedBooks.map(book => {
                const bid = book.id || book._id;
                return (
                  <div key={bid} className="relative group">
                    <button
                      onClick={() => handleRemove(bid)}
                      className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-md bg-red-500 hover:bg-red-600"
                    >
                      <FiTrash2 size={13} />
                    </button>

                    <BookCard book={book} darkMode={darkMode} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Save;