import cron from 'node-cron';
import { connectDb, disconnectDb } from '../db.js';
import { findOneAndUpdate } from '../models/crimes.js';
import { communityFindOneAndUpdate  } from '../models/communities.js';
import { getDatasetMetadata } from '../util/apiUtils.js';

// TODO: Change the type of import to pull in all records from the API at once.
// Based on documentation here: https://support.socrata.com/hc/en-us/articles/202949268-How-to-query-more-than-1000-rows-of-a-dataset
const BATCH_SIZE = 1000; // Max records that can be imported at a time.
const BASE_CRIME_URL = "https://data.calgary.ca/resource/78gh-n26t.json";
// const BASE_CRIME_URL = "https://data.calgarypolice.ca/api/v2/datasets/crime-statistics";
const BASE_COMMUNITY_BOUNDARY_URL = "https://data.calgary.ca/resource/surr-xmvs.json";

const importCrimeData = async () => {
    const startTime = new Date();
    console.log(`Starting crime data import at: ${startTime.toISOString()}`);

    try {
        // Make a connection and fetch the data from the city of Calgary API.
        await connectDb();
        let offset = 0;
        let totalRecords = 0;
        let hasMoreRecords = true;

        // Only used for building purposes to get information about the API.
        // TODO: Check the metadata against what we expect to validate the columns haven't changed.

        // This is a testing line to get the metadata information from the URL. Currently not needed in prod.
        // getDatasetMetadata(BASE_CRIME_URL);

        while (hasMoreRecords) {
            // Build the URL based on the base location you will get data, and how many pages have been 
            // retrieved to this point of data. Each time you will get more.
            const url = `${BASE_CRIME_URL}?$limit=${BATCH_SIZE}&$offset=${offset}`;
            console.log(`Fetching records from offset ${offset}`);

            const response = await fetch(url);
            const crimeData = await response.json();

            // Check if you received any records from the current offset. 
            // If there are none then change the flag and get out of the while loop.
            if (crimeData.length === 0) {
                hasMoreRecords = false;
                continue;
            }
            // Process and save each crime.
            for (const crimeRecord of crimeData) {
                // Send a request to Crimes to create a new record for each coming from the API.
                const newCrimeRecord = await findOneAndUpdate(
                crimeRecord.community,
                crimeRecord.category,
                crimeRecord.crime_count,
                crimeRecord.year,
                crimeRecord.month 
                )
                totalRecords++;
            }

            console.log(`Processed ${crimeData.length} records. Total records: ${totalRecords}`);
            offset += BATCH_SIZE;
        }

        // Write a log on the server every time the process runs. It will calculate how long it ran for and outline how many records it processed.
        const endTime = new Date();
        const durationInSeconds = (endTime - startTime) / 1000; //Converted to seconds.

        // Convert duration to HH:MM:SS format.
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Log the summary of the entire execution.
        console.log(`Crime data import completed at: ${endTime.toISOString()}`);
        console.log(`Total duration: ${formattedDuration}`);
        console.log(`Crime data import completed. Total records: ${totalRecords}`);
        await disconnectDb();
    } catch (error) {
        const errorTime = new Date();
        const durationInSeconds = (startTime - errorTime) / 1000; //Converted to seconds.

        // Convert duration to HH:MM:SS format.
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        console.error(`Import failed at ${errorTime.toISOString()} after ${formattedDuration}`);
        console.error(`Error details: ${error}`);
        await disconnectDb();
    }
}

// The importCommunityBoundaryData process is largely the same as the one for crime. To understand how it works, refer to importCrimeData please.
// TODO: It is worth considering if these functions can be combined and executed based on parameters if time permits.
// If not, they should be split out to their own files.
const importCommunityBoundaryData = async () => {
    const startTime = new Date();
    console.log(`Starting crime data import at: ${startTime.toISOString()}`);

    try {
        await connectDb();
        let offset = 0;
        let totalRecords = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
            const url = `${BASE_COMMUNITY_BOUNDARY_URL}?$limit=${BATCH_SIZE}&$offset=${offset}`;
            console.log(`Fetching records from offset ${offset}`);

            // Only used for building purposes to get information about the API.
            // TODO: Check the metadata against what we expect to validate the columns haven't changed.
            // getDatasetMetadata(BASE_COMMUNITY_BOUNDARY_URL);

            const response = await fetch(url);
            const boundaryData = await response.json();

            if (boundaryData.length === 0) {
                hasMoreRecords = false;
                continue;
            }

            for (const boundaryRecord of boundaryData) {
                const newBoundaryRecord = await communityFindOneAndUpdate (
                    boundaryRecord.comm_code,
                    boundaryRecord.name,
                    boundaryRecord.sector,
                    boundaryRecord.multipolygon,
                    boundaryRecord.created_dt,
                    boundaryRecord.modified_dt
                )
                totalRecords++;
            }

            console.log(`Processed ${boundaryData.length} records. Total records: ${totalRecords}`);
            offset += BATCH_SIZE;
        }

        const endTime = new Date();
        const durationInSeconds = (endTime - startTime) / 1000;
        
        // Convert duration to HH:MM:SS format.
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Log the summary of the entire execution.
        console.log(`Crime data import completed at: ${endTime.toISOString()}`);
        console.log(`Total duration: ${formattedDuration}`);
        console.log(`Crime data import completed. Total records: ${totalRecords}`);
        await disconnectDb();
    } catch (error) {
        const errorTime = new Date();
        const durationInSeconds = (startTime - errorTime) / 1000; //Converted to seconds.

        // Convert duration to HH:MM:SS format.
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        console.error(`Import failed at ${errorTime.toISOString()} after ${formattedDuration}`);
        console.error(`Error details: ${error}`);
        await disconnectDb();
    }
}

// Schedule a task to run at 2am every day.
export const initializeCronJob = () => {
    cron.schedule('0 2 * * *', () =>{
        importCrimeData();
        importCommunityBoundaryData();
    });
    console.log(`Crime data import scheduled for 2AM daily.`);
}