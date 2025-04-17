import { useEffect, useState } from "react";
import { Polygon } from 'react-leaflet';
import { findAllCommunityBoundaries } from "../api";

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

    // Set a universal options variable for now. This will be adjusted once we get to filtering.
    const polygonOptions = {
        color: 'blue',
        fillColor: 'lightblue',
        fillOpacity: 0.4,
        weight: 2
    };

    return communityBoundary.map((community) => (
        // Draw the Polygon per each community that is returned.
        <Polygon
            key={community._id}
            pathOptions={polygonOptions}
            positions={community.boundary.coordinates[0][0]}
        />
    ));
}

export default CommunityBoundaries;
