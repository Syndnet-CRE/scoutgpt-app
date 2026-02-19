import { NavLink, Outlet } from 'react-router-dom';
import { Search, Bell, Plus, Hexagon, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../theme.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Live Map', to: '/live-map' },
  { label: 'CRM', to: '/crm' },
  { label: 'Properties', to: '/properties' },
  { label: 'Deals', to: '/deals' },
  { label: 'Markets', to: '/markets' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Documents', to: '/documents' },
  { label: 'Settings', to: '/settings' },
];

export default function Layout() {
  const { t, isDark, toggleTheme } = useTheme();
  const [themeHovered, setThemeHovered] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Bar — h-14 (56px) */}
      <div
        className="h-14 flex items-center justify-between px-6 shrink-0"
        style={{ background: t.bg.primary, borderBottom: `1px solid ${t.border.subtle}`, position: 'relative', zIndex: 70 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: t.semantic.success }}
          >
            <Hexagon size={20} style={{ color: '#fff' }} />
          </div>
          <span className="text-base font-bold" style={{ color: t.text.primary }}>Parcyl.AI</span>
        </div>

        {/* Search Bar */}
        <div
          className="flex items-center gap-2 rounded-lg h-9 px-3 w-[480px]"
          style={{ background: t.bg.secondary, border: `1px solid ${t.border.default}` }}
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

      {/* Horizontal Nav — h-12 (48px) */}
      <div
        className="h-12 flex items-center px-6 shrink-0"
        style={{ background: t.bg.secondary, borderBottom: `1px solid ${t.border.default}`, position: 'relative', zIndex: 70 }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `h-full flex items-center justify-center px-4 text-[13px] border-b-2 transition-colors ${
                isActive ? 'font-semibold' : 'font-medium'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? t.text.primary : t.text.tertiary,
              borderBottomColor: isActive ? t.accent.primary : 'transparent',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
