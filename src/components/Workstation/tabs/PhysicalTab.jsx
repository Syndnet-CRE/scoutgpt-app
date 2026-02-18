import { useTheme } from '../../../theme.jsx';
import DataRow from '../shared/DataRow.jsx';
import SectionHeader from '../shared/SectionHeader.jsx';

function fmt(val, suffix = '') {
  if (val == null) return null;
  if (typeof val === 'number') return `${val.toLocaleString()}${suffix}`;
  return `${val}${suffix}`;
}

function yesNo(val) {
  if (val == null) return null;
  return val ? 'Yes' : 'No';
}

function TwoColumnGrid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
      {children}
    </div>
  );
}

export default function PhysicalTab({ data }) {
  const { t } = useTheme();

  const d = data ?? {};

  const propType = d.propertyUseStandardized ?? null;
  const propCode = d.propertyUseCode ?? null;
  const yearBuilt = d.yearBuilt ?? null;
  const buildingArea = d.areaBuilding ?? null;
  const grossArea = d.grossArea ?? null;
  const stories = d.storiesCount ?? null;
  const buildings = d.buildingsCount ?? null;
  const units = d.unitsCount ?? null;

  const bedrooms = d.bedroomsCount ?? null;
  const baths = d.bathCount ?? null;
  const lotSf = d.areaLotSf ?? null;
  const lotAcres = d.areaLotAcres ?? null;
  const zoning = d.zoning ?? null;

  const construction = d.constructionType ?? null;
  const extWalls = d.exteriorWalls ?? null;
  const intWalls = d.interiorWalls ?? null;
  const foundation = d.foundation ?? null;
  const floorType = d.floorType ?? null;

  const roofType = d.roofType ?? null;
  const roofMaterial = d.roofMaterial ?? null;
  const quality = d.qualityGrade ?? null;
  const condition = d.condition ?? null;

  const garageType = d.garageType ?? null;
  const garageArea = d.garageArea ?? null;
  const parking = d.parkingSpaces ?? null;
  const poolType = d.poolType ?? null;
  const hasPool = d.hasPool ?? null;
  const hasSpa = d.hasSpa ?? null;

  const hasElevator = d.hasElevator ?? null;
  const hasFireplace = d.hasFireplace ?? null;
  const fireplaceCount = d.fireplaceCount ?? null;
  const hvacCooling = d.hvacCooling ?? null;
  const hvacHeating = d.hvacHeating ?? null;
  const hvacFuel = d.hvacFuel ?? null;

  const legalDesc = d.legalDescription ?? null;
  const legalLot = d.legalLot ?? null;
  const legalBlock = d.legalBlock ?? null;
  const legalSection = d.legalSection ?? null;

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Building Characteristics */}
      <div>
        <SectionHeader title="Building Characteristics" />
        <TwoColumnGrid>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Property Type" value={propType} mono={false} />
            <DataRow label="Use Code" value={propCode} />
            <DataRow label="Year Built" value={yearBuilt} />
            <DataRow label="Building Area" value={fmt(buildingArea, ' sqft')} />
            <DataRow label="Gross Area" value={fmt(grossArea, ' sqft')} />
            <DataRow label="Stories" value={stories} />
            <DataRow label="Buildings" value={buildings} />
            <DataRow label="Units" value={units} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Bedrooms" value={bedrooms} />
            <DataRow label="Bathrooms" value={baths} />
            <DataRow label="Lot Size" value={fmt(lotSf, ' sqft')} />
            <DataRow label="Lot Acres" value={fmt(lotAcres, ' acres')} />
            <DataRow label="Zoning" value={zoning} mono={false} />
          </div>
        </TwoColumnGrid>
      </div>

      {/* Structure Details */}
      <div>
        <SectionHeader title="Structure Details" />
        <TwoColumnGrid>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Construction" value={construction} mono={false} />
            <DataRow label="Exterior Walls" value={extWalls} mono={false} />
            <DataRow label="Interior Walls" value={intWalls} mono={false} />
            <DataRow label="Foundation" value={foundation} mono={false} />
            <DataRow label="Floor Type" value={floorType} mono={false} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Roof Type" value={roofType} mono={false} />
            <DataRow label="Roof Material" value={roofMaterial} mono={false} />
            <DataRow label="Quality Grade" value={quality} mono={false} />
            <DataRow label="Condition" value={condition} mono={false} />
          </div>
        </TwoColumnGrid>
      </div>

      {/* Amenities */}
      <div>
        <SectionHeader title="Amenities" />
        <TwoColumnGrid>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Garage Type" value={garageType} mono={false} />
            <DataRow label="Garage Area" value={fmt(garageArea, ' sqft')} />
            <DataRow label="Parking Spaces" value={parking} />
            <DataRow label="Pool Type" value={poolType} mono={false} />
            <DataRow label="Has Pool" value={yesNo(hasPool)} mono={false} />
            <DataRow label="Has Spa" value={yesNo(hasSpa)} mono={false} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Has Elevator" value={yesNo(hasElevator)} mono={false} />
            <DataRow label="Has Fireplace" value={yesNo(hasFireplace)} mono={false} />
            <DataRow label="Fireplace Count" value={fireplaceCount} />
            <DataRow label="HVAC Cooling" value={hvacCooling} mono={false} />
            <DataRow label="HVAC Heating" value={hvacHeating} mono={false} />
            <DataRow label="HVAC Fuel" value={hvacFuel} mono={false} />
          </div>
        </TwoColumnGrid>
      </div>

      {/* Legal Description */}
      <div>
        <SectionHeader title="Legal Description" />
        {legalDesc && (
          <div style={{
            fontSize: 12,
            color: t.text.primary,
            fontFamily: t.font.display,
            lineHeight: 1.6,
            padding: '8px 0 12px',
            borderBottom: `1px solid ${t.border.subtle}`,
            wordBreak: 'break-word',
          }}>
            {legalDesc}
          </div>
        )}
        <TwoColumnGrid>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Lot" value={legalLot} />
            <DataRow label="Block" value={legalBlock} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataRow label="Section" value={legalSection} />
          </div>
        </TwoColumnGrid>
      </div>
    </div>
  );
}
