import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/Chatbot";

/* ─── Floating Logo Card ─────────────────────────────────── */
const FloatingCard = ({ style, gradient, icon, label, delay }) => (
  <div
    className="absolute rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-2 text-white text-center animate-pulse-slow"
    style={{
      background: gradient,
      width: 90,
      height: 90,
      animationDelay: delay,
      ...style,
    }}
  >
    <span className="text-3xl">{icon}</span>
    <span className="text-xs font-semibold opacity-90">{label}</span>
  </div>
);

/* ─── Feature Card ───────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, gradient, delay }) => (
  <div
    className="p-6 rounded-3xl flex flex-col gap-4 animate-fade-in-up glass-card hover:-translate-y-1 transition-transform"
    style={{ animationDelay: delay, border: "1px solid var(--border-color)" }}
  >
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${gradient} shadow-xl`}
    >
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {desc}
      </p>
    </div>
  </div>
);

/* ─── Step Card ─────────────────────────────────────────── */
const StepCard = ({ num, icon, title, desc }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-full brand-gradient flex items-center justify-center text-white text-xl font-black shadow-2xl mb-4 relative z-10">
      {num}
    </div>
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{desc}</p>
  </div>
);

/* ─── Pricing Card ──────────────────────────────────────── */
const PricingCard = ({ name, credits, price, features, gradient, popular }) => (
  <div
    className={`relative p-6 rounded-3xl flex flex-col transition-all hover:-translate-y-1 ${popular ? "scale-105 shadow-2xl" : ""} glass-card`}
    style={{ border: popular ? "2px solid #7c3aed" : "1px solid var(--border-color)" }}
  >
    {popular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full brand-gradient text-white text-xs font-bold shadow-lg">
        ⭐ MOST POPULAR
      </div>
    )}
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg`}>
      {credits === 0 ? "∞" : credits}
    </div>
    <h3 className="text-xl font-black mb-1" style={{ color: "var(--text-primary)" }}>{name}</h3>
    <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>{credits === 0 ? "1 free generation" : `${credits} logo credits`}</p>
    <div className="flex items-baseline gap-1 mb-6">
      <span className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>{price === 0 ? "Free" : `$${price}`}</span>
      {price > 0 && <span className="text-sm" style={{ color: "var(--text-muted)" }}>one-time</span>}
    </div>
    <ul className="space-y-2 mb-6 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span className="text-green-400 font-bold">✓</span> {f}
        </li>
      ))}
    </ul>
    <Link
      to={price === 0 ? "/" : "/purchase"}
      className={`w-full py-3 rounded-2xl font-bold text-sm text-center transition ${popular ? "brand-gradient text-white hover:opacity-90" : "border hover:bg-[var(--bg-card-hover)]"}`}
      style={!popular ? { borderColor: "var(--border-color)", color: "var(--text-primary)" } : {}}
    >
      {price === 0 ? "Try for Free" : "Get Started →"}
    </Link>
  </div>
);

/* ─── Showcase Item ─────────────────────────────────────── */
const ShowcaseItem = ({ src, name, delay }) => (
  <div
    className="group relative aspect-square rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] animate-fade-in-up shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
    style={{ animationDelay: delay }}
  >
    <img src={src} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <p className="text-white font-black text-lg tracking-tight mb-1">{name}</p>
        <div className="w-8 h-1 brand-gradient rounded-full" />
      </div>
    </div>
    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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

  // Typewriter effect
  useEffect(() => {
    const interval = setInterval(() => {
      const phrase = phrases[phraseIdx.current];
      if (!deleting.current) {
        setTyped(phrase.slice(0, charIdx.current + 1));
        charIdx.current++;
        if (charIdx.current === phrase.length) {
          deleting.current = true;
          clearInterval(interval);
          setTimeout(() => {
            const del = setInterval(() => {
              charIdx.current--;
              setTyped(phrase.slice(0, charIdx.current));
              if (charIdx.current === 0) {
                clearInterval(del);
                deleting.current = false;
                phraseIdx.current = (phraseIdx.current + 1) % phrases.length;
              }
            }, 50);
          }, 1800);
        }
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const showcaseLogos = [
    { name: "CoreFlex", src: "/showcase/CoreFlex.jpg" },
    { name: "CoreLink", src: "/showcase/CoreLink.png" },
    { name: "Craftoria", src: "/showcase/Craftoria.jpg" },
    { name: "ElleCove", src: "/showcase/ElleCove.png" },
    { name: "LeafStart", src: "/showcase/LeafStart.png" },
    { name: "LearnAxis", src: "/showcase/LearnAxis.png" },
    { name: "NaturaE", src: "/showcase/NaturaE.png" },
    { name: "Petale", src: "/showcase/Petale.png" },
    { name: "PixelNest", src: "/showcase/PixelNest.png" },
    { name: "PixelPollen", src: "/showcase/PixelPollen.jpg" },
    { name: "PulseShift", src: "/showcase/PulseShift.png" },
    { name: "QuickBite", src: "/showcase/QuickBite.png" },
  ];

  return (
    <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "var(--nav-bg)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center shadow-lg">
            <img src="/brandybot_icon.png" alt="Logo" className="w-5 h-5 object-contain" onError={e => e.target.style.display = "none"} />
          </div>
          <span className="font-black text-xl brand-gradient-text">BrandyBot</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          <a href="#features" className="hover:text-purple-400 transition">Features</a>
          <a href="#how-it-works" className="hover:text-purple-400 transition">How It Works</a>
          <a href="#pricing" className="hover:text-purple-400 transition">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] transition text-sm">{isDark ? "☀️" : "🌙"}</button>
          {user ? (
            <Link to="/dashboard" className="px-4 py-2 rounded-xl brand-gradient text-white text-sm font-bold hover:opacity-90 transition shadow-lg">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition" style={{ color: "var(--text-secondary)" }}>Login</Link>
              <Link to="/signup" className="px-4 py-2 rounded-xl brand-gradient text-white text-sm font-bold hover:opacity-90 transition shadow-lg">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-28 text-center">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 brand-gradient pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "linear-gradient(to right, #3b82f6, #06b6d4)" }} />

        {/* Floating cards */}
        <FloatingCard style={{ top: "10%", left: "8%" }} gradient="linear-gradient(135deg,#7c3aed,#3b82f6)" icon="🎨" label="Logo" delay="0ms" />
        <FloatingCard style={{ top: "15%", right: "8%" }} gradient="linear-gradient(135deg,#ec4899,#7c3aed)" icon="📋" label="Guidelines" delay="400ms" />
        <FloatingCard style={{ bottom: "15%", left: "12%" }} gradient="linear-gradient(135deg,#f59e0b,#ef4444)" icon="👕" label="Mockup" delay="800ms" />
        <FloatingCard style={{ bottom: "20%", right: "10%" }} gradient="linear-gradient(135deg,#10b981,#3b82f6)" icon="🤖" label="AI Chat" delay="1200ms" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
            🚀 New in 2026 - Conversational Logo AI
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Build{" "}
            <span className="brand-gradient-text">
              {typed}<span className="animate-pulse">|</span>
            </span>
            {" "}with AI
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Just <strong>chat</strong> with BrandyBot - describe your brand, and watch AI design your logo, craft your brand guidelines, and generate mockups in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/logo-agent" : "/signup"} className="px-8 py-4 rounded-2xl brand-gradient text-white font-bold text-lg hover:opacity-90 transition shadow-2xl hover:scale-105">
              ✨ Start Creating for Free
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[var(--bg-card-hover)] transition border"
              style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
              Watch How It Works ↓
            </a>
          </div>

          <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
            No credit card required · 1 free logo for guests · 3 free credits for registered users
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-3 brand-gradient-text">Everything You Need</h2>
          <p style={{ color: "var(--text-secondary)" }}>A complete AI branding suite in one platform</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard icon="🤖" title="Logo Agent AI" desc="Chat naturally about your brand. The AI understands your vision and generates the perfect logo through conversation." gradient="from-purple-600 to-blue-500" delay="0ms" />
          <FeatureCard icon="🎨" title="50-Line SD Prompts" desc="Advanced prompt engineering generates ultra-detailed Stable Diffusion prompts for professional-grade logo imagery." gradient="from-pink-600 to-purple-600" delay="100ms" />
          <FeatureCard icon="📋" title="Brand Guidelines" desc="Get a complete brand style guide - color palettes, typography, voice and tone - synced to your actual logo." gradient="from-blue-600 to-cyan-500" delay="200ms" />
          <FeatureCard icon="👕" title="Mockup Studio" desc="Preview your logo on business cards, t-shirts, mugs, website heroes, and social banners instantly." gradient="from-amber-500 to-orange-500" delay="300ms" />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-3 brand-gradient-text">How It Works</h2>
            <p style={{ color: "var(--text-secondary)" }}>Three simple steps to a complete brand identity</p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connector lines (desktop only) */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 brand-gradient opacity-40" />
            <StepCard num="1" icon="💬" title="Chat Your Vision" desc="Tell BrandyBot about your brand - industry, style, colors. No forms, just conversation." />
            <StepCard num="2" icon="🧠" title="AI Designs It" desc="Advanced AI generates a professional logo from a 50-line engineered prompt in under 2 minutes." />
            <StepCard num="3" icon="⬇" title="Download & Use" desc="Get your logo, brand guidelines PDF, and mockups. Ready for use across all platforms." />
          </div>
        </div>
      </section>

      {/* ── Logo Showcase ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-3 brand-gradient-text">AI-Generated Brands</h2>
          <p style={{ color: "var(--text-secondary)" }}>Real logos built with BrandyBot in under 2 minutes</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {showcaseLogos.map((logo, i) => (
            <ShowcaseItem
              key={i}
              src={logo.src}
              name={logo.name}
              delay={`${i * 100}ms`}
            />
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-3 brand-gradient-text">Simple Pricing</h2>
            <p style={{ color: "var(--text-secondary)" }}>Start free, scale as you grow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <PricingCard name="Guest" credits={0} price={0} popular={false} gradient="from-gray-500 to-gray-600"
              features={["1 free logo generation", "Download PNG", "No sign-up required"]} />
            <PricingCard name="Starter" credits={50} price={4.99} popular={true} gradient="from-purple-600 to-blue-500"
              features={["50 logo generations", "Brand guidelines", "Mockup studio", "Chat history", "All styles"]} />
            <PricingCard name="Pro" credits={150} price={9.99} popular={false} gradient="from-pink-600 to-purple-600"
              features={["150 logo generations", "Everything in Starter", "Priority generation", "HD downloads", "Commercial rights"]} />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 py-24 brand-gradient text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Ready to Build Your Brand?
        </h2>
        <p className="text-purple-200 text-lg mb-8 max-w-xl mx-auto">
          Join thousands of founders, designers, and entrepreneurs creating stunning brands with AI.
        </p>
        <Link to={user ? "/logo-agent" : "/signup"} className="inline-block px-10 py-4 rounded-2xl bg-white text-purple-600 font-black text-lg hover:scale-105 transition shadow-2xl">
          Start Creating Free →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-10 text-center" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-color)" }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl brand-gradient flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-black">B</span>
          </div>
          <span className="font-black text-lg brand-gradient-text">BrandyBot</span>
        </div>
        <div className="flex justify-center gap-6 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          <Link to="/" className="hover:text-purple-400 transition">Home</Link>
          <Link to="/login" className="hover:text-purple-400 transition">Login</Link>
          <Link to="/signup" className="hover:text-purple-400 transition">Sign Up</Link>
          <Link to="/purchase" className="hover:text-purple-400 transition">Pricing</Link>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 BrandyBot. All rights reserved. Built with ❤️ and AI.</p>
      </footer>

      {/* ── Global Chatbot ── */}
      <Chatbot />
    </div>
  );
}
