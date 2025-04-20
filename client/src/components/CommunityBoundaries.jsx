import { useEffect, useState } from "react";
import { Polygon } from 'react-leaflet';
import chroma from "chroma-js";

function CommunityBoundaries() {
    const [communityBoundary, setCommunityBoundary] = useState([]);
    const [maxCrime, setMaxCrime] = useState(0);
    const [error, setError] = useState(null);

    // Build a reusable function that may be extracted out to convert geojson to be leaflet usable.
    // TODO: Extract the function out as a utility to be used elsewhere.
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

    // When the page loads, this will run once.
    useEffect(() => {
        // Create a sub function to complete async/await processes.
        async function fetchCommunityData() {
            try {
                // Add all community records to a record.
                // TODO: Determine why some communities aren't being matched properly, ie Scarboro/Sunalta.
                // TODO: Extract the crimeSummary call into the front end API.
                const crimeSummary = await fetch('/api/crimeSummary').then(res => res.json());

                // Because crimeSummary is sorted by total crimes with the biggest one first,
                // we can set the maxCrimes amount by referencing the first record.
                if (crimeSummary.length > 0) {
                    setMaxCrime(crimeSummary[0].totalCrimes);
                }

                // Swap coordinates for Leaflet and add crime summaries.
                const communitiesWithSwappedCoords = crimeSummary.map(communityRecord => ({
                    ...communityRecord,
                    boundary: swapGeoJsonCoordinates(communityRecord.boundary)
                }));

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

    // Set the scale of colours that will exist, from green to red with yellow in the middle.
    const scale = chroma.scale(['#00ff00', '#ffff00', '#ff0000'])
        .domain([0, maxCrime]);

    return communityBoundary.map((community) => {
        // Set the polygOptions. The colour is using the Chroma dependency and calculates based on
        // total crimes for a community compared to the community with the most crimes (beltline).
        const polygonOptions = {
            color: scale(community.totalCrimes).hex(),
            fillColor: scale(community.totalCrimes).hex(),
            fillOpacity: 0.3,
            weight: 4
        }    // Draw the Polygon per each community that is returned.
        return (
            <Polygon
                // The key passed needs to be unique and will be the name of the community.
                key={community._id}
                // Add pathOptions as calculated above.
                pathOptions={polygonOptions}
                // The position to draw is nested deep in the coordinates field so needs two layers of array reference.
                positions={community.boundary.coordinates[0][0]}
            />
        );
    });
}

export default CommunityBoundaries;
