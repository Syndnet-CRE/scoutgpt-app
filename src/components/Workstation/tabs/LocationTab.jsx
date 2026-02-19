import { useState } from 'react';
import { Copy, Check, MapPin } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import DataRow from '../shared/DataRow.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';

function CopyableCoord({ label, value, t }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value == null) return;
    navigator.clipboard.writeText(String(value)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: `1px solid ${t.border.subtle}`,
      gap: 12,
    }}>
      <span style={{ fontSize: 12, color: t.text.secondary, fontFamily: t.font.display, flexShrink: 0 }}>
        {label}
      </span>
      <button
        onClick={handleCopy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 500,
          color: copied ? t.accent.green : t.text.primary,
          fontFamily: t.font.display,
          background: 'none',
          border: 'none',
          cursor: value != null ? 'pointer' : 'default',
          padding: 0,
        }}
        title={value != null ? 'Click to copy' : undefined}
      >
        {value != null ? Number(value).toFixed(6) : '\u2014'}
        {value != null && (
          copied
            ? <Check size={12} style={{ color: t.accent.green }} />
            : <Copy size={12} style={{ color: t.text.quaternary }} />
        )}
      </button>
    </div>
  );
}

function floodZoneVariant(zone) {
  if (!zone) return 'neutral';
  const z = zone.toUpperCase();
  if (z === 'X' || z === 'MINIMAL') return 'success';
  if (z.includes('SHADED') || z === 'B' || z === 'C') return 'warning';
  if (z.startsWith('A') || z.startsWith('V') || z === 'AE' || z === 'VE') return 'error';
  return 'neutral';
}

export default function LocationTab({ data }) {
  const { t } = useTheme();

  const d = data ?? {};
  const lat = d.latitude ?? null;
  const lng = d.longitude ?? null;
  const fips = d.fipsCode ?? null;
  const apn = d.parcelNumberRaw ?? null;
  const useCode = d.propertyUseCode ?? null;

  const floodZoneStr = d.floodZone ?? null;
  const floodZoneDesc = d.floodZoneDesc ?? null;
  const inFloodplain = d.inFloodplain ?? null;

  const censusTract = d.censusTract ?? null;
  const censusBlock = d.censusBlock ?? null;

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Coordinates */}
      <div>
        <SectionHeader title="Coordinates" />
        <CopyableCoord label="Latitude" value={lat} t={t} />
        <CopyableCoord label="Longitude" value={lng} t={t} />
      </div>

      {/* Property Identifiers */}
      <div>
        <SectionHeader title="Property Identifiers" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="FIPS Code" value={fips} />
          <DataRow label="APN" value={apn} />
          <DataRow label="Use Code" value={useCode} />
          <DataRow label="Census Tract" value={censusTract} />
          <DataRow label="Census Block" value={censusBlock} />
        </div>
      </div>

      {/* Parcel Info */}
      <div>
        <SectionHeader title="Parcel Info" />
        <div style={{
          padding: '12px 0',
          fontSize: 12,
          color: t.text.tertiary,
          fontFamily: t.font.display,
          fontStyle: 'italic',
        }}>
          Parcel data displayed on map
        </div>
      </div>

      {/* Flood Zone */}
      <div>
        <SectionHeader title="Flood Zone" />
        {floodZoneStr ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0 10px' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: t.text.primary, fontFamily: t.font.display }}>
                {floodZoneStr}
              </span>
              <StatusBadge label={floodZoneStr} variant={floodZoneVariant(floodZoneStr)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <DataRow label="Description" value={floodZoneDesc} mono={false} />
              <DataRow
                label="In Floodplain"
                value={inFloodplain != null ? (inFloodplain ? 'Yes' : 'No') : null}
                accent={inFloodplain === false}
                mono={false}
              />
            </div>
          </>
        ) : (
          <div style={{ padding: '8px 0', fontSize: 12, color: t.text.tertiary, fontFamily: t.font.display }}>
            {'\u2014'}
          </div>
        )}
      </div>

      {/* School District */}
      <div>
        <SectionHeader title="School District" />
        <div style={{
          padding: '12px 0',
          fontSize: 12,
          color: t.text.tertiary,
          fontFamily: t.font.display,
          fontStyle: 'italic',
        }}>
          School district data coming soon
        </div>
      </div>

      {/* Map Preview */}
      <div>
        <SectionHeader title="Map Preview" />
        <div style={{
          width: '100%',
          height: 300,
          borderRadius: 8,
          background: t.bg.tertiary,
          border: `1px solid ${t.border.default}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <MapPin size={24} style={{ color: t.text.quaternary }} />
          <span style={{ fontSize: 13, color: t.text.quaternary, fontFamily: t.font.display }}>
            Map Preview
          </span>
          <span style={{ fontSize: 10, color: t.text.quaternary, fontFamily: t.font.display, fontStyle: 'italic' }}>
            Mapbox Static Image {'\u2014'} coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
