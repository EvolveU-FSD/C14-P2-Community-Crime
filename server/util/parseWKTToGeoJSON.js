import wellknown from 'wellknown';

export const parseWKTToGeoJSON = (wkt) => {
    try {
        if (!wkt) {
            throw new Error ('WKT string is required.');
        }

        // Parse WKT string to geoJSON
        const geojson = wellknown.parse(wkt);

        if (!geojson) {
            throw new Error('Failed to parse WKT');
        }

        console.log('Parsed GeoJSON: ', JSON.stringify(geojson, null, 2));
        return geojson;
    } catch (error) {
        console.error(`Error parsing WKT to GeoJSON: ${error}`);
        throw error;
    }
}
