// App.jsx
import { MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet';
import './App.css';
import CommunityBoundaries from './components/CommunityBoundaries'
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
  )
};

export default App;


