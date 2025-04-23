// App.jsx
import { MapContainer, Polygon, TileLayer} from 'react-leaflet';
import './App.css';
import { CrimeFilterMultiSelect } from './components/CrimeFilterMultiSelect';
import { CommunityFilterMultiSelect } from './components/CommunityFilterMultiSelect';
import React from 'react';
import CrimeMap from './components/CrimeMap'; 


function App() {
  return (
    <>
      <CrimeMap />
      <CommunityFilterMultiSelect />
      <CrimeFilterMultiSelect />
    </>
  );
}
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



export default App;
