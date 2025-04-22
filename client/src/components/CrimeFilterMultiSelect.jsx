import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useFilters } from '../context/FilterContext';
import { useEffect, useState } from 'react';

const animatedComponents = makeAnimated();

export function CrimeFilterMultiSelect() {
    const [crimeTypeList, setCrimeTypeList] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
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

            // The options format requires an array of objects.
            // TODO: Create new lookup collections that give a proper ID for the label to avoid whitespace.
            const formattedOptions = crimeTypeListData.map(crimeType => ({
                value: crimeType,
                label: crimeType
            }))

            setCrimeTypeList(formattedOptions);
        } catch (error) {
            console.error(`Error fetching crime type list: ${error}`);
        }
    }

    // Run the function outlined above.
    fetchCrimeTypeList();
  }, [])
  
  const handleChange = (selectedOptions) => {
    // setSelectedOptions(selectedOptions);
    setFilters(prev => ({
        ...prev,
        crimeTypeList: selectedOptions || []
    }));
    // Logged the currently selected options to get VS Code to not complain about it not being used.
    console.log(filters.crimeTypeList);
  };

  return (
    <div className='crime-select-container'>
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        onChange={handleChange}
        isMulti
        placeholder="Filter by crime"
        options={crimeTypeList}
      />
    </div>
  )
}