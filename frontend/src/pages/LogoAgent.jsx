import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLogo } from '../context/LogoContext';
import api from '../services/api';
import BrandGuidelinesModal from '../components/BrandGuidelinesModal';
import MockupModal from '../components/MockupModal';
import LogoCustomizerModal from '../components/LogoCustomizerModal';

const API_BASE = '/logo-agent';
const CHAT_BASE = '/chat';
const CREDITS_BASE = '/credits';

// ─── Inline markdown helpers ──────────────────────────────────
const inlineBold = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
};
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    const listMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (listMatch) return (
      <div key={i} className="mt-2 flex gap-2 items-start text-sm">
        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'rgba(124,58,237,0.2)', color: '#7c3aed' }}>
          {listMatch[1]}
        </span>
        <span>{inlineBold(listMatch[2])}</span>
      </div>
    );
    if (!trimmed) return <div key={i} className="h-1" />;
    return <p key={i} className="mt-0.5 text-sm">{inlineBold(trimmed)}</p>;
  });
};


// ─── Dual variant loader ──────────────────────
const TwoBoxLoader = () => (
  <div className="mt-3">
    <style>{`
      @keyframes box-pulse {
        0%,100% { opacity: 0.35; transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.02); }
      }
    `}</style>
    <div className="flex gap-3" style={{ maxWidth: 240 }}>
      {[0, 200].map(d => (
        <div key={d} className="flex-1 aspect-square rounded-2xl" 
             style={{ 
               background: 'rgba(124,58,237,0.1)', 
               border: '1px solid rgba(124,58,237,0.2)',
               animation: `box-pulse 1.5s ease-in-out ${d}ms infinite`
             }} 
        />
      ))}
    </div>
    <p className="text-[10px] uppercase tracking-widest mt-3 font-bold text-purple-400/60">Crafting Variants...</p>
  </div>
);

