import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { supabase } from './supabase';

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
const monthKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`; };
const thisMonth = () => monthKey(new Date());
const ADMIN_EMAIL = "v7nilz@gmail.com";

// ─── Icons (SVGs in /public/icons) ────────────────────────────
const ICONS = {
  queue: "inbox-svgrepo-com.svg",
  history: "circle-check-svgrepo-com.svg",
  stats: "chart-column-svgrepo-com.svg",
  user: "circle-user-svgrepo-com.svg",
  check: "check-svgrepo-com.svg",
  bolt: "bolt-svgrepo-com.svg",
  edit: "pen-svgrepo-com.svg",
  warning: "triangle-exclamation-svgrepo-com.svg",
  music: "music-svgrepo-com.svg",
  money: "circle-dollar-svgrepo-com.svg",
  proof: "image-square-check-svgrepo-com.svg",
  theme: "palette-svgrepo-com.svg",
  party: "party-horn-svgrepo-com.svg",
  download: "arrow-circle-down-svgrepo-com.svg",
  darkTheme: "stars-svgrepo-com.svg",
  lightTheme: "sun-svgrepo-com.svg",
  pinkTheme: "heart-svgrepo-com.svg",
};

function SvgIcon({ name, theme = "dark", className = "", alt = "" }) {
  const file = ICONS[name];
  if (!file) return null;
  const filter = theme === "light" ? "none" : "invert(1)";
  return (
    <img
      src={`/icons/${file}`}
      alt={alt}
      draggable="false"
      className={className}
      style={{ filter }}
    />
  );
}

// ─── Theme ───────────────────────────────────────────────────
const themes = {
  dark: {
    bg: "bg-[#080810]",
    bgStyle: {
      background: "#080810",
      backgroundImage: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(217,70,239,0.10) 0%, transparent 55%)"
    },
    card: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5",
    base: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl",
    input: "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/10 transition-all",
    btn: "px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95",
    text: "text-white", subtext: "text-white/50", muted: "text-white/30",
  },
  light: {
    bg: "bg-[#e8f8fc]",
    bgStyle: {
      background: "#e8f8fc",
      backgroundImage: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(6,182,212,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(20,184,166,0.10) 0%, transparent 55%)"
    },
    card: "backdrop-blur-xl bg-white/70 border border-cyan-200/60 rounded-2xl p-5",
    base: "backdrop-blur-xl bg-white/70 border border-cyan-200/60 rounded-2xl",
    input: "w-full bg-white/80 border border-cyan-300/50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all",
    btn: "px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95",
    text: "text-slate-800", subtext: "text-slate-600", muted: "text-slate-400",
  },
  pink: {
    bg: "bg-[#1a0a10]",
    bgStyle: {
      background: "#1a0a10",
      backgroundImage: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(244,114,182,0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(236,72,153,0.14) 0%, transparent 55%)"
    },
    card: "backdrop-blur-xl bg-pink-400/5 border border-pink-300/10 rounded-2xl p-5",
    base: "backdrop-blur-xl bg-pink-400/5 border border-pink-300/10 rounded-2xl",
    input: "w-full bg-pink-400/5 border border-pink-300/15 rounded-xl px-4 py-3 text-white placeholder-pink-300/30 focus:outline-none focus:border-pink-400/60 focus:bg-pink-400/10 transition-all",
    btn: "px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95",
    text: "text-white", subtext: "text-pink-200/60", muted: "text-pink-300/30",
  }
};

// ─── Confetti ────────────────────────────────────────────────
function Confetti({ onDone }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width, y: -10,
      r: Math.random() * 6 + 3,
      color: ["#8b5cf6","#d946ef","#ec4899","#f59e0b","#10b981","#3b82f6"][Math.floor(Math.random()*6)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
      vy: Math.random() * 3 + 1.5,
      vx: (Math.random() - 0.5) * 1.5,
    }));

    const TOTAL_FRAMES = 220;
    const FADE_START = 160;
    let frame = 0;
    let animId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alpha = frame < FADE_START
        ? 1
        : 1 - (frame - FADE_START) / (TOTAL_FRAMES - FADE_START);
      ctx.globalAlpha = Math.max(0, alpha);
      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += p.vy;
        p.x += p.vx;
        p.tilt = Math.sin(p.tiltAngle) * 12;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r * 0.4, p.tiltAngle, 0, Math.PI * 2);
        ctx.fill();
      });
      frame++;
      if (frame < TOTAL_FRAMES) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.globalAlpha = 1;
        onDone();
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" />;
}

// ─── Creator Carousel ────────────────────────────────────────
function CreatorCarousel({ creators }) {
  if (!creators.length) return null;
  const minItems = 20;
  const repeatCount = Math.ceil(minItems / creators.length) + 1;
  const items = Array.from({ length: repeatCount }, () => creators).flat();
  const singleSetWidth = creators.length * 168;
  const duration = Math.max(creators.length * 4, 18);

  return (
    <div className="w-full overflow-hidden py-8">
      <p className="text-center text-white/20 text-xs uppercase tracking-widest mb-6">trusted by creators</p>
      <div className="relative w-full">
        <style>{`
          @keyframes carouselScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-${singleSetWidth}px); }
          }
          .carousel-track {
            animation: carouselScroll ${duration}s linear infinite;
            will-change: transform;
          }
          .carousel-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="carousel-track flex gap-6" style={{ width: "max-content" }}>
          {items.map((c, i) => (
            <a key={i} href={c.tiktok_url || "#"} target="_blank" rel="noreferrer"
              className="flex flex-col items-center gap-2 shrink-0 group"
              style={{ width: "144px" }}>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-violet-400/50 transition-colors">
                {c.pfp_url ? (
                  <img src={c.pfp_url} alt={c.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <SvgIcon name="user" theme="dark" className="w-7 h-7 opacity-70" alt="" />
                  </div>
                )}
              </div>
              <p className="text-white/70 text-xs font-medium">@{c.username}</p>
              <p className="text-white/30 text-[10px]">{c.follower_count} followers</p>
            </a>
          ))}
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-10"
          style={{ background: "linear-gradient(to right, #080810, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-10"
          style={{ background: "linear-gradient(to left, #080810, transparent)" }} />
      </div>
    </div>
  );
}

// ─── Magnetic Card ───────────────────────────────────────────
function MagneticCard({ children }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, rot: 0 });
  const animRef = useRef(null);
  const current = useRef({ x: 0, y: 0, rot: 0 });
  const target = useRef({ x: 0, y: 0, rot: 0 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 120;
    const strength = Math.max(0, 1 - dist / maxDist);
    target.current = {
      x: dx * strength * 0.35,
      y: dy * strength * 0.35,
      rot: dx * strength * 0.04,
    };
  };

  const handleMouseLeave = () => {
    target.current = { x: 0, y: 0, rot: 0 };
  };

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      current.current.x = lerp(current.current.x, target.current.x, 0.1);
      current.current.y = lerp(current.current.y, target.current.y, 0.1);
      current.current.rot = lerp(current.current.rot, target.current.rot, 0.1);
      setTransform({ ...current.current });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-2 cursor-default"
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rot}deg)`,
        transition: "box-shadow 0.3s ease",
        boxShadow: Math.abs(transform.x) + Math.abs(transform.y) > 0.5
          ? "0 20px 40px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.15)"
          : "none",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

// ─── Floating Orb ────────────────────────────────────────────
function FloatingOrb({ emoji, top, left, right, bottom, animDur, animDelay, size = "3rem" }) {
  return (
    <div style={{
      position: "absolute",
      top, left, right, bottom,
      fontSize: size,
      animation: `orbFloat ${animDur}s ease-in-out ${animDelay}s infinite`,
      filter: "drop-shadow(0 0 20px rgba(139,92,246,0.4))",
      pointerEvents: "none",
      userSelect: "none",
      zIndex: 1,
    }}>
      {emoji}
    </div>
  );
}

// ─── Landing Page ────────────────────────────────────────────
function LandingPage({ onEnter, creators, exiting }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const reveal = (delay) => ({
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s, filter 0.7s ease ${delay}s`,
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0px)" : "translateY(20px)",
    filter: mounted ? "blur(0px)" : "blur(8px)",
  });

  const faqs = [
    { q: "What is Glaze?", a: "Glaze is a promo tracking tool built specifically for video editors who work with music artists and brands. Keep your client queue organized, track payments, and hit your monthly goals." },
    { q: "Is it really free?", a: "Yes, 100% free forever. No credit card required, no hidden fees. Built by creators, for creators." },
    { q: "How do I track my earnings?", a: "Simply add your promos with the amount you're getting paid. Glaze automatically calculates your lifetime earnings, monthly progress, and projections." },
    { q: "Can I organize by priority?", a: "Absolutely. Drag and drop to reorder, mark promos as priority, and see what's due today at a glance." },
    { q: "Is my data safe?", a: "Your data is stored securely with Supabase. We never share or sell your information." },
  ];

  const platforms = [
    { name: "TikTok",     emoji: "🎵", top: "8%",  left: "6%",   dur: 5.2, delay: 0    },
    { name: "Instagram",  emoji: "📸", top: "5%",  left: "38%",  dur: 6.8, delay: 0.5  },
    { name: "YouTube",    emoji: "▶️", top: "10%", right: "7%",  dur: 5.8, delay: 1.1  },
    { name: "Spotify",    emoji: "🎧", top: "52%", left: "3%",   dur: 4.9, delay: 0.3  },
    { name: "SoundCloud", emoji: "☁️", top: "55%", right: "4%",  dur: 6.2, delay: 0.8  },
    { name: "X",          emoji: "𝕏",  bottom:"8%",left: "16%",  dur: 5.5, delay: 1.4  },
    { name: "Snapchat",   emoji: "👻", bottom:"6%",right: "16%", dur: 6.0, delay: 0.6  },
  ];

  return (
    <div className="flex flex-col relative overflow-x-hidden" style={{
      background: "#080810",
      backgroundImage: "radial-gradient(ellipse 90% 60% at 15% 5%, rgba(139,92,246,0.22) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 85% 85%, rgba(217,70,239,0.14) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 60%)",
      transition: "opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease",
      opacity: exiting ? 0 : 1,
      transform: exiting ? "scale(0.97)" : "scale(1)",
      filter: exiting ? "blur(6px)" : "blur(0px)",
    }}>
      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-16px) rotate(2deg)} }
        @keyframes shimmerText { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes scrollLeft { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes cardIn { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .animate-scroll { animation: scrollLeft 28s linear infinite; }
      `}</style>

      {/* ── CENTERED PILL NAV ── */}
      <div style={reveal(0)} className="flex justify-center pt-7 px-4 relative z-20">
        <nav className="flex items-center gap-1 px-3 py-2 rounded-2xl backdrop-blur-2xl border"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="text-base font-black tracking-tighter text-white px-3 py-1">
            glaze<span className="text-violet-400">.</span>
          </span>
          <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.10)" }} />
          <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.9)"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>
            FAQ
          </button>
          <button onClick={onEnter} className="text-sm px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.9)"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>
            Login
          </button>
          <button onClick={onEnter}
            className="ml-2 px-5 py-2 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a21caf)", boxShadow: "0 0 20px rgba(139,92,246,0.35)" }}>
            Get Started
          </button>
        </nav>
      </div>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-36 z-10 overflow-hidden">

        {/* Floating emoji orbs */}
        <FloatingOrb emoji="🎵" top="10%"  left="5%"   animDur={5.2} animDelay={0}   size="2.8rem" />
        <FloatingOrb emoji="💸" top="20%"  right="6%"  animDur={6.1} animDelay={0.7} size="2.6rem" />
        <FloatingOrb emoji="🎧" top="58%"  left="3%"   animDur={4.9} animDelay={0.3} size="2.4rem" />
        <FloatingOrb emoji="📱" top="62%"  right="4%"  animDur={5.7} animDelay={1.0} size="2.5rem" />
        <FloatingOrb emoji="✨" top="35%"  left="10%"  animDur={7.0} animDelay={0.5} size="1.6rem" />
        <FloatingOrb emoji="🔥" top="38%"  right="10%" animDur={6.4} animDelay={1.2} size="1.8rem" />
        <FloatingOrb emoji="🎤" top="78%"  left="8%"   animDur={5.5} animDelay={0.2} size="2rem"   />
        <FloatingOrb emoji="💜" top="75%"  right="7%"  animDur={6.8} animDelay={0.9} size="1.8rem" />

        {/* Badge */}
        <div style={{ ...reveal(0.1), border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)", color: "#c4b5fd" }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          built for video editors
        </div>

        {/* Headline */}
        <h1 className="text-white leading-[0.92] mb-6 max-w-3xl"
          style={{ ...reveal(0.2), fontFamily: "'Coolvetica', sans-serif", fontSize: "clamp(3.5rem,9vw,7rem)" }}>
          your promo<br />
          <span style={{
            fontFamily: "'Coolvetica', sans-serif",
            background: "linear-gradient(135deg, #a78bfa 0%, #f0abfc 40%, #818cf8 100%)",
            backgroundSize: "200% 200%",
            animation: "shimmerText 4s ease infinite",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>empire,</span><br />tracked.
        </h1>

        {/* Subtext */}
        <p style={{ ...reveal(0.35), color: "rgba(255,255,255,0.45)" }} className="text-lg max-w-md leading-relaxed mb-10 font-light">
          You edit the videos, land the placements, collect the bags. Glaze keeps your client queue organized, your payments tracked, and your monthly goals in sight.
        </p>

        {/* CTAs */}
        <div style={reveal(0.46)} className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <button onClick={onEnter} className="relative px-8 py-3.5 font-bold rounded-2xl text-white text-sm tracking-wide active:scale-95 transition-all select-none group"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a21caf)", boxShadow: "0 0 40px rgba(139,92,246,0.4)", userSelect: "none" }}>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-110 blur-xl"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a21caf)" }} />
            ✦ Start Creating Free
          </button>
          <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{ color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            See how it works →
          </button>
        </div>
        <p style={{ ...reveal(0.5), color: "rgba(255,255,255,0.2)" }} className="text-xs">
          100% free, forever. no credit card needed
        </p>

        {/* Feature Cards */}
        <div style={reveal(0.62)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-2xl w-full text-left">
          {[
            { icon: "queue", title: "Client Queue",     body: "Keep every promo deal organized by deadline and priority. No more lost DMs or forgotten invoices." },
            { icon: "money", title: "Earnings Tracker", body: "See your lifetime earnings, monthly goal progress, and which clients are paying the most." },
            { icon: "proof", title: "Payment Proof",    body: "Attach your TikTok links and payment screenshots to every completed deal." },
          ].map(f => (
            <MagneticCard key={f.title}>
              <SvgIcon name={f.icon} theme="dark" className="w-6 h-6 opacity-80" alt="" />
              <p className="text-white font-semibold text-sm">{f.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{f.body}</p>
            </MagneticCard>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative z-10 px-6 pb-36 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(167,139,250,0.6)" }}>simple process</p>
          <h2 className="text-white font-black mb-4" style={{ fontSize: "clamp(2rem,6vw,3.5rem)" }}>How It Works</h2>
          <p style={{ color: "rgba(255,255,255,0.35)" }}>From DM to paid in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              num: "1", title: "Add Your Promo",
              body: "Drop in the song name, client, amount, and deadline. Takes 10 seconds.",
              preview: (
                <div className="mt-5 rounded-xl p-3 space-y-2" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="h-2 w-24 rounded-full" style={{ background: "rgba(139,92,246,0.5)" }} />
                  <div className="h-2 w-16 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1 h-8 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    <div className="h-8 w-16 rounded-lg" style={{ background: "rgba(139,92,246,0.6)" }} />
                  </div>
                </div>
              ),
            },
            {
              num: "2", title: "Track Everything",
              body: "See your queue, deadlines, priorities, and earnings progress in real time.",
              preview: (
                <div className="mt-5 rounded-xl p-3 space-y-2" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {[["rgba(139,92,246,0.5)","70%"],["rgba(217,70,239,0.4)","50%"],["rgba(255,255,255,0.1)","35%"]].map(([c,w],i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: i===0?"#a78bfa":"#d946ef" }} />
                      <div className="h-2 rounded-full" style={{ background: c, width: w }} />
                      {i === 0 && <div className="ml-auto text-[9px] font-bold" style={{ color: "#10b981" }}>$</div>}
                    </div>
                  ))}
                  <div className="h-1.5 w-full rounded-full mt-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: "62%", background: "linear-gradient(90deg,#7c3aed,#d946ef)" }} />
                  </div>
                </div>
              ),
            },
            {
              num: "3", title: "Get Paid & Prove It",
              body: "Mark complete, attach payment screenshots, and export your full history as CSV.",
              preview: (
                <div className="mt-5 rounded-xl p-3 space-y-2" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(16,185,129,0.2)" }}>✓</div>
                    <div className="space-y-0.5 flex-1">
                      <div className="h-1.5 w-20 rounded-full" style={{ background: "rgba(52,211,153,0.4)" }} />
                      <div className="h-1.5 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                    </div>
                    <div className="text-xs font-bold" style={{ color: "#34d399" }}>$250</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(217,70,239,0.15)", border: "1px solid rgba(217,70,239,0.2)" }}>
                      <span className="text-[9px]" style={{ color: "#e879f9" }}>proof ↗</span>
                    </div>
                    <div className="flex-1 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>export CSV</span>
                    </div>
                  </div>
                </div>
              ),
            },
          ].map((step, i) => (
            <div key={i}
              className="relative rounded-2xl p-5 group overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                animation: `cardIn 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.12}s both`,
                transition: "border-color 0.3s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
            >
              {/* Big number */}
              <div style={{
                fontFamily: "'Coolvetica', sans-serif",
                fontSize: "5.5rem",
                fontWeight: 900,
                lineHeight: 1,
                position: "absolute",
                top: "-8px",
                left: "8px",
                background: "linear-gradient(135deg, rgba(139,92,246,0.55), rgba(217,70,239,0.2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                userSelect: "none",
                pointerEvents: "none",
              }}>{step.num}</div>
              <div className="pt-10">
                <p className="text-white font-bold text-base mb-1">{step.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>{step.body}</p>
                {step.preview}
              </div>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(139,92,246,0.07) 0%, transparent 70%)" }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section className="relative z-10 pb-36 text-center px-6 max-w-5xl mx-auto w-full">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(167,139,250,0.6)" }}>where your work lives</p>
          <h2 className="text-white font-black mb-3" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
            Built for the platforms<br />you create for
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem" }}>Post promos wherever your clients want. Glaze tracks it all.</p>
        </div>
        <div className="relative mx-auto" style={{ height: "280px", maxWidth: "700px" }}>
          {platforms.map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              top: p.top, left: p.left, right: p.right, bottom: p.bottom,
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              animation: `orbFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.8rem",
              }}>{p.emoji}</div>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{p.name}</span>
            </div>
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="rounded-2xl px-7 py-4 text-center" style={{ backdropFilter: "blur(16px)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-white font-bold text-sm">All platforms,</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>one tracker</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CREATOR CAROUSEL ── */}
      <div className="w-full relative z-10 pb-8 max-w-5xl mx-auto overflow-hidden">
        <CreatorCarousel creators={creators} />
      </div>

      {/* ── SUPERPOWERS CTA ── */}
      <section className="relative z-10 px-6 py-32 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white font-black mb-4 leading-tight" style={{ fontSize: "clamp(2rem,6vw,3.5rem)" }}>
            Giving Superpowers to<br />
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #f0abfc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Creators</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.05rem" }} className="mb-4">
            And you decide which features we build next.
          </p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }} className="max-w-md mx-auto mb-12">
            The features you see? Creators asked for them. The features coming next? That's up to you. That's how Glaze works.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={onEnter}
              className="px-8 py-3.5 font-bold rounded-2xl text-white text-sm transition-all active:scale-95 select-none"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a21caf)", boxShadow: "0 0 40px rgba(139,92,246,0.35)", userSelect: "none" }}>
              Start creating free
            </button>
            <button onClick={onEnter}
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
              Share your ideas →
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="w-full max-w-2xl mx-auto px-6 pb-24 relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(167,139,250,0.6)" }}>got questions?</p>
          <h2 className="text-white font-black text-3xl">Frequently Asked</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ backdropFilter: "blur(16px)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left transition-colors"
                style={{ background: openFaq === i ? "rgba(255,255,255,0.02)" : "transparent" }}
              >
                <span className="text-white font-medium text-sm">{faq.q}</span>
                <span className="text-lg transition-transform duration-200"
                  style={{ color: "rgba(255,255,255,0.4)", display: "inline-block", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ⌄
                </span>
              </button>
              <div className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: openFaq === i ? "200px" : "0", opacity: openFaq === i ? 1 : 0 }}>
                <p className="text-sm px-4 pb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="text-center pb-14 relative z-10 space-y-2">
        <p className="text-xl font-black tracking-tighter text-white">glaze<span className="text-violet-400">.</span></p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>made by creators, for creators</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>sincerely, sapphire 🤍</p>
        <a href="mailto:support@glaze.boo" className="text-xs transition-colors block" style={{ color: "rgba(255,255,255,0.15)" }}
          onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.45)"}
          onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.15)"}>
          support@glaze.boo
        </a>
      </footer>
    </div>
  );
}

