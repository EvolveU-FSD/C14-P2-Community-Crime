import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useFilters } from '../context/FilterContext';
import { useEffect, useState } from 'react';

const animatedComponents = makeAnimated();

export function CommunityFilterMultiSelect() {
  const [communityBoundaryList, setCommunityBoundaryList] = useState({});
  const { filters, setFilters } = useFilters();

  useEffect(() => {
    // Put the fetch in a function to get the master list of all community names.
    async function fetchCommunityBoundaryList() {
        try {
            const communityBoundaryResponse = await fetch('/api/communityBoundaryList');

            if (!communityBoundaryResponse.ok) {
                throw new Error('Community Boundary list API call error');
            }

            const communityBoundaryListData = await communityBoundaryResponse.json();

            // Since we have comm code, this has been formatted into an object in the base query.
            // No need to format it like was needed for the Crimes list.
            setCommunityBoundaryList(communityBoundaryListData);
        } catch (error) {
            console.error(`Error fetching community boundary list: ${error}`);
        }
    }

    // Run the function built above.
    fetchCommunityBoundaryList();
  }, [])

  const handleChange = (selectedOptions) => {
    setFilters(prev => ({
      ...prev,
      communitiesList: selectedOptions || []
    }));
    // Logged the currently selected options to get VS Code to not complain about it not being used.
    console.log(filters.communitiesList);
  };

  return (
    <div className='community-select-container'>
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        onChange={handleChange}
        isMulti
        placeholder="Filter by community"
        options={communityBoundaryList}
      />
    </div>
  )
}