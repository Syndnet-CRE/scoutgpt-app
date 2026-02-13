import { useState, useRef, useEffect, useCallback } from "react";
import { fetchPropertyDetail } from "../../services/api";

// ── Design Tokens ──
const T = {
  bg: "#111114",
  bgPanel: "#16161a",
  bgDrawer: "#131316",
  bgInput: "#1e1e23",
  bgUserBubble: "#2a2a30",
  bgHover: "rgba(255,255,255,0.04)",
  bgChip: "rgba(255,255,255,0.03)",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.10)",
  borderMed: "rgba(255,255,255,0.14)",
  textPrimary: "#ececf0",
  textBody: "#d0d0d6",
  textSecondary: "#a0a0aa",
  textMuted: "#707078",
  textDim: "#505058",
  accent: "#2563eb",
  accentHover: "#3b82f6",
  accentSoft: "rgba(37,99,235,0.12)",
  green: "#22c55e",
  greenSoft: "rgba(34,197,94,0.10)",
  red: "#ef4444",
  amber: "#eab308",
};

const PANEL_WIDTH = 420;
const GAP = 10;
const RADIUS = 8;

// ── Icons ──
const Icons = {
  sparkle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill={T.accentHover} opacity="0.9"/>
      <path d="M18 14L19 17L22 18L19 19L18 22L17 19L14 18L17 17L18 14Z" fill={T.accentHover} opacity="0.5"/>
    </svg>
  ),
  send: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  spinner: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{animation:"spin 1s linear infinite"}}>
      <circle cx="8" cy="8" r="6" stroke={T.borderLight} strokeWidth="2"/>
      <path d="M8 2a6 6 0 014.9 2.5" stroke={T.accent} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  chat: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  doc: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  trendUp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  attach: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  mapPin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  heart: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  heartFilled: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={T.red} stroke={T.red} strokeWidth="2"/>
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
};

// ── Quick Actions ──
const QUICK_ACTIONS = [
  { text: "Vacant land in 78702" },
  { text: "Commercial over 2 acres" },
  { text: "Foreclosures downtown" },
  { text: "Market stats 78745" },
];

// ── Markdown renderer ──
function renderInlineBold(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j} style={{ color: T.textPrimary, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={j}>{part}</span>;
  });
}

function renderMarkdown(text) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;

    // Bullet lines: "- " or "• " or "* " (not bold **)
    const bulletMatch = line.match(/^\s*(?:[-•]|\*(?!\*))\s+(.*)/);
    if (bulletMatch) {
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, lineHeight: 1.65, paddingLeft: 4 }}>
          <span style={{ color: T.textMuted, flexShrink: 0, marginTop: 1 }}>•</span>
          <span>{renderInlineBold(bulletMatch[1])}</span>
        </div>
      );
    }

    return <div key={i} style={{ marginBottom: 4, lineHeight: 1.65 }}>{renderInlineBold(line)}</div>;
  });
}

// ── Format currency ──
function fmtCurrency(val) {
  if (!val && val !== 0) return "—";
  return "$" + val.toLocaleString();
}

