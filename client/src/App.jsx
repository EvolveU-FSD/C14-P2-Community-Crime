import FilterProvider from './context/FilterContext';
import './style/App.css';
import CrimeMap from './components/CrimeMap';
import Logo from './components/Logo';
import FilterPanel from './components/FilterPanel';
import React from 'react';

export default function App() {
  return (
    <FilterProvider>
      <Logo />
      <CrimeMap />
      <FilterPanel />
    </FilterProvider>
  );
}

