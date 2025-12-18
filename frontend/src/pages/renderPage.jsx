import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiMinus,
  FiPlus,
  FiBookOpen,
  FiMenu
} from "react-icons/fi";
import { normalizeHtmlBook, normalizeHtmlBookSimple } from "../components/normalizeHtmlBook.js";

const STORAGE_KEY = "reader_progress";

const ReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const scrollRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [book, setBook] = useState(null);
  const [content, setContent] = useState("");

  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [showToc, setShowToc] = useState(false);

  /* LOAD SAVED */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (saved[id]) {
      setDarkMode(saved[id].dark || false);
      setFontSize(saved[id].fontSize || 18);
      setLineHeight(saved[id].lineHeight || 1.7);
      setCurrentPageIndex(saved[id].page || 0);
    }
  }, [id]);

  /* FETCH BOOK */
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`http://localhost:8090/api/books/${id}`);
      const data = await res.json();
      setBook(data);

      if (data.file?.endsWith(".html")) {
        const raw = await fetch(data.file).then(r => r.text());
        // Use simpler normalizer that preserves more content
        const normalized = normalizeHtmlBookSimple(raw);
        setContent(normalized);
      }
    };
    load();
  }, [id]);

  /* PAGINATE CONTENT */
  useEffect(() => {
    if (!contentRef.current) return;

    const paginateContent = () => {
      const container = contentRef.current;
      if (!container) return;

      // Clear previous pages
      const newPages = [];
      const children = Array.from(container.children);
      
      // Create a temporary container for measuring
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${container.clientWidth}px;
        font-size: ${fontSize}px;
        line-height: ${lineHeight};
        padding: 0 1rem;
      `;
      document.body.appendChild(tempContainer);

      let currentPage = [];
      let currentHeight = 0;
      const pageHeight = scrollRef.current?.clientHeight || window.innerHeight - 128; // Account for header/footer

      children.forEach(child => {
        // Clone the element to measure
        const clone = child.cloneNode(true);
        tempContainer.innerHTML = '';
        tempContainer.appendChild(clone);
        
        const childHeight = tempContainer.offsetHeight;
        
        // If element is too big for one page, split it
        if (childHeight > pageHeight * 0.8) {
          // Split text nodes or handle large elements
          if (child.tagName === 'P' || child.className.includes('paragraph')) {
            const text = child.textContent;
            const words = text.split(' ');
            let chunk = [];
            let chunkHeight = 0;
            
            words.forEach(word => {
              const testSpan = document.createElement('span');
              testSpan.textContent = word + ' ';
              tempContainer.innerHTML = '';
              tempContainer.appendChild(testSpan);
              const wordHeight = tempContainer.offsetHeight;
              
              if (chunkHeight + wordHeight > pageHeight * 0.8) {
                // Save current chunk as a page
                const p = document.createElement('p');
                p.className = child.className;
                p.textContent = chunk.join(' ');
                newPages.push([p]);
                
                // Start new chunk
                chunk = [word];
                chunkHeight = wordHeight;
              } else {
                chunk.push(word);
                chunkHeight += wordHeight;
              }
            });
            
            // Add remaining chunk
            if (chunk.length > 0) {
              const p = document.createElement('p');
              p.className = child.className;
              p.textContent = chunk.join(' ');
              currentPage.push(p);
              currentHeight += chunkHeight;
            }
          } else {
            // For non-paragraph elements, just add them
            if (currentHeight + childHeight > pageHeight * 0.8 && currentPage.length > 0) {
              newPages.push([...currentPage]);
              currentPage = [child];
              currentHeight = childHeight;
            } else {
              currentPage.push(child);
              currentHeight += childHeight;
            }
          }
        } else {
          // Normal element
          if (currentHeight + childHeight > pageHeight * 0.8 && currentPage.length > 0) {
            newPages.push([...currentPage]);
            currentPage = [child];
            currentHeight = childHeight;
          } else {
            currentPage.push(child);
            currentHeight += childHeight;
          }
        }
        
        // If we're close to filling a page, start a new one
        if (currentHeight > pageHeight * 0.7) {
          newPages.push([...currentPage]);
          currentPage = [];
          currentHeight = 0;
        }
      });

      // Add the last page if it has content
      if (currentPage.length > 0) {
        newPages.push([...currentPage]);
      }

      // Clean up
      document.body.removeChild(tempContainer);
      setPages(newPages);
    };

    // Wait for content to render
    setTimeout(paginateContent, 100);
  }, [content, fontSize, lineHeight]);

  /* SCROLL TO CURRENT PAGE */
  useEffect(() => {
    if (scrollRef.current && pages.length > 0) {
      scrollRef.current.scrollTop = currentPageIndex * (scrollRef.current.clientHeight);
    }
  }, [currentPageIndex, pages]);

  /* SAVE PROGRESS */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    saved[id] = {
      page: currentPageIndex,
      dark: darkMode,
      fontSize,
      lineHeight
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [currentPageIndex, darkMode, fontSize, lineHeight, id]);

  /* KEYBOARD NAVIGATION */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setShowToc(!showToc);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, pages.length, showToc]);

  /* NAVIGATION FUNCTIONS */
  const nextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  }, [currentPageIndex, pages.length]);

  const prevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  }, [currentPageIndex]);

  const goToPage = useCallback((index) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPageIndex(index);
      setShowToc(false);
    }
  }, [pages.length]);

  const scrollToChapter = useCallback((id) => {
    const element = contentRef.current?.querySelector(`#${id}`);
    if (element) {
      // Find which page contains this element
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].some(el => el === element || el.contains(element))) {
          setCurrentPageIndex(i);
          break;
        }
      }
    }
    setShowToc(false);
  }, [pages]);

  if (!book) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl">Loading book...</div>
    </div>
  );

  return (
    <div
      className={`reader-root ${
        darkMode ? "bg-[#0f0f0f] text-gray-200" : "bg-[#fdfcf8] text-gray-800"
      }`}
    >
      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <FiArrowLeft /> Back
          </button>
          <button
            onClick={() => setShowToc(!showToc)}
            className="flex items-center gap-2 hover:opacity-80 transition"
            title="Table of Contents (T)"
          >
            <FiMenu />
          </button>
        </div>

        <div className="text-center truncate max-w-md">
          <div className="font-semibold truncate">{book.title}</div>
          <div className="text-xs opacity-60">{book.author}</div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setFontSize(s => Math.max(14, s - 2))}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
            title="Decrease font size"
          >
            <FiMinus />
          </button>
          <span className="text-sm w-8 text-center">{fontSize}px</span>
          <button 
            onClick={() => setFontSize(s => Math.min(26, s + 2))}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
            title="Increase font size"
          >
            <FiPlus />
          </button>
          <button 
            onClick={() => setLineHeight(l => l === 1.7 ? 2.1 : 1.7)}
            className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
            title="Toggle line height"
          >
            {lineHeight === 1.7 ? 'Compact' : 'Spacious'}
          </button>
          <button 
            onClick={() => setDarkMode(d => !d)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
            title="Toggle dark mode"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* TABLE OF CONTENTS SIDEBAR */}
        {showToc && (
          <div className={`w-64 md:w-80 border-r overflow-y-auto p-4 ${
            darkMode ? 'bg-[#1a1a1a]' : 'bg-white'
          }`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiBookOpen /> Table of Contents
            </h3>
            <div className="space-y-1">
              {pages.map((page, index) => {
                // Find the first heading in the page
                const heading = page.find(el => 
                  el.tagName.match(/^H[1-6]$/i) || 
                  el.className.includes('chapter-title')
                );
                if (heading) {
                  return (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`block w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${
                        index === currentPageIndex ? 'bg-blue-100 dark:bg-blue-900' : ''
                      }`}
                    >
                      <div className="truncate">{heading.textContent}</div>
                      <div className="text-xs opacity-60">Page {index + 1}</div>
                    </button>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          </div>
        )}

        {/* READER CONTENT */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto relative"
        >
          <div 
            ref={contentRef}
            className="content-container"
            style={{ fontSize, lineHeight }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          {/* PAGE NAVIGATION OVERLAY */}
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
            Page {currentPageIndex + 1} of {pages.length}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="h-14 flex items-center justify-between px-8 border-t text-sm">
        <button 
          onClick={prevPage}
          disabled={currentPageIndex === 0}
          className={`flex items-center gap-1 ${currentPageIndex === 0 ? 'opacity-50' : 'hover:opacity-80'}`}
        >
          <FiChevronLeft /> Prev
        </button>
        
        <div className="flex items-center gap-4">
          <span>
            Page <strong>{currentPageIndex + 1}</strong> of <strong>{pages.length}</strong>
          </span>
          <div className="w-32 h-1 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${((currentPageIndex + 1) / pages.length) * 100}%` }}
            />
          </div>
        </div>
        
        <button 
          onClick={nextPage}
          disabled={currentPageIndex === pages.length - 1}
          className={`flex items-center gap-1 ${currentPageIndex === pages.length - 1 ? 'opacity-50' : 'hover:opacity-80'}`}
        >
          Next <FiChevronRight />
        </button>
      </footer>
    </div>
  );
};

export default ReaderPage;


