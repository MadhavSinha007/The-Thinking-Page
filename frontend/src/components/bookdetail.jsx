import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiBook,
  FiBookOpen,
  FiBookmark,
  FiCalendar,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiStar,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useAuth } from "../authContext/index";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const outlet = useOutletContext?.() || {};
  const darkMode = outlet.darkMode ?? false;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const theme = useMemo(
    () => ({
      bg: darkMode ? "#111110" : "#efe5dc",
      surface: darkMode ? "#1C1917" : "#f3ebe3",
      surface2: darkMode ? "#292524" : "#efe5dc",
      text: darkMode ? "#F5F0EB" : "#000000",
      textMuted: darkMode ? "#A8A29E" : "#00000099",
      textSubtle: darkMode ? "#57534E" : "#00000066",
      border: darkMode ? "#292524" : "#0000001a",
      accent: "#f57c00",
      accentSoft: darkMode ? "#3D1410" : "#f57c0015",
    }),
    [darkMode]
  );

  useEffect(() => {
    fetchBookDetails();
    fetchComments();
    checkIfSaved();
  }, [id, currentUser]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`http://localhost:8090/api/books/${id}`);
      if (!response.ok) throw new Error("Book not found");

      const data = await response.json();
      setBook(data);
    } catch (err) {
      setError(err.message || "Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/coms/book/${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfSaved = async () => {
    if (!currentUser) {
      const saved = JSON.parse(localStorage.getItem("savedBooks") || "[]");
      setIsSaved(saved.some((b) => String(b.id) === String(id)));
      return;
    }

    try {
      const response = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      if (!response.ok) return;
      const user = await response.json();
      setIsSaved(
        Array.isArray(user.favBooks) &&
          user.favBooks.some((bookId) => String(bookId) === String(id))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadNow = () => {
    if (!book) return;

    const history = JSON.parse(localStorage.getItem("history") || "[]");
    const entry = {
      id: String(id),
      title: book.title,
      author: book.author,
      cover: book.cover,
      lastRead: new Date().toISOString(),
    };

    const filtered = history.filter((b) => String(b.id) !== String(id));
    filtered.unshift(entry);
    localStorage.setItem("history", JSON.stringify(filtered.slice(0, 50)));

    navigate(`/read/${id}`);
  };

  const handleSave = async () => {
    if (!book) return;

    if (!currentUser) {
      const saved = JSON.parse(localStorage.getItem("savedBooks") || "[]");

      if (isSaved) {
        localStorage.setItem(
          "savedBooks",
          JSON.stringify(saved.filter((b) => String(b.id) !== String(id)))
        );
      } else {
        saved.push({
          id: String(id),
          title: book.title,
          author: book.author,
          cover: book.cover,
        });
        localStorage.setItem("savedBooks", JSON.stringify(saved));
      }

      setIsSaved((prev) => !prev);
      return;
    }

    try {
      const userRes = await fetch(`http://localhost:8090/api/users/firebase/${currentUser.uid}`);
      if (!userRes.ok) return;

      const user = await userRes.json();
      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch(`http://localhost:8090/api/users/${user.id}/favbooks/${id}`, { method });

      if (res.ok) setIsSaved((prev) => !prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!book) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: `Check out "${book.title}" by ${book.author}`,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8090/api/coms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookid: id,
          text: newComment,
          user: currentUser?.email || "Anonymous",
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
    const num = Math.round(parseFloat(rating || 0));

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            size={18}
            fill={i < num ? theme.accent : "none"}
            stroke={i < num ? theme.accent : "currentColor"}
            style={{ color: i < num ? theme.accent : theme.textSubtle }}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full" style={{ background: theme.bg }}>
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
          <div
            className="rounded-[28px] border p-10 text-center"
            style={{ background: theme.surface, borderColor: theme.border }}
          >
            <div
              className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: theme.border, borderTopColor: theme.accent }}
            />
            <p className="mt-4 text-sm font-medium" style={{ color: theme.textMuted }}>
              Loading book details…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen w-full" style={{ background: theme.bg }}>
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
          <div
            className="w-full max-w-lg rounded-[28px] border p-8 text-center"
            style={{ background: theme.surface, borderColor: theme.border }}
          >
            <FiBookOpen size={48} className="mx-auto mb-4 opacity-40" style={{ color: theme.textMuted }} />
            <h2 className="text-2xl font-black tracking-tight" style={{ color: theme.text }}>
              Could not open this book
            </h2>
            <p className="mt-3 text-sm leading-6" style={{ color: theme.textMuted }}>
              {error || "Book not found"}
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-6 rounded-full px-6 py-3 font-semibold text-black transition-transform hover:scale-105"
              style={{ background: theme.accent }}
            >
              Browse Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  const description = book.desc || "No description available.";
  const displayedDescription =
    showFullDesc || description.length < 300 ? description : `${description.slice(0, 300)}…`;

  return (
    <div className="min-h-screen w-full" style={{ background: theme.bg }}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: theme.textMuted }}
        >
          <FiArrowLeft size={18} />
          Back
        </button>

        <section
          className="overflow-hidden rounded-[32px] border"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-[280px_1fr] lg:p-8">
            <div className="mx-auto w-full max-w-[260px]">
              <div
                className="overflow-hidden rounded-[24px] border"
                style={{ borderColor: theme.border, background: theme.surface2 }}
              >
                <img
                  src={
                    book.cover ||
                    `https://placehold.co/400x600/${darkMode ? "1C1917/F5F0EB" : "efe5dc/000000"}?text=No+Cover`
                  }
                  alt={book.title}
                  className="aspect-[2/3] w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = darkMode
                      ? "https://placehold.co/400x600/1C1917/F5F0EB?text=No+Cover"
                      : "https://placehold.co/400x600/efe5dc/000000?text=No+Cover";
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                {(book.genre ? String(book.genre).split(",") : ["Book"]).slice(0, 3).map((g, idx) => (
                  <span
                    key={idx}
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ background: theme.accentSoft, color: theme.accent }}
                  >
                    {g.trim()}
                  </span>
                ))}
              </div>

              <h1
                className="mt-4 text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em] sm:text-4xl lg:text-5xl"
                style={{ color: theme.text }}
              >
                {book.title}
              </h1>

              <p className="mt-3 text-base sm:text-lg" style={{ color: theme.textMuted }}>
                by {book.author || "Unknown author"}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {renderStars(book.rating)}
                <span className="text-sm" style={{ color: theme.textMuted }}>
                  {book.rating || "N/A"} / 5.0
                </span>
                {book.reviews ? (
                  <span className="text-sm" style={{ color: theme.textSubtle }}>
                    {book.reviews} reviews
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleReadNow}
                  className="rounded-full px-6 py-3 font-semibold text-black transition-all hover:scale-105"
                  style={{ background: theme.accent }}
                >
                  Read Now
                </button>

                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold transition-all hover:scale-105"
                  style={{ borderColor: theme.border, color: theme.text, background: theme.surface2 }}
                >
                  {isSaved ? <FiHeart size={18} /> : <FiBookmark size={18} />}
                  {isSaved ? "Saved" : "Save"}
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold transition-all hover:scale-105"
                  style={{ borderColor: theme.border, color: theme.text, background: theme.surface2 }}
                >
                  <FiShare2 size={18} />
                  Share
                </button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <StatCard icon={<FiBookOpen size={18} />} label="Format" value="EPUB Reader" theme={theme} />
                <StatCard icon={<FiCalendar size={18} />} label="Published" value={book.year || "Unknown"} theme={theme} />
                <StatCard icon={<FiBook size={18} />} label="Category" value={book.category || book.genre || "General"} theme={theme} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[32px] border" style={{ background: theme.surface, borderColor: theme.border }}>
          <div className="flex flex-wrap gap-2 border-b p-4" style={{ borderColor: theme.border }}>
            {[
              { key: "details", label: "Details" },
              { key: "comments", label: `Comments (${comments.length})` },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
                  style={{
                    background: active ? theme.accent : theme.surface2,
                    color: active ? "#000000" : theme.text,
                    border: `1px solid ${active ? theme.accent : theme.border}`,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "details" ? (
            <div className="p-5 sm:p-6 lg:p-8">
              <div className="rounded-[24px] border p-5 sm:p-6" style={{ background: theme.surface2, borderColor: theme.border }}>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: theme.textSubtle }}>
                  About this book
                </p>
                <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: theme.textMuted }}>
                  {displayedDescription}
                </p>
                {description.length > 300 ? (
                  <button
                    onClick={() => setShowFullDesc((prev) => !prev)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: theme.accent }}
                  >
                    {showFullDesc ? (
                      <>
                        Show less <FiChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Read more <FiChevronDown size={16} />
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 lg:p-8">
              <div className="rounded-[24px] border p-5 sm:p-6" style={{ background: theme.surface2, borderColor: theme.border }}>
                <h3 className="flex items-center gap-2 text-lg font-black tracking-tight" style={{ color: theme.text }}>
                  <FiMessageCircle size={20} />
                  Reader Comments
                </h3>

                <form onSubmit={handleCommentSubmit} className="mt-5">
                  <textarea
                    className="w-full resize-none rounded-[20px] border p-4 text-sm outline-none"
                    style={{
                      background: theme.surface,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                    rows={4}
                    placeholder="Share your thoughts about this book…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold text-black transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: theme.accent }}
                    >
                      {submitting ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>

                <div className="mt-6 space-y-3">
                  {comments.length === 0 ? (
                    <div className="rounded-[20px] border px-5 py-8 text-center" style={{ borderColor: theme.border }}>
                      <FiMessageCircle size={36} className="mx-auto opacity-35" style={{ color: theme.textMuted }} />
                      <p className="mt-3 text-sm" style={{ color: theme.textSubtle }}>
                        No comments yet. Be the first one.
                      </p>
                    </div>
                  ) : (
                    comments.map((comment, idx) => (
                      <div
                        key={comment.id || idx}
                        className="rounded-[20px] border p-4"
                        style={{ background: theme.surface, borderColor: theme.border }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold" style={{ color: theme.accent }}>
                            {comment.user || "Anonymous"}
                          </span>
                          <span className="text-xs" style={{ color: theme.textSubtle }}>
                            {new Date(comment.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6" style={{ color: theme.textMuted }}>
                          {comment.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, theme }) => {
  return (
    <div className="rounded-[22px] border p-4" style={{ background: theme.surface2, borderColor: theme.border }}>
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: theme.textSubtle }}>
        {icon}
        {label}
      </div>
      <p className="mt-3 text-sm font-semibold leading-6" style={{ color: theme.text }}>
        {value}
      </p>
    </div>
  );
};

export default BookDetail;