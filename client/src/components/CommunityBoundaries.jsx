import { useEffect, useState } from "react";
import { useFilters } from "../context/FilterContext";
import { Polygon, Popup } from 'react-leaflet';
import chroma from "chroma-js";
import BoundsControl from "./BoundsControl";
import CrimeColourLegend from "./CrimeColourLegend";
import "../styles/CommunityPopup.css";

export default function CommunityBoundaries() {
    const { filters } = useFilters();
    const [communityBoundary, setCommunityBoundary] = useState([]);
    const [maxCrime, setMaxCrime] = useState(0);
    const [maxDifference, setMaxDifference] = useState(0);
    const [minDifference, setMinDifference] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentData, setCurrentData] = useState({}); 
    const [startData, setStartData] = useState({}); 
    const [fromDateSummary, setFromDateSummary] = useState([]); 

    // Build a reusable function that may be extracted out for leaflet usable coordinates.
    function swapGeoJsonCoordinates(geojson) {
        if (!geojson || !geojson.type || !geojson.coordinates) return geojson;

        const swap = coords => coords.map(coords => coords.slice().reverse());

        // Leave the potential to expand to more types of geojson type.
        switch (geojson.type) {
            case "MultiPolygon":
                return {
                    ...geojson,
                    coordinates: geojson.coordinates.map(polygon =>
                        polygon.map(ring => swap(ring))
                    )
                };

            default:
                return geojson;
        }
    }

    // Function to fetch data for a specific date
    const fetchCrimeByDate = async (year, month, communitiesListFilter, crimeListFilter) => {
        const response = await fetch('/api/crimeByDate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                year,
                month,
                communitiesListFilter,
                crimeListFilter
            })
        });
        
        return await response.json();
    };

    // Function to fetch summary data
    const fetchCrimeSummary = async (filterParams) => {
        const response = await fetch('/api/crimeSummary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filterParams)
        });
        
        return await response.json();
    };

    // Process data for difference mode
    const processDifferenceData = async (startYear, startMonth, endYear, endMonth, communitiesListFilter, crimeListFilter) => {
        // Fetch "FROM" date data
        const fromDateSummary = await fetchCrimeByDate(
            startYear, 
            startMonth, 
            communitiesListFilter, 
            crimeListFilter
        );
        setFromDateSummary(fromDateSummary);

        // Create a lookup map for "From" data
        const fromDateMap = {};
        fromDateSummary.forEach(community => {
            fromDateMap[community._id] = community.totalCrimes;
        });
        
        // Fetch "TO" date data
        const crimeSummary = await fetchCrimeByDate(
            endYear, 
            endMonth, 
            communitiesListFilter, 
            crimeListFilter
        );
        
        // Process coordinates
        const communitiesWithSwappedCoords = processCommunityCoordinates(crimeSummary);
        
        // Calculate differences
        const { maxDiff, minDiff } = calculateDifferences(communitiesWithSwappedCoords, fromDateMap);
        
        // Set all the state after processing
        setStartData(fromDateMap);
        setCurrentData(Object.fromEntries(
            crimeSummary.map(community => [community._id, community.totalCrimes])
        ));
        setMaxDifference(maxDiff);
        setMinDifference(minDiff);
        setCommunityBoundary(communitiesWithSwappedCoords);
        
        if (crimeSummary.length > 0) {
            setMaxCrime(crimeSummary[0].totalCrimes);
        }

        return communitiesWithSwappedCoords;
    };

    // Process data for total mode
    const processTotalData = async (filterParams) => {
        const crimeSummary = await fetchCrimeSummary(filterParams);
        
        // Extract max crime value for color scaling
        if (crimeSummary.length > 0) {
            setMaxCrime(crimeSummary[0].totalCrimes);
        }
        
        // Create a lookup map for data
        const dataMap = {};
        crimeSummary.forEach(community => {
            dataMap[community._id] = community.totalCrimes;
        });
        setCurrentData(dataMap);
        
        // Process coordinates
        const communitiesWithSwappedCoords = processCommunityCoordinates(crimeSummary);
        
        setCommunityBoundary(communitiesWithSwappedCoords);
        return communitiesWithSwappedCoords;
    };

    // Process community coordinates
    const processCommunityCoordinates = (crimeSummary) => {
        return crimeSummary.map(communityRecord => ({
            ...communityRecord,
            boundary: swapGeoJsonCoordinates(communityRecord.boundary)
        }));
    };

    // Calculate differences between two datasets
    const calculateDifferences = (communities, fromDataMap) => {
        let maxDiff = 0;
        let minDiff = 0;
        
        communities.forEach(community => {
            const fromValue = fromDataMap[community._id] || 0;
            const toValue = community.totalCrimes || 0;
            const difference = toValue - fromValue;
            
            community.startValue = fromValue;
            community.difference = difference;
            
            if (difference > maxDiff) maxDiff = difference;
            if (difference < minDiff) minDiff = difference;
        });
        
        return { maxDiff, minDiff };
    };

    useEffect(() => {
        async function fetchFilteredCommunityData() {
            setIsLoading(true);
            try {
                const isDifferenceMode = filters.dateRangeFilter?.comparisonMode === 'difference';
                
                if (isDifferenceMode && 
                    filters.dateRangeFilter?.startYear && 
                    filters.dateRangeFilter?.startMonth && 
                    filters.dateRangeFilter?.endYear && 
                    filters.dateRangeFilter?.endMonth) {
                    
                    // Process data in difference mode
                    await processDifferenceData(
                        filters.dateRangeFilter.startYear.value,
                        filters.dateRangeFilter.startMonth.value,
                        filters.dateRangeFilter.endYear.value,
                        filters.dateRangeFilter.endMonth.value,
                        filters.communitiesListFilter,
                        filters.crimeListFilter
                    );
                } else {
                    // Process data in total mode
                    await processTotalData(filters);
                }
            } catch (error) {
                console.error(`Error fetching community: ${error}`);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFilteredCommunityData();
    }, [filters]);

    // Scale for total mode - green to red
    const totalScale = chroma.scale(['#00ff00', '#ffff00', '#ff0000'])
        .domain([0, maxCrime]);
        
    const differenceScale = (value) => {
        // If no change or both values are 0, use blue
        if (value === 0) return chroma('#2196F3');
        
        // Get max absolute value for proper scaling
        const absMax = Math.max(Math.abs(minDifference), Math.abs(maxDifference));
        if (absMax === 0) return chroma('#2196F3'); // Handle edge case
        
        if (value > 0) {
            // Positive difference (increase) - use red scale
            return chroma.scale(['#FFEB3B', '#FF9800', '#F44336'])
                .domain([0, absMax])(value);
        } else {
            // Negative difference (decrease) - use green scale
            return chroma.scale(['#4CAF50', '#8BC34A', '#CDDC39'])
                .domain([-absMax, 0])(value);
        }
    };
    
    // Choose scale based on mode for polygon coloring
    const getPolygonOptions = (community) => {
        const isDifferenceMode = filters.dateRangeFilter?.comparisonMode === 'difference';
        
        const isZeroCrime = isDifferenceMode && community.totalCrimes === 0 && community.startValue === 0;
        const color = isZeroCrime 
            ? chroma('#2196F3').hex() 
            : isDifferenceMode 
            ? differenceScale(community.difference).hex() 
            : totalScale(community.totalCrimes).hex();

        return {
            color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 4
        };
    };

    // Helper function for difference mode to merge and compare crime data 
    const prepareDifferenceBreakdown = (community) => {
        if (!community || !community.crimesByCategory) return [];
        
        // Get crime data from the current community ("To" data)
        const toData = {};
        community.crimesByCategory.forEach(crime => {
            if (!toData[crime.category]) {
                toData[crime.category] = 0;
            }
            toData[crime.category] += crime.count;
        });
        
        // Get crime data from the fromDateSummary
        const fromDateCommunity = fromDateSummary?.find(c => c._id === community._id);
        const fromData = {};
        
        if (fromDateCommunity?.crimesByCategory) {
            fromDateCommunity.crimesByCategory.forEach(crime => {
                if (!fromData[crime.category]) {
                    fromData[crime.category] = 0;
                }
                fromData[crime.category] += crime.count;
            });
        }
        
        // Merge the data for comparison
        const mergedCategories = new Set([
            ...Object.keys(fromData),
            ...Object.keys(toData)
        ]);
        
        // Create combined dataset with differences
        const comparisonData = Array.from(mergedCategories).map(category => {
            const fromValue = fromData[category] || 0;
            const toValue = toData[category] || 0;
            const difference = toValue - fromValue;
            const percentChange = fromValue > 0 
                ? Math.round((difference / fromValue) * 100) 
                : toValue > 0 ? 100 : 0;
                
            return {
                category,
                from: fromValue,
                to: toValue,
                difference,
                percentChange
            };
        });
        
        // Sort by absolute difference (largest changes first)
        return comparisonData.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
    };

    // Helper function to process crime data for display
    const processAndSummarizeCrimeData = (crimesByCategory) => {
        if (!crimesByCategory || crimesByCategory.length === 0) return [];
        
        // Combine counts for the same category
        const categorySummary = {};
        
        crimesByCategory.forEach(crime => {
            if (!categorySummary[crime.category]) {
                categorySummary[crime.category] = 0;
            }
            categorySummary[crime.category] += crime.count;
        });
        
        // Convert to array and sort by count
        return Object.entries(categorySummary)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    };

    return (
        <>
            <BoundsControl
                isLoading={isLoading}
                hasBoundaries={communityBoundary.length > 0}
            >
                {communityBoundary.map((community) => {
                    const polygonOptions = getPolygonOptions(community);
                    const crimeData = processAndSummarizeCrimeData(community.crimesByCategory);
                    const isDifferenceMode = filters.dateRangeFilter?.comparisonMode === 'difference';
                    
                    return (
                        <Polygon
                            key={community._id}
                            pathOptions={polygonOptions}
                            positions={community.boundary.coordinates[0][0]}
                        >
                            <Popup className="community-popup">
                                <div className="community-popup-content">
                                    <h3>{community._id}</h3>
                                    
                                    {/* Display based on filter conditions and mode */}
                                    {isDifferenceMode && 'difference' in community ? (
                                        <>
                                            <p className="crime-total">
                                                From Date: <span>{community.startValue}</span>
                                                &nbsp;&nbsp;To Date: <span>{community.totalCrimes}</span>
                                            </p>
                                            <p className={`crime-difference ${
                                                community.totalCrimes === 0 && community.startValue === 0 
                                                    ? 'zero-crime' 
                                                    : community.difference > 0 
                                                        ? 'increase' 
                                                        : community.difference < 0 
                                                            ? 'decrease' 
                                                            : 'unchanged'
                                            }`}>
                                                {community.totalCrimes === 0 && community.startValue === 0 ? (
                                                    <>No crimes recorded in either period</>
                                                ) : (
                                                    <>
                                                        Change: <span>{community.difference > 0 ? '+' : ''}{community.difference}</span>
                                                        {community.difference !== 0 && community.startValue > 0 && (
                                                            <span className="percent-change">
                                                                ({Math.round((community.difference / community.startValue) * 100)}%)
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </p>
                                            
                                            {/* Crime breakdown comparison table */}
                                            <div className="crime-comparison">
                                                <h4>Crime Comparison:</h4>
                                                <div className="comparison-table-container">
                                                    <table className="comparison-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Crime Type</th>
                                                                <th>From</th>
                                                                <th>To</th>
                                                                <th>Change</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {community.crimesByCategory && community.crimesByCategory.length > 0 ? (
                                                                prepareDifferenceBreakdown(community).map((item, index) => (
                                                                    <tr key={index} className={
                                                                        item.difference > 0 
                                                                            ? 'row-increase' 
                                                                            : item.difference < 0 
                                                                                ? 'row-decrease' 
                                                                                : 'row-unchanged'
                                                                    }>
                                                                        <td className="crime-type-cell">{item.category}</td>
                                                                        <td>{item.from}</td>
                                                                        <td>{item.to}</td>
                                                                        <td className="change-cell">
                                                                            {item.difference > 0 ? '+' : ''}{item.difference}
                                                                            {item.difference !== 0 && item.from > 0 && (
                                                                                <span className="percent-change">
                                                                                    ({item.percentChange > 0 ? '+' : ''}{item.percentChange}%)
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="4" className="no-data">No crime breakdown available</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </>
                                    ) : filters.crimeListFilter?.length === 0 ? (
                                        <>
                                            <p className="crime-total">Total Crimes: <span>{community.totalCrimes}</span></p>
                                        
                                            {/* Show breakdown for multiple crime types */}
                                            <div className="crime-breakdown">
                                                <h4>Crime Breakdown:</h4>
                                                <ul>
                                                    {crimeData.map((crime, index) => (
                                                        <li key={index}>
                                                            <span className="crime-type">{crime.category}</span>
                                                            <span className="crime-count">{crime.count}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    ) : filters.crimeListFilter?.length === 1 ? (
                                        <p className="crime-total">
                                            Total {filters.crimeListFilter[0].label} Crimes: 
                                            <span>{community.totalCrimes}</span>
                                        </p>
                                    ) : (
                                        <>
                                            <p className="crime-total">Total Filtered Crimes: <span>{community.totalCrimes}</span></p>
                                            
                                            {/* Show breakdown for multiple crime types */}
                                            <div className="crime-breakdown">
                                                <h4>Crime Breakdown:</h4>
                                                <ul>
                                                    {crimeData.map((crime, index) => (
                                                        <li key={index}>
                                                            <span className="crime-type">{crime.category}</span>
                                                            <span className="crime-count">{crime.count}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                    
                                    {community.sector && (
                                        <p className="community-sector">Sector: {community.sector}</p>
                                    )}
                                </div>
                            </Popup>
                        </Polygon>
                    );
                })}
            </BoundsControl>

            <CrimeColourLegend 
                scale={filters.dateRangeFilter?.comparisonMode === 'difference' ? differenceScale : totalScale} 
                maxValue={filters.dateRangeFilter?.comparisonMode === 'difference' 
                    ? Math.max(Math.abs(minDifference), Math.abs(maxDifference)) 
                    : maxCrime} 
                minValue={filters.dateRangeFilter?.comparisonMode === 'difference' 
                    ? -Math.max(Math.abs(minDifference), Math.abs(maxDifference)) 
                    : 0}
                mode={filters.dateRangeFilter?.comparisonMode || 'total'}
            />
        </>
    );
}
