import { Link, Outlet, useLocation } from 'react-router-dom';
import { Search, Bell, Plus, Hexagon } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Live Map', to: '/live-map' },
  { label: 'CRM', to: '#' },
  { label: 'Properties', to: '#' },
  { label: 'Deals', to: '#' },
  { label: 'Markets', to: '#' },
  { label: 'Analytics', to: '#' },
  { label: 'Documents', to: '#' },
  { label: 'Settings', to: '#' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Bar — h-14 (56px) */}
      <div className="h-14 bg-slate-900 flex items-center justify-between px-6 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center">
            <Hexagon size={20} className="text-white" />
          </div>
          <span className="text-base font-bold text-white">Parcyl.AI</span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg h-9 px-3 w-[480px]">
          <Search size={16} className="text-slate-400" />
          <span className="text-[13px] text-slate-500 flex-1">Search properties, addresses, owners...</span>
          <span className="bg-slate-700 text-slate-400 text-[11px] font-medium px-1.5 h-[22px] flex items-center rounded">&#8984;K</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
            <Bell size={18} className="text-slate-400" />
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold h-[34px] px-3.5 rounded-[7px] transition-colors">
            <Plus size={14} />
            Add Deal
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center cursor-pointer">
            <span className="text-white text-[13px] font-semibold">B</span>
          </div>
        </div>
      </div>

      {/* Horizontal Nav — h-12 (48px) */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
        {NAV_ITEMS.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname === item.to;
          const isDisabled = item.to === '#';

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`h-full flex items-center justify-center px-4 text-[13px] border-b-2 transition-colors ${
                isActive
                  ? 'font-semibold text-slate-900 border-blue-600'
                  : isDisabled
                    ? 'font-medium text-slate-300 border-transparent cursor-default'
                    : 'font-medium text-slate-500 border-transparent hover:text-slate-700'
              }`}
              onClick={isDisabled ? (e) => e.preventDefault() : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
