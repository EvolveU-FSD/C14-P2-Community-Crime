// App.jsx
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import './App.css';
import { useEffect, useState } from 'react';
import { findAllCommunityBoundaries } from './api';
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

function CommunityBoundaries() {
  const [communityBoundary, setCommunityBoundary] = useState([]);

  useEffect(() => {
    console.log(`Getting community boundaries`);
    findAllCommunityBoundaries().then((e) => {
      setCommunityBoundary(e)
      console.log(`Found ${e.length} boundaries`);
    })
  }, [])

  communityBoundary.map((community) => {
    console.log(`${community.code}: with name ${community.name}`)
  })

  const fillBlueOption = { color: 'blue' };
  return communityBoundary.map((community) => {
    <Polyline 
      key={community._id}
      pathOptions={fillBlueOption}
      positions={community.boundary.coordinates[0]} />
  })
}

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

  // Draw some basic polygons. Start from beltline data to ensure we know where the points are:
  const tempMultiPolygon = [
    [
      [51.037831, -114.0742562],
      [51.0378312, -114.0715175],
      [51.0378313, -114.0685169],
      [51.0378314, -114.0660451],
      [51.0378313, -114.0635768],
      [51.0378313, -114.0611155],
      [51.0370668, -114.0611716],
      [51.037831, -114.0742562]
    ]
  ]

  // Set a default colour for now.
  const fillBlueOption = { color: 'blue' };

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

      {/* <Polyline pathOptions={fillBlueOption} positions={tempMultiPolygon} /> */}
      <CommunityBoundaries />
    </MapContainer>
  )
};

export default App;


