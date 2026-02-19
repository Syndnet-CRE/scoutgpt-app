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
        color: hovered ? t.text.primary : t.text.tertiary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.15s ease, color 0.15s ease',
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
  const [closeBtnHovered, setCloseBtnHovered] = useState(false);

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
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=${googleMapsKey}`
    : null;

  const satelliteUrl = lat && lng && mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},17,0/600x300@2x?access_token=${mapboxToken}`
    : null;

  const imgSrc = (!streetViewUrl || imgError) ? satelliteUrl : streetViewUrl;
  const imgLabel = (!streetViewUrl || imgError) ? '\ud83d\udccd Satellite' : '\ud83d\udccd Street View';

  const handleCopyCoords = (e) => {
    e.stopPropagation();
    if (lat != null && lng != null) {
      navigator.clipboard.writeText(`${lat}, ${lng}`).then(() => {
        setCopiedCoord(true);
        setTimeout(() => setCopiedCoord(false), 2000);
      });
    }
  };

  // Badge definitions
  const badges = [];
  if (propertyType) badges.push({ label: propertyType, bg: 'rgba(34,197,94,0.15)', color: '#4ADE80', border: 'rgba(34,197,94,0.3)' });
  if (zoning) badges.push({ label: zoning, bg: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: 'rgba(59,130,246,0.3)' });
  if (floodZone) badges.push({ label: `Zone ${floodZone}`, bg: 'rgba(249,115,22,0.15)', color: '#FB923C', border: 'rgba(249,115,22,0.3)' });
  if (isAbsentee) badges.push({ label: 'Absentee Owner', bg: 'rgba(168,85,247,0.15)', color: '#C084FC', border: 'rgba(168,85,247,0.3)' });

  return (
    <div style={{
      flexShrink: 0,
      height: 180,
      display: 'flex',
      flexDirection: 'row',
      borderBottom: `1px solid ${t.border.default}`,
      overflow: 'hidden',
    }}>
      {/* Close Button Column */}
      <div style={{
        width: 32,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <button
          onClick={onClose}
          onMouseEnter={() => setCloseBtnHovered(true)}
          onMouseLeave={() => setCloseBtnHovered(false)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: closeBtnHovered ? t.bg.tertiary : t.bg.secondary,
            border: `1px solid ${t.border.default}`,
            color: closeBtnHovered ? t.text.primary : t.text.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Image Section — 50% of panel width */}
      <div style={{
        width: '50%',
        flexShrink: 0,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: t.bg.tertiary,
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
          }}>
            <span style={{ fontSize: 13, color: t.text.quaternary, fontFamily: t.font.display }}>No imagery available</span>
          </div>
        )}

        {/* Image type badge */}
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
          {imgLabel}
        </div>
      </div>

      {/* Info Section — fills remaining width */}
      <div style={{
        flex: 1,
        minWidth: 0,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
        overflow: 'hidden',
      }}>
        {/* Address */}
        <div style={{
          fontSize: 18,
          fontWeight: 800,
          color: t.text.primary,
          fontFamily: t.font.display,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {address}
        </div>

        {/* City, State ZIP */}
        {cityLine && (
          <div style={{
            fontSize: 13,
            color: t.text.secondary,
            fontFamily: t.font.display,
          }}>
            {cityLine}
          </div>
        )}

        {/* Owner name */}
        {ownerName && (
          <div style={{
            fontSize: 12,
            color: t.text.tertiary,
            fontFamily: t.font.display,
          }}>
            {ownerName}
          </div>
        )}

        {/* Badge row */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
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
                  border: b.border ? `1px solid ${b.border}` : undefined,
                  whiteSpace: 'nowrap',
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Metadata line — APN/FIPS/coords (keeps mono font) */}
        {(apn || fips || lat != null) && (
          <div style={{
            fontSize: 11,
            fontFamily: t.font.mono,
            color: t.text.tertiary,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 2,
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
                {copiedCoord ? 'Copied!' : `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`}
              </button>
            )}
          </div>
        )}

        {/* Action icons row */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <ActionIcon icon={Star} label="Bookmark" />
          <ActionIcon icon={Pencil} label="Edit" />
          <ActionIcon icon={Copy} label="Copy" />
          <ActionIcon icon={Download} label="Export" />
          <ActionIcon icon={ExternalLink} label="Open Property Page" />
        </div>
      </div>
    </div>
  );
}
