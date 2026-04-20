import React, { useEffect, useMemo, useRef, useState } from "react";
import ePub from "epubjs";
import {
  speakText,
  stopAudio,
  isSpeaking,
  getSpeechEngine,
} from "../../utils/readerTTS";

const THEMES = {
  light: {
    shellBg: "#efe5dc",
    overlayBg: "rgba(243, 235, 227, 0.96)",
    text: "#16120f",
    muted: "#6b625b",
    subtle: "#8a8077",
    border: "#00000014",
    accent: "#f57c00",
    accentSoft: "rgba(245,124,0,0.12)",
    readerBg: "#f7f1ea",
    readerText: "#17120e",
    readerLink: "#f57c00",
    playerBg: "rgba(255,255,255,0.7)",
  },
  dark: {
    shellBg: "#111110",
    overlayBg: "rgba(28, 25, 23, 0.96)",
    text: "#F5F0EB",
    muted: "#b8aea6",
    subtle: "#8a8179",
    border: "#ffffff14",
    accent: "#f57c00",
    accentSoft: "rgba(245,124,0,0.16)",
    readerBg: "#181512",
    readerText: "#F5F0EB",
    readerLink: "#f57c00",
    playerBg: "rgba(36,32,29,0.82)",
  },
};

const FONT_SIZES = [15, 17, 19, 21, 23];
const FONTS = [
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Palatino", value: "'Palatino Linotype', Palatino, Georgia, serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "Sans", value: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
];

const isMobileViewport = () => window.innerWidth < 768;

const buildReaderCss = ({ theme, fontFamily, fontSize, lineHeight, mobile }) => `
  html, body {
    background: ${theme.readerBg} !important;
    color: ${theme.readerText} !important;
    font-family: ${fontFamily} !important;
    font-size: ${fontSize}px !important;
    line-height: ${lineHeight} !important;
    margin: 0 !important;
    padding: 0 !important;
    height: 100% !important;
  }

  body {
    box-sizing: border-box !important;
    padding: ${mobile ? "20px 16px 90px" : "34px 42px 42px"} !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
    -webkit-font-smoothing: antialiased !important;
    text-rendering: optimizeLegibility !important;
  }

  * {
    box-sizing: border-box !important;
  }

  p, div, span, li, blockquote {
    color: ${theme.readerText} !important;
    font-family: ${fontFamily} !important;
    font-size: ${fontSize}px !important;
    line-height: ${lineHeight} !important;
  }

  p {
    margin: 0 0 1em !important;
    text-align: justify !important;
    text-indent: 1.2em !important;
    hyphens: auto !important;
  }

  p:first-of-type,
  h1 + p,
  h2 + p,
  h3 + p,
  h4 + p {
    text-indent: 0 !important;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${theme.readerText} !important;
    font-family: ${fontFamily} !important;
    line-height: 1.25 !important;
    margin: 1.15em 0 0.6em !important;
    text-indent: 0 !important;
    break-after: avoid !important;
  }

  a {
    color: ${theme.readerLink} !important;
    text-decoration: none !important;
  }

  img, svg, video {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    margin: 1rem auto !important;
    object-fit: contain !important;
    background: transparent !important;
  }

  table {
    width: 100% !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
  }

  pre, code {
    white-space: pre-wrap !important;
    word-break: break-word !important;
  }
`;

const OverlayButton = ({
  children,
  active = false,
  theme,
  compact = false,
  className = "",
  ...props
}) => (
  <button
    {...props}
    className={`rounded-full border font-semibold transition-all active:scale-95 ${
      compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
    } ${className}`}
    style={{
      background: active ? theme.accent : theme.overlayBg,
      color: active ? "#000000" : theme.text,
      borderColor: active ? theme.accent : theme.border,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    }}
  >
    {children}
  </button>
);

