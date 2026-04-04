/**
 * KindleReader.jsx — Fixed & Enhanced
 *
 * Fixes:
 *  - Theme/font/size/line-height settings now actually apply (injects <style> into epub iframe)
 *  - Two-column layout on desktop (≥1024px)
 *  - Synced with site ThemeContext (sepia/dark/light)
 *  - Overall design polish
 *
 * Props:
 *   bookUrl  — URL to the .epub file
 *   onClose  — optional back callback
 *
 * npm install epubjs
 * Paste your ElevenLabs key below.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import ePub from "epubjs";
import { useTheme } from "../../context/ThemeContext";

// ─── ElevenLabs ───────────────────────────────────────────
const ELEVENLABS_API_KEY = "YOUR_API_KEY";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const TTS_MODEL = "eleven_turbo_v2";

// ─── Reader themes (for the reading area only) ────────────
const READER_THEMES = {
  light: { name: "Light",  bg: "#faf9f8", fg: "#1a1714", accent: "#7c3aed", scrollbar: "#d4d0cb" },
  dark:  { name: "Dark",   bg: "#0f0f0f", fg: "#d8d4cf", accent: "#7c3aed", scrollbar: "#2a2a2a" },
  sepia: { name: "Sepia",  bg: "#f5ede0", fg: "#3a2e22", accent: "#9c4a1a", scrollbar: "#d4c5ae" },
  sand:  { name: "Sand",   bg: "#f2f0eb", fg: "#2c2825", accent: "#7c3aed", scrollbar: "#ccc8c2" },
};

const FONT_SIZES = [13, 15, 17, 19, 21, 24];
const FONTS = [
  { label: "Georgia",      value: "Georgia, 'Times New Roman', serif" },
  { label: "Palatino",     value: "'Palatino Linotype', Palatino, Georgia, serif" },
  { label: "Garamond",     value: "'EB Garamond', 'Garamond', Georgia, serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "Sans",         value: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
];

// ─── TTS ──────────────────────────────────────────────────
let _ttsAudio = null;
let _ttsAbort = false;

const stopTTS = () => {
  _ttsAbort = true;
  if (_ttsAudio) { _ttsAudio.pause(); _ttsAudio.src = ""; _ttsAudio = null; }
};

const chunkText = (text, max = 400) => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [cleaned];
  const chunks = []; let cur = "";
  for (const s of sentences) {
    const t = s.trim(); if (!t) continue;
    if (cur.length + t.length > max && cur.length > 0) { chunks.push(cur.trim()); cur = t + " "; }
    else cur += t + " ";
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
};

const fetchBlob = async (text) => {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: TTS_MODEL, voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true } }),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
  return res.blob();
};

const playBlob = (blob) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    _ttsAudio = audio;
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); reject(); };
    audio.play().catch(reject);
  });

const speakText = async (text, onDone) => {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === "YOUR_API_KEY") { onDone?.(); return; }
  stopTTS(); _ttsAbort = false;
  try {
    for (const chunk of chunkText(text)) {
      if (_ttsAbort) break;
      const blob = await fetchBlob(chunk);
      if (_ttsAbort) break;
      await playBlob(blob);
    }
  } catch (e) { console.error("TTS:", e); }
  finally { _ttsAudio = null; if (!_ttsAbort) onDone?.(); }
};

// ─── Core style injector — works reliably across epub.js versions ──
const buildCss = (rt, font, size, lh) => `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Merriweather:ital,wght@0,300;0,400;1,300&display=swap');
  
  html, body {
    background: ${rt.bg} !important;
    color: ${rt.fg} !important;
    font-family: ${font.value} !important;
    font-size: ${size}px !important;
    line-height: ${lh} !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  body {
    max-width: 640px !important;
    margin: 0 auto !important;
    padding: 1.8em 1.5em 2.5em !important;
    box-sizing: border-box !important;
  }
  p {
    font-family: ${font.value} !important;
    font-size: ${size}px !important;
    line-height: ${lh} !important;
    color: ${rt.fg} !important;
    text-align: justify !important;
    margin-bottom: 0.8em !important;
    text-indent: 1.4em !important;
    hyphens: auto !important;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: ${font.value} !important;
    color: ${rt.fg} !important;
    text-indent: 0 !important;
    line-height: 1.3 !important;
    margin-top: 1.5em !important;
    margin-bottom: 0.6em !important;
  }
  a { color: ${rt.accent} !important; text-decoration: none !important; }
  img { max-width: 100% !important; height: auto !important; }
  * { box-sizing: border-box !important; }
`;

const injectStyle = (rend, css) => {
  try {
    // Method 1: getContents API (works with most epub.js versions)
    const contents = rend.getContents?.();
    if (contents && contents.length > 0) {
      contents.forEach(c => {
        const doc = c.document || c.window?.document;
        if (!doc) return;
        let el = doc.getElementById('__kindle_style__');
        if (!el) {
          el = doc.createElement('style');
          el.id = '__kindle_style__';
          doc.head.appendChild(el);
        }
        el.textContent = css;
      });
      return;
    }
  } catch (_) {}

  try {
    // Method 2: Use themes.default (epub.js v0.3+)
    rend.themes.default({ body: {} }); // reset
    rend.themes.override('body', {
      'background': 'transparent',
      'font-size': '16px',
    });
  } catch (_) {}
};

// ─── Icons ─────────────────────────────────────────────────
const Ico = ({ d, size = 20, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IBack  = () => <Ico d="M19 12H5M12 5l-7 7 7 7" />;
const IToc   = () => <Ico d="M4 6h16M4 12h16M4 18h10" />;
const ISet   = () => <Ico size={18} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />;
const IPlay  = () => <Ico size={14} d="M5 3l14 9-14 9V3z" fill="currentColor" />;
const IPause = () => <Ico size={14} d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" />;
const ILeft  = () => <Ico d="M15 18l-6-6 6-6" />;
const IRight = () => <Ico d="M9 18l6-6-6-6" />;
const IClose = () => <Ico size={16} d="M18 6L6 18M6 6l12 12" />;
const ICols  = () => <Ico size={16} d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M9 3v18M15 3v18" />;

// ─── Main Component ────────────────────────────────────────
export default function KindleReader({ bookUrl, onClose }) {
  const { theme: siteTheme, themeKey: siteThemeKey } = useTheme();

  const viewerRef   = useRef(null);
  const bookRef     = useRef(null);
  const rendRef     = useRef(null);
  const touchStartX = useRef(null);
  const styleCache  = useRef("");

  // Map site theme to reader theme
  const defaultReaderTheme = { light: 'light', dark: 'dark', sepia: 'sepia' }[siteThemeKey] || 'light';

  const [readerThemeKey, setReaderThemeKey] = useState(defaultReaderTheme);
  const [fontIdx,        setFontIdx]        = useState(0);
  const [fontSizeIdx,    setFontSizeIdx]    = useState(2);
  const [lineHeight,     setLineHeight]     = useState(1.8);
  const [twoColumn,      setTwoColumn]      = useState(false);
  const [progress,       setProgress]       = useState(0);
  const [toc,            setToc]            = useState([]);
  const [chapter,        setChapter]        = useState("");
  const [metadata,       setMetadata]       = useState(null);
  const [showToc,        setShowToc]        = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [uiVisible,      setUiVisible]      = useState(true);
  const [speaking,       setSpeaking]       = useState(false);
  const [pageText,       setPageText]       = useState("");
  const [loaded,         setLoaded]         = useState(false);

  // Sync when site theme changes
  useEffect(() => {
    setReaderThemeKey({ light: 'light', dark: 'dark', sepia: 'sepia' }[siteThemeKey] || 'light');
  }, [siteThemeKey]);

  const rt       = READER_THEMES[readerThemeKey];
  const fontSize = FONT_SIZES[fontSizeIdx];
  const font     = FONTS[fontIdx];

  // Chrome colors come from site theme
  const chromeBg     = siteTheme.navBg;
  const chromeBorder = siteTheme.border;
  const chromeFg     = siteTheme.fg;
  const chromeMuted  = siteTheme.fgMuted;
  const purple       = siteTheme.accent;

  // ── Build and apply styles ────────────────────────────────
  const applyStyles = useCallback(() => {
    if (!rendRef.current) return;
    const css = buildCss(rt, font, fontSize, lineHeight);
    styleCache.current = css;
    injectStyle(rendRef.current, css);
  }, [rt, font, fontSize, lineHeight]);

  // Re-apply on any setting change
  useEffect(() => {
    applyStyles();
  }, [applyStyles]);

  // ── Load book ─────────────────────────────────────────────
  useEffect(() => {
    if (!bookUrl || !viewerRef.current) return;

    const book = ePub(bookUrl);
    bookRef.current = book;

    const rendOptions = {
      width: "100%",
      height: "100%",
      spread: twoColumn && window.innerWidth >= 1024 ? "always" : "none",
      flow: "paginated",
      allowScriptedContent: true,
      resizeOnOrientationChange: true,
    };

    const rend = book.renderTo(viewerRef.current, rendOptions);
    rendRef.current = rend;

    rend.display().then(() => {
      setLoaded(true);
      // Inject styles after first render
      setTimeout(() => {
        const css = buildCss(rt, font, fontSize, lineHeight);
        injectStyle(rend, css);
      }, 200);
    });

    book.loaded.navigation.then(nav => setToc(nav.toc || []));
    book.loaded.metadata.then(meta => setMetadata(meta));

    rend.on("relocated", (loc) => {
      const pct = book.locations.percentageFromCfi(loc.start.cfi);
      if (!isNaN(pct)) setProgress(Math.round(pct * 100));

      // Re-inject styles on page change (epub.js recreates iframes)
      setTimeout(() => {
        const css = buildCss(READER_THEMES[readerThemeKey], FONTS[fontIdx], FONT_SIZES[fontSizeIdx], lineHeight);
        injectStyle(rend, css);
      }, 100);

      extractText(rend);
      book.loaded.navigation.then(nav => {
        const item = nav.get(loc.start.href);
        if (item) setChapter(item.label?.trim() || "");
      });
    });

    // Also inject on render events
    rend.on("rendered", () => {
      setTimeout(() => {
        const css = styleCache.current || buildCss(rt, font, fontSize, lineHeight);
        injectStyle(rend, css);
      }, 150);
    });

    book.ready.then(() => book.locations.generate(1024));

    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") rend.next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   rend.prev();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      stopTTS();
      window.removeEventListener("keydown", onKey);
      book.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookUrl]);

  // ── Two-column toggle: recreate rendition ─────────────────
  const toggleTwoColumn = () => {
    if (!bookRef.current || !viewerRef.current) return;
    const newVal = !twoColumn;
    setTwoColumn(newVal);

    try {
      rendRef.current?.destroy();
    } catch (_) {}

    const rend = bookRef.current.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      spread: newVal && window.innerWidth >= 1024 ? "always" : "none",
      flow: "paginated",
      allowScriptedContent: true,
    });
    rendRef.current = rend;

    rend.display().then(() => {
      setTimeout(() => {
        const css = buildCss(rt, font, fontSize, lineHeight);
        styleCache.current = css;
        injectStyle(rend, css);
      }, 200);
    });

    rend.on("relocated", (loc) => {
      const pct = bookRef.current.locations.percentageFromCfi(loc.start.cfi);
      if (!isNaN(pct)) setProgress(Math.round(pct * 100));
      setTimeout(() => injectStyle(rend, styleCache.current), 100);
      extractText(rend);
    });

    rend.on("rendered", () => {
      setTimeout(() => injectStyle(rend, styleCache.current), 150);
    });
  };

  const extractText = (rend) => {
    try {
      const contents = rend.getContents?.() || [];
      setPageText(
        contents.map(c => c.document?.body?.innerText || "").join(" ").replace(/\s+/g, " ").trim()
      );
    } catch (_) {}
  };

  // ── Auto-hide UI ──────────────────────────────────────────
  useEffect(() => {
    let t;
    const reset = () => {
      setUiVisible(true);
      clearTimeout(t);
      t = setTimeout(() => setUiVisible(false), 4000);
    };
    window.addEventListener("mousemove", reset);
    window.addEventListener("touchstart", reset);
    reset();
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, []);

  // ── Swipe ─────────────────────────────────────────────────
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? rendRef.current?.next() : rendRef.current?.prev(); }
    touchStartX.current = null;
  };

  const handleTTS = () => {
    if (speaking) { stopTTS(); setSpeaking(false); return; }
    if (!pageText) return;
    setSpeaking(true);
    speakText(pageText, () => setSpeaking(false));
  };

  const closeAll = () => { setShowToc(false); setShowSettings(false); };

  // ── Style helpers ─────────────────────────────────────────
  const ib = {
    background: "transparent", border: "none", cursor: "pointer",
    color: chromeFg, display: "flex", alignItems: "center",
    padding: "8px", borderRadius: "8px", flexShrink: 0,
  };

  const pillBtn = (active) => ({
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    cursor: "pointer",
    background: active ? purple : "transparent",
    color: active ? "#fff" : chromeFg,
    border: `1px solid ${active ? purple : chromeBorder}`,
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  });

  return (
    <>
      <style>{`
        .kr-ib:hover { background: ${siteTheme.isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"} !important; }
        .kr-toc-btn:hover { background: ${siteTheme.surface2} !important; }
        .kr-nav:hover { opacity: 1 !important; }
        @keyframes kr-spin { to { transform: rotate(360deg); } }
        .kr-panel { scrollbar-width: thin; scrollbar-color: ${chromeBorder} transparent; }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        background: chromeBg, color: chromeFg, overflow: "hidden",
      }}>

        {/* ── Top bar ───────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", height: "52px",
          padding: "0 8px", flexShrink: 0, gap: "4px",
          background: chromeBg,
          borderBottom: `1px solid ${chromeBorder}`,
          position: "relative", zIndex: 100,
          transition: "opacity 0.3s, transform 0.3s",
          opacity: uiVisible ? 1 : 0,
          transform: uiVisible ? "translateY(0)" : "translateY(-100%)",
          pointerEvents: uiVisible ? "auto" : "none",
        }}>
          <button className="kr-ib" style={ib}
            onClick={onClose || (() => window.history.back())}>
            <IBack />
          </button>

          <button className="kr-ib" style={ib}
            onClick={() => { setShowToc(v => !v); setShowSettings(false); }}>
            <IToc />
          </button>

          <div style={{ flex: 1, textAlign: "center", overflow: "hidden", padding: "0 8px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {metadata?.title || "Reading"}
            </div>
            {chapter && (
              <div style={{ fontSize: "11px", color: chromeMuted, marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {chapter}
              </div>
            )}
          </div>

          {/* Two-column toggle (desktop only) */}
          <button
            className="kr-ib"
            style={{ ...ib, color: twoColumn ? purple : chromeFg, display: window.innerWidth < 1024 ? "none" : "flex" }}
            onClick={toggleTwoColumn}
            title={twoColumn ? "Single column" : "Two columns"}
          >
            <ICols />
          </button>

          <button className="kr-ib" style={ib}
            onClick={() => { setShowSettings(v => !v); setShowToc(false); }}>
            <ISet />
          </button>
        </div>

        {/* ── ToC panel ─────────────────────────────────────── */}
        {showToc && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)" }}
              onClick={closeAll} />
            <div className="kr-panel" style={{
              position: "fixed", top: "52px", left: 0, zIndex: 201,
              width: "min(280px, 100vw)", maxHeight: "calc(100vh - 52px)",
              background: chromeBg, borderTop: `1px solid ${chromeBorder}`,
              borderRight: `1px solid ${chromeBorder}`, overflowY: "auto",
              boxShadow: "4px 0 32px rgba(0,0,0,0.25)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderBottom: `1px solid ${chromeBorder}` }}>
                <span style={{ fontWeight: 600, fontSize: "13px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Contents</span>
                <button className="kr-ib" style={{ ...ib, padding: "4px" }} onClick={closeAll}><IClose /></button>
              </div>
              {toc.length === 0
                ? <div style={{ padding: "20px 16px", color: chromeMuted, fontSize: "13px" }}>No chapters found.</div>
                : toc.map((item, i) => (
                  <button key={i} className="kr-toc-btn"
                    onClick={() => { rendRef.current?.display(item.href); closeAll(); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      background: "transparent", border: "none",
                      borderBottom: `1px solid ${chromeBorder}`,
                      padding: "12px 16px", fontSize: "13px",
                      color: chromeFg, cursor: "pointer", transition: "background 0.15s",
                    }}>
                    {item.label}
                  </button>
                ))
              }
            </div>
          </>
        )}

        {/* ── Settings panel ────────────────────────────────── */}
        {showSettings && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)" }}
              onClick={closeAll} />
            <div className="kr-panel" style={{
              position: "fixed", top: "52px", right: 0, zIndex: 201,
              width: "min(300px, 100vw)", maxHeight: "calc(100vh - 52px)",
              background: chromeBg, borderTop: `1px solid ${chromeBorder}`,
              borderLeft: `1px solid ${chromeBorder}`, overflowY: "auto",
              boxShadow: "-4px 0 32px rgba(0,0,0,0.25)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderBottom: `1px solid ${chromeBorder}` }}>
                <span style={{ fontWeight: 600, fontSize: "13px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Settings</span>
                <button className="kr-ib" style={{ ...ib, padding: "4px" }} onClick={closeAll}><IClose /></button>
              </div>

              <div style={{ padding: "16px 16px 28px" }}>

                {/* Reading theme */}
                <SettingSection label="Reading Theme" chromeMuted={chromeMuted}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {Object.entries(READER_THEMES).map(([key, t]) => (
                      <button key={key}
                        onClick={() => {
                          setReaderThemeKey(key);
                          // Apply immediately
                          setTimeout(() => {
                            const css = buildCss(t, font, fontSize, lineHeight);
                            styleCache.current = css;
                            injectStyle(rendRef.current, css);
                          }, 50);
                        }}
                        style={{
                          ...pillBtn(readerThemeKey === key),
                          background: readerThemeKey === key ? purple : t.bg,
                          color: readerThemeKey === key ? "#fff" : t.fg,
                          border: `2px solid ${readerThemeKey === key ? purple : t.scrollbar}`,
                        }}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </SettingSection>

                {/* Typeface */}
                <SettingSection label="Typeface" chromeMuted={chromeMuted}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {FONTS.map((f, i) => (
                      <button key={f.label}
                        onClick={() => {
                          setFontIdx(i);
                          setTimeout(() => {
                            const css = buildCss(rt, f, fontSize, lineHeight);
                            styleCache.current = css;
                            injectStyle(rendRef.current, css);
                          }, 50);
                        }}
                        style={{ ...pillBtn(fontIdx === i), fontFamily: f.value }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </SettingSection>

                {/* Font size */}
                <SettingSection label={`Font Size — ${fontSize}px`} chromeMuted={chromeMuted}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "11px", color: chromeMuted }}>A</span>
                    <input type="range" min={0} max={FONT_SIZES.length - 1} value={fontSizeIdx}
                      style={{ flex: 1, accentColor: purple, cursor: "pointer" }}
                      onChange={e => {
                        const idx = +e.target.value;
                        setFontSizeIdx(idx);
                        const sz = FONT_SIZES[idx];
                        setTimeout(() => {
                          const css = buildCss(rt, font, sz, lineHeight);
                          styleCache.current = css;
                          injectStyle(rendRef.current, css);
                        }, 50);
                      }} />
                    <span style={{ fontSize: "19px", color: chromeMuted }}>A</span>
                  </div>
                </SettingSection>

                {/* Line height */}
                <SettingSection label={`Line Spacing — ${lineHeight}`} chromeMuted={chromeMuted}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "13px", color: chromeMuted }}>≡</span>
                    <input type="range" min={1.2} max={2.4} step={0.1} value={lineHeight}
                      style={{ flex: 1, accentColor: purple, cursor: "pointer" }}
                      onChange={e => {
                        const lh = +e.target.value;
                        setLineHeight(lh);
                        setTimeout(() => {
                          const css = buildCss(rt, font, fontSize, lh);
                          styleCache.current = css;
                          injectStyle(rendRef.current, css);
                        }, 50);
                      }} />
                    <span style={{ fontSize: "13px", color: chromeMuted }}>⦀</span>
                  </div>
                </SettingSection>

              </div>
            </div>
          </>
        )}

        {/* ── Reader area ───────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: rt.bg }}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

          {/* Spinner */}
          {!loaded && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", background: rt.bg, zIndex: 10,
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: `3px solid ${chromeBorder}`, borderTopColor: purple,
                animation: "kr-spin 0.8s linear infinite",
              }} />
              <div style={{ marginTop: "12px", fontSize: "13px", color: chromeMuted }}>Loading…</div>
            </div>
          )}

          {/* epub.js target */}
          <div ref={viewerRef} style={{ width: "100%", height: "100%" }} />

          {/* Desktop nav arrows */}
          {["left", "right"].map(side => (
            <button key={side} className="kr-nav"
              onClick={side === "left" ? () => rendRef.current?.prev() : () => rendRef.current?.next()}
              style={{
                position: "absolute", [side]: "16px", top: "50%", transform: "translateY(-50%)",
                background: siteTheme.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                border: `1px solid ${chromeBorder}`, borderRadius: "50%",
                width: "40px", height: "40px", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", color: chromeFg, zIndex: 5,
                opacity: uiVisible ? 0.7 : 0, transition: "opacity 0.3s",
                pointerEvents: uiVisible ? "auto" : "none",
              }}>
              {side === "left" ? <ILeft /> : <IRight />}
            </button>
          ))}

          {/* Mobile tap zones */}
          <div style={{ position: "absolute", left: 0, top: 0, width: "22%", height: "100%", zIndex: 4 }}
            onClick={() => rendRef.current?.prev()} />
          <div style={{ position: "absolute", right: 0, top: 0, width: "22%", height: "100%", zIndex: 4 }}
            onClick={() => rendRef.current?.next()} />
        </div>

        {/* ── Bottom bar ────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "0 16px", height: "48px", flexShrink: 0,
          background: chromeBg, borderTop: `1px solid ${chromeBorder}`,
          transition: "opacity 0.3s, transform 0.3s",
          opacity: uiVisible ? 1 : 0,
          transform: uiVisible ? "translateY(0)" : "translateY(100%)",
          pointerEvents: uiVisible ? "auto" : "none",
        }}>
          {/* TTS */}
          <button onClick={handleTTS} disabled={!pageText} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "5px 12px", borderRadius: "20px", fontSize: "12px",
            background: speaking ? purple : "transparent",
            color: speaking ? "#fff" : chromeFg,
            border: `1px solid ${speaking ? purple : chromeBorder}`,
            cursor: pageText ? "pointer" : "not-allowed",
            opacity: pageText ? 1 : 0.35,
            transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {speaking ? <><IPause /> Stop</> : <><IPlay /> Read aloud</>}
          </button>

          {/* Progress bar */}
          <div style={{ flex: 1, height: "3px", background: chromeBorder, borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress}%`, background: purple,
              borderRadius: "2px", transition: "width 0.5s ease",
            }} />
          </div>

          <span style={{ fontSize: "11px", color: chromeMuted, minWidth: "32px", textAlign: "right", flexShrink: 0 }}>
            {progress}%
          </span>
        </div>
      </div>
    </>
  );
}

function SettingSection({ label, children, chromeMuted }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{
        fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em",
        color: chromeMuted, marginBottom: "10px", fontWeight: 600,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}