import { MapContainer, TileLayer} from 'react-leaflet';
import CommunityBoundaries from './components/CommunityBoundaries';
import { CommunityFilterMultiSelect } from './components/CommunityFilterMultiSelect';
import { CrimeFilterMultiSelect } from './components/CrimeFilterMultiSelect';
import './App.css';
//I dont know if this is all we need for imports




function CrimeMap () { //why does nothing work here
  return (
    <>
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
        <CommunityBoundaries />
      </MapContainer>
    </>
  )
};



