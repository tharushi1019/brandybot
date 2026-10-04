import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/Chatbot";

/* ─── Hero Feature Pill ─────────────────────────────────── */
const FeaturePill = ({ icon, label, gradient }) => (
  <div
    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm text-white text-xs font-semibold shadow-lg select-none"
    style={{ background: gradient }}
  >
    <span className="text-base leading-none">{icon}</span>
    <span className="tracking-wide">{label}</span>
  </div>
);

/* ─── Feature Card ───────────────────────────────────────── */
const FeatureCard = ({ icon, tag, title, desc, gradient, delay }) => (
  <div
    className="group relative p-7 rounded-3xl flex flex-col justify-between gap-6 animate-fade-in-up glass-card hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
    style={{ animationDelay: delay, border: "1px solid var(--border-color)" }}
  >
    <div>
      <div className="flex items-center justify-between mb-5">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${gradient} shadow-xl shadow-purple-500/15 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
        >
          {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-300">
          {tag}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {desc}
      </p>
    </div>
    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
      <span>Learn more</span>
      <span>→</span>
    </div>
  </div>
);

/* ─── Step Card ─────────────────────────────────────────── */
const StepCard = ({ num, icon, title, desc }) => (
  <div className="relative group flex flex-col items-center text-center p-7 rounded-3xl glass-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    style={{ border: "1px solid var(--border-color)" }}>
    <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white text-xl font-black shadow-xl mb-5 relative z-10 ring-4 ring-purple-500/20 group-hover:scale-110 group-hover:shadow-purple-500/30 transition-all duration-300">
      {num}
    </div>
    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
    <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-secondary)" }}>{desc}</p>
  </div>
);

