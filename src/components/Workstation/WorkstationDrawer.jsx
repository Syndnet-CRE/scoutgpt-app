import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../../theme.jsx';
import PropertyTab from './PropertyTab';
import CompsTab from './CompsTab';
import DealTab from './DealTab';

// ══════════════════════════════════════════════════════════════════════════════
// WORKSTATION DRAWER
// ══════════════════════════════════════════════════════════════════════════════

export default function WorkstationDrawer({ data, isOpen, onClose, zIndex, onBringToFront }) {
  const { t } = useTheme();
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

  // Get address for display - use correct camelCase API field names
  const address = data?.addressFull || 'Property';
  const city = data?.addressCity;
  const state = data?.addressState;
  const addressDisplay = city && state ? `${address}, ${city}, ${state}` : address;

  const tabs = [
    { id: 'property', label: 'Property Detail' },
    { id: 'comps', label: 'Comps' },
    { id: 'deal', label: 'Deal Room' },
  ];

  return (
    <div
      onMouseDown={onBringToFront}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${height}vh`,
        zIndex: zIndex || 55,
        background: t.bg.primary,
        borderTop: `1px solid ${t.accent.primaryBorder}`,
        boxShadow: '0 -10px 60px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: t.font.display,
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
          borderBottom: `1px solid ${t.border.strong}`,
          background: t.bg.primary,
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
                background: activeTab === tab.id ? t.accent.primary : 'transparent',
                color: activeTab === tab.id ? t.text.primary : t.text.secondary,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: t.font.display,
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
            background: t.text.tertiary,
            opacity: 0.5,
          }}
        />

        {/* Right: Address + Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontSize: 12,
              color: t.text.secondary,
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
              border: `1px solid ${t.border.strong}`,
              background: 'transparent',
              color: t.text.secondary,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: t.font.display,
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