// ─── Auth Screen ─────────────────────────────────────────────
function AuthScreen({ onAuth, onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const g = themes.dark;

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://glaze.boo/auth/callback' }
    });
    if (error) setError(error.message);
  };

  const signInWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { 
        redirectTo: 'https://glaze.boo/auth/callback'
      }
    });
    if (error) setError(error.message);
  };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    if (mode === "reset") {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      setLoading(false);
      if (err) return setError(err.message);
      setResetSent(true); return;
    }
    const fn = mode === "login" ? supabase.auth.signInWithPassword({ email, password }) : supabase.auth.signUp({ email, password });
    const { data, error: err } = await fn;
    setLoading(false);
    if (err) return setError(err.message);
    if (data.user) onAuth(data.user);
  };

  const tagline = "your promo empire, tracked.";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{background:"#080810"}}>
      <div style={{position:"absolute",inset:0,zIndex:0,backgroundImage:"radial-gradient(ellipse 80% 60% at 20% 10%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(217,70,239,0.10) 0%, transparent 55%)"}} />
      <div
        className={`${g.card} w-full max-w-sm space-y-6 relative z-10`}
        style={{animation:"cardReveal 0.55s cubic-bezier(0.32,0.72,0,1) forwards"}}
      >
        <button onClick={onBack} className="text-white/30 hover:text-white transition-colors text-sm">← Back</button>

        <div className="text-center space-y-1">
          <div className="text-4xl font-black tracking-tighter text-white">glaze<span className="text-violet-400">.</span></div>
          <p className="text-white/40 text-sm">
            {mode === "reset" ? "reset your password" : (
              tagline.split("").map((char, i) => (
                <span key={i} style={{
                  display:"inline-block",
                  opacity:0,
                  animation:"letterReveal 0.4s ease forwards",
                  animationDelay:`${0.35 + i * 0.028}s`,
                }}>
                  {char === " " ? "\u00A0" : char}
                </span>
              ))
            )}
          </p>
        </div>

        {resetSent ? (
          <div className="text-center space-y-4">
            <p className="text-emerald-400 text-sm">Check your email for a reset link 🤍</p>
            <button onClick={() => { setMode("login"); setResetSent(false); }} className="text-violet-400 hover:text-violet-300 text-sm transition-colors">Back to sign in</button>
          </div>
        ) : (
          <>
            {mode !== "reset" && (
              <>
                <button onClick={signInWithGoogle} className={`${g.btn} w-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-3 border border-white/10`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button onClick={signInWithDiscord} className={`${g.btn} w-full bg-[#5865F2]/80 hover:bg-[#5865F2] text-white flex items-center justify-center gap-3 border border-white/10 mt-3`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  < path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                Continue with Discord
                </button>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              </>
            )}
            <form onSubmit={submit} className="space-y-4">
              <input className={g.input} type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} required />
              {mode !== "reset" && <input className={g.input} type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} required />}
              {error && <p className="text-rose-400 text-sm">{error}</p>}
              <button type="submit" className={`${g.btn} w-full bg-violet-500/80 hover:bg-violet-500 text-white`} disabled={loading}>
                {loading ? "…" : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
              </button>
            </form>
            <div className="space-y-2 text-center">
              <p className="text-white/40 text-sm">
                {mode === "login" ? "New here? " : mode === "signup" ? "Already have an account? " : ""}
                {mode !== "reset" && <button className="text-violet-400 hover:text-violet-300 transition-colors" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? "Sign up" : "Sign in"}</button>}
              </p>
              {mode === "login" && <button onClick={() => { setMode("reset"); setError(""); }} className="text-white/25 hover:text-white/50 text-xs transition-colors">Forgot password?</button>}
              {mode === "reset" && <button onClick={() => { setMode("login"); setError(""); }} className="text-white/25 hover:text-white/50 text-xs transition-colors">Back to sign in</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Overlay ─────────────────────────────────────────────────
function Overlay({ onClose, children }) {
  return createPortal(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(24px)",animation:"fadeIn 0.2s ease forwards"}} />
      <div style={{position:"relative",width:"100%",maxWidth:"448px",margin:"0 auto"}} onClick={e => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
}

// ─── Add Promo Modal ─────────────────────────────────────────
function AddPromoModal({ onClose, onAdd, pastClients, theme }) {
  const g = themes[theme];
  const [form, setForm] = useState({ song_name:"", audio_link:"", amount:"", client_name:"", deadline:"", priority:false });
  const [loading, setLoading] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const filteredClients = pastClients.filter(c => c.toLowerCase().includes(form.client_name.toLowerCase()) && form.client_name.length > 0);
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    await onAdd(form);
    setLoading(false); onClose();
  };
  return (
    <Overlay onClose={onClose}>
      <div className={`${g.card} space-y-4 max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <h2 className={`text-xl font-bold ${g.text}`}>New Promo</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className={g.input} placeholder="Song name" value={form.song_name} onChange={e => set("song_name", e.target.value)} required />
          <input className={g.input} placeholder="Link to audio" value={form.audio_link} onChange={e => set("audio_link", e.target.value)} />
          <input className={g.input} type="number" placeholder="Amount ($)" value={form.amount} onChange={e => set("amount", e.target.value)} required min="0" step="0.01" />
          <div className="relative">
            <input className={g.input} placeholder="Client name" value={form.client_name}
              onChange={e => { set("client_name", e.target.value); setShowClientSuggestions(true); }}
              onFocus={() => setShowClientSuggestions(true)}
              onBlur={() => setTimeout(() => setShowClientSuggestions(false), 150)} />
            {showClientSuggestions && filteredClients.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 backdrop-blur-xl bg-gray-900/95 border border-white/15 rounded-xl overflow-hidden z-10">
                {filteredClients.slice(0,5).map(c => (
                  <button key={c} type="button" className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 transition-colors" onClick={() => { set("client_name", c); setShowClientSuggestions(false); }}>{c}</button>
                ))}
              </div>
            )}
          </div>
          <input className={g.input} placeholder="Deadline (YYYY-MM-DD)" value={form.deadline} onChange={e => set("deadline", e.target.value)} />
          <label className="flex items-center gap-3 text-white/70 cursor-pointer">
            <div onClick={() => set("priority", !form.priority)} className={`w-10 h-6 rounded-full transition-colors ${form.priority ? "bg-violet-500" : "bg-white/15"} relative`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.priority ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            Priority
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`${g.btn} flex-1 bg-white/5 hover:bg-white/10 ${g.text}`}>Cancel</button>
            <button type="submit" disabled={loading} className={`${g.btn} flex-1 bg-violet-500/80 hover:bg-violet-500 text-white`}>{loading ? "…" : "Add Promo"}</button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

// ─── Completion Modal ────────────────────────────────────────
function CompletionModal({ promo, onClose, onComplete, theme }) {
  const g = themes[theme];
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    let screenshot_url = null;
    if (file) {
      const path = `${promo.user_id}/${Date.now()}-${file.name}`;
      const { data } = await supabase.storage.from("screenshots").upload(path, file);
      if (data) { const { data: pub } = supabase.storage.from("screenshots").getPublicUrl(path); screenshot_url = pub.publicUrl; }
    }
    await onComplete(promo.id, { work_link: link, screenshot_url });
    setLoading(false); onClose();
  };
  return (
    <Overlay onClose={onClose}>
      <div className={`${g.card} space-y-5`} onClick={e => e.stopPropagation()}>
        <h2 className={`text-xl font-bold ${g.text} flex items-center gap-2`}>
          Mark Complete
          <SvgIcon name="party" theme={theme} className="w-5 h-5 opacity-80" alt="" />
        </h2>
        <p className={`${g.subtext} text-sm`}>{promo.song_name || promo.client_name} · {fmt(promo.amount)}</p>
        <form onSubmit={submit} className="space-y-4">
          <input className={g.input} placeholder="Link to your video" value={link} onChange={e => setLink(e.target.value)} />
          <div>
            <label className={`block ${g.subtext} text-sm mb-2`}>Payment screenshot</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className={`${g.subtext} text-sm`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`${g.btn} flex-1 bg-white/5 hover:bg-white/10 ${g.text}`}>Cancel</button>
            <button type="submit" disabled={loading} className={`${g.btn} flex-1 bg-emerald-500/80 hover:bg-emerald-500 text-white`}>
              {loading ? "…" : (
                <span className="inline-flex items-center justify-center gap-2">
                  Complete
                  <SvgIcon name="history" theme={theme} className="w-4 h-4 opacity-90" alt="" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

// ─── Edit Promo Modal ───────────────────────────────────────
function EditPromoModal({ promo, onClose, onSave, theme }) {
  const g = themes[theme];
  const [form, setForm] = useState({
    song_name: promo.song_name || "", audio_link: promo.audio_link || "",
    amount: promo.amount || "", client_name: promo.client_name || "",
    deadline: promo.deadline || promo.due_date || "", priority: promo.priority || false,
  });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    await onSave(promo.id, { ...form, amount: parseFloat(form.amount)||0, due_date: form.deadline||null });
    setLoading(false); onClose();
  };
  return (
    <Overlay onClose={onClose}>
      <div className={`${g.card} space-y-4 max-h-[90vh] overflow-y-auto animate-popIn`} onClick={e => e.stopPropagation()}>
        <h2 className={`text-xl font-bold ${g.text}`}>Edit Promo</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className={g.input} placeholder="Song name" value={form.song_name} onChange={e => set("song_name", e.target.value)} />
          <input className={g.input} placeholder="Link to audio" value={form.audio_link} onChange={e => set("audio_link", e.target.value)} />
          <input className={g.input} type="number" placeholder="Amount ($)" value={form.amount} onChange={e => set("amount", e.target.value)} min="0" step="0.01" />
          <input className={g.input} placeholder="Client name" value={form.client_name} onChange={e => set("client_name", e.target.value)} />
          <input className={g.input} placeholder="Deadline (YYYY-MM-DD)" value={form.deadline} onChange={e => set("deadline", e.target.value)} />
          <label className="flex items-center gap-3 text-white/70 cursor-pointer">
            <div onClick={() => set("priority", !form.priority)} className={`w-10 h-6 rounded-full transition-colors ${form.priority ? "bg-violet-500" : "bg-white/15"} relative`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.priority ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            Priority
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`${g.btn} flex-1 bg-white/5 hover:bg-white/10 ${g.text}`}>Cancel</button>
            <button type="submit" disabled={loading} className={`${g.btn} flex-1 bg-violet-500/80 hover:bg-violet-500 text-white`}>{loading ? "…" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────
function DeleteConfirmModal({ onClose, onConfirm, theme }) {
  const g = themes[theme];
  return (
    <Overlay onClose={onClose}>
      <div className={`${g.card} space-y-4 animate-popIn`} onClick={e => e.stopPropagation()}>
        <h2 className={`text-lg font-bold ${g.text}`}>Delete promo?</h2>
        <p className={`${g.subtext} text-sm`}>This can't be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className={`${g.btn} flex-1 bg-white/5 hover:bg-white/10 ${g.text}`}>Cancel</button>
          <button onClick={onConfirm} className={`${g.btn} flex-1 bg-rose-500/80 hover:bg-rose-500 text-white`}>Delete</button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Promo Card ──────────────────────────────────────────────
function PromoCard({ promo, index, onComplete, onDelete, onTogglePriority, onEdit, theme, dragging, dragOver, onDragStart, onDragEnter, onDragEnd }) {
  const g = themes[theme];
  const [confirmDelete, setConfirmDelete] = useState(false);

  const today = new Date(); today.setHours(0,0,0,0);
  const deadline = promo.deadline || promo.due_date;
  const deadlineDate = deadline ? new Date(deadline + "T00:00:00") : null;
  if (deadlineDate) deadlineDate.setHours(0,0,0,0);
  const isDueToday = deadlineDate && deadlineDate.getTime() === today.getTime();

  const isDragging = dragging === promo.id;
  const isOver = dragOver === promo.id;

  const delay = Math.min(index * 0.06, 0.4);

  return (
    <>
      <div style={{ animation: `cardRevealIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both` }}>
        <div
          draggable
          onDragStart={() => onDragStart(promo.id)}
          onDragEnter={() => onDragEnter(promo.id)}
          onDragEnd={onDragEnd}
          onDragOver={e => e.preventDefault()}
          className={`${g.base} p-4 flex items-center gap-3 relative overflow-hidden cursor-grab active:cursor-grabbing select-none`}
          style={{
            transform: isDragging ? "scale(1.03) rotate(1deg)" : isOver ? "scale(0.98)" : "scale(1)",
            opacity: isDragging ? 0.5 : 1,
            transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease, box-shadow 0.2s ease",
            boxShadow: isDragging ? "0 20px 40px rgba(139,92,246,0.3)" : "none",
            animation: !isDragging && isOver ? "jiggle 0.3s ease infinite" : undefined,
          }}
        >
          {promo.priority && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 to-fuchsia-500 rounded-l-2xl" />}

          <div className="flex-1 min-w-0 ml-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold ${g.text} truncate ${isDueToday ? "animate-pulse text-rose-400" : ""}`}>
                {promo.song_name || promo.client_name}
              </span>
              {promo.client_name && promo.song_name && (
                <span className={`text-[11px] ${g.muted} bg-white/10 px-2 py-0.5 rounded-full`}>{promo.client_name}</span>
              )}
              {isDueToday && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full animate-pulse">due today</span>}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {deadline && <p className={`text-xs ${isDueToday ? "text-rose-400" : g.muted}`}>Due {new Date(deadline + "T00:00:00").toLocaleDateString()}</p>}
              {promo.audio_link && (
                <a href={promo.audio_link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-violet-400/70 hover:text-violet-300 transition-colors inline-flex items-center gap-1.5">
                  <SvgIcon name="music" theme={theme} className="w-4 h-4 opacity-90" alt="" />
                  Listen
                </a>
              )}
            </div>
          </div>

          <span className="text-emerald-500 font-bold shrink-0">{fmt(promo.amount)}</span>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onTogglePriority(promo.id, !promo.priority)} aria-label="Toggle priority" className={`transition-all ${promo.priority ? "opacity-100" : "opacity-25 hover:opacity-60"}`}>
              <SvgIcon name="bolt" theme={theme} className="w-5 h-5" alt="" />
            </button>
            <button onClick={() => onEdit(promo)} aria-label="Edit promo" className={`text-xs ${g.muted} hover:text-violet-400 px-1.5 py-1.5 rounded-lg transition-all`}>
              <SvgIcon name="edit" theme={theme} className="w-4 h-4 opacity-80" alt="" />
            </button>
            <button onClick={() => onComplete(promo)} className="text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-500 px-2 py-1.5 rounded-lg transition-all">Done</button>
            <button onClick={() => setConfirmDelete(true)} className={`${g.muted} hover:text-rose-400 transition-colors text-lg leading-none px-1`}>×</button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <DeleteConfirmModal theme={theme} onClose={() => setConfirmDelete(false)} onConfirm={() => { onDelete(promo.id); setConfirmDelete(false); }} />
      )}
    </>
  );
}

// ─── Home Tab ────────────────────────────────────────────────
function HomeTab({ promos, goal, onUpdateGoal, onAdd, onComplete, onTogglePriority, onDelete, onEdit, pastClients, theme }) {
  const g = themes[theme];
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goal);
  const [completingPromo, setCompletingPromo] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [orderedIds, setOrderedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const basePromos = promos.filter(p => !p.completed).sort((a,b) => {
    const aManual = a.order_index != null;
    const bManual = b.order_index != null;
    if (aManual && bManual) return a.order_index - b.order_index;
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(a.deadline||a.due_date||"9999") - new Date(b.deadline||b.due_date||"9999");
  });

  useEffect(() => { setOrderedIds(basePromos.map(p => p.id)); }, [promos]);

  const filteredPromos = useMemo(() => {
    if (!searchQuery.trim()) return basePromos;
    const query = searchQuery.toLowerCase();
    return basePromos.filter(p =>
      (p.song_name?.toLowerCase() || "").includes(query) ||
      (p.client_name?.toLowerCase() || "").includes(query)
    );
  }, [basePromos, searchQuery]);

  const activePromos = orderedIds.length && !searchQuery
    ? orderedIds.map(id => basePromos.find(p => p.id === id)).filter(Boolean)
    : filteredPromos;

  const monthEarned = promos.filter(p => p.completed && monthKey(p.completed_at) === thisMonth()).reduce((s,p) => s+p.amount, 0);
  const pct = Math.min(100, Math.round((monthEarned/(goal||1))*100));
  const saveGoal = () => { onUpdateGoal(parseFloat(goalInput)||0); setEditingGoal(false); };
  const handleComplete = async (id, extra) => { await onComplete(id, extra); setShowConfetti(true); };

  const handleDragStart = (id) => setDragId(id);
  const handleDragEnter = (id) => {
    if (id === dragId || searchQuery) return;
    setDragOverId(id);
    setOrderedIds(prev => {
      const arr = [...prev];
      const from = arr.indexOf(dragId), to = arr.indexOf(id);
      if (from === -1 || to === -1) return prev;
      arr.splice(from, 1); arr.splice(to, 0, dragId);
      return arr;
    });
  };
  const handleDragEnd = async () => {
    setDragId(null);
    setDragOverId(null);
    if (!orderedIds.length) return;
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("promos").update({ order_index: index }).eq("id", id)
      )
    );
  };

  return (
    <div className="space-y-5 pb-32 tab-enter">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      <div className={`${g.card} space-y-3`}>
        <div className="flex items-center justify-between text-sm">
          <span className={g.subtext}>{pct}% this month</span>
          <button className="flex items-center gap-1.5 font-semibold text-violet-400 hover:text-violet-300 transition-colors group" onClick={() => setEditingGoal(true)}>
            {editingGoal ? (
              <form onSubmit={e => { e.preventDefault(); saveGoal(); }} onClick={e => e.stopPropagation()}>
                <input className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white w-28 text-right text-sm focus:outline-none focus:border-violet-400" type="number" value={goalInput} autoFocus onChange={e => setGoalInput(e.target.value)} onBlur={saveGoal} min="0" />
              </form>
            ) : (
              <>
                <span>Goal: {fmt(goal)}</span>
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                  <SvgIcon name="edit" theme={theme} className="w-3.5 h-3.5 inline-block align-[-2px]" alt="" />
                </span>
              </>
            )}
          </button>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}} />
        </div>
        <p className={`${g.muted} text-xs`}>{fmt(monthEarned)} earned · {fmt(Math.max(0,goal-monthEarned))} to go · <span className="text-violet-400/60">tap goal to edit</span></p>
      </div>

      <div className={`${g.card} py-3`}>
        <div className="relative">
          <input
            className={`${g.input} pr-10`}
            placeholder="Search by song or client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">×</button>
          )}
        </div>
        {searchQuery && <p className={`${g.muted} text-xs mt-2`}>{filteredPromos.length} result{filteredPromos.length !== 1 ? 's' : ''}</p>}
      </div>

      <div className="space-y-3">
        {activePromos.length === 0 && (
          <div className={`text-center ${g.muted} py-12 text-sm`}>
            {searchQuery ? "no promos match your search" : "no active promos — tap + to add one"}
          </div>
        )}
        {activePromos.map((p, i) => (
          <PromoCard
            key={p.id} promo={p} index={i} theme={theme}
            dragging={dragId} dragOver={dragOverId}
            onDragStart={handleDragStart} onDragEnter={handleDragEnter} onDragEnd={handleDragEnd}
            onComplete={(promo) => setCompletingPromo(promo)}
            onDelete={onDelete} onTogglePriority={onTogglePriority}
            onEdit={(promo) => setEditingPromo(promo)}
          />
        ))}
      </div>
      {editingPromo && <EditPromoModal promo={editingPromo} onClose={() => setEditingPromo(null)} onSave={onEdit} theme={theme} />}
      {completingPromo && <CompletionModal promo={completingPromo} onClose={() => setCompletingPromo(null)} onComplete={handleComplete} theme={theme} />}
    </div>
  );
}

