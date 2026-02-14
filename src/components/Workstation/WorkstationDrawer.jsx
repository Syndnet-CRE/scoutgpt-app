import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropertyTab from './PropertyTab';
import CompsTab from './CompsTab';
import DealTab from './DealTab';

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  bg: '#0f172a',
  bgGradient: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(15,23,42,0.99))',
  borderAccent: 'rgba(99,102,241,0.2)',
  borderLight: 'rgba(51,65,85,0.5)',
  accent: '#6366f1',
  accentLight: '#a5b4fc',
  text: '#e2e8f0',
  textDim: '#94a3b8',
  textMuted: '#64748b',
  shadow: '0 -10px 60px rgba(0,0,0,0.4)',
};

const font = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono = "'JetBrains Mono', 'Fira Code', monospace";

// ══════════════════════════════════════════════════════════════════════════════
// HELPER: get value with fallback
// ══════════════════════════════════════════════════════════════════════════════

const get = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
  }
  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
// WORKSTATION DRAWER
// ══════════════════════════════════════════════════════════════════════════════

export default function WorkstationDrawer({ data, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('property');
  const [height, setHeight] = useState(55); // vh
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startY: 0, startHeight: 0 });

  // Reset tab when data changes
  useEffect(() => {
    if (data) setActiveTab('property');
  }, [data?.attomId]);

  // Drag handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startHeight: height };
    setIsDragging(true);
  }, [height]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaY = dragRef.current.startY - e.clientY;
      const deltaVh = (deltaY / window.innerHeight) * 100;
      const newHeight = Math.min(85, Math.max(20, dragRef.current.startHeight + deltaVh));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  // Get address for display
  const address = get(data, 'addressFull', 'address_full', 'propertyAddress') || 'Property';
  const city = get(data, 'addressCity', 'address_city', 'city');
  const state = get(data, 'addressState', 'address_state', 'state');
  const addressDisplay = city && state ? `${address}, ${city}, ${state}` : address;

  const tabs = [
    { id: 'property', label: 'Property Detail' },
    { id: 'comps', label: 'Comps' },
    { id: 'deal', label: 'Deal Room' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${height}vh`,
        zIndex: 60,
        background: C.bgGradient,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${C.borderAccent}`,
        boxShadow: C.shadow,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: font,
        transition: isDragging ? 'none' : 'height 0.3s ease',
      }}
    >
      {/* Drag Handle Bar */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          cursor: 'ns-resize',
          borderBottom: `1px solid ${C.borderLight}`,
          background: 'rgba(15,23,42,0.6)',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        {/* Left: Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: activeTab === tab.id ? C.accent : 'transparent',
                color: activeTab === tab.id ? '#fff' : C.textDim,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: font,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Center: Drag Pill */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 48,
            height: 5,
            borderRadius: 3,
            background: C.textMuted,
            opacity: 0.5,
          }}
        />

        {/* Right: Address + Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontSize: 12,
              color: C.textDim,
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {addressDisplay}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: `1px solid ${C.borderLight}`,
              background: 'transparent',
              color: C.textDim,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: font,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'property' && <PropertyTab data={data} />}
        {activeTab === 'comps' && <CompsTab data={data} />}
        {activeTab === 'deal' && <DealTab data={data} />}
      </div>
    </div>
  );
}
