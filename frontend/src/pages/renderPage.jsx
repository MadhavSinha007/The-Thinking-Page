import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiMinus,
  FiPlus
} from "react-icons/fi";
import { normalizeHtmlBook } from "../components/normalizeHtmlBook";
const STORAGE_KEY = "reader_progress";

const ReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [content, setContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* SETTINGS */
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.7);

  /* LOAD SAVED SETTINGS */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (saved[id]) {
      setCurrentPage(saved[id].page || 1);
      setDarkMode(saved[id].dark || false);
      setFontSize(saved[id].fontSize || 18);
      setLineHeight(saved[id].lineHeight || 1.7);
    }
  }, [id]);

  /* SAVE SETTINGS */
  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    all[id] = { page: currentPage, dark: darkMode, fontSize, lineHeight };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }, [currentPage, darkMode, fontSize, lineHeight, id]);

  /* FETCH BOOK */
  useEffect(() => {
    const fetchBook = async () => {
      const res = await fetch(`http://localhost:8090/api/books/${id}`);
      const data = await res.json();
      setBook(data);

      if (data.file?.endsWith(".html")) {
        const raw = await fetch(data.file).then(r => r.text());
        const clean = normalizeHtmlBook(raw);
        setContent(clean);
        estimatePages(clean);
      }
    };
    fetchBook();
  }, [id]);

  const estimatePages = (text) => {
    const words = text.split(/\s+/).length;
    setTotalPages(Math.max(1, Math.ceil(words / 250)));
  };

  const prev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const next = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  if (!book) return null;

  return (
    <div
      className={`w-screen h-screen flex flex-col transition-colors ${
        darkMode ? "bg-[#0f0f0f] text-gray-200" : "bg-[#fdfcf8] text-gray-800"
      }`}
    >
      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-6 border-b">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2">
          <FiArrowLeft /> Back
        </button>

        <div className="text-center truncate">
          <div className="font-semibold truncate">{book.title}</div>
          <div className="text-xs opacity-60">{book.author}</div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setFontSize(s => Math.max(14, s - 2))}>
            <FiMinus />
          </button>
          <button onClick={() => setFontSize(s => Math.min(26, s + 2))}>
            <FiPlus />
          </button>
          <button onClick={() => setLineHeight(l => (l === 1.7 ? 2.1 : 1.7))}>
            LH
          </button>
          <button onClick={() => setDarkMode(d => !d)}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </header>

      {/* READER */}
      <main className="flex-1 overflow-hidden">
        <div
          className="h-full max-w-3xl mx-auto px-8 py-10 overflow-y-auto reader-content"
          style={{ fontSize: `${fontSize}px`, lineHeight }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>

      {/* FOOTER */}
      <footer className="h-14 flex items-center justify-between px-8 border-t text-sm">
        <button onClick={prev} disabled={currentPage === 1}>
          <FiChevronLeft /> Prev
        </button>

        <span>
          Page {currentPage} / {totalPages}
        </span>

        <button onClick={next} disabled={currentPage === totalPages}>
          Next <FiChevronRight />
        </button>
      </footer>
    </div>
  );
};

export default ReaderPage;
