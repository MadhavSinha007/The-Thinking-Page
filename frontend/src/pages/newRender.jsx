import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  FiMenu,
  FiLoader
} from "react-icons/fi";

const STORAGE_KEY = "reader_progress";

const normalizeHtmlBookSimple = (rawHtml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  
  const removeSelectors = [
    'script',
    'style',
    'link',
    'meta',
    'noscript',
    'iframe',
    'object',
    'embed',
    '.advertisement',
    '.ad',
    '[class*="ad-"]',
    '.banner',
    '.promo'
  ];
  
  removeSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent;
    if (text.match(/Project Gutenberg|EBOOK|START OF.*PROJECT|END OF.*PROJECT/i)) {
      if (node.parentNode && node.parentNode.parentNode) {
        node.parentNode.remove();
      }
    }
  }
  
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `h${index}`;
    }
  });
  
  return doc.body.innerHTML;
};

const ReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const scrollRef = useRef(null);
  const paginationTimeoutRef = useRef(null);
  
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPaginating, setIsPaginating] = useState(false);
  const [book, setBook] = useState(null);
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [showToc, setShowToc] = useState(false);
  const [contentReady, setContentReady] = useState(false);

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
      try {
        const res = await fetch(`http://localhost:8090/api/books/${id}`);
        const data = await res.json();
        setBook(data);

        if (data.file?.endsWith(".html")) {
          const raw = await fetch(data.file).then(r => r.text());
          const normalized = normalizeHtmlBookSimple(raw);
          setContent(normalized);
        }
      } catch (error) {
        console.error("Error loading book:", error);
      }
    };
    load();
  }, [id]);

  /* SIMPLIFIED PAGINATION - MORE RELIABLE */
  useEffect(() => {
    if (!content || !contentRef.current || isPaginating) return;

    const performPagination = () => {
      setIsPaginating(true);
      
      // Clear any existing timeout
      if (paginationTimeoutRef.current) {
        clearTimeout(paginationTimeoutRef.current);
      }

      paginationTimeoutRef.current = setTimeout(() => {
        try {
          const container = contentRef.current;
          if (!container) {
            setIsPaginating(false);
            return;
          }

          // Get all text nodes and elements
          const allElements = container.querySelectorAll('*');
          const textContent = container.textContent;
          
          // Estimate pages based on character count (simplified approach)
          // Average characters per page based on font size and container width
          const containerWidth = container.clientWidth || 600;
          const charsPerLine = Math.floor(containerWidth / (fontSize * 0.6)); // Rough estimate
          const linesPerPage = Math.floor((window.innerHeight - 128) / (fontSize * lineHeight));
          const charsPerPage = charsPerLine * linesPerPage;
          
          const totalChars = textContent.length;
          const estimatedPages = Math.max(1, Math.ceil(totalChars / charsPerPage));
          
          // Create simple page structure
          const newPages = [];
          const elementsPerPage = Math.max(1, Math.floor(allElements.length / estimatedPages));
          
          for (let i = 0; i < estimatedPages; i++) {
            const startIdx = i * elementsPerPage;
            const endIdx = Math.min((i + 1) * elementsPerPage, allElements.length);
            const pageElements = Array.from(allElements).slice(startIdx, endIdx);
            newPages.push(pageElements);
          }
          
          setPages(newPages);
          setContentReady(true);
          setIsPaginating(false);
          
          // Restore saved page position if exists
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
          if (saved[id]) {
            const savedPage = Math.min(saved[id].page || 0, newPages.length - 1);
            setTimeout(() => {
              setCurrentPageIndex(savedPage);
            }, 100);
          }
          
        } catch (error) {
          console.error("Pagination error:", error);
          setIsPaginating(false);
        }
      }, 500); // Give time for DOM to render
    };

    performPagination();

    return () => {
      if (paginationTimeoutRef.current) {
        clearTimeout(paginationTimeoutRef.current);
      }
    };
  }, [content, fontSize, lineHeight, id]);

  /* SCROLL TO CURRENT PAGE */
  useEffect(() => {
    if (!scrollRef.current || pages.length === 0 || isPaginating || !contentReady) return;
    
    const scrollElement = scrollRef.current;
    const pageHeight = scrollElement.clientHeight;
    const targetScrollTop = currentPageIndex * pageHeight;
    
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      scrollElement.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    });
  }, [currentPageIndex, pages.length, isPaginating, contentReady]);

  /* UPDATE PAGE ON SCROLL */
  useEffect(() => {
    if (!scrollRef.current || pages.length === 0 || isPaginating) return;

    let scrollTimeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;
        
        const scrollTop = scrollElement.scrollTop;
        const clientHeight = scrollElement.clientHeight;
        const newPageIndex = Math.floor(scrollTop / clientHeight);
        
        if (newPageIndex !== currentPageIndex && 
            newPageIndex >= 0 && 
            newPageIndex < pages.length) {
          setCurrentPageIndex(newPageIndex);
        }
      }, 100);
    };

    const scrollElement = scrollRef.current;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentPageIndex, pages.length, isPaginating]);

  /* SAVE PROGRESS */
  useEffect(() => {
    if (!contentReady) return;
    
    const saveTimeout = setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      saved[id] = {
        page: currentPageIndex,
        dark: darkMode,
        fontSize,
        lineHeight,
        lastRead: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [currentPageIndex, darkMode, fontSize, lineHeight, id, contentReady]);

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
    if (currentPageIndex < pages.length - 1 && !isPaginating && contentReady) {
      setCurrentPageIndex(prev => prev + 1);
    }
  }, [currentPageIndex, pages.length, isPaginating, contentReady]);

  const prevPage = useCallback(() => {
    if (currentPageIndex > 0 && !isPaginating && contentReady) {
      setCurrentPageIndex(prev => prev - 1);
    }
  }, [currentPageIndex, isPaginating, contentReady]);

  const goToPage = useCallback((index) => {
    if (index >= 0 && index < pages.length && !isPaginating && contentReady) {
      setCurrentPageIndex(index);
      setShowToc(false);
    }
  }, [pages.length, isPaginating, contentReady]);

  const toggleLineHeight = useCallback(() => {
    setLineHeight(l => l === 1.7 ? 2.1 : 1.7);
  }, []);

  const adjustFontSize = useCallback((increase) => {
    setFontSize(s => {
      const newSize = increase ? s + 1 : s - 1;
      return Math.max(14, Math.min(30, newSize));
    });
  }, []);

  // Memoize TOC items
  const tocItems = useMemo(() => {
    if (!contentReady) return [];
    
    return pages
      .map((pageElements, index) => {
        if (!pageElements || pageElements.length === 0) return null;
        
        // Try to find a heading in this page
        for (const el of pageElements) {
          if (el.tagName && el.tagName.match(/^H[1-6]$/i)) {
            return { index, heading: el };
          }
          if (el.className && (
            el.className.includes('chapter') || 
            el.className.includes('heading') ||
            el.className.includes('title')
          )) {
            return { index, heading: el };
          }
        }
        
        // If no heading found, use first element with significant text
        for (const el of pageElements) {
          if (el.textContent && el.textContent.trim().length > 20) {
            return { index, heading: el };
          }
        }
        
        return null;
      })
      .filter(Boolean)
      .slice(0, 50); // Limit TOC size
  }, [pages, contentReady]);

  if (!book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading book...</div>
      </div>
    );
  }

  return (
    <div
      className={`reader-root flex flex-col h-screen ${
        darkMode ? "bg-[#0f0f0f] text-gray-200" : "bg-[#fdfcf8] text-gray-800"
      }`}
    >
      {/* HEADER */}
      <header className={`h-14 flex items-center justify-between px-2 md:px-6 border-b flex-shrink-0 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 hover:opacity-80 transition p-1"
            title="Back"
            disabled={isPaginating}
          >
            <FiArrowLeft size={20} />
            <span className="hidden md:inline text-sm">Back</span>
          </button>
          <button
            onClick={() => setShowToc(!showToc)}
            className="flex items-center gap-2 hover:opacity-80 transition p-1"
            title="Table of Contents (T)"
            disabled={isPaginating}
          >
            <FiMenu size={20} />
            <span className="hidden md:inline text-sm">TOC</span>
          </button>
        </div>

        <div className="text-center truncate max-w-xs md:max-w-md flex-1 mx-2">
          <div className="font-semibold text-sm md:text-base truncate">{book.title}</div>
          <div className="text-xs opacity-60 hidden sm:block">{book.author}</div>
          {isPaginating && (
            <div className="text-xs text-blue-500 mt-1 flex items-center justify-center gap-1">
              <FiLoader className="animate-spin" /> Processing pages...
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <div className="flex items-center gap-0">
            <button 
              onClick={() => adjustFontSize(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition disabled:opacity-50"
              title="Decrease font size"
              disabled={isPaginating}
            >
              <FiMinus size={18} />
            </button>
            <span className="text-xs px-1 min-w-[2rem] text-center">{fontSize}px</span>
            <button 
              onClick={() => adjustFontSize(true)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition disabled:opacity-50"
              title="Increase font size"
              disabled={isPaginating}
            >
              <FiPlus size={18} />
            </button>
          </div>
          
          <button 
            onClick={toggleLineHeight}
            className="px-2 py-1 text-xs md:text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition disabled:opacity-50"
            title={`Line height: ${lineHeight === 1.7 ? 'Compact' : 'Spacious'}`}
            disabled={isPaginating}
          >
            {lineHeight === 1.7 ? '↕' : '⇕'}
          </button>
          
          <button 
            onClick={() => setDarkMode(d => !d)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition disabled:opacity-50"
            title="Toggle dark mode"
            disabled={isPaginating}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* TABLE OF CONTENTS SIDEBAR */}
        {showToc && contentReady && (
          <div className={`w-64 md:w-80 border-r overflow-y-auto p-4 flex-shrink-0 ${
            darkMode ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiBookOpen /> Contents
            </h3>
            {tocItems.length > 0 ? (
              <div className="space-y-1">
                {tocItems.map(({ index, heading }) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`block w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition text-sm ${
                      index === currentPageIndex ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                  >
                    <div className="truncate font-medium">
                      {heading.textContent?.trim().slice(0, 50) || `Page ${index + 1}`}
                      {heading.textContent?.trim().length > 50 ? '...' : ''}
                    </div>
                    <div className="text-xs opacity-60 mt-1">Page {index + 1}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm opacity-70 italic p-2">
                Generating table of contents...
              </div>
            )}
          </div>
        )}

        {/* READER CONTENT */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto relative scroll-smooth"
        >
          {isPaginating ? (
            <div className="flex flex-col items-center justify-center h-full">
              <FiLoader className="animate-spin text-4xl mb-4 opacity-70" />
              <div className="text-lg mb-2">Preparing your book...</div>
              <div className="text-sm opacity-70 max-w-md text-center">
                Formatting {book.title} for optimal reading experience
              </div>
            </div>
          ) : !contentReady ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-lg">Loading content...</div>
            </div>
          ) : (
            <>
              <div 
                ref={contentRef}
                className="content-container p-4 md:p-8 max-w-3xl mx-auto"
                style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* PAGE NAVIGATION OVERLAY */}
              {pages.length > 0 && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm shadow-lg z-10">
                  Page <span className="font-bold">{currentPageIndex + 1}</span> of <span className="font-bold">{pages.length}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className={`h-14 flex items-center justify-between px-3 md:px-8 border-t text-xs md:text-sm flex-shrink-0 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button 
          onClick={prevPage}
          disabled={currentPageIndex === 0 || isPaginating || !contentReady || pages.length === 0}
          className={`flex items-center gap-1 transition px-3 py-2 rounded ${
            currentPageIndex === 0 || isPaginating || !contentReady || pages.length === 0
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          <FiChevronLeft size={18} /> 
          <span className="hidden md:inline">Previous</span>
        </button>
        
        <div className="flex items-center gap-2 md:gap-3 flex-1 justify-center px-2">
          {contentReady && pages.length > 0 ? (
            <>
              <span className="text-xs md:text-sm whitespace-nowrap">
                <strong>{currentPageIndex + 1}</strong> / <strong>{pages.length}</strong>
              </span>
              <div className="w-20 md:w-32 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden flex-1">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ 
                    width: `${((currentPageIndex + 1) / pages.length) * 100}%`,
                    maxWidth: '100%'
                  }}
                />
              </div>
              <span className="text-xs opacity-70 hidden md:inline">
                {Math.round(((currentPageIndex + 1) / pages.length) * 100)}%
              </span>
            </>
          ) : (
            <span className="text-xs opacity-70">
              {isPaginating ? 'Processing...' : contentReady ? 'Ready' : 'Loading...'}
            </span>
          )}
        </div>
        
        <button 
          onClick={nextPage}
          disabled={currentPageIndex === pages.length - 1 || isPaginating || !contentReady || pages.length === 0}
          className={`flex items-center gap-1 transition px-3 py-2 rounded ${
            currentPageIndex === pages.length - 1 || isPaginating || !contentReady || pages.length === 0
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          <span className="hidden md:inline">Next</span> 
          <FiChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
};

export default ReaderPage;