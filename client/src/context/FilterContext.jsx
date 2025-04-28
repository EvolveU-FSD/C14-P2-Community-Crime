import React, { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export default function FilterProvider({ children }) {
    const [filters, setFilters] = useState({
        communitiesListFilter: [],
        crimeListFilter: [],
        dateRangeFilter: {
            startYear: null,
            startMonth: null,
            endYear: null,
            endMonth: null
        }
    });

    return (
        <FilterContext.Provider value={{ filters, setFilters }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    return useContext(FilterContext);
}
