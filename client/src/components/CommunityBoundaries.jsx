import { useEffect, useState } from "react";
import { Polygon } from 'react-leaflet';
import { findAllCommunityBoundaries } from "../api";
import chroma from "chroma-js";

function CommunityBoundaries() {
    const [communityBoundary, setCommunityBoundary] = useState([]);
    const [maxCrime, setMaxCrime] = useState(0);
    const [error, setError] = useState(null);

    // When the page loads, this will run once.
    useEffect(() => {
        // Create a sub function to complete async/await processes.
        async function fetchCommunityData() {
            try {
                // Add all community records to a record.
                const communities = await findAllCommunityBoundaries();
                const crimeSummary = await fetch('/api/crimeSummary').then(res => res.json());
                console.log(`Crime Summary: ${JSON.stringify(crimeSummary)}`);

                // Swap coordinates for Leaflet and add crime summaries.
                const communitiesWithSwappedCoords = communities.map(community => {
                    const crimeData = crimeSummary.find(crime => crime.commCode === community.commCode);

                    // TODO: Investigate how to better do this once as a functionc all instead of testing every record.
                    if (crimeData.totalCrimes > maxCrime) {
                        setMaxCrime(crimeData.totalCrimes);
                    }

                    return {
                        ...community,
                        totalCrimes: crimeData ? crimeData.totalCrimes : 0,
                        boundary: {
                            ...community.boundary,
                            // The nested .map functions allow the navigation down to the smallest element of the array.
                            coordinates: community.boundary.coordinates.map(polygon =>
                                polygon.map(ring =>
                                    ring.map(coord => [coord[1], coord[0]]) // Swaps lng,lat to lat,lng
                                )
                            )
                        }
                    }
                });

                // Add the array of community boundaries to state.
                setCommunityBoundary(communitiesWithSwappedCoords);
            } catch (error) {
                console.error(`Error fetching community: ${error}`);
            }
        }

        // Run the function outlined above.
        fetchCommunityData();
    }, [])

    if (error) return <div>Error loading communities: {error}</div>

    const scale = chroma.scale(['#00ff00', '#ffff00', '#ff0000'])
        .domain([0, maxCrime]);

    return communityBoundary.map((community) => {
        const polygonOptions = {
            color: scale(community.totalCrimes).hex(),
            fillColor: scale(community.totalCrimes).hex(),
            fillOpacity: 0.4,
            weight: 2
        }    // Draw the Polygon per each community that is returned.
        return (
            <Polygon
                key={community._id}
                pathOptions={polygonOptions}
                positions={community.boundary.coordinates[0][0]}
            />
        );
    });
}

export default CommunityBoundaries;
