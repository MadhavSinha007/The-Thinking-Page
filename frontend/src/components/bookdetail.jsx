import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiShare2 } from 'react-icons/fi';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { useAuth } from '../authContext/index';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user from Firebase
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookDetails();
    fetchComments();
    checkIfSaved();
    checkIfLiked();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8090/api/books/${id}`);

      if (!response.ok) {
        throw new Error('Book not found');
      }

      const data = await response.json();
      setBook(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching book:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/coms/book/${id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Check if book is saved in backend
  const checkIfSaved = async () => {
    if (!currentUser) {
      // Fallback to localStorage if not logged in
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      setIsSaved(savedBooks.some(b => b.id === id));
      return;
    }

    try {
      // Get user's favorite books from backend
      const response = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      
      if (response.ok) {
        const user = await response.json();
        setIsSaved(user.favBooks && user.favBooks.includes(id));
      }
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const checkIfLiked = () => {
    const likedBooks = JSON.parse(localStorage.getItem('likedBooks') || '[]');
    setIsLiked(likedBooks.some(b => b.id === id));
  };

  const handleReadNow = () => {
    // Save to history
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    const bookForHistory = { 
      id: id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      genre: book.genre,
      rating: book.rating,
      lastRead: new Date().toISOString() 
    };

    const filteredHistory = history.filter(b => b.id !== id);
    filteredHistory.unshift(bookForHistory);
    localStorage.setItem('history', JSON.stringify(filteredHistory.slice(0, 50)));

    // Navigate to reader page
    navigate(`/read/${id}`);
  };

  // Updated handleSave to use backend API
  const handleSave = async () => {
    if (!currentUser) {
      // Fallback to localStorage if not logged in
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');

      if (isSaved) {
        const filtered = savedBooks.filter(b => b.id !== id);
        localStorage.setItem('savedBooks', JSON.stringify(filtered));
        setIsSaved(false);
      } else {
        const bookForSave = { 
          id: id,
          title: book.title,
          author: book.author,
          cover: book.cover,
          genre: book.genre,
          rating: book.rating,
          savedAt: new Date().toISOString() 
        };
        savedBooks.push(bookForSave);
        localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
        setIsSaved(true);
      }
      return;
    }

    try {
      // Get user by Firebase UID
      const userResponse = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      
      if (!userResponse.ok) {
        console.error('User not found in database');
        return;
      }

      const user = await userResponse.json();

      if (isSaved) {
        // Remove from favorites
        const response = await fetch(`http://localhost:8090/api/users/${user.id}/favbooks/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setIsSaved(false);
        }
      } else {
        // Add to favorites
        const response = await fetch(`http://localhost:8090/api/users/${user.id}/favbooks/${id}`, {
          method: 'POST'
        });

        if (response.ok) {
          setIsSaved(true);
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleLike = () => {
    const likedBooks = JSON.parse(localStorage.getItem('likedBooks') || '[]');

    if (isLiked) {
      const filtered = likedBooks.filter(b => b.id !== id);
      localStorage.setItem('likedBooks', JSON.stringify(filtered));
      setIsLiked(false);
    } else {
      const bookForLike = { 
        id: id,
        title: book.title,
        author: book.author,
        cover: book.cover,
        genre: book.genre,
        rating: book.rating
      };
      likedBooks.push(bookForLike);
      localStorage.setItem('likedBooks', JSON.stringify(likedBooks));
      setIsLiked(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out "${book.title}" by ${book.author}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8090/api/coms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookid: id,
          text: newComment,
          user: currentUser?.email || "Anonymous"
        }),
      });
      
      if (response.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating);

    for (let i = 1; i <= 5; i++) {
      if (i <= numRating) stars.push(<span key={i} className="text-yellow-400 text-xl">★</span>);
      else if (i - 0.5 <= numRating) stars.push(<span key={i} className="text-yellow-400 text-xl">⯨</span>);
      else stars.push(<span key={i} className="text-gray-300 text-xl">★</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">{error || 'Book not found'}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-10 p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-700 hover:text-gray-900 font-medium transition-colors"
      >
        <FiArrowLeft size={20} />
        Back
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 p-8">
            <div className="flex-shrink-0">
              <img
                src={book.cover || "https://via.placeholder.com/300x450?text=No+Cover"}
                alt={book.title}
                className="w-64 h-96 object-cover rounded-xl shadow-2xl"
                onError={(e) => { e.target.src = "https://via.placeholder.com/300x450?text=No+Cover"; }}
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{book.title}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">{renderStars(book.rating)}</div>
                <span className="text-gray-600 font-medium">{book.rating}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{book.reviews || 0} Review{book.reviews !== 1 ? 's' : ''}</span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 rounded-xl p-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Author</p>
                  <p className="text-base font-semibold text-gray-900">{book.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Genre</p>
                  <p className="text-base font-semibold text-gray-900">{book.genre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Publisher</p>
                  <p className="text-base font-semibold text-gray-900">{book.publisher || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Published</p>
                  <p className="text-base font-semibold text-gray-900">{book.pubYear || 'N/A'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handleReadNow}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  <FiBookOpen size={20} />
                  Read Now
                </button>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 ${isSaved ? 'bg-purple-50 text-purple-600 border-purple-300' : 'bg-white text-gray-700 border-gray-300'} hover:bg-gray-50 border-2 px-6 py-3 rounded-lg font-semibold transition-colors`}
                  title={isSaved ? 'Remove from saved' : 'Save book'}
                >
                  {isSaved ? <BsBookmarkFill size={20} /> : <BsBookmark size={20} />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
                  title="Share book"
                >
                  <FiShare2 size={20} />
                  Share
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About this book</h3>
                <p className={`text-gray-700 leading-relaxed ${!showFullDesc ? 'line-clamp-4' : ''}`}>
                  {book.desc || 'No description available.'}
                </p>
                {book.desc && book.desc.length > 200 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-blue-500 hover:text-blue-600 font-medium mt-2"
                  >
                    {showFullDesc ? 'View less' : 'View more'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t px-8 py-8 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Comments ({comments.length})
            </h3>

            {/* Comment Input Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                rows="3"
                placeholder="Write your thoughts about this book..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map((com, index) => (
                  <div key={com.id || index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-purple-700">{com.user || "Anonymous"}</span>
                      <span className="text-xs text-gray-400">Just now</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{com.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 italic">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;