import FilterProvider from './context/FilterContext';
import './style/App.css';
import CrimeFilterMultiSelect from './components/CrimeFilterMultiSelect';
import CommunityFilterMultiSelect from './components/CommunityFilterMultiSelect';
import DateRangeFilter from './components/DateRangeFilter';
import CrimeMap from './components/CrimeMap'; 
import Logo from './components/Logo';
import React from 'react';

export default function App() {
  return (
    <FilterProvider>
      <Logo />
      <CrimeMap />
      <CommunityFilterMultiSelect />
      <CrimeFilterMultiSelect />
      <DateRangeFilter />
    </FilterProvider>
  );
}

