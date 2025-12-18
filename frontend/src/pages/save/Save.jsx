import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../authContext/index';

const Save = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mongoUserId, setMongoUserId] = useState(null);

  // ================= GET MONGO USER =================
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    console.log(currentUser.uid);
    
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

  // ================= FETCH FAVORITES =================
  useEffect(() => {
    if (!mongoUserId) return;

    fetch(`http://localhost:8090/api/users/${mongoUserId}/favbooks`)
      .then(res => res.json())
      .then(data => setSavedBooks(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [mongoUserId]);

  // ================= REMOVE FAVORITE =================
  const handleRemoveBook = async (bookId) => {
    await fetch(
      `http://localhost:8090/api/users/${mongoUserId}/favbooks/${bookId}`,
      { method: "DELETE" }
    );

    setSavedBooks(prev =>
      prev.filter(b => (b.id || b._id) !== bookId)
    );
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600" />
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8">Saved Books</h1>

      {savedBooks.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart size={64} className="mx-auto text-gray-400 mb-4" />
          <p>No saved books yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
          {savedBooks.map(book => (
            <div key={book.id || book._id} className="relative group">
              <button
                onClick={() => handleRemoveBook(book.id || book._id)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"
              >
                <FiTrash2 size={14} />
              </button>

              <div onClick={() => navigate(`/book/${book.id || book._id}`)}>
                <img
                  src={book.cover}
                  alt={book.title}
                  className="rounded-xl shadow-lg"
                />
                <h3 className="mt-2 text-sm font-semibold">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {book.author}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Save;
