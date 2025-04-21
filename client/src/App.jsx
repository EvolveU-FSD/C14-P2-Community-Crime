// App.jsx
import { MapContainer, TileLayer } from 'react-leaflet';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './App.css';
import CommunityBoundaries from './components/CommunityBoundaries'
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
      <CommunityBoundaries />
      </MapContainer>
    </>
  )
};

export default App;


