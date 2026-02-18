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
  const pd = d.propertyDetails ?? {};

  const propType = d.property_use_standardized ?? d.propertyUseStandardized ?? pd.property_use_standardized ?? null;
  const propCode = d.property_use_code ?? d.propertyUseCode ?? pd.property_use_code ?? null;
  const yearBuilt = d.year_built ?? d.yearBuilt ?? pd.year_built ?? null;
  const buildingArea = d.area_building ?? d.areaBuilding ?? pd.area_building ?? d.building_sf ?? null;
  const grossArea = d.gross_area ?? d.grossArea ?? pd.gross_area ?? null;
  const stories = d.stories_count ?? d.storiesCount ?? pd.stories_count ?? null;
  const buildings = d.buildings_count ?? d.buildingsCount ?? pd.buildings_count ?? null;
  const units = d.units_count ?? d.unitsCount ?? pd.units_count ?? null;

  const bedrooms = d.bedrooms_count ?? d.bedroomsCount ?? pd.bedrooms_count ?? null;
  const baths = d.bath_count ?? d.bathCount ?? pd.bath_count ?? null;
  const lotSf = d.area_lot_sf ?? d.areaLotSf ?? pd.area_lot_sf ?? d.lot_size ?? null;
  const lotAcres = d.area_lot_acres ?? d.areaLotAcres ?? pd.area_lot_acres ?? null;
  const zoning = d.zoning ?? pd.zoning ?? null;

  const construction = pd.construction_type ?? d.construction_type ?? null;
  const extWalls = pd.exterior_walls ?? d.exterior_walls ?? null;
  const intWalls = pd.interior_walls ?? d.interior_walls ?? null;
  const foundation = pd.foundation ?? d.foundation ?? null;
  const floorType = pd.floor_type ?? d.floor_type ?? null;

  const roofType = pd.roof_type ?? d.roof_type ?? null;
  const roofMaterial = pd.roof_material ?? d.roof_material ?? null;
  const quality = pd.quality_grade ?? d.quality_grade ?? null;
  const condition = pd.condition ?? d.condition ?? null;

  const garageType = pd.garage_type ?? d.garage_type ?? null;
  const garageArea = pd.garage_area ?? d.garage_area ?? null;
  const parking = pd.parking_spaces ?? d.parking_spaces ?? null;
  const poolType = pd.pool_type ?? d.pool_type ?? null;
  const hasPool = pd.has_pool ?? d.has_pool ?? null;
  const hasSpa = pd.has_spa ?? d.has_spa ?? null;

  const hasElevator = pd.has_elevator ?? d.has_elevator ?? null;
  const hasFireplace = pd.has_fireplace ?? d.has_fireplace ?? null;
  const fireplaceCount = pd.fireplace_count ?? d.fireplace_count ?? null;
  const hvacCooling = pd.hvac_cooling ?? d.hvac_cooling ?? null;
  const hvacHeating = pd.hvac_heating ?? d.hvac_heating ?? null;
  const hvacFuel = pd.hvac_fuel ?? d.hvac_fuel ?? null;

  const legalDesc = pd.legal_description ?? d.legal_description ?? null;
  const legalLot = pd.legal_lot ?? d.legal_lot ?? null;
  const legalBlock = pd.legal_block ?? d.legal_block ?? null;
  const legalSection = pd.legal_section ?? d.legal_section ?? null;

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