/* ─── Pricing Card ──────────────────────────────────────── */
const PricingCard = ({ name, credits, price, features, gradient, popular }) => (
  <div
    className={`relative p-8 rounded-3xl flex flex-col transition-all duration-300 hover:-translate-y-2 ${popular
      ? "scale-105 shadow-2xl shadow-purple-500/20 border-2 border-purple-500 bg-[var(--bg-card)]"
      : "glass-card border border-[var(--border-color)] hover:border-purple-500/40"
      }`}
  >
    {popular && (
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full brand-gradient text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-purple-500/40">
        ⭐ Most Popular
      </div>
    )}
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xl mb-4 shadow-md`}>
      {credits === 0 ? "∞" : credits}
    </div>
    <h3 className="text-2xl font-black mb-1" style={{ color: "var(--text-primary)" }}>{name}</h3>
    <p className="mb-4 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
      {credits === 0 ? "1 free generation" : `${credits} logo credits`}
    </p>
    <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[var(--border-color)]">
      <span className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
        {price === 0 ? "Free" : `$${price}`}
      </span>
      {price > 0 && <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>/ one-time</span>}
    </div>
    <ul className="space-y-3.5 mb-8 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <Link
      to={price === 0 ? "/" : "/purchase"}
      className={`w-full py-3.5 rounded-2xl font-bold text-sm text-center transition-all duration-200 shadow-md ${popular
        ? "brand-gradient text-white hover:opacity-95 hover:shadow-purple-500/30 hover:scale-[1.02]"
        : "border hover:bg-[var(--bg-card-hover)] hover:border-purple-500/50"
        }`}
      style={!popular ? { borderColor: "var(--border-color)", color: "var(--text-primary)" } : {}}
    >
      {price === 0 ? "Try for Free" : "Get Started →"}
    </Link>
  </div>
);

/* ─── Showcase Item ─────────────────────────────────────── */
const ShowcaseItem = ({ src, name, category, delay }) => (
  <div
    className="group relative aspect-square rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-500"
    style={{ animationDelay: delay }}
  >
    <div className="w-full h-full p-4 flex items-center justify-center bg-white dark:bg-black/20">
      <img
        src={src}
        alt={name}
        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
      <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full mb-1">
          {category}
        </span>
        <p className="text-white font-black text-base tracking-tight mb-1">{name}</p>
        <div className="w-6 h-1 brand-gradient rounded-full" />
      </div>
    </div>
    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg border border-white/10">
      <span className="text-white text-xs">✨</span>
    </div>
  </div>
);

/* ─── Main Home Page ─────────────────────────────────────── */
export default function Home() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [typed, setTyped] = useState("");
  const phrases = ["your Brand Logo", "Brand Guidelines", "Mockup Previews", "your Identity"];
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);

  // Typewriter effect (continuous loop)
  useEffect(() => {
    let timeoutId;

    const tick = () => {
      const phrase = phrases[phraseIdx.current];

      if (!deleting.current) {
        charIdx.current++;
        setTyped(phrase.slice(0, charIdx.current));

        if (charIdx.current === phrase.length) {
          deleting.current = true;
          timeoutId = setTimeout(tick, 1800);
          return;
        }
        timeoutId = setTimeout(tick, 80);
      } else {
        charIdx.current--;
        setTyped(phrase.slice(0, charIdx.current));

        if (charIdx.current === 0) {
          deleting.current = false;
          phraseIdx.current = (phraseIdx.current + 1) % phrases.length;
          timeoutId = setTimeout(tick, 400);
          return;
        }
        timeoutId = setTimeout(tick, 50);
      }
    };

    timeoutId = setTimeout(tick, 80);

    return () => clearTimeout(timeoutId);
  }, []);

  // Interactive Hero Preview Preset State
  const previewPresets = [
    {
      id: "pulseshift",
      title: "PulseShift",
      category: "Tech & Audio",
      style: "Cyber Neon",
      src: "/showcase/PulseShift.png",
      colors: ["#7c3aed", "#3b82f6", "#06b6d4"],
      font: "Inter / Cybertech",
      prompt: "Futuristic audio waveform pulse monogram, neon cyan & electric violet gradient, minimalist tech emblem, 8k vector finish.",
    },
    {
      id: "leafstart",
      title: "LeafStart",
      category: "Eco & Nature",
      style: "Organic Bio",
      src: "/showcase/LeafStart.png",
      colors: ["#10b981", "#059669", "#84cc16"],
      font: "Outfit / Geometric",
      prompt: "Sprouting organic leaf geometric mark, natural sustainable brand identity, clean lines, fresh emerald & lime gradient.",
    },
    {
      id: "craftoria",
      title: "Craftoria",
      category: "Artisan Studio",
      style: "Warm Luxury",
      src: "/showcase/Craftoria.jpg",
      colors: ["#f59e0b", "#d97706", "#78350f"],
      font: "Playfair / Serif",
      prompt: "Handcrafted artisan workshop monogram, elegant typography, warm amber gold tones, timeless luxury stamp aesthetic.",
    },
    {
      id: "quickbite",
      title: "QuickBite",
      category: "Food Delivery",
      style: "Dynamic Speed",
      src: "/showcase/QuickBite.png",
      colors: ["#ef4444", "#f97316", "#fbbf24"],
      font: "Plus Jakarta / Bold",
      prompt: "Express food delivery dynamic smile symbol, energetic fiery crimson and mango orange gradient, modern app icon design.",
    },
  ];

  const [activePreset, setActivePreset] = useState(previewPresets[0]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);

  const showcaseLogos = [
    { name: "CoreFlex", src: "/showcase/CoreFlex.jpg", category: "Tech & SaaS" },
    { name: "CoreLink", src: "/showcase/CoreLink.png", category: "Tech & SaaS" },
    { name: "Craftoria", src: "/showcase/Craftoria.jpg", category: "Creative" },
    { name: "ElleCove", src: "/showcase/ElleCove.png", category: "E-Commerce" },
    { name: "LeafStart", src: "/showcase/LeafStart.png", category: "Eco & Nature" },
    { name: "LearnAxis", src: "/showcase/LearnAxis.png", category: "Tech & SaaS" },
    { name: "NaturaE", src: "/showcase/NaturaE.png", category: "Eco & Nature" },
    { name: "Petale", src: "/showcase/Petale.png", category: "Eco & Nature" },
    { name: "PixelNest", src: "/showcase/PixelNest.png", category: "Creative" },
    { name: "PixelPollen", src: "/showcase/PixelPollen.jpg", category: "Creative" },
    { name: "PulseShift", src: "/showcase/PulseShift.png", category: "Tech & SaaS" },
    { name: "QuickBite", src: "/showcase/QuickBite.png", category: "E-Commerce" },
  ];

  const categories = ["All", "Tech & SaaS", "E-Commerce", "Eco & Nature", "Creative"];

  const filteredLogos = selectedCategory === "All"
    ? showcaseLogos
    : showcaseLogos.filter((logo) => logo.category === selectedCategory);

  const faqs = [
    {
      q: "How does BrandyBot's conversational logo AI work?",
      a: "Unlike static template generators, BrandyBot acts as your personal branding art director. You chat naturally about your industry, aesthetic goals, and target audience. Our AI agent translates your conversation into engineered 50-line Stable Diffusion prompts to create unique, original logos in under two minutes.",
    },
    {
      q: "Do I get full commercial rights to my generated logos?",
      a: "Yes! All logos created on BrandyBot are 100% yours to trademark, use on merchandise, websites, client projects, and marketing collateral worldwide without recurring royalty fees.",
    },
    {
      q: "What is included in the Brand Guidelines PDF?",
      a: "Your brand guidelines automatically extract primary and secondary color palettes (HEX/RGB codes), typographic pairings with font recommendations, clear space rules, icon usage, and voice-and-tone guidance.",
    },
    {
      q: "Can I preview my logo on real-world products?",
      a: "Yes! The integrated Mockup Studio instantly projects your logo onto business cards, luxury t-shirts, ceramic mugs, smartphone screens, and social banners with realistic 3D lighting and shadows.",
    },
    {
      q: "Is there a free trial or guest access?",
      a: "Yes! Guests can generate 1 free logo without even creating an account or entering a credit card. Creating a free account gives you 3 complimentary credits to test all features.",
    },
  ];

  return (
    <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "var(--nav-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border-color)" }}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/brandybot_icon.png"
            alt="BrandyBot Logo"
            className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
            onError={e => e.target.style.display = "none"}
          />
          <span className="font-black text-xl brand-gradient-text tracking-tight">BrandyBot</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</a>
          <a href="#studio-demo" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Live Demo</a>
          <a href="#how-it-works" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">How It Works</a>
          <a href="#showcase" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Showcase</a>
          <a href="#pricing" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition text-sm flex items-center justify-center hover:scale-105 shadow-sm"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          {user ? (
            <Link to="/dashboard" className="px-5 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold hover:opacity-95 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all shadow-md">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-purple-500/30 transition text-[var(--text-primary)]">
                Login
              </Link>
              <Link to="/signup" className="px-5 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold hover:opacity-95 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all shadow-md">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-28 text-center">
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[550px] h-[550px] rounded-full blur-[140px] opacity-25 brand-gradient pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[480px] h-[480px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "linear-gradient(to right, #3b82f6, #06b6d4)" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Announcement Badge */}
          <div className="badge-pill mb-6 sm:mb-8 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
            </span>
            <span>🚀 New in 2026 — Conversational Logo AI</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.12] tracking-tight mb-5 sm:mb-6" style={{ color: "var(--text-primary)" }}>
            Build{" "}
            <span className="brand-gradient-text relative inline-block">
              {typed || "\u00A0"}
              <span
                className="inline-block w-[3px] md:w-[4px] h-[0.78em] ml-1.5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full align-middle animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                aria-hidden="true"
              />
            </span>{" "}
            with AI
          </h1>

          {/* Feature Pills Row — replaces old floating corner cards */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-7">
            <FeaturePill icon="🎨" label="Logo AI" gradient="linear-gradient(135deg,rgba(124,58,237,0.85),rgba(59,130,246,0.85))" />
            <FeaturePill icon="📋" label="Brand Guidelines" gradient="linear-gradient(135deg,rgba(236,72,153,0.85),rgba(124,58,237,0.85))" />
            <FeaturePill icon="👕" label="3D Mockup Studio" gradient="linear-gradient(135deg,rgba(245,158,11,0.85),rgba(239,68,68,0.85))" />
            <FeaturePill icon="🤖" label="AI Agent Chat" gradient="linear-gradient(135deg,rgba(16,185,129,0.85),rgba(59,130,246,0.85))" />
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal px-2" style={{ color: "var(--text-secondary)" }}>
            Just <strong className="font-bold" style={{ color: "var(--text-primary)" }}>chat</strong> with BrandyBot — describe your brand, and watch AI design your logo, craft comprehensive brand guidelines, and generate realistic mockups in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              to={user ? "/logo-agent" : "/signup"}
              className="w-full sm:w-auto px-8 sm:px-9 py-3.5 sm:py-4 rounded-2xl brand-gradient text-white font-bold text-base sm:text-lg hover:opacity-95 transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>✨ Start Creating for Free</span>
            </Link>
            <a
              href="#studio-demo"
              className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-[var(--bg-card-hover)] transition-all duration-300 border flex items-center justify-center gap-2 hover:border-purple-500/40"
              style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            >
              <span>Explore Interactive Studio</span>
              <span className="text-purple-500 font-bold">↓</span>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            <span className="flex items-center gap-1.5">
              <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> No credit card required
            </span>
            <span className="hidden sm:inline opacity-30">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-blue-600 dark:text-blue-400 font-bold">⚡</span> 1 free logo for guests
            </span>
            <span className="hidden sm:inline opacity-30">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">🎁</span> 3 free credits on signup
            </span>
          </div>
        </div>
      </section>

      {/* ── Interactive Live Studio Mockup (Hero Showcase) ── */}
      <section id="studio-demo" className="px-6 pb-20 max-w-5xl mx-auto -mt-10 relative z-20">
        <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-2xl border border-[var(--border-color)]">
          {/* Mockup Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-[var(--border-color)] gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-bold text-[var(--text-muted)] hidden sm:inline">
                brandybot.ai/studio/preview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                AI Engine Active • Stable Diffusion XL
              </span>
            </div>
          </div>

          {/* Interactive Preset Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Click a Brand Preset:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {previewPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setActivePreset(preset)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activePreset.id === preset.id
                    ? "brand-gradient text-white shadow-md scale-105"
                    : "border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)]"
                    }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Studio Preview Content Grid */}
          <div className="grid md:grid-cols-12 gap-6 items-center">
            {/* Left: Chat & Prompt Breakdown */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-lg brand-gradient flex items-center justify-center text-white text-xs font-bold">
                    AI
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                    BrandyBot Assistant
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] ml-auto">Just now</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  "I've tailored a custom 50-line prompt for <strong className="text-[var(--text-primary)]">{activePreset.title}</strong>, emphasizing its {activePreset.style} aesthetic with synchronized brand guidelines."
                </p>
              </div>

              {/* Prompt Box */}
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Engineered SD Prompt
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/20">
                    50 Lines • Vector 8K
                  </span>
                </div>
                <p className="text-xs font-mono line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                  "{activePreset.prompt}"
                </p>
              </div>

              {/* Synchronized Brand Kit preview */}
              <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold block mb-1" style={{ color: "var(--text-primary)" }}>
                    Synced Palette
                  </span>
                  <div className="flex items-center gap-2">
                    {activePreset.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-lg shadow-sm border border-white/20" style={{ background: color }} />
                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold block mb-1" style={{ color: "var(--text-primary)" }}>
                    Typography
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {activePreset.font}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actual Generated Logo Card */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="w-full max-w-sm aspect-square rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-black/30 border border-[var(--border-color)] shadow-xl group">
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold brand-gradient text-white shadow-md">
                  {activePreset.style}
                </div>
                <img
                  src={activePreset.src}
                  alt={activePreset.title}
                  className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-105 filter drop-shadow-md"
                />
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between px-3 py-2 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs">
                  <span className="font-bold">{activePreset.title}</span>
                  <span className="text-emerald-400 font-semibold">✓ Ready to Export</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics / Social Proof Bar ── */}
      <section className="px-6 py-12 border-y border-[var(--border-color)]" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-3xl sm:text-5xl font-black brand-gradient-text tracking-tight block mb-1">
              10,000+
            </span>
            <span className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Logos Generated
            </span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black brand-gradient-text tracking-tight block mb-1">
              &lt; 60s
            </span>
            <span className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Average Generation
            </span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black brand-gradient-text tracking-tight block mb-1">
              4.8 / 5.0
            </span>
            <span className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Creator Satisfaction (⭐⭐⭐⭐⭐)
            </span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black brand-gradient-text tracking-tight block mb-1">
              100%
            </span>
            <span className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Commercial Rights Included
            </span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="badge-pill mb-3">
            ✨ Core Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 brand-gradient-text tracking-tight">
            Everything You Need to Launch
          </h2>
          <p className="text-base sm:text-lg max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            A complete AI branding suite in one unified platform — no designers required.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon="🤖"
            tag="Conversational"
            title="Logo Agent AI"
            desc="Chat naturally about your brand vision. The AI understands your style, colors, and industry nuance to craft the ideal logo."
            gradient="from-purple-600 to-blue-500"
            delay="0ms"
          />
          <FeatureCard
            icon="🎨"
            tag="Ultra Detailed"
            title="50-Line SD Prompts"
            desc="Advanced prompt engineering synthesizes hyper-specific Stable Diffusion prompts for crisp vector marks and emblems."
            gradient="from-pink-600 to-purple-600"
            delay="100ms"
          />
          <FeatureCard
            icon="📋"
            tag="Complete PDF"
            title="Brand Guidelines"
            desc="Get full brand books complete with color palettes, typography pairings, clear space rules, and voice guidance in one click."
            gradient="from-blue-600 to-cyan-500"
            delay="200ms"
          />
          <FeatureCard
            icon="👕"
            tag="Real Previews"
            title="Mockup Studio"
            desc="Preview your logo on real-world merchandise, business cards, apparel, billboards, and digital screens with 3D lighting."
            gradient="from-amber-500 to-orange-500"
            delay="300ms"
          />
        </div>
      </section>

      {/* ── Comparison Table (Why Founders Choose BrandyBot) ── */}
      <section className="px-6 py-20 border-y border-[var(--border-color)]" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge-pill mb-3">
              ⚖️ The Smart Choice
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 brand-gradient-text tracking-tight">
              Traditional Agencies vs. BrandyBot
            </h2>
            <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              See why modern startups launch their brand identities with BrandyBot.
            </p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-xl">
            <div className="grid grid-cols-12 p-4 sm:p-5 border-b border-[var(--border-color)] font-bold text-xs sm:text-sm bg-[var(--bg-input)]">
              <div className="col-span-5 text-[var(--text-muted)] uppercase tracking-wider">Feature</div>
              <div className="col-span-3 text-center text-red-500">Design Agency</div>
              <div className="col-span-4 text-center brand-gradient-text font-black">BrandyBot AI</div>
            </div>

            <div className="divide-y divide-[var(--border-color)] text-xs sm:text-sm font-semibold">
              <div className="grid grid-cols-12 p-4 sm:p-5 items-center">
                <div className="col-span-5 text-[var(--text-primary)]">Starting Cost</div>
                <div className="col-span-3 text-center text-[var(--text-muted)] line-through">$1,500 - $4,000</div>
                <div className="col-span-4 text-center font-black text-emerald-600 dark:text-emerald-400">Free to Start / $4.99</div>
              </div>
              <div className="grid grid-cols-12 p-4 sm:p-5 items-center">
                <div className="col-span-5 text-[var(--text-primary)]">Turnaround Time</div>
                <div className="col-span-3 text-center text-[var(--text-muted)]">2 - 4 Weeks</div>
                <div className="col-span-4 text-center font-black text-emerald-600 dark:text-emerald-400">Under 2 Minutes</div>
              </div>
              <div className="grid grid-cols-12 p-4 sm:p-5 items-center">
                <div className="col-span-5 text-[var(--text-primary)]">Brand Style Guide PDF</div>
                <div className="col-span-3 text-center text-[var(--text-muted)]">+$500 Extra Fee</div>
                <div className="col-span-4 text-center font-black text-emerald-600 dark:text-emerald-400">Included Automatically</div>
              </div>
              <div className="grid grid-cols-12 p-4 sm:p-5 items-center">
                <div className="col-span-5 text-[var(--text-primary)]">3D Mockup Studio</div>
                <div className="col-span-3 text-center text-[var(--text-muted)]">Manual Photoshop</div>
                <div className="col-span-4 text-center font-black text-emerald-600 dark:text-emerald-400">Instant 3D Previews</div>
              </div>
              <div className="grid grid-cols-12 p-4 sm:p-5 items-center">
                <div className="col-span-5 text-[var(--text-primary)]">Revisions & Ideation</div>
                <div className="col-span-3 text-center text-[var(--text-muted)]">2 Rounds Max</div>
                <div className="col-span-4 text-center font-black text-emerald-600 dark:text-emerald-400">Unlimited Conversational Edits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="badge-pill mb-3">
            ⚡ Seamless Process
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 brand-gradient-text tracking-tight">How It Works</h2>
          <p className="text-base sm:text-lg max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            Three simple steps to a complete, launch-ready brand identity
          </p>
        </div>
        <div className="relative grid md:grid-cols-3 gap-8">
          <StepCard
            num="1"
            icon="💬"
            title="Chat Your Vision"
            desc="Tell BrandyBot about your business, style, colors, and industry. No rigid design forms — just a friendly conversation."
          />
          <StepCard
            num="2"
            icon="🧠"
            title="AI Designs It"
            desc="Our prompt engineer generates a high-definition 50-line Stable Diffusion prompt and creates custom vector marks in seconds."
          />
          <StepCard
            num="3"
            icon="⬇"
            title="Download & Launch"
            desc="Receive your logo assets, comprehensive Brand Guidelines PDF, and realistic merchandise mockups ready for production."
          />
        </div>
      </section>

      {/* ── Logo Showcase Gallery (with Category Filter) ── */}
      <section id="showcase" className="px-6 py-24 border-t border-[var(--border-color)]" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge-pill mb-3">
              🎨 Community Showcase
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 brand-gradient-text tracking-tight">AI-Generated Brands</h2>
            <p className="text-base sm:text-lg max-w-lg mx-auto mb-8" style={{ color: "var(--text-secondary)" }}>
              Explore real brand logos generated with BrandyBot in under 2 minutes
            </p>

            {/* Filter Pills */}
            <div className="flex items-center justify-center flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${selectedCategory === cat
                    ? "brand-gradient text-white shadow-md scale-105"
                    : "glass-card border border-[var(--border-color)] hover:border-purple-500/40 text-[var(--text-secondary)]"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {filteredLogos.map((logo, i) => (
              <ShowcaseItem
                key={logo.name}
                src={logo.src}
                name={logo.name}
                category={logo.category}
                delay={`${i * 50}ms`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="badge-pill mb-3">
            💎 Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 brand-gradient-text tracking-tight">Simple Pricing</h2>
          <p className="text-base sm:text-lg max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            Start for free, then scale as your business expands. No hidden monthly subscriptions.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <PricingCard
            name="Guest"
            credits={0}
            price={0}
            popular={false}
            gradient="from-gray-500 to-gray-600"
            features={[
              "1 free logo generation",
              "High-resolution PNG download",
              "No credit card required",
              "Instant guest access",
            ]}
          />
          <PricingCard
            name="Starter"
            credits={50}
            price={4.99}
            popular={true}
            gradient="from-purple-600 to-blue-500"
            features={[
              "50 logo generations",
              "Complete Brand Guidelines PDF",
              "3D Mockup Studio access",
              "Saved chat history & revisions",
              "Full commercial usage rights",
            ]}
          />
          <PricingCard
            name="Pro"
            credits={150}
            price={9.99}
            popular={false}
            gradient="from-pink-600 to-purple-600"
            features={[
              "150 logo generations",
              "Everything in Starter plan",
              "Priority GPU processing",
              "Ultra HD 8K downloads",
              "Commercial copyright certificate",
            ]}
          />
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="px-6 py-20 border-t border-[var(--border-color)]" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="badge-pill mb-3">
              ❓ Got Questions?
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 brand-gradient-text tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              Everything you need to know about the platform, copyright, and delivery.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="glass-card rounded-2xl border border-[var(--border-color)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base transition hover:bg-[var(--bg-card-hover)]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span>{faq.q}</span>
                    <span className="w-7 h-7 rounded-full brand-gradient text-white flex items-center justify-center text-sm shrink-0 transition-transform duration-200">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm leading-relaxed border-t border-[var(--border-color)] pt-3" style={{ color: "var(--text-secondary)" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden px-6 py-24 brand-gradient text-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 bg-white/20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-300/30 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase mb-6 border border-white/20">
            ⚡ Instant AI Branding
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Ready to Build Your Brand?
          </h2>
          <p className="text-purple-100 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed opacity-95">
            Join thousands of founders, designers, and entrepreneurs creating stunning brands with AI.
          </p>
          <Link
            to={user ? "/logo-agent" : "/signup"}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-purple-700 font-black text-lg hover:scale-105 hover:shadow-2xl hover:shadow-black/25 transition-all duration-300 shadow-xl"
          >
            <span>Start Creating Free</span>
            <span className="text-xl">→</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-12 text-center" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-color)" }}>
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <img
            src="/brandybot_icon.png"
            alt="BrandyBot Logo"
            className="w-8 h-8 object-contain"
            onError={e => e.target.style.display = "none"}
          />
          <span className="font-black text-xl brand-gradient-text">BrandyBot</span>
        </div>
        <div className="flex justify-center gap-8 text-sm font-semibold mb-6" style={{ color: "var(--text-secondary)" }}>
          <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
          <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</a>
          <Link to="/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Login</Link>
          <Link to="/signup" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Sign Up</Link>
        </div>
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          © 2026 BrandyBot. All rights reserved. Built with ❤️ and Conversational AI.
        </p>
      </footer>

      {/* ── Global Chatbot ── */}
      <Chatbot />
    </div>
  );
}
