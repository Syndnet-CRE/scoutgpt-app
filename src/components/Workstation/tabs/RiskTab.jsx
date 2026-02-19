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

function floodZoneDescription(zone) {
  if (!zone) return null;
  const z = zone.toUpperCase();
  if (z === 'X') return 'Minimal flood hazard';
  if (z === 'A') return 'High risk';
  if (z === 'AE') return 'High risk (base flood elevation determined)';
  if (z === 'AH') return 'High risk (shallow flooding)';
  if (z === 'AO') return 'High risk (sheet flow)';
  if (z === 'V') return 'Coastal high hazard';
  if (z === 'VE') return 'Coastal high hazard (base flood elevation determined)';
  if (z === 'B' || z.includes('SHADED')) return 'Moderate flood hazard';
  if (z === 'C') return 'Minimal flood hazard';
  if (z === 'D') return 'Undetermined flood hazard';
  return null;
}

const RISK_SCORES = [
  { key: 'floodRiskScore', label: 'Flood', icon: Droplets },
  { key: 'heatRiskScore', label: 'Heat', icon: Thermometer },
  { key: 'stormRiskScore', label: 'Storm', icon: CloudLightning },
  { key: 'wildfireRiskScore', label: 'Wildfire', icon: Flame },
  { key: 'droughtRiskScore', label: 'Drought', icon: Sun },
  { key: 'windRiskScore', label: 'Wind', icon: Wind },
  { key: 'airQualityRiskScore', label: 'Air Quality', icon: CloudFog },
];

function RiskBar({ item, climate, t }) {
  const score = climate?.[item.key] ?? null;
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

  const climate = data?.climateRisk ?? null;

  if (!climate) {
    return (
      <div style={{
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <Shield size={32} style={{ color: t.text.quaternary }} />
        <span style={{ fontSize: 13, color: t.text.tertiary, fontFamily: t.font.display }}>
          Climate risk data not available for this property
        </span>
      </div>
    );
  }

  const totalScore = climate.totalRiskScore ?? null;

  const floodChanceFuture = climate.floodChanceFuture ?? null;
  const femaFloodRisk = climate.femaFloodRisk ?? null;

  const floodZoneStr = data?.floodZone ?? null;
  const computedDesc = floodZoneDescription(floodZoneStr);
  const floodZoneDesc = data?.floodZoneDesc ?? computedDesc;
  const inFloodplain = data?.inFloodplain ?? null;

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
        {floodZoneStr ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0 12px',
            }}>
              <Shield size={18} style={{ color: scoreColor(t, floodZoneVariant(floodZoneStr) === 'error' ? 80 : floodZoneVariant(floodZoneStr) === 'warning' ? 40 : 10), flexShrink: 0 }} />
              <span style={{ fontSize: 20, fontWeight: 700, color: t.text.primary, fontFamily: t.font.mono }}>
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
    </div>
  );
}
