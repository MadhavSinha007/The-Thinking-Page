import React, { useEffect, useRef, useState, useCallback } from "react";
import ePub from "epubjs";
import { useTheme } from "../../context/ThemeContext";
import { speakText, stopAudio } from "../../utils/ElevenLabsReader";

// ── Breakpoint for two-column spread ─────────────────────────────────
const TWO_COL_MIN = 768; // px

// ── epub.js theme definitions (pure light / pure dark) ───────────────
const EPUB_LIGHT = {
  body: {
    background:   "#ffffff",
    color:        "#111111",
    "font-family":"Georgia, 'Times New Roman', serif",
    "font-size":  "1rem",
    "line-height":"1.8",
    "text-align": "justify",
    padding:      "32px 40px",
  },
  p: { "text-indent": "1.4em", "margin-bottom": "0.7em" },
  "h1,h2,h3,h4": { "font-weight": "600", "text-indent": "0", "margin-bottom": "0.5em" },
  a: { color: "#0066cc" },
  blockquote: { "border-left": "3px solid #ccc", padding: "0 1em", "font-style": "italic", color: "#555" },
};

const EPUB_DARK = {
  body: {
    background:   "#121212",
    color:        "#e0e0e0",
    "font-family":"Georgia, 'Times New Roman', serif",
    "font-size":  "1rem",
    "line-height":"1.8",
    "text-align": "justify",
    padding:      "32px 40px",
  },
  p: { "text-indent": "1.4em", "margin-bottom": "0.7em" },
  "h1,h2,h3,h4": { "font-weight": "600", "text-indent": "0", "margin-bottom": "0.5em", color: "#e0e0e0" },
  a: { color: "#66aaff" },
  blockquote: { "border-left": "3px solid #444", padding: "0 1em", "font-style": "italic", color: "#aaa" },
};

// ── UI tokens — only light / dark, matching your app's existing theme ─
const UI = {
  light: {
    bg:      "#ffffff",
    bar:     "rgba(255,255,255,0.96)",
    border:  "rgba(0,0,0,0.10)",
    text:    "#111111",
    muted:   "#888888",
    accent:  "#0066cc",
    shadow:  "rgba(0,0,0,0.12)",
  },
  dark: {
    bg:      "#121212",
    bar:     "rgba(18,18,18,0.96)",
    border:  "rgba(255,255,255,0.08)",
    text:    "#e0e0e0",
    muted:   "#666666",
    accent:  "#66aaff",
    shadow:  "rgba(0,0,0,0.5)",
  },
};

// ── Animated sound wave icon ─────────────────────────────────────────
const SoundWave = ({ color }) => (
  <>
    <style>{`@keyframes sw{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}`}</style>
    <span style={{ display:"inline-flex", gap:"2px", alignItems:"center" }}>
      {[1,2,3,2,1].map((d,i) => (
        <span key={i} style={{
          display:"inline-block", width:"2px", borderRadius:"2px",
          height:`${d*4}px`, background:color,
          animation:`sw ${0.5+i*0.1}s ease-in-out infinite`,
          animationDelay:`${i*0.07}s`,
        }}/>
      ))}
    </span>
  </>
);

