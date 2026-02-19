import { useState } from 'react';
import { X, Star, Pencil, Copy, Download, ExternalLink, Check } from 'lucide-react';
import { useTheme } from '../../theme.jsx';

function ActionIcon({ icon: Icon, label, onClick }) {
  const { t } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: 'none',
        background: hovered ? t.bg.tertiary : 'transparent',
        color: t.text.tertiary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
      }}
    >
      <Icon size={14} />
    </button>
  );
}

export default function WorkstationHeader({ data, onClose }) {
  const { t } = useTheme();
  const [copiedCoord, setCopiedCoord] = useState(false);
  const [imgError, setImgError] = useState(false);

  const address = data?.addressFull ?? '\u2014';
  const city = data?.addressCity ?? '';
  const state = data?.addressState ?? '';
  const zip = data?.addressZip ?? '';
  const cityLine = [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');
  const apn = data?.parcelNumberRaw ?? null;
  const fips = data?.fipsCode ?? null;
  const lat = data?.latitude ?? null;
  const lng = data?.longitude ?? null;
  const propertyType = data?.propertyUseGroup ?? null;
  const zoning = data?.zoningLocal ?? data?.zoning ?? null;
  const floodZone = data?.floodZone ?? null;
  const ownerName = data?.ownership?.[0]?.owner1NameFull ?? null;
  const isAbsentee = data?.ownership?.[0]?.isAbsenteeOwner;

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

  const streetViewUrl = lat && lng && googleMapsKey
    ? `https://maps.googleapis.com/maps/api/streetview?size=640x200&location=${lat},${lng}&key=${googleMapsKey}`
    : null;

  const satelliteUrl = lat && lng && mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},17,0/640x200@2x?access_token=${mapboxToken}`
    : null;

  const imgSrc = (!streetViewUrl || imgError) ? satelliteUrl : streetViewUrl;

  const handleCopyCoords = (e) => {
    e.stopPropagation();
    if (lat != null && lng != null) {
      navigator.clipboard.writeText(`${lat}, ${lng}`).then(() => {
        setCopiedCoord(true);
        setTimeout(() => setCopiedCoord(false), 2000);
      });
    }
  };

  // Badge definitions with specific colors
  const badges = [];
  if (propertyType) badges.push({ label: propertyType, bg: 'rgba(52, 199, 89, 0.15)', color: '#34C759' });
  if (zoning) badges.push({ label: zoning, bg: 'rgba(24, 119, 242, 0.15)', color: '#1877F2' });
  if (floodZone) badges.push({ label: `Zone ${floodZone}`, bg: 'rgba(255, 159, 10, 0.15)', color: '#FF9F0A' });
  if (isAbsentee) badges.push({ label: 'Absentee Owner', bg: 'rgba(191, 90, 242, 0.15)', color: '#BF5AF2' });

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Street View Hero Image */}
      <div style={{
        width: '100%',
        height: 160,
        background: t.bg.tertiary,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt="Street View"
            onError={() => {
              if (!imgError) setImgError(true);
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: t.bg.tertiary,
          }}>
            <span style={{ fontSize: 13, color: t.text.quaternary }}>No imagery available</span>
          </div>
        )}

        {/* Street View overlay badge */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          background: 'rgba(0,0,0,0.6)',
          color: '#e2e8f0',
          fontSize: 10,
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 4,
          letterSpacing: '0.03em',
          backdropFilter: 'blur(4px)',
        }}>
          {(!streetViewUrl || imgError) ? 'Satellite' : '\ud83d\udccd Street View'}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Address Block */}
      <div style={{ padding: '8px 16px 4px' }}>
        <div style={{
          fontSize: 18,
          fontWeight: 800,
          color: t.text.primary,
          fontFamily: t.font.display,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
        }}>
          {address}
        </div>
        {cityLine && (
          <div style={{
            fontSize: 13,
            color: t.text.secondary,
            fontFamily: t.font.display,
            marginTop: 2,
          }}>
            {cityLine}
          </div>
        )}
        {ownerName && (
          <div style={{
            fontSize: 12,
            color: t.text.tertiary,
            fontFamily: t.font.display,
            marginTop: 2,
          }}>
            {ownerName}
          </div>
        )}
      </div>

      {/* Badge Row */}
      {badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 16px' }}>
          {badges.map((b) => (
            <span
              key={b.label}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: b.bg,
                color: b.color,
                whiteSpace: 'nowrap',
              }}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Metadata Line */}
      {(apn || fips || lat != null) && (
        <div style={{
          padding: '2px 16px',
          fontSize: 11,
          fontFamily: t.font.mono,
          color: t.text.tertiary,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {apn && <span>APN: {apn}</span>}
          {apn && fips && <span style={{ margin: '0 4px' }}>&bull;</span>}
          {fips && <span>FIPS: {fips}</span>}
          {(apn || fips) && lat != null && <span style={{ margin: '0 4px' }}>&bull;</span>}
          {lat != null && lng != null && (
            <button
              onClick={handleCopyCoords}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontFamily: t.font.mono,
                color: copiedCoord ? t.accent.green : t.text.tertiary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              title="Copy coordinates"
            >
              {copiedCoord ? <Check size={10} style={{ color: t.accent.green }} /> : <Copy size={10} />}
              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </button>
          )}
        </div>
      )}

      {/* Action Icons Row */}
      <div style={{ display: 'flex', gap: 4, padding: '4px 16px 8px' }}>
        <ActionIcon icon={Star} label="Bookmark" />
        <ActionIcon icon={Pencil} label="Edit" />
        <ActionIcon icon={Copy} label="Copy" />
        <ActionIcon icon={Download} label="Export" />
        <ActionIcon icon={ExternalLink} label="Open Property Page" />
      </div>
    </div>
  );
}
