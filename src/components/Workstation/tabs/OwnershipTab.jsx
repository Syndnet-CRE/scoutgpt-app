import { useTheme } from '../../../theme.jsx';
import DataRow from '../shared/DataRow.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';

function calcOwnershipLength(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const totalMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (y > 0 && m > 0) return `${y}yr ${m}mo`;
  if (y > 0) return `${y}yr`;
  if (m > 0) return `${m}mo`;
  return '< 1mo';
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OwnershipTab({ data }) {
  const { t } = useTheme();

  const owner = data?.ownership?.[0] ?? {};
  const propertyState = data?.addressState ?? data?.state ?? null;

  const ownerName = owner.owner1_name_full ?? owner.owner1NameFull ?? null;
  const owner2Name = owner.owner2_name_full ?? owner.owner2NameFull ?? null;
  const ownershipType = owner.ownership_type ?? owner.ownershipType ?? null;
  const isOccupied = owner.is_owner_occupied ?? owner.isOwnerOccupied;
  const ownershipSeq = owner.ownership_sequence ?? owner.ownershipSequence ?? null;

  const mailFull = owner.mail_address_full ?? owner.mailAddressFull ?? null;
  const mailCity = owner.mail_address_city ?? owner.mailAddressCity ?? null;
  const mailState = owner.mail_address_state ?? owner.mailAddressState ?? null;
  const mailZip = owner.mail_address_zip ?? owner.mailAddressZip ?? null;
  const isOutOfState = mailState && propertyState && mailState.toUpperCase() !== propertyState.toUpperCase();

  const transferDate = owner.ownership_transfer_date ?? owner.ownershipTransferDate ?? null;
  const ownershipLength = calcOwnershipLength(transferDate);
  const effectiveFrom = owner.effective_from ?? owner.effectiveFrom ?? null;
  const effectiveTo = owner.effective_to ?? owner.effectiveTo ?? null;

  const companyFlag = owner.company_flag ?? owner.companyFlag;
  const trustFlag = owner.trust_flag ?? owner.trustFlag;
  const absenteeFlag = owner.is_absentee_owner ?? owner.isAbsenteeOwner;

  const badges = [];
  if (companyFlag) badges.push({ label: 'CORPORATE', variant: 'info' });
  if (trustFlag) badges.push({ label: 'TRUST', variant: 'neutral' });
  if (absenteeFlag) badges.push({ label: 'ABSENTEE', variant: 'warning' });

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Current Owner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionHeader title="Current Owner" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: t.text.primary,
            fontFamily: t.font.display,
            lineHeight: 1.3,
          }}>
            {ownerName ?? '\u2014'}
          </span>

          {badges.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {badges.map((b) => (
                <StatusBadge key={b.label} label={b.label} variant={b.variant} />
              ))}
            </div>
          )}

          {owner2Name && (
            <span style={{
              fontSize: 13,
              color: t.text.secondary,
              fontFamily: t.font.display,
            }}>
              Owner 2: {owner2Name}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Ownership Type" value={ownershipType} mono={false} />
          <DataRow
            label="Owner Occupied"
            value={isOccupied != null ? (isOccupied ? 'Yes' : 'No') : null}
            mono={false}
          />
          <DataRow label="Ownership Sequence" value={ownershipSeq} />
        </div>
      </div>

      {/* Mailing Address */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SectionHeader title="Mailing Address" />
          {isOutOfState && <StatusBadge label="OUT OF STATE" variant="warning" />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Address" value={mailFull} mono={false} />
          <DataRow label="City" value={mailCity} mono={false} />
          <DataRow label="State" value={mailState} mono={false} />
          <DataRow label="ZIP" value={mailZip} />
        </div>
      </div>

      {/* Transfer History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionHeader title="Transfer History" />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataRow label="Transfer Date" value={formatDate(transferDate)} mono={false} />
          <DataRow label="Ownership Length" value={ownershipLength} mono={false} />
          <DataRow label="Effective From" value={formatDate(effectiveFrom)} mono={false} />
          <DataRow label="Effective To" value={formatDate(effectiveTo)} mono={false} />
        </div>
      </div>

      {/* Linked Properties */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionHeader title="Linked Properties" />

        <div style={{
          background: t.bg.secondary,
          border: `1px solid ${t.border.default}`,
          borderRadius: 8,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <StatusBadge label="Coming Soon" variant="neutral" />
        </div>
      </div>
    </div>
  );
}
