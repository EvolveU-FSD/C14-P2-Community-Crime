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
  
  // Check if we're in difference mode
  const isDifferenceMode = filters.dateRangeFilter?.comparisonMode === 'difference';

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
          const firstDate = dateRanges[0];
          
          setEarliestDate({
            year: firstDate.year,
            month: firstDate.month
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
        
        // Set default date range after loading data
        if (dateRanges.length > 0 && !filters.dateRangeFilter?.endYear) {
          const lastDate = dateRanges[dateRanges.length - 1];
          
          // Find the year option for the latest date
          const latestYearOption = yearOpts.find(y => y.value === lastDate.year);
          const latestMonthOption = monthOpts.find(m => m.value === lastDate.month);
          
          // Calculate default start date (1 year before latest date)
          let defaultStartYear = lastDate.year - 1;
          let defaultStartMonth = lastDate.month;
          
          // Ensure the start date exists in our dataset
          // Find the closest available date if the exact 1-year-before date doesn't exist
          const defaultStartYearOption = yearOpts.find(y => y.value === defaultStartYear) || 
                                        yearOpts.find(y => y.value <= defaultStartYear) ||
                                        yearOpts[0];
          
          const defaultStartMonthOption = monthOpts.find(m => m.value === defaultStartMonth);
          
          // Set the default date range in the filter context
          setFilters(prev => ({
            ...prev,
            dateRangeFilter: {
              ...prev.dateRangeFilter,
              startYear: defaultStartYearOption,
              startMonth: defaultStartMonthOption,
              endYear: latestYearOption,
              endMonth: latestMonthOption
            }
          }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching date ranges:', error);
        setLoading(false);
      }
    }
    
    fetchAvailableDates();
  }, [setFilters]);

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
    // In difference mode, if trying to clear, revert to previous value
    if (isDifferenceMode && !selectedOption && filters.dateRangeFilter?.startYear) {
      return; // Prevent clearing in difference mode
    }
    
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
      // If start year cleared (only in Total mode), reset end year options
      setEndYearOptions(yearOptions);
    }
  };

  // Handle start month selection
  const handleStartMonthChange = (selectedOption) => {
    // In difference mode, if trying to clear, revert to previous value
    if (isDifferenceMode && !selectedOption && filters.dateRangeFilter?.startMonth) {
      return; // Prevent clearing in difference mode
    }
    
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
    // In difference mode, if trying to clear, revert to previous value
    if (isDifferenceMode && !selectedOption && filters.dateRangeFilter?.endYear) {
      return; // Prevent clearing in difference mode
    }
    
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
    // In difference mode, if trying to clear, revert to previous value
    if (isDifferenceMode && !selectedOption && filters.dateRangeFilter?.endMonth) {
      return; // Prevent clearing in difference mode
    }
    
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

  // Handle comparison mode change
  const handleComparisonModeChange = (e) => {
    // When switching to difference mode, make sure dates are set
    if (e.target.value === 'difference') {
      // If dates aren't set, set defaults
      if (!filters.dateRangeFilter?.startYear || !filters.dateRangeFilter?.startMonth ||
          !filters.dateRangeFilter?.endYear || !filters.dateRangeFilter?.endMonth) {
        
        // Find latest date
        const lastDate = {
          year: Math.max(...yearOptions.map(y => y.value)),
          month: 12
        };
        
        // Calculate default start date (1 year before latest)
        const defaultStartYear = Math.max(earliestDate.year, lastDate.year - 1);
        const defaultStartMonth = lastDate.month;
        
        const latestYearOption = yearOptions.find(y => y.value === lastDate.year);
        const latestMonthOption = monthOptions.find(m => m.value === lastDate.month);
        const defaultStartYearOption = yearOptions.find(y => y.value === defaultStartYear);
        const defaultStartMonthOption = monthOptions.find(m => m.value === defaultStartMonth);
        
        setFilters(prev => ({
          ...prev,
          dateRangeFilter: {
            ...prev.dateRangeFilter,
            startYear: defaultStartYearOption || prev.dateRangeFilter?.startYear,
            startMonth: defaultStartMonthOption || prev.dateRangeFilter?.startMonth,
            endYear: latestYearOption || prev.dateRangeFilter?.endYear,
            endMonth: latestMonthOption || prev.dateRangeFilter?.endMonth,
            comparisonMode: e.target.value
          }
        }));
        return;
      }
    }
    
    // Standard mode change
    setFilters(prev => ({
      ...prev,
      dateRangeFilter: {
        ...prev.dateRangeFilter,
        comparisonMode: e.target.value
      }
    }));
  };

  return (
    <div className="date-range-content">
      <div className="date-filter-mode">
        <div className="radio-group">
          <label className="radio-label">
            <input 
              type="radio" 
              name="comparisonMode" 
              value="total" 
              checked={!filters.dateRangeFilter?.comparisonMode || filters.dateRangeFilter?.comparisonMode === 'total'} 
              onChange={handleComparisonModeChange}
            />
            <span>Total</span>
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="comparisonMode" 
              value="difference" 
              checked={filters.dateRangeFilter?.comparisonMode === 'difference'} 
              onChange={handleComparisonModeChange}
            />
            <span>Difference</span>
          </label>
        </div>
      </div>
      
      <div className="date-filter-section">
        <label className="date-filter-label">From:</label>
        <div className="date-filter-inputs">
          <Select
            className="year-select"
            placeholder="Year"
            value={filters.dateRangeFilter?.startYear}
            onChange={handleStartYearChange}
            options={yearOptions}
            isClearable={!isDifferenceMode}
            isLoading={loading}
            classNamePrefix="date-select"
          />
          <Select
            className="month-select"
            placeholder="Month"
            value={filters.dateRangeFilter?.startMonth}
            onChange={handleStartMonthChange}
            options={monthOptions}
            isDisabled={!filters.dateRangeFilter?.startYear || loading}
            isClearable={!isDifferenceMode}
            isLoading={loading}
            classNamePrefix="date-select"
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
            isClearable={!isDifferenceMode}
            isLoading={loading}
            classNamePrefix="date-select"
          />
          <Select
            className="month-select"
            placeholder="Month"
            value={filters.dateRangeFilter?.endMonth}
            onChange={handleEndMonthChange}
            options={endMonthOptions}
            isDisabled={!filters.dateRangeFilter?.endYear || loading}
            isClearable={!isDifferenceMode}
            isLoading={loading}
            classNamePrefix="date-select"
          />
        </div>
      </div>
    </div>
  );
}