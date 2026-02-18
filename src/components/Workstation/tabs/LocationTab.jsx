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
          fontFamily: t.font.mono,
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
  const lat = d.latitude ?? d.lat ?? null;
  const lng = d.longitude ?? d.lng ?? d.lon ?? null;
  const fips = d.fips ?? d.fipsCode ?? null;
  const apn = d.parcel_number_raw ?? d.parcelNumberRaw ?? d.apn ?? d.parcel_id ?? null;
  const useCode = d.property_use_code ?? d.propertyUseCode ?? null;

  const pb = d.parcelBoundary ?? d.parcel_boundary ?? null;
  const fz = d.floodZone ?? d.flood_zone ?? null;
  const sd = d.schoolDistrict ?? d.school_district ?? null;

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
        </div>
      </div>

      {/* Parcel Info */}
      <div>
        <SectionHeader title="Parcel Info" />
        {pb ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="APN" value={pb.apn ?? pb.parcelId} />
            <DataRow label="Address" value={pb.address_line1 ?? pb.addressLine1} mono={false} />
            <DataRow label="City" value={pb.city} mono={false} />
            <DataRow label="State" value={pb.state} mono={false} />
            <DataRow label="ZIP" value={pb.zip5 ?? pb.zip} />
            <DataRow label="FIPS State" value={pb.fips_state ?? pb.fipsState} />
            <DataRow label="FIPS County" value={pb.fips_county ?? pb.fipsCounty} />
          </div>
        ) : (
          <div style={{
            padding: '12px 0',
            fontSize: 12,
            color: t.text.tertiary,
            fontFamily: t.font.display,
            fontStyle: 'italic',
          }}>
            Parcel data from map layer
          </div>
        )}
      </div>

      {/* Flood Zone */}
      {fz && (
        <div>
          <SectionHeader title="Flood Zone" />
          {(fz.zone_type ?? fz.zoneType) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0 10px' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: t.text.primary, fontFamily: t.font.mono }}>
                {fz.zone_type ?? fz.zoneType}
              </span>
              <StatusBadge label={fz.zone_type ?? fz.zoneType} variant={floodZoneVariant(fz.zone_type ?? fz.zoneType)} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Description" value={fz.zone_description ?? fz.zoneDescription} mono={false} />
            <DataRow
              label="SFHA"
              value={(fz.is_sfha ?? fz.isSfha) != null ? ((fz.is_sfha ?? fz.isSfha) ? 'Yes' : 'No') : null}
              accent={(fz.is_sfha ?? fz.isSfha) === false}
            />
            <DataRow label="Static BFE" value={fz.static_bfe ?? fz.staticBfe} />
            <DataRow label="DFIRM ID" value={fz.dfirm_id ?? fz.dfirmId} />
            <DataRow label="Panel Number" value={fz.panel_number ?? fz.panelNumber} />
          </div>
        </div>
      )}

      {/* School District */}
      {sd && (
        <div>
          <SectionHeader title="School District" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Name" value={sd.name ?? sd.district_name ?? sd.districtName} mono={false} />
            <DataRow label="Level" value={sd.level} mono={false} />
            <DataRow label="NCES District ID" value={sd.nces_district_id ?? sd.ncesDistrictId} />
          </div>
        </div>
      )}

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
            Mapbox Static Image \u2014 coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
