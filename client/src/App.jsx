// App.jsx
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
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

  // Sample heat data for Calgary (latitude, longitude, intensity)
  // const heatmapPoints = [
  //   [51.0447, -114.0719, 0.8], // Downtown Calgary
  //   [51.0501, -114.0853, 0.6], // Eau Claire
  //   [51.0461, -114.0570, 0.7], // East Village
  //   [51.0314, -114.0712, 0.4], // Mission
  //   [51.0616, -114.1281, 0.5], // Capitol Hill
  //   [51.0486, -114.0667, 0.9], // Beltline
  //   [51.0365, -114.0829, 0.3], // Lower Mount Royal
  //   [51.0106, -114.0805, 0.5], // South Calgary
  //   [51.1211, -114.0680, 0.6], // Nose Hill Park
  //   [51.1000, -114.0682, 0.7], // Huntington Hills
  // ];

  return (
    <MapContainer
      center={[51.0447, -114.0719]} // Calgary center
      zoom={12}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {/* <HeatmapLayer data={heatmapPoints} /> */}
    </MapContainer>
  );
};

export default App;


