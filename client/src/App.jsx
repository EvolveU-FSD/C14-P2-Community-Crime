// App.jsx
import { FilterProvider } from './context/FilterContext';
import { MapContainer, TileLayer } from 'react-leaflet';
import './App.css';
import { CrimeFilterMultiSelect } from './components/CrimeFilterMultiSelect';
import { CommunityFilterMultiSelect } from './components/CommunityFilterMultiSelect';
import React from 'react';
import CrimeMap from './components/CrimeMap'; 


function App() {
  return (
    <FilterProvider>
      <CrimeMap />
      <CommunityFilterMultiSelect />
      <CrimeFilterMultiSelect />
    </FilterProvider>
  );
}

export default App;