// ─── Stats Tab ───────────────────────────────────────────────
function StatsTab({ promos, goal, theme }) {
  const g = themes[theme];
  const completed = promos.filter(p => p.completed);
  const active = promos.filter(p => !p.completed);
  const totalEarned = completed.reduce((s,p) => s+p.amount, 0);
  const monthEarned = completed.filter(p => monthKey(p.completed_at) === thisMonth()).reduce((s,p) => s+p.amount, 0);
  const pct = Math.min(100, Math.round((monthEarned/(goal||1))*100));
  const projection = monthEarned + active.reduce((s,p) => s+p.amount, 0);
  const avgPayment = completed.length ? totalEarned/completed.length : 0;
  const clientMap = {};
  completed.forEach(p => { clientMap[p.client_name] = (clientMap[p.client_name]||0)+p.amount; });
  const bestClient = Object.entries(clientMap).sort((a,b) => b[1]-a[1])[0];
  const monthlyMap = {};
  completed.forEach(p => { const k = monthKey(p.completed_at); monthlyMap[k] = (monthlyMap[k]||0)+p.amount; });
  const months = Object.entries(monthlyMap).sort((a,b) => b[0].localeCompare(a[0])).slice(0,12);
  const maxMonth = Math.max(...months.map(m => m[1]), 1);
  const bestMonth = [...months].sort((a,b) => b[1]-a[1])[0];
  const sortedMonths = [...months].sort((a,b) => a[0].localeCompare(b[0]));
  const fmtMonth = k => { const [y,m] = k.split("-"); return new Date(y,m-1).toLocaleDateString("en-US",{month:"short",year:"2-digit"}); };
  return (
    <div className="space-y-4 pb-32 tab-enter">
      <div className={`${g.card} text-center`}>
        <p className={`${g.muted} text-xs uppercase tracking-widest mb-1`}>Lifetime Earnings</p>
        <p className={`text-5xl font-black ${g.text}`}>{fmt(totalEarned)}</p>
        <p className={`${g.muted} text-sm mt-1`}>across {completed.length} promos</p>
      </div>
      <div className={`${g.card} space-y-3`}>
        <div className="flex justify-between text-sm"><span className={g.subtext}>This month</span><span className={g.subtext}>Goal: {fmt(goal)}</span></div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}} /></div>
        <div className="flex justify-between text-xs"><span className={g.muted}>{fmt(monthEarned)} earned</span><span className={g.muted}>{pct}%</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={g.card}><p className={`${g.muted} text-xs mb-1`}>Avg / promo</p><p className={`text-2xl font-bold ${g.text}`}>{fmt(avgPayment)}</p></div>
        <div className={g.card}><p className={`${g.muted} text-xs mb-1`}>Projection</p><p className="text-2xl font-bold text-emerald-500">{fmt(projection)}</p><p className={`text-[10px] ${g.muted}`}>if all active pay</p></div>
        {bestClient && <div className={g.card}><p className={`${g.muted} text-xs mb-1`}>Best Client</p><p className={`${g.text} font-bold truncate`}>{bestClient[0]}</p><p className="text-violet-500 text-sm">{fmt(bestClient[1])}</p></div>}
        {bestMonth && <div className={g.card}><p className={`${g.muted} text-xs mb-1`}>Best Month</p><p className={`${g.text} font-bold`}>{fmtMonth(bestMonth[0])}</p><p className="text-fuchsia-500 text-sm">{fmt(bestMonth[1])}</p></div>}
      </div>
      {sortedMonths.length > 0 && (
        <div className={`${g.card} space-y-3`}>
          <p className={`${g.subtext} text-sm font-semibold`}>Monthly Breakdown</p>
          <div className="space-y-2">
            {sortedMonths.map(([k,v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className={`text-xs ${g.muted} w-14 shrink-0`}>{fmtMonth(k)}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full" style={{width:`${(v/maxMonth)*100}%`}} /></div>
                <span className={`text-xs ${g.subtext} w-16 text-right`}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History Tab ─────────────────────────────────────────────
function HistoryTab({ promos, onDelete, theme }) {
  const g = themes[theme];
  const [searchQuery, setSearchQuery] = useState("");
  
  const completed = promos.filter(p => p.completed).sort((a,b) => new Date(b.completed_at)-new Date(a.completed_at));

  // Filter based on search
  const filteredCompleted = useMemo(() => {
    if (!searchQuery.trim()) return completed;
    const query = searchQuery.toLowerCase();
    return completed.filter(p => 
      (p.song_name?.toLowerCase() || "").includes(query) ||
      (p.client_name?.toLowerCase() || "").includes(query)
    );
  }, [completed, searchQuery]);

  const exportCSV = () => {
    const headers = ["Song","Client","Amount","Deadline","Completed","Video Link","Audio Link"];
    const rows = completed.map(p => [
      p.song_name||"", p.client_name||"",
      p.amount, p.due_date||p.deadline||"",
      p.completed_at ? new Date(p.completed_at).toLocaleDateString() : "",
      p.work_link||"", p.audio_link||""
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `glaze-history-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 pb-32 tab-enter">
      {/* Search Bar */}
      <div className={`${g.card} py-3`}>
        <div className="relative">
          <input
            className={`${g.input} pr-10`}
            placeholder="Search history by song or client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              ×
            </button>
          )}
        </div>
        {searchQuery && (
          <p className={`${g.muted} text-xs mt-2`}>
            {filteredCompleted.length} result{filteredCompleted.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {completed.length > 0 && !searchQuery && (
        <button onClick={exportCSV} className="w-full py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-sm transition-all flex items-center justify-center gap-2">
          <SvgIcon name="download" theme={theme} className="w-4 h-4 opacity-80" alt="" />
          Export CSV
        </button>
      )}
      
      {filteredCompleted.length === 0 && (
        <div className={`text-center ${g.muted} py-16 text-sm`}>
          {searchQuery ? "no promos match your search" : "no completed promos yet"}
        </div>
      )}
      
      {filteredCompleted.map(p => (
        <div key={p.id} className={`${g.card} space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`font-semibold ${g.text} truncate`}>{p.song_name || p.client_name}</p>
              {p.client_name && <p className={`text-xs ${g.muted}`}>{p.client_name}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-emerald-500 font-bold">{fmt(p.amount)}</span>
              <button onClick={() => onDelete(p.id)} className={`${g.muted} hover:text-rose-400 transition-colors text-lg leading-none`}>×</button>
            </div>
          </div>
          {p.completed_at && <p className={`text-xs ${g.muted}`}>Completed {new Date(p.completed_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>}
          <div className="flex gap-3 flex-wrap">
            {p.audio_link && (
              <a href={p.audio_link} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 inline-flex items-center gap-1.5">
                <SvgIcon name="music" theme={theme} className="w-4 h-4 opacity-90" alt="" />
                Song →
              </a>
            )}
            {p.work_link && <a href={p.work_link} target="_blank" rel="noreferrer" className="text-xs text-violet-500 hover:text-violet-400 underline underline-offset-2">View Video →</a>}
            {p.screenshot_url && <a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-fuchsia-500 hover:text-fuchsia-400 underline underline-offset-2">Payment Proof →</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────
function Collapsible({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between text-sm font-semibold py-0.5 transition-opacity hover:opacity-80">
        <span>{label}</span>
        <span className="text-lg leading-none transition-transform duration-200" style={{display:"inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)"}}>⌄</span>
      </button>
      <div style={{display: open ? "block" : "none"}} className="pt-3 space-y-3 animate-fadeIn">
        {children}
      </div>
    </div>
  );
}

function ProfileTab({ user, onSignOut, theme, onThemeChange }) {
  const g = themes[theme];
  const [displayName, setDisplayName] = useState(user.user_metadata?.display_name||"");
  const [avatar, setAvatar] = useState(user.user_metadata?.avatar_url||null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [linkedProviders, setLinkedProviders] = useState([]);
  const showMsg = m => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  // Load linked providers on mount
  useEffect(() => {
    loadLinkedProviders();
  }, []);

  const loadLinkedProviders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.identities) {
      setLinkedProviders(user.identities.map(i => i.provider));
    }
  };

  const updateName = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
    setLoading(false); showMsg(error ? error.message : "Name updated ✓");
  };
  
  const updatePassword = async () => {
    if (!currentPassword || !newPassword) return; setLoading(true);
    const { error: authErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (authErr) { setPwMsg("Current password is incorrect."); setLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false); setPwMsg(error ? error.message : "Password updated ✓");
    setCurrentPassword(""); setNewPassword(""); setTimeout(() => setPwMsg(""), 3000);
  };
  
  const updateEmail = async () => {
    if (!currentPasswordForEmail || !newEmail) return; setLoading(true);
    const { error: authErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPasswordForEmail });
    if (authErr) { setEmailMsg("Password is incorrect."); setLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoading(false); setEmailMsg(error ? error.message : "Confirmation sent to new email ✓");
    setCurrentPasswordForEmail(""); setNewEmail(""); setTimeout(() => setEmailMsg(""), 4000);
  };

  const linkGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: 'https://glaze.boo/auth/callback' }
    });
    if (error) showMsg(error.message);
    setLoading(false);
  };

  const linkDiscord = async () => {
    setLoading(true);
    const { error } = await supabase.auth.linkIdentity({
      provider: 'discord',
      options: { redirectTo: 'https://glaze.boo/auth/callback' }
    });
    if (error) showMsg(error.message);
    setLoading(false);
  };

  const unlinkProvider = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.unlinkIdentity({ provider });
    if (error) {
      showMsg(error.message);
    } else {
      showMsg(`${provider} unlinked ✓`);
      loadLinkedProviders();
    }
    setLoading(false);
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return; setLoading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadErr) { showMsg("Upload failed: " + uploadErr.message); setLoading(false); return; }
    const { data: pub } = supabase.storage.from("screenshots").getPublicUrl(path);
    const avatarUrl = pub.publicUrl + "?v=" + Date.now();
    const { error: updateErr } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    if (updateErr) { showMsg("Failed to save avatar"); setLoading(false); return; }
    setAvatar(avatarUrl); setLoading(false); showMsg("Avatar updated ✓");
  };
  
  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    const { error } = await supabase.from("feedback").insert([{ user_id: user.id, message: feedbackText.trim() }]);
    if (!error) { setFeedbackText(""); setFeedbackSent(true); setTimeout(() => setFeedbackSent(false), 3000); }
  };

  const hasGoogle = linkedProviders.includes('google');
  const hasDiscord = linkedProviders.includes('discord');
  const hasEmail = linkedProviders.includes('email') || user.email;

  return (
    <div className="space-y-4 pb-32 tab-enter">
      <div className={`${g.card} flex flex-col items-center gap-4 pt-6 pb-5`}>
        <label className="cursor-pointer relative group">
          <div className="w-24 h-24 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-4xl ring-2 ring-white/10 group-hover:ring-violet-400/50 transition-all duration-200">
            {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <SvgIcon name="user" theme={theme} className="w-10 h-10 opacity-70" alt="" />}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-medium">edit</div>
          <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
        </label>
        <div className="w-full">
          <p className={`${g.muted} text-xs mb-1.5 text-center`}>Display name</p>
          <div className="flex gap-2">
            <input className={`${g.input} py-2 text-sm text-center`} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            <button onClick={updateName} disabled={loading} className="px-3 py-2 bg-violet-500/60 hover:bg-violet-500 rounded-xl text-white text-sm transition-all shrink-0" aria-label="Save display name">
              <SvgIcon name="check" theme="dark" className="w-4 h-4 opacity-95" alt="" />
            </button>
          </div>
        </div>
        {msg && <p className="text-sm text-violet-400 animate-fadeIn">{msg}</p>}
      </div>

      <div className={`${g.card} space-y-0`}>
        <p className={`${g.muted} text-[11px] uppercase tracking-widest mb-3`}>Account</p>
        <div className={`${g.subtext} text-sm mb-4`}>{user.email}</div>
        <div className="space-y-4 divide-y divide-white/5">
          
          {/* Linked Accounts Section */}
          <Collapsible label={<span className={g.subtext}>Linked Accounts</span>} defaultOpen={true}>
            <div className="space-y-3">
              
              {/* Google */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className={g.text}>Google</span>
                </div>
                {hasGoogle ? (
                  <button onClick={() => unlinkProvider('google')} disabled={loading} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">
                    Unlink
                  </button>
                ) : (
                  <button onClick={linkGoogle} disabled={loading} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Link
                  </button>
                )}
              </div>

              {/* Discord */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  <span className={g.text}>Discord</span>
                </div>
                {hasDiscord ? (
                  <button onClick={() => unlinkProvider('discord')} disabled={loading} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">
                    Unlink
                  </button>
                ) : (
                  <button onClick={linkDiscord} disabled={loading} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Link
                  </button>
                )}
              </div>

              {/* Email/Password */}
              <div className="flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <SvgIcon name="user" theme={theme} className="w-5 h-5" alt="" />
                  <span className={g.text}>Email/Password</span>
                </div>
                <span className="text-xs text-emerald-500">Active</span>
              </div>

            </div>
          </Collapsible>

          <div className="pt-4">
            <Collapsible label={<span className={g.subtext}>Change Email</span>}>
              <input className={g.input} type="password" placeholder="Current password" value={currentPasswordForEmail} onChange={e => setCurrentPasswordForEmail(e.target.value)} />
              <input className={g.input} type="email" placeholder="New email address" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              {emailMsg && <p className={`text-sm ${emailMsg.includes("✓") ? "text-emerald-500" : "text-rose-400"}`}>{emailMsg}</p>}
              <button onClick={updateEmail} disabled={loading||!newEmail||!currentPasswordForEmail} className={`${g.btn} w-full bg-white/5 hover:bg-white/10 ${g.text} text-sm`}>Update Email</button>
            </Collapsible>
          </div>
          
          <div className="pt-4">
            <Collapsible label={<span className={g.subtext}>Change Password</span>}>
              <input className={g.input} type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <input className={g.input} type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              {pwMsg && <p className={`text-sm ${pwMsg.includes("✓") ? "text-emerald-500" : "text-rose-400"}`}>{pwMsg}</p>}
              <button onClick={updatePassword} disabled={loading||!currentPassword||!newPassword} className={`${g.btn} w-full bg-white/5 hover:bg-white/10 ${g.text} text-sm`}>Update Password</button>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className={`${g.card} space-y-3`}>
        <p className={`${g.subtext} text-sm font-semibold flex items-center gap-2`}>
          <SvgIcon name="theme" theme={theme} className="w-4 h-4 opacity-80" alt="" />
          Theme
        </p>
        <div className="flex gap-2">
          {[
            {id:"dark", label:"Dark", icon:"darkTheme"},
            {id:"light", label:"Cyan", icon:"lightTheme"},
            {id:"pink", label:"Pink", icon:"pinkTheme"},
          ].map(t => (
            <button key={t.id} onClick={() => onThemeChange(t.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                theme === t.id
                  ? t.id === "pink" ? "bg-pink-500/80 border-pink-500 text-white scale-[1.02]"
                  : t.id === "light" ? "bg-cyan-500/80 border-cyan-500 text-white scale-[1.02]"
                  : "bg-violet-500/80 border-violet-500 text-white scale-[1.02]"
                  : "border-white/10 text-white/40 hover:text-white/70 bg-white/5"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <SvgIcon name={t.icon} theme={theme} className="w-4 h-4 opacity-90" alt="" />
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className={`${g.card} space-y-3`}>
        <p className={`${g.subtext} text-sm font-semibold`}>💬 Send Feedback</p>
        <textarea className={`${g.input} resize-none`} rows={3} placeholder="Tell us what you think, what's broken, or what you'd love to see…" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
        {feedbackSent
          ? <p className="text-emerald-500 text-sm text-center animate-fadeIn">Feedback sent! Thanks 🤍</p>
          : <button onClick={submitFeedback} disabled={!feedbackText.trim()} className={`${g.btn} w-full bg-violet-500/40 hover:bg-violet-500/70 text-white text-sm`}>Send Feedback</button>}
      </div>

      <button onClick={onSignOut} className={`${g.btn} w-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-500 text-sm`}>Sign Out</button>
    </div>
  );
}

// ─── Creator Row (Admin) ─────────────────────────────────────
function CreatorRow({ creator, g, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: creator.username, pfp_url: creator.pfp_url||"", follower_count: creator.follower_count||"", tiktok_url: creator.tiktok_url||"" });
  const save = async () => { await onUpdate(creator.id, form); setEditing(false); };
  if (editing) return (
    <div className={`${g.card} space-y-2`}>
      <input className={`${g.input} text-sm py-2`} placeholder="Username" value={form.username} onChange={e => setForm(f => ({...f,username:e.target.value}))} />
      <input className={`${g.input} text-sm py-2`} placeholder="Pic URL" value={form.pfp_url} onChange={e => setForm(f => ({...f,pfp_url:e.target.value}))} />
      <input className={`${g.input} text-sm py-2`} placeholder="Followers" value={form.follower_count} onChange={e => setForm(f => ({...f,follower_count:e.target.value}))} />
      <input className={`${g.input} text-sm py-2`} placeholder="TikTok URL" value={form.tiktok_url} onChange={e => setForm(f => ({...f,tiktok_url:e.target.value}))} />
      <div className="flex gap-2">
        <button onClick={save} className="flex-1 py-2 bg-violet-500/80 hover:bg-violet-500 text-white text-sm rounded-xl transition-all">Save</button>
        <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl transition-all">Cancel</button>
      </div>
    </div>
  );
  return (
    <div className={`${g.card} flex items-center gap-4`}>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
        {creator.pfp_url ? (
          <img src={creator.pfp_url} alt={creator.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SvgIcon name="user" theme="dark" className="w-5 h-5 opacity-70" alt="" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">@{creator.username}</p>
        <p className="text-white/40 text-xs">{creator.follower_count} followers</p>
      </div>
      <button onClick={() => setEditing(true)} aria-label="Edit creator" className="text-white/20 hover:text-violet-400 transition-colors px-1">
        <SvgIcon name="edit" theme="dark" className="w-4 h-4 opacity-80" alt="" />
      </button>
      <button onClick={() => onDelete(creator.id)} className="text-white/20 hover:text-rose-400 transition-colors text-lg">×</button>
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────
function AdminPanel({ onSignOut }) {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [promos, setPromos] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [creators, setCreators] = useState([]);
  const [newCreator, setNewCreator] = useState({ username:"", pfp_url:"", follower_count:"", tiktok_url:"" });
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadAll(); }, []);
  const loadAll = async () => {
    setLoading(true);
    const [{ data: promoData }, { data: fbData }, { data: creatorData }] = await Promise.all([
      supabase.from("promos").select("*").eq("completed", true),
      supabase.from("feedback").select("*").order("created_at", { ascending: false }),
      supabase.from("creators").select("*").order("created_at", { ascending: false }),
    ]);
    if (promoData) {
      setPromos(promoData);
      const userMap = {};
      promoData.forEach(p => {
        if (!userMap[p.user_id]) userMap[p.user_id] = { user_id: p.user_id, total: 0, promos: [] };
        userMap[p.user_id].total += p.amount; userMap[p.user_id].promos.push(p);
      });
      setUsers(Object.values(userMap).sort((a,b) => b.total - a.total));
    }
    if (fbData) setFeedback(fbData);
    if (creatorData) setCreators(creatorData);
    setLoading(false);
  };
  const addCreator = async () => {
    if (!newCreator.username) return;
    const { data } = await supabase.from("creators").insert([newCreator]).select().single();
    if (data) { setCreators(prev => [data,...prev]); setNewCreator({ username:"", pfp_url:"", follower_count:"", tiktok_url:"" }); }
  };
  const deleteCreator = async (id) => {
    await supabase.from("creators").delete().eq("id", id);
    setCreators(prev => prev.filter(c => c.id !== id));
  };
  const g = themes.dark;
  const tabs = [{id:"users",label:"👥 Users"},{id:"promos",label:"📋 Promos"},{id:"feedback",label:"💬 Feedback"},{id:"carousel",label:"🎠 Carousel"}];
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 pt-6 pb-32" style={themes.dark.bgStyle}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">glaze<span className="text-violet-400">.</span> <span className="text-violet-400 text-lg">admin</span></h1>
          <p className="text-white/30 text-xs mt-0.5">sapphire's control panel</p>
        </div>
        <button onClick={onSignOut} className="text-white/30 hover:text-rose-400 text-sm transition-colors">sign out</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={`${g.card} text-center`}><p className={`${g.muted} text-xs mb-1`}>Users</p><p className="text-2xl font-black text-white">{users.length}</p></div>
        <div className={`${g.card} text-center`}><p className={`${g.muted} text-xs mb-1`}>Promos</p><p className="text-2xl font-black text-white">{promos.length}</p></div>
        <div className={`${g.card} text-center`}><p className={`${g.muted} text-xs mb-1`}>Platform $</p><p className="text-xl font-black text-violet-400">{fmt(promos.reduce((s,p) => s+p.amount,0))}</p></div>
      </div>
      <div className={`${g.base} p-1.5 flex gap-1 mb-6`}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${tab === t.id ? "bg-violet-500/80 text-white" : "text-white/40 hover:text-white/70"}`}>{t.label}</button>
        ))}
      </div>
      {loading && <div className="text-center text-white/30 py-12 animate-pulse">loading…</div>}
      {!loading && tab === "users" && (
        <div className="space-y-3">
          {users.length === 0 && <div className="text-center text-white/30 py-12 text-sm">no users yet</div>}
          {users.map((u,i) => (
            <div key={u.user_id} className={g.card}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white/20 text-sm font-mono">#{i+1}</span>
                  <span className="text-white/50 text-xs font-mono truncate max-w-[140px]">{u.user_id.slice(0,12)}…</span>
                </div>
                <span className="text-emerald-400 font-bold">{fmt(u.total)}</span>
              </div>
              <div className="space-y-1">
                {u.promos.slice(0,3).map(p => (
                  <div key={p.id} className="flex justify-between text-xs text-white/40">
                    <span>{p.client_name} · {p.song_name||"—"}</span>
                    <span>{fmt(p.amount)}</span>
                  </div>
                ))}
                {u.promos.length > 3 && <p className="text-xs text-white/20">+{u.promos.length-3} more</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && tab === "promos" && (
        <div className="space-y-3">
          {promos.length === 0 && <div className="text-center text-white/30 py-12 text-sm">no completed promos yet</div>}
          {[...promos].sort((a,b) => new Date(b.completed_at)-new Date(a.completed_at)).map(p => (
            <div key={p.id} className={`${g.card} flex items-center justify-between gap-3`}>
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{p.song_name||p.client_name}</p>
                <p className="text-white/40 text-xs">{p.client_name} · {new Date(p.completed_at).toLocaleDateString()}</p>
              </div>
              <span className="text-emerald-400 font-bold shrink-0">{fmt(p.amount)}</span>
            </div>
          ))}
        </div>
      )}
      {!loading && tab === "feedback" && (
        <div className="space-y-3">
          {feedback.length === 0 && <div className="text-center text-white/30 py-12 text-sm">no feedback yet</div>}
          {feedback.map(f => (
            <div key={f.id} className={`${g.card} space-y-2`}>
              <p className="text-white/70 text-sm leading-relaxed">"{f.message}"</p>
              <p className="text-white/25 text-xs">{new Date(f.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
            </div>
          ))}
        </div>
      )}
      {!loading && tab === "carousel" && (
        <div className="space-y-4">
          <div className={`${g.card} space-y-3`}>
            <p className="text-white/60 text-sm font-semibold">Add Creator</p>
            <input className={g.input} placeholder="TikTok username (no @)" value={newCreator.username} onChange={e => setNewCreator(c => ({...c,username:e.target.value}))} />
            <input className={g.input} placeholder="Profile picture URL" value={newCreator.pfp_url} onChange={e => setNewCreator(c => ({...c,pfp_url:e.target.value}))} />
            <input className={g.input} placeholder="Follower count (e.g. 102K)" value={newCreator.follower_count} onChange={e => setNewCreator(c => ({...c,follower_count:e.target.value}))} />
            <input className={g.input} placeholder="TikTok profile URL" value={newCreator.tiktok_url} onChange={e => setNewCreator(c => ({...c,tiktok_url:e.target.value}))} />
            <button onClick={addCreator} className={`${g.btn} w-full bg-violet-500/80 hover:bg-violet-500 text-white text-sm`}>Add to Carousel</button>
          </div>
          <div className="space-y-3">
            {creators.map(c => (
              <CreatorRow key={c.id} creator={c} g={g} onDelete={deleteCreator} onUpdate={async (id, updates) => {
                const { data } = await supabase.from("creators").update(updates).eq("id", id).select().single();
                if (data) setCreators(prev => prev.map(cr => cr.id === id ? data : cr));
              }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav helpers ─────────────────────────────────────────────
function NavBtn({ id, icon, label, active, onClick, theme }) {
  const g = themes[theme];
  return (
    <button onClick={() => onClick(id)} className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${active === id ? "bg-violet-500/80 text-white" : `${g.muted} hover:text-violet-400`}`}>
      <SvgIcon name={icon} theme={theme} className="w-5 h-5 opacity-90" alt="" />
      <span>{label}</span>
    </button>
  );
}

function VinylBtn({ onClick }) {
  const [spinning, setSpinning] = useState(false);
  const handleClick = () => { setSpinning(true); setTimeout(() => setSpinning(false), 600); onClick(); };
  return (
    <button onClick={handleClick} className="relative w-14 h-14 mx-1 group" aria-label="Add promo">
      <svg viewBox="0 0 56 56" className={`w-full h-full drop-shadow-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${spinning ? "animate-spin-once" : ""}`}>
        <circle cx="28" cy="28" r="27" fill="url(#vinylGrad)" />
        {[22,17,12].map(r => <circle key={r} cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />)}
        <circle cx="28" cy="28" r="9" fill="url(#labelGrad)" />
        <circle cx="28" cy="28" r="2.5" fill="rgba(0,0,0,0.5)" />
        <line x1="28" y1="23" x2="28" y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="23" y1="28" x2="33" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <radialGradient id="vinylGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#6d28d9" />
            <stop offset="50%" stopColor="#1e1040" />
            <stop offset="100%" stopColor="#0d0820" />
          </radialGradient>
          <radialGradient id="labelGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </radialGradient>
        </defs>
      </svg>
    </button>
  );
}

function AddQuickBtn({ onAdd, pastClients, theme, triggerOpen, onOpened }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (triggerOpen) { setOpen(true); onOpened(); } }, [triggerOpen]);
  return (
    <>
      <VinylBtn onClick={() => setOpen(true)} />
      {open && <AddPromoModal onClose={() => setOpen(false)} onAdd={async f => { await onAdd(f); setOpen(false); }} pastClients={pastClients} theme={theme} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [landingExiting, setLandingExiting] = useState(false);

  const enterAuth = () => {
    setLandingExiting(true);
    setTimeout(() => setShowLanding(false), 400);
  };

  const [tab, setTab] = useState("home");
  const [promos, setPromos] = useState([]);
  const [goal, setGoal] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("glaze-theme") || "dark");
  const g = themes[theme];

  const [ctrlN, setCtrlN] = useState(false);

  useEffect(() => { localStorage.setItem("glaze-theme", theme); }, [theme]);

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "n") { e.preventDefault(); setCtrlN(true); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    supabase.from("creators").select("*").order("created_at", { ascending: true }).then(({ data }) => { if (data) setCreators(data); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (!user) return; loadPromos(); loadSettings(); }, [user]);

  const loadPromos = async () => {
    const { data } = await supabase.from("promos").select("*").eq("user_id", user.id)
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (data) setPromos(data);
  };
  const loadSettings = async () => {
    const { data } = await supabase.from("user_settings").select("monthly_goal").eq("user_id", user.id).single();
    if (data) setGoal(data.monthly_goal);
  };

  const pastClients = [...new Set(promos.map(p => p.client_name).filter(Boolean))];

  const addPromo = async (form) => {
    const payload = {
      song_name: form.song_name || null, audio_link: form.audio_link || null,
      client_name: form.client_name || null, platform: "TikTok",
      amount: parseFloat(form.amount) || 0, due_date: form.deadline || null,
      notes: null, priority: form.priority || false, user_id: user.id, completed: false,
    };
    const { data, error } = await supabase.from("promos").insert([payload]).select().single();
    if (error) { console.error("Save error:", error); alert("Error: "+error.message); return; }
    if (data) setPromos(prev => [data,...prev]);
  };

  const completePromo = async (id, extra) => {
    const updates = { completed: true, completed_at: new Date().toISOString(), ...extra };
    const { data } = await supabase.from("promos").update(updates).eq("id", id).select().single();
    if (data) setPromos(prev => prev.map(p => p.id === id ? data : p));
  };

  const togglePriority = async (id, val) => {
    await supabase.from("promos").update({ priority: val }).eq("id", id);
    setPromos(prev => prev.map(p => p.id === id ? {...p,priority:val} : p));
  };

  const deletePromo = async (id) => {
    await supabase.from("promos").delete().eq("id", id);
    setPromos(prev => prev.filter(p => p.id !== id));
  };

  const updateGoal = async (val) => {
    setGoal(val);
    await supabase.from("user_settings").upsert({ user_id: user.id, monthly_goal: val });
  };

  const editPromo = async (id, updates) => {
    const { data } = await supabase.from("promos").update(updates).eq("id", id).select().single();
    if (data) setPromos(prev => prev.map(p => p.id === id ? data : p));
  };

  const signOut = () => supabase.auth.signOut();

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background:"#080810"}}><div className="text-white/30 text-sm animate-pulse">loading glaze…</div></div>;
  if (!user && (showLanding || landingExiting)) return (
    <div style={{position:"relative"}}>
      <LandingPage onEnter={enterAuth} creators={creators} exiting={landingExiting} />
      {landingExiting && (
        <div style={{position:"fixed", inset:0, zIndex:50}}>
          <AuthScreen onAuth={setUser} onBack={() => { setLandingExiting(false); setShowLanding(true); }} />
        </div>
      )}
    </div>
  );
  if (!user) return <AuthScreen onAuth={setUser} onBack={() => setShowLanding(true)} />;
  if (user.email === ADMIN_EMAIL) return <AdminPanel onSignOut={signOut} />;

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pt-6 transition-colors duration-300" style={g.bgStyle}>
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-black tracking-tighter ${g.text}`}>glaze<span className="text-violet-500">.</span></h1>
        <p className={`${g.muted} text-sm truncate max-w-[60%]`}>{user.user_metadata?.display_name||user.email}</p>
      </div>
      <div key={tab} className="tab-enter">
        {tab === "home" && <HomeTab promos={promos} goal={goal} onUpdateGoal={updateGoal} onAdd={addPromo} onComplete={completePromo} onTogglePriority={togglePriority} onDelete={deletePromo} onEdit={editPromo} pastClients={pastClients} theme={theme} />}
        {tab === "stats" && <StatsTab promos={promos} goal={goal} theme={theme} />}
        {tab === "history" && <HistoryTab promos={promos} onDelete={deletePromo} theme={theme} />}
        {tab === "profile" && <ProfileTab user={user} onSignOut={signOut} theme={theme} onThemeChange={setTheme} />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 px-4">
        <div className={`${g.base} px-2 py-2 flex items-center gap-1 shadow-2xl`}>
          <NavBtn id="home" icon="queue" label="Queue" active={tab} onClick={setTab} theme={theme} />
          <NavBtn id="history" icon="history" label="History" active={tab} onClick={setTab} theme={theme} />
          <AddQuickBtn onAdd={addPromo} pastClients={pastClients} theme={theme} triggerOpen={ctrlN} onOpened={() => setCtrlN(false)} />
          <NavBtn id="stats" icon="stats" label="Stats" active={tab} onClick={setTab} theme={theme} />
          <NavBtn id="profile" icon="user" label="Profile" active={tab} onClick={setTab} theme={theme} />
        </div>
      </div>
    </div>
  );
}