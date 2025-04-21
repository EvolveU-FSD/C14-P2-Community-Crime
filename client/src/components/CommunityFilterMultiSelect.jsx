import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useState } from 'react';

const animatedComponents = makeAnimated();
const communityTempOptions = [
  { value: 'comm01', label: 'comm1' },
  { value: 'comm02', label: 'comm2' },
  { value: 'comm03', label: 'comm3' },
  { value: 'comm04', label: 'comm4' },
  { value: 'comm05', label: 'comm5' },
  { value: 'comm06', label: 'comm6' },
];
const defaultTempCommunities = [
  { value: 'comm01', label: 'comm1' },
  { value: 'comm02', label: 'comm2' },
]

export function CommunityFilterMultiSelect() {
  const [selectedOptions, setSelectedOptions] = useState(defaultTempCommunities);

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    // Logged the currently selected options to get VS Code to not complain about it not being used.
    console.log(selectedOptions);
  };

  return (
    <div className='community-select-container'>
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