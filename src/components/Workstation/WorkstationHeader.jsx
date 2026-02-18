import { useState } from 'react';
import { X, Camera, Star, Pencil, FileText, Download, Share2, Copy, Check } from 'lucide-react';
import { useTheme } from '../../theme.jsx';
import StatusBadge from './shared/StatusBadge.jsx';

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
        width: 32,
        height: 32,
        borderRadius: 8,
        border: `1px solid ${hovered ? t.border.default : 'transparent'}`,
        background: hovered ? t.bg.tertiary : 'transparent',
        color: t.text.tertiary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <Icon size={16} />
    </button>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 30) return `Updated ${diffDays}d ago`;
  return `Updated ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
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
  const companyFlag = data?.ownership?.[0]?.companyFlag;
  const trustFlag = data?.ownership?.[0]?.trustFlag;
  const isAbsentee = data?.ownership?.[0]?.isAbsenteeOwner;
  const freshness = formatDate(data?.updatedAt);

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const streetViewUrl = lat && lng && googleMapsKey
    ? `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=${googleMapsKey}`
    : null;

  const handleCopyCoords = () => {
    if (lat != null && lng != null) {
      navigator.clipboard.writeText(`${lat}, ${lng}`).then(() => {
        setCopiedCoord(true);
        setTimeout(() => setCopiedCoord(false), 2000);
      });
    }
  };

  const badges = [];
  if (propertyType) badges.push({ label: propertyType, variant: 'success' });
  if (zoning) badges.push({ label: zoning, variant: 'neutral' });
  if (floodZone) badges.push({ label: `Zone ${floodZone}`, variant: floodZone === 'X' ? 'success' : 'warning' });
  if (companyFlag) badges.push({ label: 'Corporate', variant: 'info' });
  if (trustFlag) badges.push({ label: 'Trust', variant: 'neutral' });
  if (isAbsentee) badges.push({ label: 'Absentee Owner', variant: 'warning' });

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Street View / Placeholder */}
      <div style={{
        width: '100%',
        height: 180,
        background: t.bg.tertiary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {streetViewUrl && !imgError ? (
          <img
            src={streetViewUrl}
            alt="Street View"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Camera size={32} style={{ color: t.text.quaternary }} />
        )}
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 8,
            background: t.bg.primary,
            border: `1px solid ${t.border.default}`,
            color: t.text.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Property Info */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Address */}
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: t.text.primary,
            fontFamily: t.font.display,
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
              marginTop: 4,
            }}>
              Owner: {ownerName}
            </div>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {badges.map((b) => (
              <StatusBadge key={b.label} label={b.label} variant={b.variant} />
            ))}
          </div>
        )}

        {/* APN + FIPS */}
        {(apn || fips) && (
          <div style={{
            display: 'flex',
            gap: 16,
            fontSize: 11,
            color: t.text.tertiary,
            fontFamily: t.font.mono,
          }}>
            {apn && <span>APN {apn}</span>}
            {fips && <span>FIPS {fips}</span>}
          </div>
        )}

        {/* Lat/Lng */}
        {lat != null && lng != null && (
          <button
            onClick={handleCopyCoords}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: t.text.tertiary,
              fontFamily: t.font.mono,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            title="Copy coordinates"
          >
            {copiedCoord ? <Check size={12} style={{ color: t.accent.green }} /> : <Copy size={12} />}
            <span style={{ color: copiedCoord ? t.accent.green : t.text.tertiary }}>
              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </span>
          </button>
        )}

        {/* Actions + Freshness */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 4,
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <ActionIcon icon={Star} label="Bookmark" />
            <ActionIcon icon={Pencil} label="Edit" />
            <ActionIcon icon={FileText} label="Notes" />
            <ActionIcon icon={Download} label="Export" />
            <ActionIcon icon={Share2} label="Share" />
          </div>
          {freshness && (
            <span style={{
              fontSize: 10,
              color: t.text.quaternary,
              fontFamily: t.font.display,
            }}>
              {freshness}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
