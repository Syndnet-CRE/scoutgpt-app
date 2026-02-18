import { Droplets, Thermometer, CloudLightning, Flame, Sun, Wind, CloudFog, Shield } from 'lucide-react';
import { useTheme } from '../../../theme.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import DataRow from '../shared/DataRow.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';

function scoreColor(t, score) {
  if (score == null) return t.text.quaternary;
  if (score <= 30) return t.accent.green;
  if (score <= 50) return t.semantic.warning;
  return t.semantic.error;
}

function scoreBgColor(t, score) {
  if (score == null) return t.bg.tertiary;
  if (score <= 30) return t.accent.greenMuted;
  if (score <= 50) return `${t.semantic.warning}1a`;
  return `${t.semantic.error}1a`;
}

function floodZoneVariant(zone) {
  if (!zone) return 'neutral';
  const z = zone.toUpperCase();
  if (z === 'X' || z === 'MINIMAL') return 'success';
  if (z.includes('SHADED') || z === 'B' || z === 'C') return 'warning';
  if (z.startsWith('A') || z.startsWith('V') || z === 'AE' || z === 'VE') return 'error';
  return 'neutral';
}

const RISK_SCORES = [
  { key: 'flood_risk_score', camel: 'floodRiskScore', label: 'Flood', icon: Droplets },
  { key: 'heat_risk_score', camel: 'heatRiskScore', label: 'Heat', icon: Thermometer },
  { key: 'storm_risk_score', camel: 'stormRiskScore', label: 'Storm', icon: CloudLightning },
  { key: 'wildfire_risk_score', camel: 'wildfireRiskScore', label: 'Wildfire', icon: Flame },
  { key: 'drought_risk_score', camel: 'droughtRiskScore', label: 'Drought', icon: Sun },
  { key: 'wind_risk_score', camel: 'windRiskScore', label: 'Wind', icon: Wind },
  { key: 'air_quality_score', camel: 'airQualityScore', label: 'Air Quality', icon: CloudFog },
];

function RiskBar({ item, climate, t }) {
  const score = climate?.[item.key] ?? climate?.[item.camel] ?? null;
  const Icon = item.icon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon size={16} style={{ color: scoreColor(t, score), flexShrink: 0, width: 16 }} />
      <div style={{ flex: 1 }}>
        <ProgressBar label={item.label} value={score} />
      </div>
    </div>
  );
}

export default function RiskTab({ data }) {
  const { t } = useTheme();

  const rawClimate = data?.climateRisk ?? data?.climate_risk ?? null;
  const climate = Array.isArray(rawClimate) ? rawClimate[0] : (rawClimate ?? {});

  const totalScore = climate?.total_risk_score ?? climate?.totalRiskScore ?? climate?.total_score ?? climate?.totalScore ?? null;

  const floodChanceFuture = climate?.flood_chance_future ?? climate?.floodChanceFuture ?? null;
  const femaFloodRisk = climate?.fema_flood_risk ?? climate?.femaFloodRisk ?? null;

  const fz = data?.floodZone ?? data?.flood_zone ?? {};
  const zoneType = fz?.zone_type ?? fz?.zoneType ?? null;
  const zoneDesc = fz?.zone_description ?? fz?.zoneDescription ?? null;
  const isSfha = fz?.is_sfha ?? fz?.isSfha ?? null;
  const staticBfe = fz?.static_bfe ?? fz?.staticBfe ?? null;
  const dfirmId = fz?.dfirm_id ?? fz?.dfirmId ?? null;
  const panelNumber = fz?.panel_number ?? fz?.panelNumber ?? null;

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Total Risk Score */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: 24,
      }}>
        <div style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: scoreBgColor(t, totalScore),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 48,
            fontWeight: 700,
            color: scoreColor(t, totalScore),
            fontFamily: t.font.mono,
            lineHeight: 1,
          }}>
            {totalScore ?? '\u2014'}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.text.secondary, fontFamily: t.font.display }}>
          Total Climate Risk Score
        </span>
        {totalScore != null && (
          <StatusBadge
            label={totalScore <= 30 ? 'Low Risk' : totalScore <= 50 ? 'Moderate Risk' : 'High Risk'}
            variant={totalScore <= 30 ? 'success' : totalScore <= 50 ? 'warning' : 'error'}
          />
        )}
      </div>

      {/* Individual Risk Scores */}
      <div>
        <SectionHeader title="Individual Risk Scores" count={RISK_SCORES.length} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RISK_SCORES.map((item) => (
            <RiskBar key={item.key} item={item} climate={climate} t={t} />
          ))}
        </div>
      </div>

      {/* Climate Projections */}
      <div>
        <SectionHeader title="Climate Projections" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow
            label="Future Flood Probability"
            value={floodChanceFuture != null ? `${Number(floodChanceFuture).toFixed(1)}%` : null}
          />
          <DataRow label="FEMA Flood Risk" value={femaFloodRisk} mono={false} />
        </div>
      </div>

      {/* FEMA Flood Zone */}
      <div>
        <SectionHeader title="FEMA Flood Zone" />
        {zoneType && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 0 12px',
          }}>
            <Shield size={18} style={{ color: scoreColor(t, floodZoneVariant(zoneType) === 'error' ? 80 : floodZoneVariant(zoneType) === 'warning' ? 40 : 10), flexShrink: 0 }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: t.text.primary, fontFamily: t.font.mono }}>
              {zoneType}
            </span>
            <StatusBadge label={zoneType} variant={floodZoneVariant(zoneType)} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Description" value={zoneDesc} mono={false} />
          <DataRow
            label="SFHA"
            value={isSfha != null ? (isSfha ? 'Yes' : 'No') : null}
            accent={isSfha === false}
          />
          <DataRow label="Static BFE" value={staticBfe} />
          <DataRow label="DFIRM ID" value={dfirmId} />
          <DataRow label="Panel Number" value={panelNumber} />
        </div>
      </div>
    </div>
  );
}
