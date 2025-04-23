import { FilterProvider, useFilters } from './context/FilterContext';
import { MapContainer, TileLayer, FeatureGroup, useMap} from 'react-leaflet';
import './App.css';
import { CrimeFilterMultiSelect } from './components/CrimeFilterMultiSelect';
import { CommunityFilterMultiSelect } from './components/CommunityFilterMultiSelect';
import CommunityBoundaries from './components/CommunityBoundaries'
import { useEffect, useRef } from 'react';

// Create a new component to handle bounds updates
export function BoundsUpdater({ group }) {
  const map = useMap();
  const { filters } = useFilters();

  useEffect(() => {
    if (group.current) {
      const bounds = group.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, group, filters]);

  return null;
}

export function BoundsControl({ isLoading }) {
  const featureGroupRef = useRef(null);

  return (
    <FeatureGroup ref={featureGroupRef}>
      <BoundsUpdater group={featureGroupRef} isLoading={isLoading} />
    </FeatureGroup>
  );
}
     
function App () {
  const featureGroupRef = useRef(null);

  return (
    <FilterProvider>
      <CommunityFilterMultiSelect />
      <CrimeFilterMultiSelect />
      <MapContainer
        center={[51.0447, -114.0719]} // Calgary center
        zoom={12}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Add the community boundaries drawing. */}
        <FeatureGroup ref={featureGroupRef}>
          <CommunityBoundaries />
        </FeatureGroup>
        <BoundsUpdater group={featureGroupRef} />
      </MapContainer>
    </FilterProvider>
  )
};

export default App;
