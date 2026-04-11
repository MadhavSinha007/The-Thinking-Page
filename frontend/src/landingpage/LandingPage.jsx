import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Headphones,
  Play,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";

const featuredBooks = [
  {
    id: 1,
    genre: "Self Growth",
    title: "Think Bigger, Read Better",
    author: "Curated for ambitious readers",
    description:
      "Discover books that sharpen your thinking, expand perspective, and fit beautifully into your daily reading flow.",
    rating: "4.9",
  },
  {
    id: 2,
    genre: "AI Narration",
    title: "Human-like voice with ElevenLabs",
    author: "Immersive listening experience",
    description:
      "Switch from reading to listening instantly with natural, expressive narration designed for long-form book sessions.",
    rating: "4.8",
  },
  {
    id: 3,
    genre: "Smart Discovery",
    title: "Find your next favorite book",
    author: "Personalized exploration",
    description:
      "Browse by mood, genre, trending picks, and editor-curated collections built for modern digital readers.",
    rating: "4.7",
  },
];

const benefits = [
  "Browse curated fiction, nonfiction, and trending titles",
  "Read online with a clean, distraction-free experience",
  "Listen with realistic AI narration powered by ElevenLabs",
  "Continue across devices with synced progress and history",
];

const quickStats = [
  { label: "Reader Rating", value: "4.9" },
  { label: "Narration Style", value: "Human-like" },
  { label: "Reading Flow", value: "Seamless" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full min-h-screen bg-[#efe5dc]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <header className="border-b border-black/10 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-black bg-white text-sm font-semibold tracking-tight hover:scale-105 transition-transform"
              >
                TP.
              </Link>

              <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
                <a href="#about" className="transition hover:opacity-70">
                  About
                </a>
                <a href="#features" className="transition hover:opacity-70">
                  Features
                </a>
                <a href="#contact" className="transition hover:opacity-70">
                  Contact
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[#f57c00] px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-black transition hover:scale-105"
                >
                  Login
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="py-6 sm:py-8 lg:py-10 space-y-4 sm:space-y-6">
            {/* Hero Section */}
            <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.7fr_1fr]">
              {/* Left Column - Hero */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] border border-black/10 bg-[#f3ebe3] p-5 sm:p-6 lg:p-8">
                <div className="absolute right-[-5%] top-16 hidden lg:block h-[75%] w-[48%] rounded-full bg-[radial-gradient(circle,_rgba(0,0,0,0.05)_1.5px,_transparent_1.5px)] [background-size:18px_18px]" />

                <div className="relative z-10 flex flex-col min-h-0">
                  <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
                    <div>
                      <p className="mb-2 sm:mb-3 text-xs uppercase tracking-[0.25em] text-black/60">
                        Online Reading Platform
                      </p>

                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] tracking-[-0.05em]">
                        The
                        <br />
                        Thinking
                        <br />
                        Page
                      </h1>

                      <div className="mt-3 sm:mt-4 h-8 w-32 sm:h-9 sm:w-44 bg-black" />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-sm sm:text-base leading-relaxed text-black/80">
                          Read smarter, listen deeper, and explore books with a
                          premium digital experience designed for modern readers.
                        </p>

                        <p className="text-xs sm:text-sm leading-relaxed text-black/65">
                          TheThinkingPage combines immersive online reading with
                          AI narration that feels natural and expressive using
                          ElevenLabs-powered voice playback.
                        </p>
                      </div>

                      <div className="mt-1 sm:mt-2">
                        <Link
                          to="/login"
                          className="group inline-flex items-center gap-2 sm:gap-3 rounded-full bg-[#f57c00] px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-lg"
                        >
                          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-black bg-black/10 transition-transform group-hover:rotate-90">
                            <PlusIcon />
                          </span>
                          <span>Start Reading</span>
                          <ArrowRight className="ml-1 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mt-6 sm:mt-8">
                    {quickStats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl sm:rounded-2xl border border-black/10 bg-[#efe5dc] p-3 sm:p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                          {item.label}
                        </p>
                        <p className="mt-3 sm:mt-4 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-black/55">
                    Book discovery • AI voice • Deep focus reading
                  </div>
                </div>
              </div>

              {/* Right Column - Reviews & Info */}
              <div className="grid gap-3 sm:gap-4">
                <div className="rounded-2xl sm:rounded-[28px] border border-black/10 bg-[#f3ebe3] p-5 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex items-center gap-1 text-black">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-black" />
                    ))}
                    <Star className="h-4 w-4 text-black/40" />
                  </div>

                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight">4.9</p>

                  <p className="mt-3 sm:mt-4 text-sm leading-relaxed text-black/75">
                    "A clean and elegant reading platform. The narration feels
                    polished, the interface is calming, and discovering books is
                    genuinely enjoyable."
                  </p>

                  <p className="mt-3 sm:mt-4 text-sm font-medium">— Early readers</p>
                </div>

                <div className="rounded-2xl sm:rounded-[28px] border border-black/10 bg-[#f3ebe3] p-5 sm:p-6">
                  <blockquote className="text-xl sm:text-2xl font-medium leading-tight tracking-tight">
                    "The reading experience matters just as much as the book
                    itself."
                  </blockquote>
                  <p className="mt-4 sm:mt-6 text-sm sm:text-base font-medium">
                    — TheThinkingPage
                  </p>
                </div>

                <div className="rounded-2xl sm:rounded-[28px] border border-black/10 bg-[#f3ebe3] p-5 sm:p-6">
                  <p className="text-sm leading-relaxed text-black/75">
                    TheThinkingPage helps you move effortlessly from browsing to
                    reading to listening.
                  </p>

                  <ul className="mt-3 sm:mt-4 space-y-2">
                    {benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm leading-relaxed text-black/65">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-black" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="mt-5 sm:mt-6 inline-flex items-center text-sm font-medium underline underline-offset-4 hover:opacity-70 transition"
                  >
                    Explore more
                  </button>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl sm:rounded-[28px] border border-black/10 bg-[#111111] p-6 sm:p-8 text-[#efe5dc]">
                <div className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-[#efe5dc]/70">
                  <Sparkles className="h-4 w-4" />
                  Signature Experience
                </div>

                <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                  Read online. Listen naturally. Stay immersed.
                </h2>

                <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <FeatureCard
                    icon={<BookOpen className="h-5 w-5" />}
                    title="Beautiful reading view"
                    description="Generous spacing, focused typography, and a clean visual structure inspired by premium editorial layouts."
                  />
                  <FeatureCard
                    icon={<Volume2 className="h-5 w-5" />}
                    title="AI narration"
                    description="Use ElevenLabs voice synthesis to turn book content into expressive, human-like listening sessions."
                  />
                  <FeatureCard
                    icon={<Headphones className="h-5 w-5" />}
                    title="Read and listen mode"
                    description="Let readers switch between silent reading and narrated playback without losing their place."
                  />
                  <FeatureCard
                    icon={<Play className="h-5 w-5" />}
                    title="One-click continuation"
                    description="Jump back into saved books, previous reads, and narration progress from any device."
                  />
                </div>
              </div>

              <div
                id="about"
                className="rounded-2xl sm:rounded-[28px] border border-black/10 bg-[#f3ebe3] p-6 sm:p-8"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-black/55">
                  Featured Collections
                </p>

                <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
                  {featuredBooks.map((book) => (
                    <article
                      key={book.id}
                      className="rounded-2xl sm:rounded-[24px] border border-black/10 bg-[#efe5dc] p-4 sm:p-5 transition hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-black/55">
                            {book.genre}
                          </p>
                          <h3 className="mt-2 text-xl sm:text-2xl font-bold leading-tight">
                            {book.title}
                          </h3>
                          <p className="mt-1 sm:mt-2 text-sm font-medium text-[#d96d00]">
                            {book.author}
                          </p>
                        </div>

                        <div className="self-start shrink-0 rounded-full border border-black/10 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold">
                          ⭐ {book.rating}
                        </div>
                      </div>

                      <p className="mt-3 sm:mt-4 text-sm leading-relaxed text-black/70">
                        {book.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section
              id="contact"
              className="rounded-2xl sm:rounded-[28px] bg-[#f57c00] p-6 sm:p-8"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-black/60">
                    Start your next reading session
                  </p>
                  <h2 className="mt-3 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black uppercase leading-[0.95] tracking-[-0.04em]">
                    Explore books and log in to continue reading
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-3 font-semibold text-[#efe5dc] hover:scale-105 transition-transform"
                  >
                    Go to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="rounded-2xl sm:rounded-[24px] border border-[#efe5dc]/20 bg-white/5 p-4 sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#efe5dc]/25">
        {icon}
      </div>
      <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#efe5dc]/72">{description}</p>
    </div>
  );
};

const PlusIcon = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
};

const ArrowRight = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
};

export default LandingPage;