// ─── Logo Lightbox ─────────────────────────────────────────────
const LogoLightbox = ({ logos, startIndex, onClose, onGuidelines, onMockup }) => {
  const [idx, setIdx] = React.useState(startIndex ?? 0);
  const logo = logos[idx];
  React.useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx(i => Math.min(logos.length - 1, i + 1));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [logos.length, onClose]);
  const handleDl = async () => {
    try {
      const r = await fetch(logo.logo_url);
      const blob = await r.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `logo-variant-${idx + 1}.png`;
      a.click();
    } catch { window.open(logo.logo_url, '_blank'); }
  };
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,0.90)', backdropFilter:'blur(10px)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    }}>
      <button onClick={onClose} style={{ position:'absolute', top:18, right:22, color:'white', fontSize:26, background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, width:42, height:42, cursor:'pointer' }}>×</button>
      {/* Action bar - Top Center Hub */}
      <div style={{
        position:'absolute', top:30, left:'50%', transform:'translateX(-50%)',
        display:'flex', gap:12, padding:'12px 24px', borderRadius:20,
        background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)',
        border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 10px 40px rgba(0,0,0,0.5)',
        zIndex:10000, flexWrap:'nowrap'
      }}>
        <button onClick={() => { onGuidelines(logo); onClose(); }} className="flex items-center gap-2" style={{ padding:'10px 20px', borderRadius:12, fontSize:13, fontWeight:600, background:'rgba(255,255,255,0.1)', color:'white', border:'none', cursor:'pointer', transition:'all 0.2s' }}>
          <span>📋</span> Guidelines
        </button>
        <button onClick={() => { onMockup(logo); onClose(); }} className="flex items-center gap-2" style={{ padding:'10px 20px', borderRadius:12, fontSize:13, fontWeight:600, background:'rgba(255,255,255,0.1)', color:'white', border:'none', cursor:'pointer', transition:'all 0.2s' }}>
          <span>👕</span> Mockup
        </button>
        <button onClick={handleDl} className="flex items-center gap-2" style={{ padding:'10px 20px', borderRadius:12, fontSize:13, fontWeight:600, background:'var(--brand-gradient, linear-gradient(90deg,#7c3aed,#3b82f6))', color:'white', border:'none', cursor:'pointer', transition:'all 0.2s' }}>
          <span>⬇</span> Download
        </button>
      </div>

      {/* Image + arrows */}
      <div style={{ display:'flex', alignItems:'center', gap:40, width:'100%', justifyContent:'center', padding:'0 40px' }}>
        <button onClick={() => setIdx(i => Math.max(0,i-1))} disabled={idx===0}
          className="hover:scale-110 transition-transform"
          style={{ fontSize:32, background:'rgba(255,255,255,0.05)', color:'white', borderRadius:15, width:60, height:60, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:idx===0?0.1:1, border:'1px solid rgba(255,255,255,0.1)' }}>
          ‹
        </button>
        
        <div style={{ maxWidth:'min(800px, 85vw)', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div className="relative group">
            <img src={logo.logo_url} alt={`Variant ${idx+1}`}
              style={{ maxHeight:'75vh', width:'auto', maxWidth:'100%', borderRadius:24, boxShadow:'0 30px 100px rgba(0,0,0,0.8)', objectFit:'contain', background:'white' }}
              onError={e => { e.target.style.display='none'; }} />
            <div className="absolute inset-0 rounded-24 ring-1 ring-inset ring-white/10 pointer-events-none" />
          </div>
          <div style={{ marginTop:24, padding:'8px 20px', borderRadius:30, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color:'white', fontSize:13, fontWeight:500 }}>
              Variant {idx+1} of {logos.length} {logo.style && <span style={{ opacity:0.6, marginLeft:12, fontWeight:400, borderLeft:'1px solid rgba(255,255,255,0.2)', paddingLeft:12 }}>{logo.style}</span>}
            </p>
          </div>
        </div>

        <button onClick={() => setIdx(i => Math.min(logos.length-1,i+1))} disabled={idx===logos.length-1}
          className="hover:scale-110 transition-transform"
          style={{ fontSize:32, background:'rgba(255,255,255,0.05)', color:'white', borderRadius:15, width:60, height:60, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:idx===logos.length-1?0.1:1, border:'1px solid rgba(255,255,255,0.1)' }}>
          ›
        </button>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg, onGuidelinesClick, onMockupClick, onCustomizerClick, onImageClick }) => {
  const isUser = msg.role === 'user';
  const logoCount = msg.logos?.length ?? 0;
  
  // Use first logo for quick actions if multiple exist
  const primaryLogo = msg.logos?.[0] || msg.logo;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-3 brand-gradient text-white text-sm font-bold shadow-lg shadow-purple-500/20">
          B
        </div>
      )}
      <div style={{ maxWidth:'85%' }}>
        {/* Bubble */}
        {(msg.content || !msg.isGenerating) && (
          <div className={isUser ? 'chat-bubble-user shadow-md' : 'chat-bubble-ai shadow-sm'}
               style={isUser ? { wordBreak:'break-word', overflowWrap:'anywhere' } : {}}>
            {isUser ? msg.content : renderMarkdown(msg.content)}
          </div>
        )}

        {/* 2-box loader when generating */}
        {msg.isGenerating && <TwoBoxLoader />}

        {/* Logo result grid */}
        {logoCount > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-4">
              {msg.logos.map((logo, i) => (
                <div key={logo.id || i}
                  className="glass-card rounded-2xl overflow-hidden hover:-translate-y-1 transition-all hover:shadow-xl cursor-pointer group/card border border-white/10 bg-white"
                  style={{ width:'min(200px, 45%)' }}
                  onClick={() => onImageClick(msg.logos, i)}
                >
                  <div className="relative p-4 flex items-center justify-center aspect-square">
                    <img src={logo.logo_url} alt={`Variant ${i+1}`}
                      className="max-h-full max-w-full object-contain pointer-events-none"
                      crossOrigin="anonymous"
                      onError={e => { e.target.style.display='none'; }} />
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-colors flex items-center justify-center">
                       <span className="opacity-0 group-hover/card:opacity-100 bg-white/90 text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transition-opacity uppercase tracking-wider">Expand</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick Actions for the chosen direction */}
            <div className="flex gap-2 mt-4 flex-wrap">
               <button onClick={() => onGuidelinesClick(primaryLogo)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition flex items-center gap-2">
                📄 Guidelines
              </button>
              <button onClick={() => onMockupClick(primaryLogo)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition flex items-center gap-2">
                ✨ Mockups
              </button>
              <button onClick={() => onCustomizerClick(primaryLogo)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition flex items-center gap-2">
                ✏️ Typography Lockup
              </button>
              <button onClick={() => window.open(primaryLogo.logo_url, '_blank')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10 transition flex items-center gap-2">
                🔗 New Tab
              </button>
            </div>
          </div>
        )}

        {/* Fallback backward compatibility */}
        {msg.logo && !msg.logos && (
          <div className="mt-4 p-4 rounded-2xl glass-card max-w-sm bg-white">
            <img src={msg.logo.logo_url} alt="Generated Logo" className="w-full rounded-xl mb-3" crossOrigin="anonymous" />
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => onGuidelinesClick(msg.logo)}
                className="flex-1 py-2 px-3 text-xs font-bold rounded-xl brand-gradient text-white">
                📋 Guidelines
              </button>
              <button onClick={() => onMockupClick(msg.logo)}
                className="flex-1 py-2 px-3 text-xs font-bold rounded-xl border border-white/10 bg-white/5">
                👕 Mockups
              </button>
              <button onClick={() => onCustomizerClick(msg.logo)}
                className="flex-1 py-2 px-3 text-xs font-bold rounded-xl border border-white/10 bg-white/5">
                ✏️ Typography Lockup
              </button>
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ml-3 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-bold shadow-sm">
          U
        </div>
      )}
    </div>
  );
};


// ─── Session Item ─────────────────────────────────────────────
const SessionItem = ({ session, isActive, onClick, onDelete }) => (
  <div
    onClick={onClick}
    className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${
      isActive
        ? 'brand-gradient text-white shadow-lg'
        : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)]'
    }`}
  >
    <p className="text-sm font-medium truncate pr-6">{session.title}</p>
    <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-purple-200' : 'text-[var(--text-muted)]'}`}>
      {new Date(session.updated_at).toLocaleDateString()}
    </p>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
      className={`absolute right-2 top-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
        isActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
      }`}
    >
      ×
    </button>
  </div>
);

