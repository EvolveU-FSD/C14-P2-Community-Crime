import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useFilters } from '../context/FilterContext';
import '../styles/DateRangeFilter.css';

export default function DateRangeFilter() {
  const [loading, setLoading] = useState(true);
  const [yearOptions, setYearOptions] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [endYearOptions, setEndYearOptions] = useState([]);
  const [endMonthOptions, setEndMonthOptions] = useState([]);
  const [earliestDate, setEarliestDate] = useState({ year: null, month: null });
  const { filters, setFilters } = useFilters();

  // Fetch available dates when component mounts
  useEffect(() => {
    async function fetchAvailableDates() {
      setLoading(true);
      try {
        const response = await fetch('/api/dateRanges');
        if (!response.ok) {
          throw new Error('Failed to fetch date ranges');
        }
        
        const dateRanges = await response.json();
        
        // Sort the date ranges by year and month
        dateRanges.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });
        
        // Get earliest date for defaulting
        if (dateRanges.length > 0) {
          setEarliestDate({
            year: dateRanges[0].year,
            month: dateRanges[0].month
          });
        }
        
        // Extract unique years and sort
        const years = [...new Set(dateRanges.map(d => d.year))].sort();
        const yearOpts = years.map(year => ({
          value: year,
          label: year.toString()
        }));
        
        setYearOptions(yearOpts);
        setEndYearOptions(yearOpts);
        
        // Create month options (1-12)
        const monthOpts = Array.from({ length: 12 }, (_, i) => i + 1).map(month => ({
          value: month,
          label: getMonthName(month)
        }));
        
        setMonthOptions(monthOpts);
        setEndMonthOptions(monthOpts);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching date ranges:', error);
        setLoading(false);
      }
    }
    
    fetchAvailableDates();
  }, []);

  // Helper function to get month name
  const getMonthName = (monthNum) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNum - 1];
  };

  // Handle start year selection
  const handleStartYearChange = (selectedOption) => {
    setFilters(prev => ({
      ...prev,
      dateRangeFilter: {
        ...prev.dateRangeFilter,
        startYear: selectedOption
      }
    }));
    
    // Update end year options to be >= start year
    if (selectedOption) {
      const filteredYears = yearOptions.filter(opt => 
        opt.value >= selectedOption.value
      );
      setEndYearOptions(filteredYears);
      
      // Reset end year if it's now invalid
      if (filters.dateRangeFilter?.endYear && 
          filters.dateRangeFilter.endYear.value < selectedOption.value) {
        setFilters(prev => ({
          ...prev,
          dateRangeFilter: {
            ...prev.dateRangeFilter,
            endYear: null,
            endMonth: null
          }
        }));
      }
    } else {
      // If start year cleared, reset end year options
      setEndYearOptions(yearOptions);
    }
  };

  // Handle start month selection
  const handleStartMonthChange = (selectedOption) => {
    setFilters(prev => ({
      ...prev,
      dateRangeFilter: {
        ...prev.dateRangeFilter,
        startMonth: selectedOption
      }
    }));
    
    // If start year = end year, update end month options
    if (filters.dateRangeFilter?.startYear && 
        filters.dateRangeFilter?.endYear && 
        filters.dateRangeFilter.startYear.value === filters.dateRangeFilter.endYear.value) {
      
      if (selectedOption) {
        const filteredMonths = monthOptions.filter(opt => 
          opt.value >= selectedOption.value
        );
        setEndMonthOptions(filteredMonths);
        
        // Reset end month if it's now invalid
        if (filters.dateRangeFilter?.endMonth && 
            filters.dateRangeFilter.endMonth.value < selectedOption.value) {
          setFilters(prev => ({
            ...prev,
            dateRangeFilter: {
              ...prev.dateRangeFilter,
              endMonth: null
            }
          }));
        }
      } else {
        setEndMonthOptions(monthOptions);
      }
    }
  };

  // Handle end year selection
  const handleEndYearChange = (selectedOption) => {
    // If start date isn't set and end date is being set, default the start date to earliest
    if ((!filters.dateRangeFilter?.startYear || !filters.dateRangeFilter?.startMonth) && 
        selectedOption && earliestDate.year !== null) {
      
      const earliestYearOption = yearOptions.find(y => y.value === earliestDate.year);
      const earliestMonthOption = monthOptions.find(m => m.value === earliestDate.month);
      
      setFilters(prev => ({
        ...prev,
        dateRangeFilter: {
          ...prev.dateRangeFilter,
          startYear: earliestYearOption,
          startMonth: earliestMonthOption,
          endYear: selectedOption
        }
      }));
    } else {
      // Normal update
      setFilters(prev => ({
        ...prev,
        dateRangeFilter: {
          ...prev.dateRangeFilter,
          endYear: selectedOption
        }
      }));
    }
    
    // If end year = start year, update end month options
    if (selectedOption && 
        filters.dateRangeFilter?.startYear && 
        selectedOption.value === filters.dateRangeFilter.startYear.value) {
      
      if (filters.dateRangeFilter?.startMonth) {
        const filteredMonths = monthOptions.filter(opt => 
          opt.value >= filters.dateRangeFilter.startMonth.value
        );
        setEndMonthOptions(filteredMonths);
        
        // Reset end month if it's now invalid
        if (filters.dateRangeFilter?.endMonth && 
            filters.dateRangeFilter.endMonth.value < filters.dateRangeFilter.startMonth.value) {
          setFilters(prev => ({
            ...prev,
            dateRangeFilter: {
              ...prev.dateRangeFilter,
              endMonth: null
            }
          }));
        }
      }
    } else {
      // If end year != start year, reset end month options
      setEndMonthOptions(monthOptions);
    }
  };

  // Handle end month selection
  const handleEndMonthChange = (selectedOption) => {
    // If start date isn't set and end date is being set, default the start date to earliest
    if ((!filters.dateRangeFilter?.startYear || !filters.dateRangeFilter?.startMonth) && 
        selectedOption && earliestDate.year !== null) {
      
      const earliestYearOption = yearOptions.find(y => y.value === earliestDate.year);
      const earliestMonthOption = monthOptions.find(m => m.value === earliestDate.month);
      
      setFilters(prev => ({
        ...prev,
        dateRangeFilter: {
          ...prev.dateRangeFilter,
          startYear: earliestYearOption,
          startMonth: earliestMonthOption,
          endMonth: selectedOption
        }
      }));
    } else {
      // Normal update
      setFilters(prev => ({
        ...prev,
        dateRangeFilter: {
          ...prev.dateRangeFilter,
          endMonth: selectedOption
        }
      }));
    }
  };

  return (
    <div className="date-filter-container">
      <div className="date-filter-section">
        <label className="date-filter-label">From:</label>
        <div className="date-filter-inputs">
          <Select
            className="year-select"
            placeholder="Year"
            value={filters.dateRangeFilter?.startYear}
            onChange={handleStartYearChange}
            options={yearOptions}
            isClearable
            isLoading={loading}
          />
          <Select
            className="month-select"
            placeholder="Month"
            value={filters.dateRangeFilter?.startMonth}
            onChange={handleStartMonthChange}
            options={monthOptions}
            isDisabled={!filters.dateRangeFilter?.startYear || loading}
            isClearable
            isLoading={loading}
          />
        </div>
      </div>
      
      <div className="date-filter-section">
        <label className="date-filter-label">To:</label>
        <div className="date-filter-inputs">
          <Select
            className="year-select"
            placeholder="Year"
            value={filters.dateRangeFilter?.endYear}
            onChange={handleEndYearChange}
            options={endYearOptions}
            isClearable
            isLoading={loading}
          />
          <Select
            className="month-select"
            placeholder="Month"
            value={filters.dateRangeFilter?.endMonth}
            onChange={handleEndMonthChange}
            options={endMonthOptions}
            isDisabled={!filters.dateRangeFilter?.endYear || loading}
            isClearable
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}