const CircleButton = ({ children, theme, className = "", ...props }) => (
  <button
    {...props}
    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-base font-bold transition-all active:scale-95 ${className}`}
    style={{
      background: theme.overlayBg,
      color: theme.text,
      borderColor: theme.border,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    }}
  >
    {children}
  </button>
);

const AudioBars = ({ active, theme }) => {
  return (
    <div className="flex h-7 items-end gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`block w-1.5 rounded-full ${active ? "animate-pulse" : ""}`}
          style={{
            height: active ? `${12 + ((i % 3) + 1) * 5}px` : "8px",
            background: theme.accent,
            opacity: active ? 1 : 0.45,
            animationDuration: `${0.55 + i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function KindleReader({
  bookUrl,
  title = "Book Reader",
  author = "",
  onClose,
}) {
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const hideTimerRef = useRef(null);
  const autoNextTimerRef = useRef(null);

  const [themeKey, setThemeKey] = useState("light");
  const [fontIndex, setFontIndex] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [toc, setToc] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [progress, setProgress] = useState(0);
  const [pageInfo, setPageInfo] = useState({ page: 1, total: 1 });
  const [loaded, setLoaded] = useState(false);
  const [readerError, setReaderError] = useState("");
  const [showTopBar, setShowTopBar] = useState(true);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("idle");
  const [speechEngine, setSpeechEngine] = useState("idle");
  const [currentSpokenText, setCurrentSpokenText] = useState("");

  const theme = useMemo(() => THEMES[themeKey], [themeKey]);
  const font = FONTS[fontIndex];
  const fontSize = FONT_SIZES[fontSizeIndex];

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const clearAutoNextTimer = () => {
    if (autoNextTimerRef.current) {
      window.clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
  };

  const hideControlsNow = () => {
    clearHideTimer();
    setShowTopBar(false);
    setShowBottomBar(false);
    setShowSettings(false);
    setShowToc(false);
  };

  const scheduleHide = () => {
    if (isMobile) return;
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      hideControlsNow();
    }, 2200);
  };

  const showControls = (which = "both") => {
    if (which === "both" || which === "top") setShowTopBar(true);
    if (which === "both" || which === "bottom") setShowBottomBar(true);
    if (!isMobile) scheduleHide();
  };

  const applyStylesToDocument = (doc) => {
    if (!doc) return;

    const css = buildReaderCss({
      theme,
      fontFamily: font.value,
      fontSize,
      lineHeight,
      mobile: isMobile,
    });

    let styleEl = doc.getElementById("__ttp_reader_style__");
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = "__ttp_reader_style__";
      doc.head.appendChild(styleEl);
    }

    styleEl.textContent = css;
    doc.documentElement.style.background = theme.readerBg;
    doc.body.style.background = theme.readerBg;
  };

  const goPrev = async () => {
    if (!renditionRef.current) return;
    try {
      await renditionRef.current.prev();
    } catch (err) {
      console.error(err);
    }
  };

  const goNext = async () => {
    if (!renditionRef.current) return;
    try {
      await renditionRef.current.next();
    } catch (err) {
      console.error(err);
    }
  };

  const getVisibleText = () => {
    try {
      const contents = renditionRef.current?.getContents?.() || [];

      return contents
        .map((content) => {
          const doc = content.document || content.window?.document;
          return doc?.body?.innerText || "";
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    } catch (err) {
      console.error("Failed to extract visible text:", err);
      return "";
    }
  };

  const readCurrentPage = async ({ continueToNextPage = true } = {}) => {
    const text = getVisibleText();

    if (!text) {
      setSpeechStatus("idle");
      setIsReadingAloud(false);
      return;
    }

    setCurrentSpokenText(text);
    setSpeechStatus("speaking");
    setSpeechEngine("starting");

    await speakText(text, async ({ completed }) => {
      const engine = getSpeechEngine();
      setSpeechEngine(engine || "idle");

      if (!completed) {
        setSpeechStatus("idle");
        setIsReadingAloud(false);
        return;
      }

      if (!continueToNextPage || !isReadingAloud) {
        setSpeechStatus("idle");
        return;
      }

      setSpeechStatus("page-finished");

      clearAutoNextTimer();
      autoNextTimerRef.current = window.setTimeout(async () => {
        if (!isReadingAloud) return;
        await goNext();
        window.setTimeout(() => {
          if (isReadingAloud) {
            readCurrentPage({ continueToNextPage: true });
          }
        }, 450);
      }, 350);
    });
  };

  const startReadAloud = async () => {
    setIsReadingAloud(true);
    setSpeechStatus("speaking");
    showControls("bottom");
    await readCurrentPage({ continueToNextPage: true });
  };

  const stopReadAloud = () => {
    clearAutoNextTimer();
    stopAudio();
    setIsReadingAloud(false);
    setSpeechStatus("idle");
    setSpeechEngine("idle");
  };

  const handleReadAloud = async () => {
    if (isSpeaking() || isReadingAloud) {
      stopReadAloud();
    } else {
      await startReadAloud();
    }
  };

  const handleNextWhileReading = async () => {
    const keepReading = isReadingAloud;
    stopAudio();
    clearAutoNextTimer();
    await goNext();
    if (keepReading) {
      window.setTimeout(() => {
        readCurrentPage({ continueToNextPage: true });
      }, 450);
    }
  };

  const handlePrevWhileReading = async () => {
    const keepReading = isReadingAloud;
    stopAudio();
    clearAutoNextTimer();
    await goPrev();
    if (keepReading) {
      window.setTimeout(() => {
        readCurrentPage({ continueToNextPage: true });
      }, 450);
    }
  };

  useEffect(() => {
    const updateViewportMode = () => setIsMobile(isMobileViewport());
    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);
    return () => window.removeEventListener("resize", updateViewportMode);
  }, []);

  useEffect(() => {
    if (!bookUrl || !viewerRef.current) return;

    let mounted = true;
    setLoaded(false);
    setReaderError("");

    const book = ePub(bookUrl);
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      spread: isMobile ? "none" : "auto",
      // spread: "auto",
      flow: "paginated",
      manager: "default",
      allowScriptedContent: true,
    });

    renditionRef.current = rendition;

    if (rendition.hooks?.content?.register) {
      rendition.hooks.content.register((contents) => {
        const doc = contents?.document || contents?.window?.document;
        applyStylesToDocument(doc);
      });
    }

    const onRelocated = (location) => {
      try {
        const pct = book.locations.percentageFromCfi(location.start.cfi);
        if (!Number.isNaN(pct)) setProgress(Math.round(pct * 100));

        const displayed = location?.start?.displayed;
        if (displayed?.page && displayed?.total) {
          setPageInfo({
            page: displayed.page,
            total: displayed.total,
          });
        } else {
          setPageInfo({ page: 1, total: 1 });
        }
      } catch (err) {
        console.error(err);
      }
    };

    rendition.on("relocated", onRelocated);

    (async () => {
      try {
        await rendition.display();

        if (!mounted) return;

        setLoaded(true);
        showControls("both");
      } catch (err) {
        console.error(err);
        setReaderError(err.message || "Failed to open EPUB.");
      }
    })();

    book.loaded.navigation.then((nav) => {
      if (mounted) setToc(nav.toc || []);
    });

    book.loaded.metadata.then((meta) => {
      if (mounted) setMetadata(meta);
    });

    book.ready
      .then(() => book.locations.generate(1200))
      .catch((err) => console.error(err));

    return () => {
      mounted = false;
      clearHideTimer();
      clearAutoNextTimer();
      stopAudio();
      try {
        rendition.off?.("relocated", onRelocated);
        rendition.destroy();
      } catch {}
      try {
        book.destroy();
      } catch {}
    };
  }, [bookUrl, isMobile, themeKey, fontIndex, fontSizeIndex, lineHeight]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!renditionRef.current) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          handleNextWhileReading();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevWhileReading();
          break;
        case " ":
          e.preventDefault();
          handleReadAloud();
          break;
        case "Escape":
          if (showSettings || showToc) {
            setShowSettings(false);
            setShowToc(false);
            showControls("top");
          } else if (onClose) {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSettings, showToc, onClose, isReadingAloud]);

  useEffect(() => {
    showControls("both");
  }, [themeKey]);

  const handleMouseMove = () => {
    if (isMobile) return;
    showControls("both");
  };

  const handleCenterClick = () => {
    if (isMobile) return;
    const visible = showTopBar || showBottomBar || showSettings || showToc;
    if (visible) {
      hideControlsNow();
    } else {
      setShowTopBar(true);
      setShowBottomBar(true);
      scheduleHide();
    }
  };

  const goToTocItem = async (href) => {
    try {
      stopReadAloud();
      await renditionRef.current?.display(href);
      setShowToc(false);
      showControls("top");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    const touchX = e.touches[0].clientX;
    e.currentTarget.dataset.touchStartX = touchX;
    e.currentTarget.dataset.touchStartTime = Date.now();
  };

  const handleTouchEnd = (e) => {
    if (!isMobile) return;

    const startX = parseFloat(e.currentTarget.dataset.touchStartX);
    const startTime = parseFloat(e.currentTarget.dataset.touchStartTime);
    const endX = e.changedTouches[0].clientX;
    const endTime = Date.now();
    const deltaX = endX - startX;
    const deltaTime = endTime - startTime;

    if (Math.abs(deltaX) > 50 && deltaTime < 300) {
      if (deltaX < 0) {
        handleNextWhileReading();
      } else {
        handlePrevWhileReading();
      }
      return;
    }

    if (Math.abs(deltaX) < 10 && deltaTime < 300) {
      const screenWidth = window.innerWidth;

      if (endX < screenWidth * 0.28) {
        handlePrevWhileReading();
      } else if (endX > screenWidth * 0.72) {
        handleNextWhileReading();
      } else {
        const visible = showTopBar || showBottomBar || showSettings || showToc;
        if (visible) {
          hideControlsNow();
        } else {
          setShowTopBar(true);
          setShowBottomBar(true);
          clearHideTimer();
          hideTimerRef.current = window.setTimeout(() => {
            if (!showSettings && !showToc) {
              setShowTopBar(false);
              setShowBottomBar(false);
            }
          }, 3000);
        }
      }
    }
  };

  const topVisible = showTopBar || showSettings || showToc;
  const bottomVisible = showBottomBar;
  const bookTitle = metadata?.title || title;
  const authorName = metadata?.creator || author || "EPUB Reader";
  const engineLabel =
    speechEngine === "elevenlabs"
      ? "ElevenLabs"
      : speechEngine === "puter"
      ? "Puter.js"
      : speechEngine === "browser"
      ? "Browser Voice"
      : "Ready";

  if (readerError) {
    return (
      <div
        className="flex h-[100dvh] w-screen items-center justify-center p-4"
        style={{ background: theme.shellBg }}
      >
        <div
          className="w-full max-w-lg rounded-[28px] border p-8 text-center"
          style={{
            background: theme.overlayBg,
            borderColor: theme.border,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: theme.subtle }}>
            Reader Error
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight" style={{ color: theme.text }}>
            Failed to render book
          </h2>
          <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>
            {readerError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-[100dvh] w-screen overflow-hidden select-none"
      style={{ background: theme.readerBg, color: theme.text }}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!loaded ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: theme.readerBg }}>
          <div className="text-center">
            <div
              className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: theme.border, borderTopColor: theme.accent }}
            />
            <p className="mt-4 text-sm font-medium" style={{ color: theme.muted }}>
              Preparing reading view…
            </p>
          </div>
        </div>
      ) : null}

      <div
        ref={viewerRef}
        className="absolute inset-0 z-0 h-full w-full"
        style={{ background: theme.readerBg }}
      />

      {!isMobile && (
        <>
          <button
            type="button"
            aria-label="Previous page"
            onClick={handlePrevWhileReading}
            className="absolute left-0 top-0 z-20 h-full w-[14%] bg-transparent sm:w-[14%] lg:w-[18%]"
          />
          <button
            type="button"
            aria-label="Next page"
            onClick={handleNextWhileReading}
            className="absolute right-0 top-0 z-20 h-full w-[14%] bg-transparent sm:w-[14%] lg:w-[18%]"
          />
          <button
            type="button"
            aria-label="Toggle controls"
            onClick={handleCenterClick}
            className="absolute left-[14%] top-0 z-20 h-full w-[72%] bg-transparent sm:left-[14%] sm:w-[72%] lg:left-[18%] lg:w-[64%]"
          />
          <CircleButton
            theme={theme}
            onClick={handlePrevWhileReading}
            className="absolute left-3 top-1/2 z-30 -translate-y-1/2 lg:left-4"
          >
            ←
          </CircleButton>
          <CircleButton
            theme={theme}
            onClick={handleNextWhileReading}
            className="absolute right-3 top-1/2 z-30 -translate-y-1/2 lg:right-4"
          >
            →
          </CircleButton>
        </>
      )}

      {isMobile && loaded && !showTopBar && !showBottomBar && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-between px-4 opacity-60">
          <div className="rounded-full bg-black/30 px-2 py-1 text-xs text-white">← Prev</div>
          <div className="rounded-full bg-black/30 px-2 py-1 text-xs text-white">Next →</div>
        </div>
      )}

      <div
        className={`absolute inset-x-0 top-0 z-40 transition-transform duration-300 ${
          topVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          className="border-b px-3 py-2.5 sm:px-5 sm:py-3"
          style={{
            background: theme.overlayBg,
            borderColor: theme.border,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          {isMobile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <OverlayButton theme={theme} onClick={onClose} compact>
                  ← Back
                </OverlayButton>

                <div className="flex items-center gap-1.5">
                  <OverlayButton
                    theme={theme}
                    compact
                    onClick={() => setThemeKey((prev) => (prev === "light" ? "dark" : "light"))}
                  >
                    {themeKey === "light" ? "Dark" : "Light"}
                  </OverlayButton>

                  <OverlayButton
                    theme={theme}
                    compact
                    active={showToc}
                    onClick={() => {
                      setShowToc((prev) => !prev);
                      if (showSettings) setShowSettings(false);
                    }}
                  >
                    TOC
                  </OverlayButton>

                  <OverlayButton
                    theme={theme}
                    compact
                    active={showSettings}
                    onClick={() => {
                      setShowSettings((prev) => !prev);
                      if (showToc) setShowToc(false);
                    }}
                  >
                    Set
                  </OverlayButton>
                </div>
              </div>

              <div className="min-w-0 text-center">
                <h1 className="truncate text-sm font-black tracking-tight">
                  {bookTitle}
                </h1>
                <p className="truncate text-xs" style={{ color: theme.muted }}>
                  {authorName}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <div className="flex items-center">
                <OverlayButton theme={theme} onClick={onClose}>
                  ← Back
                </OverlayButton>
              </div>

              <div className="min-w-0 px-1 text-center">
                <h1 className="truncate text-sm font-black tracking-tight md:text-lg">
                  {bookTitle}
                </h1>
                <p className="truncate text-xs md:text-sm" style={{ color: theme.muted }}>
                  {authorName}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <OverlayButton
                  theme={theme}
                  onClick={() => setThemeKey((prev) => (prev === "light" ? "dark" : "light"))}
                >
                  {themeKey === "light" ? "Dark" : "Light"}
                </OverlayButton>

                <OverlayButton
                  theme={theme}
                  active={showToc}
                  onClick={() => {
                    setShowToc((prev) => !prev);
                    if (showSettings) setShowSettings(false);
                    showControls("top");
                  }}
                >
                  TOC
                </OverlayButton>

                <OverlayButton
                  theme={theme}
                  active={showSettings}
                  onClick={() => {
                    setShowSettings((prev) => !prev);
                    if (showToc) setShowToc(false);
                    showControls("top");
                  }}
                >
                  Settings
                </OverlayButton>
              </div>
            </div>
          )}
        </div>

        {showSettings ? (
          <div
            className="border-b px-3 py-3 sm:px-5"
            style={{
              background: theme.overlayBg,
              borderColor: theme.border,
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] border p-3 sm:rounded-[22px] sm:p-4" style={{ borderColor: theme.border }}>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.subtle }}>
                  Font
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FONTS.map((item, idx) => (
                    <button
                      key={item.label}
                      onClick={() => setFontIndex(idx)}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: fontIndex === idx ? theme.accent : "transparent",
                        color: fontIndex === idx ? "#000000" : theme.text,
                        border: `1px solid ${fontIndex === idx ? theme.accent : theme.border}`,
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] border p-3 sm:rounded-[22px] sm:p-4" style={{ borderColor: theme.border }}>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.subtle }}>
                  Text Size
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FONT_SIZES.map((size, idx) => (
                    <button
                      key={size}
                      onClick={() => setFontSizeIndex(idx)}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: fontSizeIndex === idx ? theme.accent : "transparent",
                        color: fontSizeIndex === idx ? "#000000" : theme.text,
                        border: `1px solid ${fontSizeIndex === idx ? theme.accent : theme.border}`,
                      }}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] border p-3 sm:rounded-[22px] sm:p-4" style={{ borderColor: theme.border }}>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.subtle }}>
                  Line Height
                </p>
                <input
                  type="range"
                  min="1.4"
                  max="2.2"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="mt-4 w-full"
                />
                <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                  {lineHeight.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {showToc ? (
          <div
            className="max-h-[45dvh] overflow-y-auto border-b px-3 py-3 sm:px-5"
            style={{
              background: theme.overlayBg,
              borderColor: theme.border,
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            {toc.length === 0 ? (
              <p className="text-sm" style={{ color: theme.muted }}>
                No table of contents found.
              </p>
            ) : (
              <div className="grid gap-2">
                {toc.map((item, idx) => (
                  <button
                    key={`${item.href}-${idx}`}
                    onClick={() => goToTocItem(item.href)}
                    className="rounded-[16px] border px-4 py-3 text-left text-sm transition-all active:scale-[0.99]"
                    style={{
                      background: "transparent",
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 z-40 transition-transform duration-300 ${
          bottomVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="border-t px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-5"
          style={{
            background: theme.overlayBg,
            borderColor: theme.border,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          {isMobile ? (
            <div className="space-y-3">
              <div
                className="rounded-[24px] border p-3"
                style={{
                  borderColor: theme.border,
                  background: theme.playerBg,
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: theme.text }}>
                      {isReadingAloud ? "Audiobook Mode" : "Read Aloud"}
                    </p>
                    <p className="truncate text-xs" style={{ color: theme.muted }}>
                      {engineLabel}
                    </p>
                  </div>
                  <AudioBars active={speechStatus === "speaking"} theme={theme} />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handlePrevWhileReading}
                    className="rounded-full border px-3 py-2 text-xs font-semibold"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    ⏮
                  </button>

                  <button
                    onClick={handleReadAloud}
                    className="rounded-full px-5 py-2.5 text-xs font-semibold"
                    style={{
                      background: theme.accent,
                      color: "#000000",
                      border: `1px solid ${theme.accent}`,
                    }}
                  >
                    {isReadingAloud ? "Stop" : "Play"}
                  </button>

                  <button
                    onClick={handleNextWhileReading}
                    className="rounded-full border px-3 py-2 text-xs font-semibold"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    ⏭
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: theme.border }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: theme.accent }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-semibold" style={{ color: theme.muted }}>
                  {progress}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span style={{ color: theme.text }}>
                  {pageInfo.total > 1 ? `Page ${pageInfo.page} / ${pageInfo.total}` : "Page 1"}
                </span>
                <span style={{ color: theme.muted }}>
                  {isReadingAloud ? "Auto next page on" : "Manual reading"}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevWhileReading}
                  className="rounded-full border px-3 py-2 text-sm font-semibold"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  ⏮
                </button>

                <button
                  onClick={handleReadAloud}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold"
                  style={{
                    background: theme.accent,
                    color: "#000000",
                    border: `1px solid ${theme.accent}`,
                  }}
                >
                  {isReadingAloud ? "Stop Reading" : "Read Aloud"}
                </button>

                <button
                  onClick={handleNextWhileReading}
                  className="rounded-full border px-3 py-2 text-sm font-semibold"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  ⏭
                </button>

                <AudioBars active={speechStatus === "speaking"} theme={theme} />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: theme.border }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: theme.accent }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold" style={{ color: theme.muted }}>
                  {progress}%
                </span>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: theme.text }}>
                  {pageInfo.total > 1 ? `Page ${pageInfo.page} / ${pageInfo.total}` : "Page 1"}
                </div>
                <div className="text-xs" style={{ color: theme.muted }}>
                  {engineLabel}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}