// ─── Main LogoAgent Page ───────────────────────────────────────
const LogoAgent = () => {
  const { user, getAuthToken } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { setLogoData } = useLogo();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hi! 👋 I'm **BrandyBot**, your AI branding partner. Tell me about the brand you want to build — what's the brand name and what industry are you in?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [brandContext, setBrandContext] = useState({});
  const [credits, setCredits] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [guidelinesModal, setGuidelinesModal] = useState({ open: false, logo: null });
  const [mockupModal, setMockupModal] = useState({ open: false, logo: null });
  const [customizerModal, setCustomizerModal] = useState({ open: false, logo: null });
  const [lightbox, setLightbox] = useState({ open: false, logos: [], index: 0 });
  const openLightbox = (logos, index) => setLightbox({ open: true, logos, index });
  const closeLightbox = () => setLightbox({ open: false, logos: [], index: 0 });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load sessions and credits on mount; handle ?session= & ?from=guest URL params
  useEffect(() => {
    fetchSessions();
    fetchCredits();

    // ── Handle URL params from guest handoff or direct session link ──
    const params = new URLSearchParams(window.location.search);
    const urlSessionId = params.get('session');
    const fromGuest    = params.get('from') === 'guest';

    if (urlSessionId) {
      // Load the session and optionally show a guest-handoff greeting
      loadSession(urlSessionId, fromGuest);
      // Clean URL without page reload
      window.history.replaceState({}, '', '/logo-agent');
      return;
    }

    // ── Fallback: legacy sessionStorage preload from old chatbot ──
    const preload = sessionStorage.getItem('brandybot-preload');
    if (preload) {
      try {
        const ctx = JSON.parse(preload);
        setBrandContext(ctx);
        const preloadMsg = Object.entries(ctx)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        if (preloadMsg) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'ai',
            content: `Welcome back! I picked up where we left off. Here's what I know about your brand: **${preloadMsg}**. Ready to continue?`
          }]);
        }
        sessionStorage.removeItem('brandybot-preload');
      } catch (e) { /* ignore */ }
    }
  }, []);


  const getToken = async () => {
    if (user?.getIdToken) return await user.getIdToken();
    return null;
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get(`${CHAT_BASE}/sessions`);
      setSessions(res.data.data || []);
    } catch (e) { /* silent */ }
  };

  const fetchCredits = async () => {
    try {
      const res = await api.get(`${CREDITS_BASE}`);
      setCredits(res.data.data?.balance);
    } catch (e) { /* silent */ }
  };

  const loadSession = async (sessionId, fromGuest = false) => {
    try {
      const res = await api.get(`${CHAT_BASE}/sessions/${sessionId}`);
      const session = res.data.data;
      setActiveSessionId(sessionId);
      const ctx = session.brand_context || {};
      setBrandContext(ctx);
      const loadedMessages = (session.messages || []).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        logo: m.metadata?.logoResult || null,
        logos: m.metadata?.logoResults || null
      }));
      setMessages(loadedMessages);

      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }

      // If coming from a guest handoff, add a confirmation message at the end
      if (fromGuest) {
        const ctxSummary = Object.entries(ctx)
          .filter(([, v]) => v)
          .map(([k, v]) => `**${k}**: ${v}`)
          .join(', ');
        const confirmText = ctxSummary
          ? `🎉 Welcome! I've restored our full conversation. Here's what I know about your brand so far: ${ctxSummary}.\n\nShall I generate your logo now? Just say **"Yes, create my logo!"** or tell me anything you'd like to change first.`
          : `🎉 Welcome! I've restored our conversation. Ready to create your logo? Just say **"Yes, create my logo!"** or continue refining your brand details.`;
        setMessages(prev => [...prev, {
          id: `guest-handoff-${Date.now()}`,
          role: 'ai',
          content: confirmText
        }]);
      }
    } catch (e) { console.error('Load session failed:', e); }
  };

  const newChat = () => {
    setActiveSessionId(null);
    setBrandContext({});
    setMessages([{
      id: 'welcome-new',
      role: 'ai',
      content: "Starting fresh! 🚀 Tell me about your new brand. What's the name and what does it do?"
    }]);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`${CHAT_BASE}/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) newChat();
    } catch (e) { /* silent */ }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Add a placeholder AI message that shows the MS Design loader
    const placeholderId = `ai-placeholder-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: placeholderId,
      role: 'ai',
      content: '',
      isGenerating: true
    }]);

    try {
      const res = await api.post(
        `${API_BASE}/message`,
        { sessionId: activeSessionId, message: text, brandContext },
      );
      const data = res.data.data;

      if (data.sessionId && !activeSessionId) {
        setActiveSessionId(data.sessionId);
        fetchSessions();
      }

      if (data.brandContext) setBrandContext(data.brandContext);
      if (data.action !== undefined) fetchCredits();

      // Check if this is a logo generation response
      const isLogoGen = data.action === 'logos_generated' || data.action === 'logo_generated';

      // Update the placeholder with real content
      setMessages(prev => prev.map(m =>
        m.id === placeholderId
          ? {
              ...m,
              content: data.reply,
              isGenerating: false,
              logos: isLogoGen && data.logos?.length ? data.logos : null,
              logo:  isLogoGen && !data.logos?.length ? data.logo : null,
            }
          : m
      ));

    } catch (err) {
      const status = err.response?.status;
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setMessages(prev => prev.map(m =>
        m.id === placeholderId
          ? {
              ...m,
              content: status === 402
                ? `😟 **${errMsg}** [Buy Credits →](/purchase)`
                : `⚠️ ${errMsg}`,
              isGenerating: false
            }
          : m
      ));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ── Sidebar ── */}
      <div className={`flex-shrink-0 flex flex-col border-r border-[var(--border-color)] transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-72' : 'w-0'}`}
           style={{ background: 'var(--bg-secondary)', height: '100dvh' }}>

        {/* ── TOP: Header + New Chat + Credits (fixed, never shrinks) ── */}
        <div className="flex-shrink-0 p-4 pb-0">
          {/* Logo + App Name */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">B</div>
            <span className="font-bold text-base brand-gradient-text truncate">BrandyBot</span>
          </div>

          {/* New Chat Button */}
          <button
            onClick={newChat}
            className="w-full py-2 px-3 rounded-xl brand-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity mb-3 truncate"
          >
            + New Chat
          </button>

          {/* Credits Badge */}
          {credits !== null && (
            <div className="flex items-center justify-between p-2.5 rounded-xl glass-card mb-3">
              <span className="text-xs text-[var(--text-muted)]">Credits</span>
              <span className={`text-sm font-bold ${credits < 10 ? 'text-red-400' : 'text-purple-400'}`}>
                {credits} left
                {credits < 10 && <Link to="/purchase" className="ml-2 text-xs text-blue-400 hover:underline">Buy</Link>}
              </span>
            </div>
          )}

          {/* Recent Chats Label */}
          <p className="text-xs text-[var(--text-muted)] mb-2 font-semibold uppercase tracking-wider">Recent Chats</p>
        </div>

        {/* ── MIDDLE: Sessions List (scrolls independently) ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-2">
          {sessions.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-4">No chats yet. Start creating!</p>
          ) : (
            sessions.map(s => (
              <SessionItem
                key={s.id}
                session={s}
                isActive={s.id === activeSessionId}
                onClick={() => loadSession(s.id)}
                onDelete={deleteSession}
              />
            ))
          )}
        </div>

        {/* ── BOTTOM: Nav Links (fixed, never shrinks) ── */}
        <div className="flex-shrink-0 p-4 border-t border-[var(--border-color)]">
          <Link to="/dashboard" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] text-sm transition-colors">
            📊 Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] text-sm transition-colors">
            🏠 Home
          </Link>
          <Link to="/logo_history" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] text-sm transition-colors">
            🖼 My Logos
          </Link>
        </div>
      </div>

      {/* ── Mobile/Tablet Sidebar Backdrop ── */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="sidebar-backdrop"
        />
      )}

      {/* ── Main Chat Area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]"
             style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(p => !p)} className="p-2 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] text-sm transition-colors">
              ☰
            </button>
            <h1 className="font-bold text-base">Logo Design Agent</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] transition-colors text-sm" title="Toggle Theme">
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/dashboard" className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map(msg => (
          <MessageBubble
              key={msg.id}
              msg={msg}
              onGuidelinesClick={(logo) => setGuidelinesModal({ open: true, logo })}
              onMockupClick={(logo) => setMockupModal({ open: true, logo })}
              onCustomizerClick={(logo) => setCustomizerModal({ open: true, logo })}
              onImageClick={openLightbox}
            />
          ))}
          {/* Dot animation — only when loading AND no isGenerating placeholder visible */}
          {loading && !messages.some(m => m.isGenerating) && (
            <div className="flex justify-start mb-4">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-3 brand-gradient text-white text-sm font-bold">B</div>
              <div className="chat-bubble-ai flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay:'0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay:'150ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay:'300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[var(--border-color)]" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message BrandyBot..."
              className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                maxHeight: '120px'
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-2xl brand-gradient text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0 text-lg"
            >
              ↑
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* ── Modals ── */}
      {guidelinesModal.open && (
        <BrandGuidelinesModal
          logo={guidelinesModal.logo}
          onClose={() => setGuidelinesModal({ open: false, logo: null })}
        />
      )}
      {mockupModal.open && (
        <MockupModal
          logo={mockupModal.logo}
          onClose={() => setMockupModal({ open: false, logo: null })}
        />
      )}
      {customizerModal.open && (
        <LogoCustomizerModal
          logo={customizerModal.logo}
          onClose={() => setCustomizerModal({ open: false, logo: null })}
        />
      )}
      {lightbox.open && lightbox.logos.length > 0 && (
        <LogoLightbox
          logos={lightbox.logos}
          startIndex={lightbox.index}
          onClose={closeLightbox}
          onGuidelines={(logo) => setGuidelinesModal({ open: true, logo })}
          onMockup={(logo) => {
            setLogoData({
              logoUrl: logo.logo_url,
              brandName: logo.brand_name || brandContext.name || "Brand",
              primaryColors: [], // Could extract from logo if available
              font: "Inter"
            });
            setMockupModal({ open: true, logo });
          }}
        />
      )}
    </div>
  );
};

export default LogoAgent;
