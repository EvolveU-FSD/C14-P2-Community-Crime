// App.jsx
import { MapContainer, Polygon, TileLayer} from 'react-leaflet';
import './App.css';
import { CrimeFilterMultiSelect } from './components/CrimeFilterMultiSelect';
import { CommunityFilterMultiSelect } from './components/CommunityFilterMultiSelect';
import CommunityBoundaries from './components/CommunityBoundaries';
import { CrimeMap } from './components/CrimeMap';
// import { useEffect } from 'react';
// import L from 'leaflet';
// import 'leaflet.heat';
// import 'leaflet/dist/leaflet.css';

// const HeatmapLayer = ({ data }) => {
//   const map = useMap();

//   useEffect(() => {
//     const heat = L.heatLayer(data, {
//       radius: 30,
//       blur: 20,
//       maxZoom: 17,
//     }).addTo(map);

//     return () => {
//       map.removeLayer(heat);
//     };
//   }, [data, map]);

//   return null;
// };


     
function App () {
  return (
    <>
      <CommunityFilterMultiSelect />
      <CrimeFilterMultiSelect /> </>
  )
}

      
export default App;
