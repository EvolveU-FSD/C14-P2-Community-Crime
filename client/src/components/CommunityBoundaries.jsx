import { useEffect, useState } from "react";
import { useFilters } from "../context/FilterContext";
import { Polygon, Popup } from 'react-leaflet';
import chroma from "chroma-js";
import BoundsControl from "./BoundsControl";
import CrimeColourLegend from "./CrimeColourLegend";

export default function CommunityBoundaries() {
    const { filters } = useFilters();
    const [communityBoundary, setCommunityBoundary] = useState([]);
    const [maxCrime, setMaxCrime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

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
    // TODO: Split the useEffect to load once per filter type change (ie, once on filter.communities and once on filter.crimeCategory)
    useEffect(() => {
        // Create a sub function to complete async/await processes.
        async function fetchFilteredCommunityData() {
            setIsLoading(true);
            try {
                // Add all community records to a record.
                // TODO: Determine why some communities aren't being matched properly, ie Scarboro/Sunalta.
                // TODO: Extract the crimeSummary call into the front end API.
                const crimeSummary = await fetch('/api/crimeSummary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(filters)
                }).then(res => res.json());

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
            } finally {
                setIsLoading(false);
            }
        }

        // Run the function outlined above.
        fetchFilteredCommunityData();
    }, [filters])

    // Set the scale of colours that will exist, from green to red with yellow in the middle.
    const scale = chroma.scale(['#00ff00', '#ffff00', '#ff0000'])
        .domain([0, maxCrime]);

    return (
        <>
            <BoundsControl
                isLoading={isLoading}
                hasBoundaries={communityBoundary.length > 0}
            >
                {communityBoundary.map((community) => {
                    // Set the polygon Options. The colour is using the Chroma dependency and calculates based on
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
                        >
                            <Popup>
                                Community: {community._id} <br />
                                Total Crimes: {community.totalCrimes}
                            </Popup>
                        </Polygon>
                    );
                })};
            </BoundsControl>

            <CrimeColourLegend scale={scale} maxCrime={maxCrime} />
        </>
    )
}
