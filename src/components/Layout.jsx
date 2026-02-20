import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  Sun,
  Moon,
  LayoutDashboard,
  Map,
  Users,
  FileText,
  Pentagon,
  Circle,
  MapPin,
  Undo2,
  Redo2,
  Ruler,
  SquareDashedBottom,
  Bookmark,
  Camera,
  Download,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../theme.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Live Map', to: '/live-map', icon: Map },
  { label: 'CRM', to: '/crm', icon: Users },
  { label: 'Documents', to: '/documents', icon: FileText },
];

const DRAWING_TOOLS = ['polygon', 'circle', 'pin'];

const TOOLBAR_GROUPS = [
  {
    name: 'drawing',
    tools: [
      { name: 'polygon', icon: Pentagon, label: 'Polygon' },
      { name: 'circle', icon: Circle, label: 'Radius' },
      { name: 'pin', icon: MapPin, label: 'Drop Pin' },
      { name: 'undo', icon: Undo2, label: 'Undo' },
      { name: 'redo', icon: Redo2, label: 'Redo' },
    ],
  },
  {
    name: 'measurement',
    tools: [
      { name: 'ruler', icon: Ruler, label: 'Measure Distance' },
      { name: 'area', icon: SquareDashedBottom, label: 'Measure Area' },
    ],
  },
  {
    name: 'utility',
    tools: [
      { name: 'bookmark', icon: Bookmark, label: 'Bookmark View' },
      { name: 'screenshot', icon: Camera, label: 'Screenshot' },
      { name: 'export', icon: Download, label: 'Export' },
    ],
  },
];

function ToolButton({ tool, isActive, isHovered, onHover, onLeave, onClick, t, isDark }) {
  const Icon = tool.icon;
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef(null);

  const handleMouseEnter = () => {
    onHover();
    tooltipTimer.current = setTimeout(() => {
      setShowTooltip(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    onLeave();
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
      }
    };
  }, []);

  const isDrawingTool = DRAWING_TOOLS.includes(tool.name);

  let background = 'transparent';
  let border = '1px solid transparent';

  if (isActive && isDrawingTool) {
    background = isDark ? 'rgba(24, 119, 242, 0.15)' : 'rgba(21, 112, 232, 0.15)';
    border = `1px solid ${t.accent.primary}`;
  } else if (isHovered) {
    background = t.bg.tertiary;
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background,
          border,
          color: isActive ? t.accent.primary : isHovered ? t.text.primary : t.text.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Icon size={18} />
      </button>
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 6,
            background: t.bg.primary,
            border: `1px solid ${t.border.default}`,
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            color: t.text.primary,
            whiteSpace: 'nowrap',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {tool.label}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const { t, isDark, toggleTheme } = useTheme();
  const [themeHovered, setThemeHovered] = useState(false);
  const [hoveredTool, setHoveredTool] = useState(null);
  const [activeDrawingTool, setActiveDrawingTool] = useState(null);

  const handleToolClick = (toolName) => {
    if (DRAWING_TOOLS.includes(toolName)) {
      // Toggle drawing tool - only one can be active
      setActiveDrawingTool((current) => (current === toolName ? null : toolName));
    } else {
      console.log(`${toolName} clicked`);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Bar — h-14 (56px) with centered nav tabs */}
      <div
        className="h-14 flex items-center justify-between px-6 shrink-0"
        style={{ background: t.bg.primary, borderBottom: `1px solid ${t.border.subtle}`, position: 'relative', zIndex: 70 }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={isDark ? '/parcyl-logo-light.png' : '/parcyl-logo-dark.png'}
            alt="Parcyl.ai"
            style={{ height: 28 }}
          />
        </div>

        {/* Centered Nav Tabs */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: isActive ? t.bg.tertiary : 'transparent',
                  color: isActive ? t.text.primary : t.text.secondary,
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 13,
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = t.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  const isActive = location.pathname === item.to ||
                    (item.to !== '/' && location.pathname.startsWith(item.to));
                  if (!isActive) {
                    e.currentTarget.style.color = t.text.secondary;
                  }
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            onMouseEnter={() => setThemeHovered(true)}
            onMouseLeave={() => setThemeHovered(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: themeHovered ? t.bg.tertiary : 'transparent',
              border: `1px solid ${themeHovered ? t.border.default : 'transparent'}`,
              color: t.text.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center cursor-pointer transition-colors"
            style={{ color: t.text.tertiary }}
          >
            <Bell size={18} />
          </div>
          <button
            className="flex items-center gap-1.5 text-[13px] font-semibold h-[34px] px-3.5 rounded-[7px] transition-colors"
            style={{ background: t.accent.primary, color: '#fff' }}
          >
            <Plus size={14} />
            Add Deal
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: t.bg.tertiary }}
          >
            <span className="text-[13px] font-semibold" style={{ color: t.text.primary }}>B</span>
          </div>
        </div>
      </div>

      {/* Sub-Header Toolbar — h-11 (44px) */}
      <div
        className="h-11 flex px-6 shrink-0"
        style={{ background: t.bg.secondary, borderBottom: `1px solid ${t.border.default}`, position: 'relative', zIndex: 70, display: 'flex', alignItems: 'center' }}
      >
        {/* Search Bar (Left) */}
        <div
          className="rounded-lg h-9 px-3 w-[480px]"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.bg.primary, border: `1px solid ${t.border.default}` }}
        >
          <Search size={16} style={{ color: t.text.tertiary }} />
          <span className="text-[13px] flex-1" style={{ color: t.text.quaternary }}>
            Search properties, addresses, owners...
          </span>
          <span
            className="text-[11px] font-medium px-1.5 h-[22px] flex items-center rounded"
            style={{ background: t.bg.tertiary, color: t.text.tertiary }}
          >
            &#8984;K
          </span>
        </div>

        {/* Map Tools Toolbar — starts 32px after search bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 32 }}>
          {TOOLBAR_GROUPS.map((group, groupIndex) => (
            <div key={group.name} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Tool group container with border */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '2px 4px',
                  border: `1px solid ${t.border.default}`,
                  borderRadius: 8,
                }}
              >
                {group.tools.map((tool) => (
                  <ToolButton
                    key={tool.name}
                    tool={tool}
                    isActive={activeDrawingTool === tool.name}
                    isHovered={hoveredTool === tool.name}
                    onHover={() => setHoveredTool(tool.name)}
                    onLeave={() => setHoveredTool(null)}
                    onClick={() => handleToolClick(tool.name)}
                    t={t}
                    isDark={isDark}
                  />
                ))}
              </div>

              {/* Vertical divider between groups (except last) */}
              {groupIndex < TOOLBAR_GROUPS.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 24,
                    background: t.border.default,
                    marginLeft: 16,
                    marginRight: 16,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <Outlet key={location.pathname} />
    </div>
  );
}
