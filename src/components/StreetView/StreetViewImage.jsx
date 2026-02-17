import React from 'react';

export default function StreetViewImage({ streetView, loading, height = 150, showCameraIcon = false }) {
  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height,
          background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '8px 8px 0 0',
          position: 'relative',
        }}
      >
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!streetView || !streetView.imageUrl) {
    return null;
  }

  const { imageUrl, source, googleMapsUrl } = streetView;
  const isStreetView = source === 'streetview';
  const isClickable = isStreetView && googleMapsUrl;

  const handleClick = () => {
    if (isClickable) {
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: '100%',
        height,
        position: 'relative',
        cursor: isClickable ? 'pointer' : 'default',
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden',
      }}
      title={isClickable ? 'Open in Google Street View' : 'No Street View available'}
    >
      <img
        src={imageUrl}
        alt={isStreetView ? 'Street View' : 'Satellite View'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        loading="lazy"
      />

      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          background: isStreetView ? 'rgba(99, 102, 241, 0.85)' : 'rgba(30, 41, 59, 0.85)',
          color: '#e2e8f0',
          fontSize: 10,
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 4,
          letterSpacing: '0.03em',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {isStreetView ? 'Street View' : 'Satellite'}
      </div>

      {isClickable && showCameraIcon && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(99, 102, 241, 0.85)',
            color: '#fff',
            width: 28,
            height: 28,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
      )}

      {isClickable && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; }}
        />
      )}
    </div>
  );
}
