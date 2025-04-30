import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useFilters } from '../context/FilterContext';
import { useEffect, useState } from 'react';

const animatedComponents = makeAnimated();

export default function CrimeFilterMultiSelect() {
  const [crimeTypeList, setCrimeTypeList] = useState({});
  const { filters, setFilters } = useFilters();

// When the page loads, get the list of crime types.
  useEffect(() => {
// Put the fetch in a function.
    async function fetchCrimeTypeList() {
      try {
        const crimeTypeResponse = await fetch('/api/crimeTypeList');

        if (!crimeTypeResponse.ok) {
          throw new Error('Crime Type list API call error');
        }

        const crimeTypeListData = await crimeTypeResponse.json();
        const formattedOptions = crimeTypeListData.map(crimeType => ({
          value: crimeType,
          label: crimeType
        }));

        setCrimeTypeList(formattedOptions);
      } catch (error) {
        console.error(`Error fetching crime type list: ${error}`);
      }
    }

    fetchCrimeTypeList();
  }, []);

  const handleChange = (selectedOptions) => {
    setFilters(prev => ({
      ...prev,
      crimeListFilter: selectedOptions || []
    }));
  };

  return (
    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      onChange={handleChange}
      isMulti
      menuPortalTarget={document.body}
      styles={{
        menuPortal: base => ({ ...base, zIndex: 9999 }),
      }}
      placeholder="Filter by crime"
      options={crimeTypeList}
      value={filters.crimeListFilter}
      classNamePrefix="crime-select"
    />
  );
}