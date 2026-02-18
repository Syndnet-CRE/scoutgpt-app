import { useState } from 'react';
import { ChevronDown, ChevronUp, Droplets, Pipette, CloudRain, Grid3X3, Waves, MapPin } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import DataRow from '../shared/DataRow.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';

function Placeholder({ text, t }) {
  return (
    <span style={{ fontSize: 12, color: t.text.tertiary, fontFamily: t.font.display, fontStyle: 'italic' }}>
      {text}
    </span>
  );
}

function MapPlaceholder({ label, t }) {
  return (
    <div style={{
      width: '100%',
      height: 200,
      borderRadius: 6,
      background: t.bg.tertiary,
      border: `1px solid ${t.border.default}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 8,
    }}>
      <MapPin size={18} style={{ color: t.text.quaternary }} />
      <span style={{ fontSize: 11, color: t.text.quaternary, fontFamily: t.font.display }}>
        {label}
      </span>
    </div>
  );
}

function AccordionSection({ icon: Icon, iconColor, title, isOpen, onToggle, children, t }) {
  return (
    <div style={{
      background: t.bg.primary,
      border: `1px solid ${t.border.default}`,
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: t.text.primary, fontFamily: t.font.display, textAlign: 'left' }}>
          {title}
        </span>
        {isOpen
          ? <ChevronUp size={16} style={{ color: t.text.tertiary }} />
          : <ChevronDown size={16} style={{ color: t.text.tertiary }} />
        }
      </button>
      {isOpen && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, borderTop: `1px solid ${t.border.subtle}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function InfrastructureTab({ data, infrastructureData }) {
  const { t } = useTheme();
  const [openSections, setOpenSections] = useState(new Set());

  const toggle = (key) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const infra = infrastructureData ?? null;
  const fetching = <Placeholder text="Fetching..." t={t} />;

  const zoning = data?.zoning ?? null;

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Water */}
      <AccordionSection
        icon={Droplets}
        iconColor={t.semantic.info}
        title="Water"
        isOpen={openSections.has('water')}
        onToggle={() => toggle('water')}
        t={t}
      >
        <DataRow label="Nearest Water Main" value={infra?.water?.nearestMain ?? null} mono={false} />
        {!infra && <div style={{ padding: '4px 0' }}>{fetching}</div>}
        <DataRow label="Pipe Diameter" value={infra?.water?.pipeDiameter ?? null} />
        <DataRow label="Pipe Material" value={infra?.water?.pipeMaterial ?? null} mono={false} />
        <DataRow label="Service Provider" value={infra?.water?.serviceProvider ?? null} mono={false} />
        <MapPlaceholder label="Water Infrastructure Map" t={t} />
      </AccordionSection>

      {/* Wastewater */}
      <AccordionSection
        icon={Pipette}
        iconColor={t.semantic.success}
        title="Wastewater"
        isOpen={openSections.has('wastewater')}
        onToggle={() => toggle('wastewater')}
        t={t}
      >
        <DataRow label="Nearest Main" value={infra?.wastewater?.nearestMain ?? null} mono={false} />
        {!infra && <div style={{ padding: '4px 0' }}>{fetching}</div>}
        <DataRow label="Pipe Diameter" value={infra?.wastewater?.pipeDiameter ?? null} />
        <DataRow label="Pipe Material" value={infra?.wastewater?.pipeMaterial ?? null} mono={false} />
        <DataRow label="Service Provider" value={infra?.wastewater?.serviceProvider ?? null} mono={false} />
        <MapPlaceholder label="Wastewater Infrastructure Map" t={t} />
      </AccordionSection>

      {/* Stormwater */}
      <AccordionSection
        icon={CloudRain}
        iconColor={t.semantic.info}
        title="Stormwater"
        isOpen={openSections.has('stormwater')}
        onToggle={() => toggle('stormwater')}
        t={t}
      >
        <DataRow label="Nearest Line" value={infra?.stormwater?.nearestLine ?? null} mono={false} />
        {!infra && <div style={{ padding: '4px 0' }}>{fetching}</div>}
        <DataRow label="Diameter" value={infra?.stormwater?.diameter ?? null} />
        <DataRow label="Drainage Basin" value={infra?.stormwater?.drainageBasin ?? null} mono={false} />
        <MapPlaceholder label="Stormwater Map" t={t} />
      </AccordionSection>

      {/* Zoning */}
      <AccordionSection
        icon={Grid3X3}
        iconColor={t.semantic.warning}
        title="Zoning"
        isOpen={openSections.has('zoning')}
        onToggle={() => toggle('zoning')}
        t={t}
      >
        <DataRow label="Zone Code" value={zoning ?? infra?.zoning?.zoneCode ?? null} />
        <DataRow label="Zone Description" value={infra?.zoning?.zoneDescription ?? null} mono={false} />
        <DataRow label="Zone Category" value={infra?.zoning?.zoneCategory ?? null} mono={false} />
        <MapPlaceholder label="Zoning Map" t={t} />
      </AccordionSection>

      {/* Floodplain */}
      <AccordionSection
        icon={Waves}
        iconColor={t.semantic.error}
        title="Floodplain"
        isOpen={openSections.has('floodplain')}
        onToggle={() => toggle('floodplain')}
        t={t}
      >
        <DataRow label="FEMA Zone" value={infra?.floodplain?.femaZone ?? null} />
        <DataRow label="Flood Zone Type" value={infra?.floodplain?.floodZoneType ?? null} mono={false} />
        <DataRow label="Fully Developed Floodplain" value={infra?.floodplain?.fullyDeveloped != null ? (infra.floodplain.fullyDeveloped ? 'Yes' : 'No') : null} mono={false} />
        <MapPlaceholder label="Floodplain Map" t={t} />
      </AccordionSection>

      {/* Future Layers */}
      <div style={{ marginTop: 8 }}>
        <SectionHeader title="Future Layers" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            'Electric Service Areas', 'Power Lines', 'Gas Lines', 'Manholes',
            'Fire Hydrants', 'Wetlands', 'Soil Types', 'Contour Lines',
          ].map((layer) => (
            <StatusBadge key={layer} label={layer} variant="neutral" />
          ))}
        </div>
      </div>

      {/* Architecture note */}
      <div style={{ paddingTop: 12 }}>
        <span style={{
          fontSize: 11,
          color: t.text.quaternary,
          fontFamily: t.font.display,
          fontStyle: 'italic',
        }}>
          Infrastructure data fetched live from ArcGIS MapServer endpoints
        </span>
      </div>
    </div>
  );
}
