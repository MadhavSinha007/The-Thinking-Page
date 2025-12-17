import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2 } from 'react-icons/fi';

const Save = () => {
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedBooks();
  }, []);

  const fetchSavedBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/user/saved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved books');
      }
      
      const data = await response.json();
      setSavedBooks(data);
      setLoading(false);
    } catch (err) {
      console.log('Using mock saved data');
      const mockSaved = [
        {
          _id: "1",
          title: "101 cách của đồ đại lão hằng xóm",
          author: "Đồng Vũ",
          genre: "Romance",
          rating: "4.8",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1660145160i/62022434.jpg",
          savedAt: "2024-01-10T08:30:00"
        },
        {
          _id: "3",
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          genre: "Classic Fiction",
          rating: "4.8",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
          savedAt: "2024-01-11T12:20:00"
        },
        {
          _id: "4",
          title: "1984",
          author: "George Orwell",
          genre: "Dystopian",
          rating: "4.7",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg",
          savedAt: "2024-01-12T09:45:00"
        },
        {
          _id: "7",
          title: "Harry Potter and the Sorcerer's Stone",
          author: "J.K. Rowling",
          genre: "Fantasy",
          rating: "4.9",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1598823299i/42844155.jpg",
          savedAt: "2024-01-13T16:10:00"
        },
        {
          _id: "10",
          title: "The Lord of the Rings",
          author: "J.R.R. Tolkien",
          genre: "Fantasy",
          rating: "4.9",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566425108i/33.jpg",
          savedAt: "2024-01-14T11:30:00"
        }
      ];
      setSavedBooks(mockSaved);
      setLoading(false);
    }
  };

  const handleRemoveBook = (bookId) => {
    setSavedBooks(savedBooks.filter(book => book._id !== bookId));
    // TODO: Call API to remove book from saved
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading saved books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Books</h1>
        <p className="text-gray-600">
          {savedBooks.length} {savedBooks.length === 1 ? 'book' : 'books'} in your collection
        </p>
      </div>

      {/* Saved Books Grid */}
      {savedBooks.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved books yet</h3>
          <p className="text-gray-500 mb-6">Start adding books to your collection</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
          {savedBooks.map((book) => (
            <div key={book._id} className="relative group">
              {/* Remove Button - Top Right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBook(book._id);
                }}
                className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from saved"
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
                  {/* Saved indicator */}
                  <div className="absolute bottom-3 right-3 text-white">
                    <FiHeart size={18} fill="currentColor" />
                  </div>
                </div>
                
                {/* Book Title */}
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-purple-600 transition-colors leading-tight">
                  {book.title}
                </h3>
                
                {/* Author */}
                <p className="text-xs text-gray-600 line-clamp-1 font-medium">
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