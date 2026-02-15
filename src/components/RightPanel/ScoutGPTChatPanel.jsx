import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, Search, Clock, MessageSquare, FileText, LayoutGrid, TrendingUp, X, Plus, MapPin, Heart, Eye, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { useTheme } from '../../theme.jsx';
import { fetchPropertyDetail } from "../../services/api";

const PANEL_WIDTH = 420;
const GAP = 10;
const RADIUS = 8;

// ── Quick Actions ──
const QUICK_ACTIONS = [
  { text: "Vacant land in 78702" },
  { text: "Commercial over 2 acres" },
  { text: "Foreclosures downtown" },
  { text: "Market stats 78745" },
];

// ── Markdown renderer ──
function renderInlineBold(text, t) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j} style={{ color: t.text.primary, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={j}>{part}</span>;
  });
}

function renderMarkdown(text, t) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;

    // Bullet lines: "- " or "• " or "* " (not bold **)
    const bulletMatch = line.match(/^\s*(?:[-•]|\*(?!\*))\s+(.*)/);
    if (bulletMatch) {
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, lineHeight: 1.65, paddingLeft: 4 }}>
          <span style={{ color: t.text.quaternary, flexShrink: 0, marginTop: 1 }}>•</span>
          <span>{renderInlineBold(bulletMatch[1], t)}</span>
        </div>
      );
    }

    return <div key={i} style={{ marginBottom: 4, lineHeight: 1.65 }}>{renderInlineBold(line, t)}</div>;
  });
}

// ── Format currency ──
function fmtCurrency(val) {
  if (!val && val !== 0) return "—";
  return "$" + val.toLocaleString();
}

// ── Chat Property Card (Mini) ──
function ChatPropertyCard({ property, loading, onShowOnMap, onViewDetails, saved, onToggleSave, t }) {
  const [h, setH] = useState(false);

  if (loading) {
    return (
      <div style={{
        background: t.bg.secondary, border: `1px solid ${t.border.default}`,
        borderRadius: RADIUS, padding: "14px 16px", marginBottom: 8,
      }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 60, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)", animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ width: 40, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.04)", animation: "pulse 1.4s ease-in-out 0.2s infinite" }} />
        </div>
        <div style={{ width: "75%", height: 16, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 6, animation: "pulse 1.4s ease-in-out 0.1s infinite" }} />
        <div style={{ width: "55%", height: 13, borderRadius: 4, background: "rgba(255,255,255,0.04)", marginBottom: 10, animation: "pulse 1.4s ease-in-out 0.3s infinite" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.04)", animation: "pulse 1.4s ease-in-out 0.2s infinite" }} />
          <div style={{ flex: 1, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.04)", animation: "pulse 1.4s ease-in-out 0.4s infinite" }} />
        </div>
      </div>
    );
  }

  if (!property) return null;

  const useType = property.propertyUseStandardized || "Unknown";
  const typeColor = useType.toLowerCase().includes("commercial") ? t.accent.green :
    useType.toLowerCase().includes("vacant") ? t.semantic.warning :
    useType.toLowerCase().includes("mixed") ? "#8b5cf6" : t.text.quaternary;

  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? t.bg.tertiary : t.bg.secondary, border: `1px solid ${h ? t.border.strong : t.border.default}`,
      borderRadius: RADIUS, padding: "12px 14px", transition: "all 150ms", marginBottom: 8,
    }}>
      {/* Top row: type badge + year */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
            color: typeColor, background: typeColor + "1a", padding: "2px 8px", borderRadius: 10 }}>{useType}</span>
          {property.yearBuilt && <span style={{ fontSize: 11, color: t.text.quaternary }}>{property.yearBuilt}</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }} style={{
          background: "none", border: "none", cursor: "pointer", padding: 4,
          color: saved ? t.semantic.error : t.text.quaternary, display: "flex", transition: "color 150ms",
        }}
          onMouseEnter={e => { if (!saved) e.currentTarget.style.color = t.semantic.error; }}
          onMouseLeave={e => { if (!saved) e.currentTarget.style.color = t.text.quaternary; }}
        ><Heart size={14} fill={saved ? "currentColor" : "none"} /></button>
      </div>

      {/* Address */}
      <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary, marginBottom: 3 }}>{property.addressFull}</div>
      <div style={{ fontSize: 11.5, color: t.text.quaternary, marginBottom: 8 }}>
        {property.addressCity}, TX {property.addressZip}
        {property.owner1NameFull && <span> · {property.owner1NameFull}</span>}
        {!property.owner1NameFull && property.ownership?.[0]?.owner1NameFull && (
          <span> · {property.ownership[0].owner1NameFull}</span>
        )}
      </div>

      {/* Key metrics row */}
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: t.text.tertiary, marginBottom: 10, flexWrap: "wrap" }}>
        <span>{fmtCurrency(property.taxAssessedValueTotal)}</span>
        <span style={{ color: t.text.quaternary }}>·</span>
        <span>{property.areaLotAcres} ac</span>
        {property.areaBuilding > 0 && (<><span style={{ color: t.text.quaternary }}>·</span><span>{property.areaBuilding.toLocaleString()} sf</span></>)}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onShowOnMap?.(property.attomId)} style={{
          flex: 1, padding: "6px 0", borderRadius: 6, border: "none", cursor: "pointer",
          background: t.accent.greenMuted, color: t.accent.green, fontSize: 11.5, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 150ms",
        }}
          onMouseEnter={e => e.currentTarget.style.background = t.accent.greenBorder}
          onMouseLeave={e => e.currentTarget.style.background = t.accent.greenMuted}
        ><MapPin size={14} />Show on Map</button>
        <button onClick={() => onViewDetails?.(property.attomId)} style={{
          flex: 1, padding: "6px 0", borderRadius: 6, border: `1px solid ${t.border.default}`,
          cursor: "pointer", background: "transparent", color: t.text.tertiary, fontSize: 11.5, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 150ms",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.border.strong; e.currentTarget.style.color = t.text.primary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border.default; e.currentTarget.style.color = t.text.tertiary; }}
        ><Eye size={14} />Details</button>
      </div>
    </div>
  );
}

