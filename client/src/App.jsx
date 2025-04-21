// App.jsx
import { MapContainer, TileLayer } from 'react-leaflet';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './App.css';
import { useState } from 'react';
// import { useEffect } from 'react';
// import L from 'leaflet';
// import 'leaflet.heat';
// import 'leaflet/dist/leaflet.css';

const animatedComponents = makeAnimated();
const communityTempOptions = [
  { value: 'comm01', label: 'temp1' },
  { value: 'comm02', label: 'temp2' },
  { value: 'comm03', label: 'temp3' },
  { value: 'comm04', label: 'temp4' },
  { value: 'comm05', label: 'temp5' },
  { value: 'comm06', label: 'temp6' },
];
const defaultTempCommunities = [
  { value: 'comm01', label: 'temp1' },
  { value: 'comm02', label: 'temp2' },
]
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

export function AnimatedMulti() {
  const [selectedOptions, setSelectedOptions] = useState(defaultTempCommunities);

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    // Logged the currently selected options to get VS Code to not complain about it not being used.
    console.log(selectedOptions);
  };

  return (
    <div className='crime-select-container'>
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        defaultValue={defaultTempCommunities}
        onChange={handleChange}
        isMulti
        placeholder="Filter by crime"
        options={communityTempOptions}
      />
    </div>
  )
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

  return (
    <>
      <AnimatedMulti />
      <MapContainer
        center={[51.0447, -114.0719]} // Calgary center
        zoom={12}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </>
  )
};

export default App;


