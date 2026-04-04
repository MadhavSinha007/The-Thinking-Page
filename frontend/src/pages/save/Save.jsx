import React, { useState, useEffect } from 'react';
import { FiBookmark, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../authContext/index';
import BookCard from '../../components/bookcard';
import { useTheme } from '../../context/ThemeContext';

const Save = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState(null);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
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
    await fetch(`http://localhost:8090/api/users/${mongoUserId}/favbooks/${bookId}`, { method: 'DELETE' });
    setSavedBooks(prev => prev.filter(b => (b.id || b._id) !== bookId));
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
        Saved Books
      </h1>

      {savedBooks.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <FiBookmark size={48} style={{ color: theme.fgSubtle }} />
          <p className="text-sm" style={{ color: theme.fgMuted }}>
            No saved books yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {savedBooks.map(book => {
            const bid = book.id || book._id;
            return (
              <div key={bid} className="relative group">
                <button
                  onClick={() => handleRemove(bid)}
                  className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  style={{ background: '#EF4444' }}
                >
                  <FiTrash2 size={13} />
                </button>

                <BookCard book={book} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Save;