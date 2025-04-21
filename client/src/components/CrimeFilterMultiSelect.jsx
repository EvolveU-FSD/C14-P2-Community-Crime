import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useState } from 'react';

const animatedComponents = makeAnimated();
const crimeTempOptions = [
  { value: 'crime01', label: 'crime01' },
  { value: 'crime02', label: 'crime02' },
  { value: 'crime03', label: 'crime03' },
  { value: 'crime04', label: 'crime04' },
  { value: 'crime05', label: 'crime05' },
  { value: 'crime06', label: 'crime06' },
];
const defaultTempCrimes = [
  { value: 'crime02', label: 'crime02' },
  { value: 'crime04', label: 'crime04' },
]

export function CrimeFilterMultiSelect() {
  const [selectedOptions, setSelectedOptions] = useState(defaultTempCrimes);

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    // Logged the currently selected options to get VS Code to not complain about it not being used.
    console.log(selectedOptions);
  };

  return (
    <div className='crime-select-container'>
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        defaultValue={defaultTempCrimes}
        onChange={handleChange}
        isMulti
        placeholder="Filter by crime"
        options={crimeTempOptions}
      />
    </div>
  )
}