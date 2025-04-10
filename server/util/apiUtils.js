import { connectDb, disconnectDb } from '../db.js';

export const getDatasetMetadata = async(resourceUrl) => {
    try {
        // Modify the url to get Views instead of content.
        const datasetId = resourceUrl.split('/').pop().split('.')[0];
        const metadataUrl = `https://data.calgary.ca/api/views/${datasetId}`;

        const response = await fetch(metadataUrl);
        const metadata = await response.json();

        console.log(metadata);

        console.log('Dataset Schema: ');
        metadata.columns.forEach(column => {
            console.log(`${column.name}: ${column.dataTypeName}`);
        });
    } catch (error) {
        console.error(`Error fetching metadata: ${error}`);
    }
}
