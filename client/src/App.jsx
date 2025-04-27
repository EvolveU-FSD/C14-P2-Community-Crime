import FilterProvider from './context/FilterContext';
import './App.css';
import CrimeFilterMultiSelect from './components/CrimeFilterMultiSelect';
import CommunityFilterMultiSelect from './components/CommunityFilterMultiSelect';
import DateRangeFilter from './components/DateRangeFilter';
import CrimeMap from './components/CrimeMap'; 
import React from 'react';

function App() {
  return (
    <FilterProvider>
      <CrimeMap />
      <CommunityFilterMultiSelect />
      <CrimeFilterMultiSelect />
      <DateRangeFilter />
    </FilterProvider>
  );
}

export default App;
