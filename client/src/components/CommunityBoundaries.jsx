import { useEffect, useState } from "react";
import { Polygon } from 'react-leaflet';
import { findAllCommunityBoundaries } from "../api";
import chroma from "chroma-js";

function CommunityBoundaries() {
    const [communityBoundary, setCommunityBoundary] = useState([]);
    const [error, setError] = useState(null);

    // When the page loads, this will run once.
    useEffect(() => {
        // Create a sub function to complete async/await processes.
        async function fetchCommunityData() {
            try {
                // Add all community records to a record.
                const communities = await findAllCommunityBoundaries();
                // Swap coordinates for Leaflet.
                const communitiesWithSwappedCoords = communities.map(community => ({
                    ...community,
                    boundary: {
                        ...community.boundary,
                        // The nested .map functions allow the navigation down to the smallest element of the array.
                        coordinates: community.boundary.coordinates.map(polygon =>
                            polygon.map(ring =>
                                ring.map(coord => [coord[1], coord[0]]) // Swaps lng,lat to lat,lng
                            )
                        )
                    }
                }))

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
    const minCrime = 0;
    const maxCrime = 10000;

    function getRandomColour(minCrime, maxCrime) {
        return Math.floor(Math.random() * (maxCrime - minCrime) + minCrime);
    }

    const scale = chroma.scale(['#00ff00', '#ffff00', '#ff0000'])
        .domain([minCrime, maxCrime]);

    return communityBoundary.map((community) => {
        const crimeValue =  getRandomColour(minCrime, maxCrime);
        const polygonOptions = {
            color: scale(crimeValue ).hex(),
            fillColor: scale(crimeValue ).hex(),
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
