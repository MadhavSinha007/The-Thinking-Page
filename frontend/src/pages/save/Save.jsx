import React, { useState, useEffect } from 'react';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../authContext/index';
import BookCard from '../../components/bookcard';
import { useTheme } from '../../context/ThemeContext';

const Save = () => {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();

  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`)
      .then(res => res.json())
      .then(user => {
        setMongoUserId(user.id || user._id);
      })
      .catch(err => {
        console.error("User mapping failed", err);
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    if (!mongoUserId) return;

    fetch(`http://localhost:8090/api/users/${mongoUserId}/favbooks`)
      .then(res => res.json())
      .then(data => setSavedBooks(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [mongoUserId]);

  const handleRemoveBook = async (bookId) => {
    await fetch(
      `http://localhost:8090/api/users/${mongoUserId}/favbooks/${bookId}`,
      { method: "DELETE" }
    );

    setSavedBooks(prev =>
      prev.filter(b => (b.id || b._id) !== bookId)
    );
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
      <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Saved Books
      </h1>

      {savedBooks.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>No saved books yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
          {savedBooks.map(book => (
            <div key={book.id || book._id} className="relative group">
              <button
                onClick={() => handleRemoveBook(book.id || book._id)}
                className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiTrash2 size={14} />
              </button>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Save;