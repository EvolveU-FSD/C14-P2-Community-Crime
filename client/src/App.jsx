import FilterProvider from './context/FilterContext';
import './style/App.css';
import CrimeFilterMultiSelect from './components/CrimeFilterMultiSelect';
import CommunityFilterMultiSelect from './components/CommunityFilterMultiSelect';
import CrimeMap from './components/CrimeMap'; 
import Logo from './components/Logo';
import React from 'react';

function App() {
  return (
    <FilterProvider>
      <Logo />
      <CrimeMap />
      <CommunityFilterMultiSelect />
      <CrimeFilterMultiSelect />
    </FilterProvider>
  );
}

export default App;
