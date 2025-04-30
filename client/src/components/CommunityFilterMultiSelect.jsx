import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useFilters } from '../context/FilterContext';
import { useEffect, useState } from 'react';

const animatedComponents = makeAnimated();

export default function CommunityFilterMultiSelect() {
  const [communityBoundaryList, setCommunityBoundaryList] = useState({});
  const { filters, setFilters } = useFilters();

  useEffect(() => {
    async function fetchCommunityBoundaryList() {
      try {
        const communityBoundaryResponse = await fetch('/api/communityBoundaryList');

        if (!communityBoundaryResponse.ok) {
          throw new Error('Community Boundary list API call error');
        }

        const communityBoundaryListData = await communityBoundaryResponse.json();
        setCommunityBoundaryList(communityBoundaryListData);
      } catch (error) {
        console.error(`Error fetching community boundary list: ${error}`);
      }
    }

    fetchCommunityBoundaryList();
  }, []);

  const handleChange = (selectedOptions) => {
    setFilters(prev => ({
      ...prev,
      communitiesListFilter: selectedOptions || []
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
      placeholder="Filter by community"
      options={communityBoundaryList}
      value={filters.communitiesListFilter}
      classNamePrefix="community-select"
    />
  );
}