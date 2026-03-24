import React, { useEffect, useRef, useState, useCallback } from "react";
import ePub from "epubjs";
import { useTheme } from "../context/ThemeContext";

const KindleReader = ({ bookUrl }) => {
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const { darkMode } = useTheme(); // Get global dark mode state

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Cleanup
  useEffect(() => {
    return () => {
      if (renditionRef.current) renditionRef.current.destroy();
      if (bookRef.current) bookRef.current.destroy();
    };
  }, []);

  // Initialize book and rendition
  useEffect(() => {
    if (!bookUrl || !viewerRef.current) {
      setError("No book URL or viewer container");
      return;
    }

    setError(null);
    setIsLoaded(false);

    try {
      const book = ePub(bookUrl);
      bookRef.current = book;

      book.ready
        .then(() => {
          const rendition = book.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
            flow: "paginated",
            spreads: "none",
            manager: "default",
            allowScriptedContent: true,
          });

          renditionRef.current = rendition;
          applyTheme(rendition, darkMode);

          // Tap navigation (inside iframe)
          rendition.on("click", (e) => {
            const x = e.clientX;
            const width = window.innerWidth;
            if (x < width / 3) {
              rendition.prev();
            } else if (x > (width * 2) / 3) {
              rendition.next();
            }
          });

          return rendition.display();
        })
        .then(() => {
          setIsLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load/display:", err);
          setError(err.message || "Failed to load book");
        });

      // Location tracking
      book.ready.then(() => {
        const rendition = renditionRef.current;
        if (rendition) {
          rendition.on("relocated", (loc) => {
            if (book.locations) {
              const percentage = book.locations.percentageFromCfi(loc.start.cfi);
              setProgress(Math.round(percentage * 100));
            }
          });
        }
      });

      // Error handling
      book.ready.then(() => {
        const rendition = renditionRef.current;
        if (rendition) {
          rendition.on("displayError", (err) => {
            console.error("Rendition error:", err);
            setError("Rendering error");
          });
        }
      });
    } catch (err) {
      console.error("Initialization error:", err);
      setError(err.message);
    }
  }, [bookUrl]);

  // Apply theme with matte black and warm off-white
  const applyTheme = useCallback((rendition, isDark) => {
    if (!rendition) return;

    rendition.themes.default({
      body: {
        // Matte black for dark mode, warm off-white for light mode
        background: isDark ? "#0a0a0a" : "#faf9f8",
        color: isDark ? "#e8e8e8" : "#2c2c2c",
        "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Georgia, serif",
        "line-height": "1.6",
        padding: "clamp(12px, 4vw, 20px)",
        "font-size": "clamp(0.9rem, 3.5vw, 1.2rem)",
      },
      "p, div, span, h1, h2, h3, h4, h5, h6": {
        "font-size": "clamp(0.9rem, 3.5vw, 1.2rem)",
      },
      a: {
        color: isDark ? "#66ccff" : "#0066cc",
      },
      // Improve readability for dark mode
      ".epub-view": {
        background: isDark ? "#0a0a0a" : "#faf9f8",
      },
    });
  }, []);

  // React to global darkMode changes
  useEffect(() => {
    if (renditionRef.current) applyTheme(renditionRef.current, darkMode);
  }, [darkMode, applyTheme]);

  // Handle window resize – re‑apply theme (to update clamp values)
  useEffect(() => {
    const handleResize = () => {
      if (renditionRef.current) {
        applyTheme(renditionRef.current, darkMode);
        renditionRef.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyTheme, darkMode]);

  // Navigation functions
  const handlePrev = () => renditionRef.current?.prev();
  const handleNext = () => renditionRef.current?.next();

  // Swipe detection for mobile
  useEffect(() => {
    const container = viewerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const onTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) handlePrev();
        else handleNext();
      }
    };

    container.addEventListener("touchstart", onTouchStart);
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [handlePrev, handleNext]);

  if (error) {
    return (
      <div className={`h-full w-full flex items-center justify-center p-4 ${
        darkMode ? 'bg-[#0a0a0a] text-red-400' : 'bg-[#faf9f8] text-red-500'
      }`}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">⚠️ EPUB Failed to Load</h2>
          <p className="text-sm">{error}</p>
          <p className={`text-xs mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>URL: {bookUrl}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full flex flex-col overflow-hidden ${
        darkMode ? 'bg-[#0a0a0a]' : 'bg-[#faf9f8]'
      }`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Progress bar */}
      {isLoaded && (
        <div className={`absolute top-0 left-0 w-full h-0.5 z-10 ${
          darkMode ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <div
            className="h-full bg-purple-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* EPUB viewer container */}
      <div
        ref={viewerRef}
        className="flex-1 w-full"
        style={{
          minHeight: 0,
          overflow: "hidden",
        }}
      />

      {/* Navigation buttons */}
      <div
        className={`absolute inset-y-0 left-0 w-16 flex items-center justify-start pl-2 transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0 md:opacity-0"
        } md:hover:opacity-100`}
      >
        <button
          onClick={handlePrev}
          className="bg-black/50 backdrop-blur-sm text-white w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-all shadow-lg"
          aria-label="Previous page"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div
        className={`absolute inset-y-0 right-0 w-16 flex items-center justify-end pr-2 transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0 md:opacity-0"
        } md:hover:opacity-100`}
      >
        <button
          onClick={handleNext}
          className="bg-black/50 backdrop-blur-sm text-white w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-all shadow-lg"
          aria-label="Next page"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default KindleReader;