// ── Thinking Indicator ──
function ThinkingIndicator({ t }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0" }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0,
        background: t.accent.green,
        display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 size={16} className="animate-spin" style={{ color: "#fff" }} /></div>
      <div style={{ paddingTop: 3 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(i => (<div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: t.accent.green,
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`, opacity: 0.5 }} />))}
        </div>
        <div style={{ fontSize: 12, color: t.text.quaternary, marginTop: 5 }}>Searching properties...</div>
      </div>
    </div>
  );
}

// ── History Drawer ──
function HistoryDrawer({ open, onClose, sessions, activeId, onSelect, onNewChat, searchQuery, onSearchChange, t }) {
  const ARTIFACTS = [
    { icon: FileText, label: "Analysis Report", color: t.accent.green },
    { icon: LayoutGrid, label: "Property Comparison", color: t.semantic.success },
    { icon: TrendingUp, label: "Market Trends", color: t.semantic.warning },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 10,
        background: "rgba(0,0,0,0.35)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 200ms ease" }} />
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        width: "72%", maxWidth: 310, zIndex: 20, background: t.bg.primary,
        borderRight: `1px solid ${t.border.subtle}`,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column",
        borderRadius: `${RADIUS}px 0 0 ${RADIUS}px`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: t.text.primary }}>Chats</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={onNewChat} style={{ background: t.accent.green, border: "none", borderRadius: 14,
              padding: "5px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff" }}
              onMouseEnter={e => e.target.style.background = t.accent.greenHover}
              onMouseLeave={e => e.target.style.background = t.accent.green}>+ New</button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
              color: t.text.quaternary, padding: 4, display: "flex", borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.color = t.text.primary}
              onMouseLeave={e => e.currentTarget.style.color = t.text.quaternary}><X size={18} /></button>
          </div>
        </div>
        <div style={{ padding: "0 16px 12px", position: "relative" }}>
          <div style={{ position: "absolute", left: 28, top: 10, color: t.text.quaternary, display: "flex" }}><Search size={15} /></div>
          <input value={searchQuery} onChange={e => onSearchChange(e.target.value)} placeholder="Search chats..."
            style={{ width: "100%", background: t.bg.secondary, border: `1px solid ${t.border.default}`,
              borderRadius: 6, padding: "9px 12px 9px 38px", fontSize: 13, color: t.text.secondary,
              outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = t.accent.greenBorder}
            onBlur={e => e.target.style.borderColor = t.border.default} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }} className="scout-scroll">
          <div style={{ fontSize: 11, fontWeight: 600, color: t.semantic.success, textTransform: "uppercase",
            letterSpacing: 1, padding: "4px 8px 8px" }}>Recent</div>
          {sessions.filter(s => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase())).map(session => {
            const isActive = session.id === activeId;
            return (
              <button key={session.id} onClick={() => onSelect(session.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                background: isActive ? t.accent.green : "transparent", border: "none", borderRadius: 6,
                padding: "9px 12px", margin: "1px 0", cursor: "pointer", transition: "background 120ms",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.bg.tertiary; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ color: isActive ? "rgba(255,255,255,0.9)" : t.text.quaternary, display: "flex", flexShrink: 0 }}><MessageSquare size={16} /></span>
                <div style={{ overflow: "hidden", minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : t.text.secondary,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.title}</div>
                  <div style={{ fontSize: 11, color: isActive ? "rgba(255,255,255,0.65)" : t.text.quaternary,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{session.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ margin: "8px 10px 12px", background: t.bg.secondary, border: `1px solid ${t.border.subtle}`,
          borderRadius: RADIUS, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: t.semantic.success, textTransform: "uppercase",
            letterSpacing: 1, marginBottom: 12 }}>Artifacts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ARTIFACTS.map((item, i) => (
              <button key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "none",
                border: "none", cursor: "pointer", padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <span style={{ color: item.color, display: "flex" }}><item.icon size={16} /></span>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Collapsed Toggle Button ──
function ToggleButton({ onClick, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed", right: GAP, bottom: "calc(50vh - 24px)",
        width: 48, height: 48, borderRadius: 12,
        background: hovered ? t.accent.green : t.bg.secondary,
        border: `1px solid ${hovered ? t.accent.green : t.border.default}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 200ms ease", zIndex: 55,
      }}>
      <MessageSquare size={22} fill={hovered ? "white" : t.text.tertiary} color={hovered ? "white" : t.text.tertiary} />
      <div style={{
        position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%",
        background: t.accent.green, border: `2px solid ${t.bg.secondary}`,
        opacity: hovered ? 0 : 1, transition: "opacity 150ms",
      }} />
    </button>
  );
}

// ── Main Export ──
export default function ScoutGPTChatPanel({
  messages = [],
  loading = false,
  onSend,
  onSelectProperty,
  onShowOnMap,
  onHighlightProperties,
  onNewChat,
  onClose,
  zIndex,
  onBringToFront,
}) {
  const { t } = useTheme();

  // ── Multi-session state ──
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // ── UI state ──
  const [panelOpen, setPanelOpen] = useState(true);
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [savedProperties, setSavedProperties] = useState(new Set());

  // ── Property cards state (progressive loading) ──
  const [cardData, setCardData] = useState({});
  const [cardLoading, setCardLoading] = useState(new Set());
  const lastFetchedRef = useRef(new Set());

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // ── Create new session ──
  const createNewChat = useCallback(() => {
    onNewChat?.(); // Reset parent state (messages, highlights, markers)
    const id = "chat_" + Date.now();
    setSessions(prev => [{ id, title: "New chat", subtitle: "Just now" }, ...prev]);
    setActiveSessionId(id);
    setHistoryOpen(false);
    setInput("");
    setCardData({}); // Clear cached property cards
    lastFetchedRef.current = new Set(); // Reset fetch tracking
    onHighlightProperties?.([]);
  }, [onNewChat, onHighlightProperties]);

  // ── Switch session ──
  const switchSession = useCallback((id) => {
    setActiveSessionId(id);
    setHistoryOpen(false);
    setHistorySearch("");
  }, []);

  // Init first session
  useEffect(() => { if (sessions.length === 0) createNewChat(); }, []); // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // ── Progressive property card fetching ──
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant" || !lastMsg.properties?.length) return;

    const toFetch = lastMsg.properties.slice(0, 5).filter(
      id => !cardData[id] && !cardLoading.has(id) && !lastFetchedRef.current.has(id)
    );
    if (toFetch.length === 0) return;

    toFetch.forEach(id => lastFetchedRef.current.add(id));
    setCardLoading(prev => {
      const next = new Set(prev);
      toFetch.forEach(id => next.add(id));
      return next;
    });

    // Fetch each in parallel — progressive reveal as each resolves
    toFetch.forEach(async (attomId) => {
      try {
        const data = await fetchPropertyDetail(attomId);
        setCardData(prev => ({ ...prev, [attomId]: data }));
      } catch (err) {
        console.error(`[CHAT] Failed to fetch property ${attomId}:`, err);
      } finally {
        setCardLoading(prev => {
          const next = new Set(prev);
          next.delete(attomId);
          return next;
        });
      }
    });
  }, [messages]); // eslint-disable-line

  // ── Input handling ──
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; }
  }, []);

  // ── Send message ──
  const handleSend = useCallback((text) => {
    const msg = typeof text === "string" ? text : input;
    if (!msg.trim() || loading) return;
    if (messages.length <= 1) {
      setSessions(prev => prev.map(s => s.id === activeSessionId
        ? { ...s, title: msg.trim().slice(0, 40), subtitle: msg.trim().slice(0, 50) } : s));
    }
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Call parent send handler — goes to useChat → POST /api/chat
    onSend?.(msg.trim());
  }, [input, loading, messages, activeSessionId, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const toggleSave = useCallback((attomId) => {
    setSavedProperties(prev => {
      const next = new Set(prev);
      if (next.has(attomId)) next.delete(attomId); else next.add(attomId);
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
    onClose?.();
  }, [onClose]);

  const hasText = input.trim().length > 0;

  // ── Collapsed state ──
  if (!panelOpen) {
    return <ToggleButton onClick={() => setPanelOpen(true)} t={t} />;
  }

  return (
    <div onMouseDown={onBringToFront} style={{
      position: "fixed", top: 60, right: GAP, bottom: GAP, width: PANEL_WIDTH,
      display: "flex", flexDirection: "column", background: t.bg.primary,
      borderRadius: RADIUS, border: `1px solid ${t.border.subtle}`,
      boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.15)",
      overflow: "hidden",
      fontFamily: t.font.display,
      color: t.text.secondary, zIndex: zIndex || 55,
      animation: "slideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    }}>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(${PANEL_WIDTH + GAP + 10}px);opacity:0.8} to{transform:translateX(0);opacity:1} }
        .animate-spin { animation: spin 1s linear infinite; }
        .scout-scroll::-webkit-scrollbar { width: 4px; }
        .scout-scroll::-webkit-scrollbar-track { background: transparent; }
        .scout-scroll::-webkit-scrollbar-thumb { background: ${t.border.subtle}; border-radius: 4px; }
        .scout-scroll::-webkit-scrollbar-thumb:hover { background: ${t.border.default}; }
      `}</style>

      {/* History Drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => { setHistoryOpen(false); setHistorySearch(""); }}
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={switchSession}
        onNewChat={createNewChat}
        searchQuery={historySearch}
        onSearchChange={setHistorySearch}
        t={t}
      />

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px", borderBottom: `1px solid ${t.border.subtle}`,
        flexShrink: 0, position: "relative", zIndex: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => setHistoryOpen(true)} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: t.bg.tertiary, border: `1px solid ${t.border.default}`,
            borderRadius: 14, padding: "4px 11px", cursor: "pointer",
            fontSize: 12, fontWeight: 500, color: t.text.tertiary, transition: "all 150ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = t.bg.elevated; e.currentTarget.style.color = t.text.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.bg.tertiary; e.currentTarget.style.color = t.text.tertiary; }}>
            <Clock size={14} />
            History
            <ChevronRight size={14} style={{ color: t.text.quaternary }} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={createNewChat} style={{
            background: t.accent.green, border: "none", borderRadius: 14,
            padding: "4px 12px", cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: "#fff",
          }}
            onMouseEnter={e => e.target.style.background = t.accent.greenHover}
            onMouseLeave={e => e.target.style.background = t.accent.green}>+ New</button>
          <button onClick={handleClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: t.text.quaternary, padding: 4, display: "flex", borderRadius: 4,
          }}
            onMouseEnter={e => e.currentTarget.style.color = t.text.primary}
            onMouseLeave={e => e.currentTarget.style.color = t.text.quaternary}><X size={18} /></button>
        </div>
      </div>

      {/* ── Scroll Region ── */}
      <div ref={scrollRef} className="scout-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px" }}>

        {/* Welcome */}
        {messages.length === 0 && !loading && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: 12, paddingBottom: 40,
            animation: "fadeUp 400ms ease-out",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: t.accent.greenMuted, border: `1px solid ${t.accent.greenBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Sparkles size={24} style={{ color: t.accent.green }} /></div>
            <div style={{ fontSize: 17, fontWeight: 700, color: t.text.primary, marginTop: 4 }}>What can I help you find?</div>
            <div style={{ fontSize: 13, color: t.text.quaternary, textAlign: "center", maxWidth: 260, lineHeight: 1.5 }}>
              Search properties, analyze markets, or explore Travis County parcels
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7, marginTop: 8, maxWidth: 340 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <button key={i} onClick={() => handleSend(a.text)} style={{
                  background: t.bg.secondary, border: `1px solid ${t.border.strong}`,
                  borderRadius: 18, padding: "7px 14px", cursor: "pointer",
                  fontSize: 12, fontWeight: 500, color: t.text.tertiary,
                  transition: "all 150ms", whiteSpace: "nowrap",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.border.strong; e.currentTarget.style.background = t.bg.tertiary; e.currentTarget.style.color = t.text.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border.strong; e.currentTarget.style.background = t.bg.secondary; e.currentTarget.style.color = t.text.tertiary; }}
                >{a.text}</button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 18, animation: "fadeUp 250ms ease-out" }}>
            {msg.role === "user" ? (
              /* ── User bubble ── */
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{
                  maxWidth: "82%", background: t.accent.greenMuted,
                  border: `1px solid ${t.accent.greenBorder}`,
                  borderRadius: `${RADIUS}px ${RADIUS}px 3px ${RADIUS}px`,
                  padding: "10px 14px", fontSize: 14, lineHeight: 1.5, color: t.text.primary,
                }}>{msg.content}</div>
              </div>
            ) : (
              /* ── Assistant ── */
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7, paddingLeft: 1 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: t.accent.green,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Sparkles size={10} style={{ color: "white" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: t.text.quaternary }}>Scout</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: t.text.secondary, paddingLeft: 1 }}>
                  {renderMarkdown(msg.content, t)}
                </div>

                {/* Property count bar + Show all on map */}
                {msg.properties?.length > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: 12, padding: "9px 12px",
                    background: t.accent.greenMuted, border: `1px solid ${t.accent.greenBorder}`, borderRadius: 7,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.semantic.success }}>{msg.properties.length} properties found</span>
                    <button onClick={() => {
                      onHighlightProperties?.(msg.properties);
                    }} style={{ background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, color: t.accent.green }}>Show all on map →</button>
                  </div>
                )}

                {/* Inline property cards (first 5) */}
                {msg.properties?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {msg.properties.slice(0, 5).map((attomId) => (
                      <ChatPropertyCard
                        key={attomId}
                        property={cardData[attomId]}
                        loading={cardLoading.has(attomId) || (!cardData[attomId] && msg.properties.includes(attomId))}
                        onShowOnMap={(id) => onShowOnMap?.(id)}
                        onViewDetails={(id) => onSelectProperty?.(id)}
                        saved={savedProperties.has(attomId)}
                        onToggleSave={() => toggleSave(attomId)}
                        t={t}
                      />
                    ))}
                    {msg.properties.length > 5 && (
                      <div style={{
                        textAlign: "center", padding: "8px 0", fontSize: 12,
                        color: t.text.quaternary, fontStyle: "italic",
                      }}>
                        +{msg.properties.length - 5} more on map
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && <ThinkingIndicator t={t} />}
      </div>

      {/* ── Input Area ── */}
      <div style={{ padding: "10px 12px 8px", flexShrink: 0 }}>
        <div style={{
          background: inputFocused ? t.bg.tertiary : t.bg.secondary,
          border: `1px solid ${inputFocused ? t.accent.greenBorder : t.border.default}`,
          borderRadius: RADIUS, padding: "10px 11px", transition: "all 200ms ease",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <textarea ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}
            placeholder="Ask about properties, parcels, or market data..."
            rows={1} style={{
              width: "100%", background: "none", border: "none", outline: "none",
              resize: "none", fontSize: 13.5, lineHeight: 1.5,
              color: t.text.primary, fontFamily: t.font.display,
              minHeight: 24, maxHeight: 120, verticalAlign: "top",
            }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button style={{
              width: 28, height: 28, borderRadius: "50%", border: `1px solid ${t.border.default}`,
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: t.text.quaternary, transition: "all 150ms",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.border.strong; e.currentTarget.style.color = t.text.tertiary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border.default; e.currentTarget.style.color = t.text.quaternary; }}
            ><Plus size={18} /></button>
            <button onClick={() => handleSend()} disabled={!hasText || loading} style={{
              width: 30, height: 30, borderRadius: 7, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: hasText && !loading ? "pointer" : "not-allowed",
              background: hasText && !loading ? t.accent.green : t.bg.tertiary,
              color: hasText && !loading ? "#fff" : t.text.quaternary,
              transition: "all 200ms ease", flexShrink: 0,
            }}>{loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}</button>
          </div>
        </div>
        <div style={{
          textAlign: "center", padding: "8px 0 2px",
          fontSize: 11, color: t.text.quaternary, letterSpacing: 0.1,
        }}>
          Syndnet is AI and can make mistakes. Please double-check responses.
        </div>
      </div>
    </div>
  );
}