// ── Chat Property Card (Mini) ──
function ChatPropertyCard({ property, loading, onShowOnMap, onViewDetails, saved, onToggleSave }) {
  const [h, setH] = useState(false);

  if (loading) {
    return (
      <div style={{
        background: T.bgUserBubble, border: `1px solid ${T.borderLight}`,
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
  const typeColor = useType.toLowerCase().includes("commercial") ? T.accent :
    useType.toLowerCase().includes("vacant") ? T.amber :
    useType.toLowerCase().includes("mixed") ? "#8b5cf6" : T.textMuted;

  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? "#26262c" : T.bgUserBubble, border: `1px solid ${h ? T.borderMed : T.borderLight}`,
      borderRadius: RADIUS, padding: "12px 14px", transition: "all 150ms", marginBottom: 8,
    }}>
      {/* Top row: type badge + year */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
            color: typeColor, background: typeColor + "1a", padding: "2px 8px", borderRadius: 10 }}>{useType}</span>
          {property.yearBuilt && <span style={{ fontSize: 11, color: T.textDim }}>{property.yearBuilt}</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }} style={{
          background: "none", border: "none", cursor: "pointer", padding: 4,
          color: saved ? T.red : T.textDim, display: "flex", transition: "color 150ms",
        }}
          onMouseEnter={e => { if (!saved) e.currentTarget.style.color = T.red; }}
          onMouseLeave={e => { if (!saved) e.currentTarget.style.color = T.textDim; }}
        >{saved ? Icons.heartFilled : Icons.heart}</button>
      </div>

      {/* Address */}
      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 3 }}>{property.addressFull}</div>
      <div style={{ fontSize: 11.5, color: T.textMuted, marginBottom: 8 }}>
        {property.addressCity}, TX {property.addressZip}
        {property.owner1NameFull && <span> · {property.owner1NameFull}</span>}
        {!property.owner1NameFull && property.ownership?.[0]?.owner1NameFull && (
          <span> · {property.ownership[0].owner1NameFull}</span>
        )}
      </div>

      {/* Key metrics row */}
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textSecondary, marginBottom: 10, flexWrap: "wrap" }}>
        <span>{fmtCurrency(property.taxAssessedValueTotal)}</span>
        <span style={{ color: T.textDim }}>·</span>
        <span>{property.areaLotAcres} ac</span>
        {property.areaBuilding > 0 && (<><span style={{ color: T.textDim }}>·</span><span>{property.areaBuilding.toLocaleString()} sf</span></>)}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onShowOnMap?.(property.attomId)} style={{
          flex: 1, padding: "6px 0", borderRadius: 6, border: "none", cursor: "pointer",
          background: T.accentSoft, color: T.accentHover, fontSize: 11.5, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 150ms",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = T.accentSoft}
        ><span style={{ display: "flex" }}>{Icons.mapPin}</span>Show on Map</button>
        <button onClick={() => onViewDetails?.(property.attomId)} style={{
          flex: 1, padding: "6px 0", borderRadius: 6, border: `1px solid ${T.borderLight}`,
          cursor: "pointer", background: "transparent", color: T.textSecondary, fontSize: 11.5, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 150ms",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMed; e.currentTarget.style.color = T.textPrimary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderLight; e.currentTarget.style.color = T.textSecondary; }}
        ><span style={{ display: "flex" }}>{Icons.eye}</span>Details</button>
      </div>
    </div>
  );
}

// ── Thinking Indicator ──
function ThinkingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0" }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0,
        background: `linear-gradient(135deg, ${T.accent}, ${T.accentHover})`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.spinner}</div>
      <div style={{ paddingTop: 3 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(i => (<div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent,
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`, opacity: 0.5 }} />))}
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 5 }}>Searching properties...</div>
      </div>
    </div>
  );
}

// ── History Drawer ──
function HistoryDrawer({ open, onClose, sessions, activeId, onSelect, onNewChat, searchQuery, onSearchChange }) {
  const ARTIFACTS = [
    { icon: Icons.doc, label: "Analysis Report", color: T.accentHover },
    { icon: Icons.grid, label: "Property Comparison", color: T.green },
    { icon: Icons.trendUp, label: "Market Trends", color: T.amber },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 10,
        background: "rgba(0,0,0,0.35)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 200ms ease" }} />
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        width: "72%", maxWidth: 310, zIndex: 20, background: T.bgDrawer,
        borderRight: `1px solid ${T.borderSubtle}`,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column",
        borderRadius: `${RADIUS}px 0 0 ${RADIUS}px`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary }}>Chats</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={onNewChat} style={{ background: T.accent, border: "none", borderRadius: 14,
              padding: "5px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff" }}
              onMouseEnter={e => e.target.style.background = "#1d4ed8"}
              onMouseLeave={e => e.target.style.background = T.accent}>+ New</button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
              color: T.textMuted, padding: 4, display: "flex", borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.color = T.textPrimary}
              onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>{Icons.close}</button>
          </div>
        </div>
        <div style={{ padding: "0 16px 12px", position: "relative" }}>
          <div style={{ position: "absolute", left: 28, top: 10, color: T.textDim, display: "flex" }}>{Icons.search}</div>
          <input value={searchQuery} onChange={e => onSearchChange(e.target.value)} placeholder="Search chats..."
            style={{ width: "100%", background: "#1e1e22", border: `1px solid ${T.borderLight}`,
              borderRadius: 6, padding: "9px 12px 9px 38px", fontSize: 13, color: T.textBody,
              outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "rgba(37,99,235,0.4)"}
            onBlur={e => e.target.style.borderColor = T.borderLight} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }} className="scout-scroll">
          <div style={{ fontSize: 11, fontWeight: 600, color: T.green, textTransform: "uppercase",
            letterSpacing: 1, padding: "4px 8px 8px" }}>Recent</div>
          {sessions.filter(s => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase())).map(session => {
            const isActive = session.id === activeId;
            return (
              <button key={session.id} onClick={() => onSelect(session.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                background: isActive ? T.accent : "transparent", border: "none", borderRadius: 6,
                padding: "9px 12px", margin: "1px 0", cursor: "pointer", transition: "background 120ms",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.bgHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ color: isActive ? "rgba(255,255,255,0.9)" : T.textMuted, display: "flex", flexShrink: 0 }}>{Icons.chat}</span>
                <div style={{ overflow: "hidden", minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : T.textBody,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.title}</div>
                  <div style={{ fontSize: 11, color: isActive ? "rgba(255,255,255,0.65)" : T.textDim,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{session.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ margin: "8px 10px 12px", background: "#1a1a1e", border: `1px solid ${T.borderSubtle}`,
          borderRadius: RADIUS, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.green, textTransform: "uppercase",
            letterSpacing: 1, marginBottom: 12 }}>Artifacts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ARTIFACTS.map((item, i) => (
              <button key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "none",
                border: "none", cursor: "pointer", padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <span style={{ color: item.color, display: "flex" }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.textBody }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Collapsed Toggle Button ──
function ToggleButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed", right: GAP, bottom: "calc(50vh - 24px)",
        width: 48, height: 48, borderRadius: 12,
        background: hovered ? T.accent : "#1e1e24",
        border: `1px solid ${hovered ? T.accent : T.borderLight}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 200ms ease", zIndex: 55,
      }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
          fill={hovered ? "white" : T.textSecondary} stroke={hovered ? "white" : T.textSecondary}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div style={{
        position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%",
        background: T.accent, border: "2px solid #1e1e24",
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
}) {
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
    return <ToggleButton onClick={() => setPanelOpen(true)} />;
  }

  return (
    <div style={{
      position: "fixed", top: GAP, right: GAP, bottom: GAP, width: PANEL_WIDTH,
      display: "flex", flexDirection: "column", background: T.bgPanel,
      borderRadius: RADIUS, border: `1px solid ${T.borderSubtle}`,
      boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.15)",
      overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      color: T.textBody, zIndex: 55,
      animation: "slideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    }}>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(${PANEL_WIDTH + GAP + 10}px);opacity:0.8} to{transform:translateX(0);opacity:1} }
        .scout-scroll::-webkit-scrollbar { width: 4px; }
        .scout-scroll::-webkit-scrollbar-track { background: transparent; }
        .scout-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .scout-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
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
      />

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px", borderBottom: `1px solid ${T.borderSubtle}`,
        flexShrink: 0, position: "relative", zIndex: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => setHistoryOpen(true)} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${T.borderLight}`,
            borderRadius: 14, padding: "4px 11px", cursor: "pointer",
            fontSize: 12, fontWeight: 500, color: T.textSecondary, transition: "all 150ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = T.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = T.textSecondary; }}>
            <span style={{ display: "flex" }}>{Icons.clock}</span>
            History
            <span style={{ color: T.textDim, fontSize: 10, marginLeft: 1 }}>›</span>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={createNewChat} style={{
            background: T.accent, border: "none", borderRadius: 14,
            padding: "4px 12px", cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: "#fff",
          }}
            onMouseEnter={e => e.target.style.background = "#1d4ed8"}
            onMouseLeave={e => e.target.style.background = T.accent}>+ New</button>
          <button onClick={handleClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: T.textMuted, padding: 4, display: "flex", borderRadius: 4,
          }}
            onMouseEnter={e => e.currentTarget.style.color = T.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>{Icons.close}</button>
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
              background: T.accentSoft, border: `1px solid rgba(37,99,235,0.15)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{Icons.sparkle}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, marginTop: 4 }}>What can I help you find?</div>
            <div style={{ fontSize: 13, color: T.textMuted, textAlign: "center", maxWidth: 260, lineHeight: 1.5 }}>
              Search properties, analyze markets, or explore Travis County parcels
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7, marginTop: 8, maxWidth: 340 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <button key={i} onClick={() => handleSend(a.text)} style={{
                  background: T.bgChip, border: `1px solid ${T.borderMed}`,
                  borderRadius: 18, padding: "7px 14px", cursor: "pointer",
                  fontSize: 12, fontWeight: 500, color: T.textSecondary,
                  transition: "all 150ms", whiteSpace: "nowrap",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = T.textPrimary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderMed; e.currentTarget.style.background = T.bgChip; e.currentTarget.style.color = T.textSecondary; }}
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
                  maxWidth: "82%", background: T.bgUserBubble,
                  border: `1px solid ${T.borderSubtle}`,
                  borderRadius: `${RADIUS}px ${RADIUS}px 3px ${RADIUS}px`,
                  padding: "10px 14px", fontSize: 14, lineHeight: 1.5, color: T.textPrimary,
                }}>{msg.content}</div>
              </div>
            ) : (
              /* ── Assistant ── */
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7, paddingLeft: 1 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: `linear-gradient(135deg, ${T.accent}, ${T.accentHover})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: T.textDim }}>Scout</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: T.textBody, paddingLeft: 1 }}>
                  {renderMarkdown(msg.content)}
                </div>

                {/* Property count bar + Show all on map */}
                {msg.properties?.length > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: 12, padding: "9px 12px",
                    background: T.greenSoft, border: `1px solid rgba(34,197,94,0.15)`, borderRadius: 7,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.green }}>{msg.properties.length} properties found</span>
                    <button onClick={() => {
                      onHighlightProperties?.(msg.properties);
                    }} style={{ background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, color: T.accent }}>Show all on map →</button>
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
                      />
                    ))}
                    {msg.properties.length > 5 && (
                      <div style={{
                        textAlign: "center", padding: "8px 0", fontSize: 12,
                        color: T.textMuted, fontStyle: "italic",
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
        {loading && <ThinkingIndicator />}
      </div>

      {/* ── Input Area ── */}
      <div style={{ padding: "10px 12px 8px", flexShrink: 0 }}>
        <div style={{
          background: inputFocused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${inputFocused ? "rgba(37,99,235,0.35)" : T.borderLight}`,
          borderRadius: RADIUS, padding: "10px 11px", transition: "all 200ms ease",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <textarea ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}
            placeholder="Ask about properties, parcels, or market data..."
            rows={1} style={{
              width: "100%", background: "none", border: "none", outline: "none",
              resize: "none", fontSize: 13.5, lineHeight: 1.5,
              color: T.textPrimary, fontFamily: "inherit",
              minHeight: 24, maxHeight: 120, verticalAlign: "top",
            }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button style={{
              width: 28, height: 28, borderRadius: "50%", border: `1px solid ${T.borderLight}`,
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.textMuted, transition: "all 150ms",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMed; e.currentTarget.style.color = T.textSecondary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderLight; e.currentTarget.style.color = T.textMuted; }}
            >{Icons.attach}</button>
            <button onClick={() => handleSend()} disabled={!hasText || loading} style={{
              width: 30, height: 30, borderRadius: 7, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: hasText && !loading ? "pointer" : "not-allowed",
              background: hasText && !loading ? T.accent : "rgba(255,255,255,0.06)",
              color: hasText && !loading ? "#fff" : T.textDim,
              transition: "all 200ms ease", flexShrink: 0,
            }}>{loading ? Icons.spinner : Icons.send}</button>
          </div>
        </div>
        <div style={{
          textAlign: "center", padding: "8px 0 2px",
          fontSize: 11, color: T.textDim, letterSpacing: 0.1,
        }}>
          Syndnet is AI and can make mistakes. Please double-check responses.
        </div>
      </div>
    </div>
  );
}
