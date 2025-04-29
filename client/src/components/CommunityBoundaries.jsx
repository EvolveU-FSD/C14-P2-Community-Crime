import { useEffect, useState } from "react";
import { useFilters } from "../context/FilterContext";
import { Polygon, Popup } from 'react-leaflet';
import chroma from "chroma-js";
import BoundsControl from "./BoundsControl";
import CrimeColourLegend from "./CrimeColourLegend";
import "../style/CommunityPopup.css";

export default function CommunityBoundaries() {
    const { filters } = useFilters();
    const [communityBoundary, setCommunityBoundary] = useState([]);
    const [maxCrime, setMaxCrime] = useState(0);
    const [maxDifference, setMaxDifference] = useState(0);
    const [minDifference, setMinDifference] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentData, setCurrentData] = useState({}); 
    const [startData, setStartData] = useState({}); 

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

    useEffect(() => {
        async function fetchFilteredCommunityData() {
            setIsLoading(true);
            try {
                let crimeSummary;
                const isDifferenceMode = filters.dateRangeFilter?.comparisonMode === 'difference';
                
                if (isDifferenceMode && 
                    filters.dateRangeFilter?.startYear && 
                    filters.dateRangeFilter?.startMonth && 
                    filters.dateRangeFilter?.endYear && 
                    filters.dateRangeFilter?.endMonth) {
                    
                    // Fetch both from and to data before processing either
                    // Fetch "FROM" date data (start date) using new endpoint first
                    const fromDateResponse = await fetch('/api/crimeByDate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            year: filters.dateRangeFilter.startYear.value,
                            month: filters.dateRangeFilter.startMonth.value,
                            communitiesListFilter: filters.communitiesListFilter,
                            crimeListFilter: filters.crimeListFilter
                        })
                    });
                    
                    const fromDateSummary = await fromDateResponse.json();
                    
                    // Create a lookup map for "From" data
                    const fromDateMap = {};
                    fromDateSummary.forEach(community => {
                        fromDateMap[community._id] = community.totalCrimes;
                    });
                    
                    // Fetch "TO" date data (end date) using new endpoint
                    const toDateResponse = await fetch('/api/crimeByDate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            year: filters.dateRangeFilter.endYear.value,
                            month: filters.dateRangeFilter.endMonth.value,
                            communitiesListFilter: filters.communitiesListFilter,
                            crimeListFilter: filters.crimeListFilter
                        })
                    });
                    
                    crimeSummary = await toDateResponse.json();
                    
                    // Process coordinates
                    const communitiesWithSwappedCoords = crimeSummary.map(communityRecord => ({
                        ...communityRecord,
                        boundary: swapGeoJsonCoordinates(communityRecord.boundary)
                    }));
                    
                    // Now calculate differences with the data we already have
                    let maxDiff = 0;
                    let minDiff = 0;
                    
                    communitiesWithSwappedCoords.forEach(community => {
                        const fromValue = fromDateMap[community._id] || 0;
                        const toValue = community.totalCrimes || 0;
                        const difference = toValue - fromValue; // Current - Previous
                        
                        community.startValue = fromValue; // Adding start value for display
                        community.difference = difference;
                        
                        if (difference > maxDiff) maxDiff = difference;
                        if (difference < minDiff) minDiff = difference;
                    });
                    
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
                } else {
                    // In total mode, use the original API endpoint
                    const toDateFilters = { ...filters };
                    const response = await fetch('/api/crimeSummary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(toDateFilters)
                    });
                    
                    crimeSummary = await response.json();
                    
                    // Extract max crime value for color scaling (for "Total" mode)
                    if (crimeSummary.length > 0) {
                        setMaxCrime(crimeSummary[0].totalCrimes);
                    }
                    
                    // Create a lookup map for "To" data
                    const toDateMap = {};
                    crimeSummary.forEach(community => {
                        toDateMap[community._id] = community.totalCrimes;
                    });
                    setCurrentData(toDateMap);
                    
                    // Process coordinates
                    const communitiesWithSwappedCoords = crimeSummary.map(communityRecord => ({
                        ...communityRecord,
                        boundary: swapGeoJsonCoordinates(communityRecord.boundary)
                    }));
                    
                    setCommunityBoundary(communitiesWithSwappedCoords);
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
        
        if (isDifferenceMode && 'difference' in community) {
            // Special case for communities with zero crime in both periods
            if (community.totalCrimes === 0 && community.startValue === 0) {
                const color = chroma('#2196F3').hex(); // Blue for communities with zero crime in both periods
                return {
                    color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    weight: 4
                };
            }
            
            const color = differenceScale(community.difference).hex();
            return {
                color,
                fillColor: color,
                fillOpacity: 0.3,
                weight: 4
            };
        } else {
            const color = totalScale(community.totalCrimes).hex();
            return {
                color,
                fillColor: color,
                fillOpacity: 0.3,
                weight: 4
            };
        }
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
                                            </p>
                                            <p className="crime-total">
                                                To Date: <span>{community.totalCrimes}</span>
                                            </p>
                                            <p className={`crime-difference ${community.difference > 0 ? 'increase' : community.difference < 0 ? 'decrease' : 'unchanged'}`}>
                                                Change: <span>{community.difference > 0 ? '+' : ''}{community.difference}</span>
                                                {community.difference !== 0 && community.startValue > 0 && (
                                                    <span className="percent-change">
                                                        ({Math.round((community.difference / community.startValue) * 100)}%)
                                                    </span>
                                                )}
                                            </p>
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
