import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiShare2, FiHeart, FiMessageCircle, FiBookmark, FiStar, FiChevronDown, FiChevronUp, FiCalendar, FiBook } from 'react-icons/fi';
import { useAuth } from '../authContext/index';
import { useTheme } from '../context/ThemeContext';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchBookDetails();
    fetchComments();
    checkIfSaved();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/books/${id}`);
      if (!response.ok) throw new Error('Book not found');
      setBook(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/coms/book/${id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfSaved = async () => {
    if (!currentUser) {
      const saved = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      setIsSaved(saved.some(b => b.id === id));
      return;
    }
    try {
      const response = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      if (response.ok) {
        const user = await response.json();
        setIsSaved(user.favBooks?.includes(id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadNow = () => {
    if (!book) return;
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    const entry = { 
      id, 
      title: book.title, 
      author: book.author, 
      cover: book.cover, 
      lastRead: new Date().toISOString() 
    };
    const filtered = history.filter(b => b.id !== id);
    filtered.unshift(entry);
    localStorage.setItem('history', JSON.stringify(filtered.slice(0, 50)));
    navigate(`/read/${id}`);
  };

  const handleSave = async () => {
    if (!book) return;
    
    if (!currentUser) {
      const saved = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      if (isSaved) {
        localStorage.setItem('savedBooks', JSON.stringify(saved.filter(b => b.id !== id)));
      } else {
        saved.push({ id, title: book.title, author: book.author, cover: book.cover });
        localStorage.setItem('savedBooks', JSON.stringify(saved));
      }
      setIsSaved(!isSaved);
      return;
    }

    try {
      const userRes = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      if (!userRes.ok) return;
      const user = await userRes.json();
      const method = isSaved ? 'DELETE' : 'POST';
      const res = await fetch(`http://localhost:8090/api/users/${user.id}/favbooks/${id}`, { method });
      if (res.ok) setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (!book) return;
    if (navigator.share) {
      navigator.share({ 
        title: book.title, 
        text: `Check out "${book.title}" by ${book.author}`, 
        url: window.location.href 
      });
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
      const res = await fetch('http://localhost:8090/api/coms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookid: id, 
          text: newComment, 
          user: currentUser?.email || "Anonymous" 
        }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const num = parseFloat(rating);
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            size={18}
            fill={i < num ? '#F59E0B' : 'none'}
            stroke={i < num ? '#F59E0B' : theme.border}
            className={i < num ? 'text-yellow-500' : ''}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bg }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" 
               style={{ borderColor: theme.accent, borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm" style={{ color: theme.fgMuted }}>Loading book...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.bg }}>
        <div className="text-center max-w-md">
          <FiBookOpen size={48} className="mx-auto mb-4 opacity-50" style={{ color: theme.fgMuted }} />
          <p className="text-lg mb-4" style={{ color: theme.fgMuted }}>{error || 'Book not found'}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 rounded-lg text-white font-semibold transition-transform hover:scale-105"
            style={{ background: theme.accent }}
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ background: theme.bg }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-sm transition-colors hover:opacity-70"
            style={{ color: theme.fgMuted }}
          >
            <FiArrowLeft size={18} />
            Back
          </button>

          {/* Book Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover */}
            <div className="flex-shrink-0 mx-auto lg:mx-0 w-48 sm:w-56 lg:w-64">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={book.cover || "https://placehold.co/400x600/2a2a2a/ffffff?text=No+Cover"}
                  alt={book.title}
                  className="w-full aspect-[2/3] object-cover"
                  onError={e => { e.target.src = "https://placehold.co/400x600/2a2a2a/ffffff?text=No+Cover"; }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Genres */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
                {book.genre?.split(',').slice(0, 3).map((g, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: `${theme.accent}15`,
                      color: theme.accent,
                    }}
                  >
                    {g.trim()}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: theme.fg }}>
                {book.title}
              </h1>
              
              <p className="text-base sm:text-lg mb-4" style={{ color: theme.fgMuted }}>
                by {book.author}
              </p>

              {/* Rating */}
              <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start mb-6">
                {renderStars(book.rating)}
                <span className="text-sm" style={{ color: theme.fgMuted }}>
                  {book.rating} / 5.0 ({book.reviews || 0} reviews)
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                <button
                  onClick={handleReadNow}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold transition-all hover:scale-105"
                  style={{ background: theme.accent }}
                >
                  <FiBookOpen size={18} />
                  Read Now
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all border hover:scale-105"
                  style={{
                    color: isSaved ? theme.accent : theme.fgMuted,
                    borderColor: isSaved ? theme.accent : theme.border,
                    background: 'transparent'
                  }}
                >
                  <FiBookmark size={18} fill={isSaved ? theme.accent : 'none'} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all border hover:scale-105"
                  style={{ 
                    color: theme.fgMuted, 
                    borderColor: theme.border,
                    background: 'transparent'
                  }}
                >
                  <FiShare2 size={18} />
                  Share
                </button>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg" style={{ background: `${theme.surface2}80` }}>
                <div className="text-center">
                  <FiBook size={18} className="mx-auto mb-1" style={{ color: theme.accent }} />
                  <p className="text-xs mb-0.5" style={{ color: theme.fgSubtle }}>Pages</p>
                  <p className="text-sm font-semibold" style={{ color: theme.fg }}>{book.pages || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <FiCalendar size={18} className="mx-auto mb-1" style={{ color: theme.accent }} />
                  <p className="text-xs mb-0.5" style={{ color: theme.fgSubtle }}>Year</p>
                  <p className="text-sm font-semibold" style={{ color: theme.fg }}>{book.pubYear || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <FiHeart size={18} className="mx-auto mb-1" style={{ color: theme.accent }} />
                  <p className="text-xs mb-0.5" style={{ color: theme.fgSubtle }}>Language</p>
                  <p className="text-sm font-semibold" style={{ color: theme.fg }}>{book.language || 'English'}</p>
                </div>
                <div className="text-center">
                  <FiStar size={18} className="mx-auto mb-1" style={{ color: theme.accent }} />
                  <p className="text-xs mb-0.5" style={{ color: theme.fgSubtle }}>Rating</p>
                  <p className="text-sm font-semibold" style={{ color: theme.fg }}>{book.rating || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 border-b mt-6" style={{ borderBottomColor: theme.border }}>
          {['details', 'comments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-sm font-semibold transition-all relative"
              style={{ color: activeTab === tab ? theme.accent : theme.fgMuted }}
            >
              {tab === 'details' ? 'Description' : `Comments (${comments.length})`}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: theme.accent }} />
              )}
            </button>
          ))}
        </div>

        {/* Description Tab */}
        {activeTab === 'details' && (
          <div className="py-6">
            <div className="rounded-lg p-6" style={{ background: 'transparent', border: `1px solid ${theme.border}` }}>
              <p className={`leading-relaxed ${!showFullDesc && book.desc?.length > 300 ? 'line-clamp-4' : ''}`} style={{ color: theme.fgMuted }}>
                {book.desc || 'No description available.'}
              </p>
              {book.desc?.length > 300 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="mt-3 text-sm font-semibold flex items-center gap-1"
                  style={{ color: theme.accent }}
                >
                  {showFullDesc ? (
                    <>Show less <FiChevronUp size={16} /></>
                  ) : (
                    <>Read more <FiChevronDown size={16} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="py-6">
            <div className="rounded-lg p-6" style={{ background: 'transparent', border: `1px solid ${theme.border}` }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.fg }}>
                <FiMessageCircle size={20} />
                Reader Comments
              </h3>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  className="w-full p-3 rounded-lg text-sm outline-none resize-none transition-all"
                  style={{
                    background: `${theme.surface2}50`,
                    border: `1px solid ${theme.border}`,
                    color: theme.fg,
                  }}
                  rows={3}
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{
                      background: submitting || !newComment.trim() ? theme.fgSubtle : theme.accent,
                      cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <FiMessageCircle size={40} className="mx-auto mb-2 opacity-30" style={{ color: theme.fgMuted }} />
                    <p className="text-sm" style={{ color: theme.fgSubtle }}>No comments yet. Be the first!</p>
                  </div>
                ) : (
                  comments.map((comment, idx) => (
                    <div
                      key={comment.id || idx}
                      className="p-4 rounded-lg"
                      style={{ background: `${theme.surface2}30`, border: `1px solid ${theme.border}` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold" style={{ color: theme.accent }}>
                          {comment.user || "Anonymous"}
                        </span>
                        <span className="text-xs" style={{ color: theme.fgSubtle }}>
                          {new Date(comment.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: theme.fgMuted }}>
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;