export default function KindleReader({ bookUrl }) {
  const viewerRef    = useRef(null);
  const renditionRef = useRef(null);
  const bookRef      = useRef(null);
  const hideTimer    = useRef(null);
  const { darkMode } = useTheme();

  const [isLoaded,  setIsLoaded]  = useState(false);
  const [error,     setError]     = useState(null);
  const [progress,  setProgress]  = useState(0);
  const [showUI,    setShowUI]    = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [fontSize,  setFontSize]  = useState(100);
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < TWO_COL_MIN);

  const ui = UI[darkMode ? "dark" : "light"];

  // ── Track viewport width ───────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < TWO_COL_MIN);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Cleanup ────────────────────────────────────────────────────────
  useEffect(() => () => {
    stopAudio();
    renditionRef.current?.destroy();
    bookRef.current?.destroy();
  }, []);

  // ── Load + configure EPUB ──────────────────────────────────────────
  useEffect(() => {
    if (!bookUrl || !viewerRef.current) return;

    const book = ePub(bookUrl);
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width:  "100%",
      height: "100%",
      spread: isMobile ? "none" : "always",   // two-column on desktop
      flow:   "paginated",
      // minSpreadWidth: on desktop allow two columns
      minSpreadWidth: isMobile ? 9999 : TWO_COL_MIN,
    });
    renditionRef.current = rendition;

    // Register themes via epub.js built-in API
    rendition.themes.register("light", EPUB_LIGHT);
    rendition.themes.register("dark",  EPUB_DARK);
    rendition.themes.select(darkMode ? "dark" : "light");
    rendition.themes.fontSize(`${fontSize}%`);

    rendition.display();

    rendition.on("relocated", (loc) => {
      setProgress(Math.floor((loc?.start?.percentage || 0) * 100));
    });

    // Forward keyboard events from inside the iframe to the window
    rendition.on("keyup", (e) => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: e.key }));
    });

    setIsLoaded(true);
    setError(null);

    return () => {
      rendition.destroy();
      book.destroy();
      renditionRef.current = null;
      bookRef.current = null;
    };
  // Re-initialise if spread mode needs to change (mobile ↔ desktop)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookUrl, isMobile]);

  // ── Sync theme ────────────────────────────────────────────────────
  useEffect(() => {
    renditionRef.current?.themes?.select(darkMode ? "dark" : "light");
  }, [darkMode]);

  // ── Sync font size ────────────────────────────────────────────────
  useEffect(() => {
    renditionRef.current?.themes?.fontSize(`${fontSize}%`);
  }, [fontSize]);

  // ── Keyboard nav ─────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Auto-hide UI ──────────────────────────────────────────────────
  const nudge = useCallback(() => {
    setShowUI(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUI(false), 4000);
  }, []);

  useEffect(() => {
    nudge();
    return () => clearTimeout(hideTimer.current);
  }, [nudge]);

  // ── Navigation ───────────────────────────────────────────────────
  const goNext = (e) => { e?.stopPropagation(); renditionRef.current?.next(); nudge(); };
  const goPrev = (e) => { e?.stopPropagation(); renditionRef.current?.prev(); nudge(); };

  // ── Read aloud ───────────────────────────────────────────────────
  const getPageText = () => {
    const r = renditionRef.current;
    if (!r) return "";
    let text = "";
    r.getContents().forEach((c) => {
      const body = c?.document?.body;
      if (body) text += (body.innerText || body.textContent || "") + " ";
    });
    return text.replace(/\s+/g, " ").trim();
  };

  const handleRead = (e) => {
    e?.stopPropagation();
    if (isReading) { stopAudio(); setIsReading(false); return; }
    const text = getPageText();
    if (!text) return;
    setIsReading(true);
    speakText(text, () => setIsReading(false));
  };

  const incFont = (e) => { e.stopPropagation(); setFontSize(s => Math.min(160, s + 10)); };
  const decFont = (e) => { e.stopPropagation(); setFontSize(s => Math.max(70,  s - 10)); };

  // ── Bar height — bigger touch targets on mobile ───────────────────
  const BAR_H = isMobile ? 52 : 44;

  // ─────────────────────────────────────────────────────────────────
  return (
    <div
      onMouseMove={nudge}
      onTouchStart={nudge}
      style={{
        position:      "fixed",       // cover the whole viewport reliably on mobile
        inset:         0,
        display:       "flex",
        flexDirection: "column",
        background:    ui.bg,
        overflow:      "hidden",
      }}
    >
      {/* ── Progress line ── */}
      <div style={{
        flexShrink: 0,
        height:     "2px",
        background: ui.border,
      }}>
        <div style={{
          height:     "100%",
          width:      `${progress}%`,
          background: ui.accent,
          transition: "width 0.4s ease",
        }}/>
      </div>

      {/* ── EPUB viewer — fills all remaining space ── */}
      <div
        ref={viewerRef}
        onClick={nudge}
        style={{
          flex:       "1 1 auto",
          minHeight:  0,            // ← must-have for flex shrink to work
          width:      "100%",
          background: darkMode ? "#121212" : "#ffffff",
          // On mobile Safari 100vh is unreliable; position:fixed+inset:0 handles it
        }}
      />

      {/* ── Left arrow (hidden on mobile — tap zones handle it) ── */}
      {!isMobile && (
        <NavArrow side="left" show={showUI && isLoaded} ui={ui} barH={BAR_H} onClick={goPrev}>‹</NavArrow>
      )}

      {/* ── Right arrow ── */}
      {!isMobile && (
        <NavArrow side="right" show={showUI && isLoaded} ui={ui} barH={BAR_H} onClick={goNext}>›</NavArrow>
      )}

      {/* ── Mobile tap zones (left 40% = prev, right 40% = next, centre = nudge) ── */}
      {isMobile && isLoaded && (
        <>
          <button onClick={goPrev} aria-label="Previous page" style={tapZone("left",  BAR_H)} />
          <button onClick={goNext} aria-label="Next page"     style={tapZone("right", BAR_H)} />
        </>
      )}

      {/* ── Bottom control bar ── */}
      {isLoaded && (
        <div style={{
          flexShrink:     0,
          height:         `${BAR_H}px`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        isMobile ? "0 8px" : "0 16px",
          background:     ui.bar,
          borderTop:      `1px solid ${ui.border}`,
          backdropFilter: "blur(12px)",
          opacity:        showUI ? 1 : 0,
          transition:     "opacity 0.3s ease",
          zIndex:         40,
          // safe area on notched phones
          paddingBottom:  "env(safe-area-inset-bottom, 0px)",
        }}>

          {/* Font controls */}
          <div style={{ display:"flex", alignItems:"center", gap: isMobile ? "0" : "2px" }}>
            <Btn ui={ui} onClick={decFont} label="A−">
              <span style={{ fontSize:"0.68rem", fontStyle:"italic" }}>A</span>
              <span style={{ fontSize:"0.6rem", marginLeft:"1px" }}>−</span>
            </Btn>
            {!isMobile && (
              <span style={{ fontSize:"0.68rem", color:ui.muted, minWidth:"30px", textAlign:"center" }}>
                {fontSize}%
              </span>
            )}
            <Btn ui={ui} onClick={incFont} label="A+">
              <span style={{ fontSize:"0.88rem", fontStyle:"italic" }}>A</span>
              <span style={{ fontSize:"0.6rem", marginLeft:"1px" }}>+</span>
            </Btn>
          </div>

          {/* Centre: prev / listen / next */}
          <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
            {/* Show prev/next buttons only on desktop; mobile uses tap zones */}
            {!isMobile && (
              <Btn ui={ui} onClick={goPrev} label="Prev">‹ Prev</Btn>
            )}

            <Btn ui={ui} onClick={handleRead} label={isReading ? "Stop" : "Listen"} accent={isReading ? ui.accent : undefined}>
              {isReading
                ? <><SoundWave color={ui.accent}/><span style={{ marginLeft:"5px", color:ui.accent, fontSize:"0.78rem" }}>Stop</span></>
                : <span style={{ fontSize:"0.78rem" }}>🔊{!isMobile && " Listen"}</span>
              }
            </Btn>

            {!isMobile && (
              <Btn ui={ui} onClick={goNext} label="Next">Next ›</Btn>
            )}
          </div>

          {/* Progress % */}
          <span style={{
            fontSize:  "0.7rem",
            color:     ui.muted,
            minWidth:  "36px",
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}>
            {progress}%
          </span>

        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          position:     "absolute",
          top:          "16px",
          left:         "50%",
          transform:    "translateX(-50%)",
          background:   "#c0392b",
          color:        "#fff",
          padding:      "6px 16px",
          borderRadius: "6px",
          fontSize:     "0.85rem",
          zIndex:       60,
          whiteSpace:   "nowrap",
        }}>{error}</div>
      )}
    </div>
  );
}

// ── Side nav arrow (desktop only) ────────────────────────────────────
function NavArrow({ side, show, ui, barH, onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={side === "left" ? "Previous (←)" : "Next (→)"}
      style={{
        position:       "absolute",
        [side]:         0,
        top:            "2px",          // below progress bar
        bottom:         `${barH}px`,    // above control bar
        width:          "clamp(32px, 5vw, 56px)",
        background:     "transparent",
        border:         "none",
        cursor:         "pointer",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         30,
        opacity:        show ? 1 : 0,
        transition:     "opacity 0.3s ease",
      }}
    >
      <span style={{
        width:          "34px",
        height:         "50px",
        background:     hover ? ui.bar : `${ui.bar}cc`,
        border:         `1px solid ${ui.border}`,
        borderRadius:   side === "left" ? "0 8px 8px 0" : "8px 0 0 8px",
        ...(side === "left" ? { borderLeft:"none" } : { borderRight:"none" }),
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "1.4rem",
        color:          hover ? ui.accent : ui.muted,
        backdropFilter: "blur(6px)",
        transition:     "color 0.15s, background 0.15s",
        lineHeight:     1,
      }}>
        {children}
      </span>
    </button>
  );
}

// ── Tap zone (mobile invisible buttons) ──────────────────────────────
function tapZone(side, barH) {
  return {
    position:   "absolute",
    [side]:     0,
    top:        "2px",
    bottom:     `${barH}px`,
    width:      "38%",
    background: "transparent",
    border:     "none",
    cursor:     "pointer",
    zIndex:     20,
    WebkitTapHighlightColor: "transparent",
  };
}

// ── Generic bar button ────────────────────────────────────────────────
function Btn({ ui, onClick, children, accent, label }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:   hover ? ui.border : "transparent",
        border:       "none",
        borderRadius: "20px",
        padding:      "5px 10px",
        cursor:       "pointer",
        color:        accent || (hover ? ui.text : ui.muted),
        fontSize:     "0.8rem",
        display:      "flex",
        alignItems:   "center",
        gap:          "2px",
        transition:   "background 0.15s, color 0.15s",
        whiteSpace:   "nowrap",
        fontFamily:   "inherit",
        // Larger touch target on mobile
        minHeight:    "36px",
        minWidth:     "36px",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}