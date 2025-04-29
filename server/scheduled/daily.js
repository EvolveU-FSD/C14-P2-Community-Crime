import cron from 'node-cron';
import { connectDb, disconnectDb } from '../db.js';
import { findOneAndUpdate } from '../models/crimes.js';
import { communityFindOneAndUpdate, createCommunityBoundary, findCommunityBoundaryByCommCode  } from '../models/communityBoundary.js';
import { getDatasetMetadata } from '../util/apiUtils.js';
import { createCrimeDateRecord, findCrimeDateRecordByValues } from '../models/crimeDateRecords.js';

// TODO: Change the type of import to pull in all records from the API at once.
// Based on documentation here: https://support.socrata.com/hc/en-us/articles/202949268-How-to-query-more-than-1000-rows-of-a-dataset
const BATCH_SIZE = 1000; // Max records that can be imported at a time.
const BASE_CRIME_URL = "https://data.calgary.ca/resource/78gh-n26t.json";
const BASE_DISTURBANCE_URL = "https://data.calgary.ca/resource/h3h6-kgme.json";
const BASE_COMMUNITY_BOUNDARY_URL = "https://data.calgary.ca/resource/surr-xmvs.json";

/**
 * Generic data import function that can work with either crime data URL
 * @param {string} baseUrl - The base URL to fetch data from
 * @param {string} dataType - The type of data being imported (for logging)
 */
export const importData = async (baseUrl, dataType = "Crime") => {
    const startTime = new Date();
    console.log(`Starting ${dataType} data import at: ${startTime.toISOString()}`);

    try {
        // Make a connection and fetch the data from the API
        await connectDb();
        let offset = 0;
        let totalRecords = 0;
        let hasMoreRecords = true;

        while (hasMoreRecords) {
            // Build the URL with pagination parameters
            const url = `${baseUrl}?$limit=${BATCH_SIZE}&$offset=${offset}`;
            console.log(`Fetching ${dataType} records from offset ${offset}`);

            const response = await fetch(url);
            const data = await response.json();

            // Check if we've reached the end of available records
            if (data.length === 0) {
                hasMoreRecords = false;
                continue;
            }

            // Process each record based on data type
            if (dataType.toLowerCase() === "crime") {
                await processCrimeRecords(data, "crime"); // Fixed: Pass the string, not the function
            } else if (dataType.toLowerCase() === "disturbance") {
                await processCrimeRecords(data, "disturbance"); // Fixed: Pass the string, not the function
            } else if (dataType.toLowerCase() === "community boundary") {
                await processCommunityRecords(data, totalRecords);
            }

            totalRecords += data.length;
            console.log(`Processed ${data.length} ${dataType} records. Total records: ${totalRecords}`);
            offset += BATCH_SIZE;
        }

        // Log summary of the execution
        logExecutionSummary(startTime, totalRecords, dataType);
        await disconnectDb();
    } catch (error) {
        logExecutionError(startTime, error, dataType);
        await disconnectDb();
    }
};

/**
 * Process crime records by finding existing records and updating them or creating new ones
 * @param {Array} crimeData - Array of crime records to process
 * @param {number} currentCount - Current count of processed records
 */
async function processCrimeRecords(crimeData, importType) {
    for (const crimeRecord of crimeData) {
        const importCount = importType && importType.toLowerCase() === "crime"
            ? crimeRecord.crime_count
            : crimeRecord.event_count;
            
        const {
            community,
            category,
            year,
            month
        } = crimeRecord;

        // Find if record exists and update it, or create a new one
        await findOneAndUpdate(
            community,
            category,
            importCount,
            year,
            month
        );

        // Update date range record if needed
        await loadCrimeDateRecord(year, month);
    }
}

/**
 * Process community boundary records
 * @param {Array} boundaryData - Array of community boundary records
 * @param {number} currentCount - Current count of processed records
 */
async function processCommunityRecords(boundaryData, currentCount) {
    for (const boundaryRecord of boundaryData) {
        const {
            comm_code,
            name,
            sector,
            multipolygon,
            created_dt,
            modified_dt
        } = boundaryRecord;

        const existingCommunityBoundary = await findCommunityBoundaryByCommCode(comm_code);
        if (existingCommunityBoundary) {
            console.log(`Updating ${comm_code}`);
            existingCommunityBoundary.name = name || existingCommunityBoundary.name;
            existingCommunityBoundary.sector = sector || existingCommunityBoundary.sector;
            existingCommunityBoundary.boundary = multipolygon || existingCommunityBoundary.boundary;
            existingCommunityBoundary.modifiedDate = modified_dt || existingCommunityBoundary.modifiedDate;
            await existingCommunityBoundary.save();
        } else {
            console.log(`Creating ${comm_code} with name ${name}`);
            await createCommunityBoundary(
                comm_code,
                name,
                sector,
                multipolygon,
                created_dt,
                modified_dt
            );
        }
    }
}

/**
 * Helper function to format execution duration
 * @param {Date} startTime - Start time of the execution
 * @returns {string} Formatted duration string (HH:MM:SS)
 */
function formatDuration(startTime) {
    const currentTime = new Date();
    const durationInSeconds = (currentTime - startTime) / 1000;
    
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Log successful execution summary
 * @param {Date} startTime - Start time of the execution
 * @param {number} totalRecords - Total records processed
 * @param {string} dataType - Type of data processed
 */
function logExecutionSummary(startTime, totalRecords, dataType) {
    const endTime = new Date();
    const formattedDuration = formatDuration(startTime);
    
    console.log(`${dataType} data import completed at: ${endTime.toISOString()}`);
    console.log(`Total duration: ${formattedDuration}`);
    console.log(`${dataType} data import completed. Total records: ${totalRecords}`);
}

/**
 * Log execution error
 * @param {Date} startTime - Start time of the execution
 * @param {Error} error - Error that occurred
 * @param {string} dataType - Type of data being processed
 */
function logExecutionError(startTime, error, dataType) {
    const errorTime = new Date();
    const formattedDuration = formatDuration(startTime);
    
    console.error(`${dataType} import failed at ${errorTime.toISOString()} after ${formattedDuration}`);
    console.error(`Error details: ${error}`);
}

/**
 * Specific function to import crime data
 */
export const importCrimeData = async () => {
    await importData(BASE_CRIME_URL, "Crime");
};

/**
 * Specific function to import disorder/disturbance data.
 */
export const importDisturbanceData = async () => {
    await importData(BASE_DISTURBANCE_URL, "Disturbance");
};

/**
 * Specific function to import community boundary data
 */
export const importCommunityBoundaryData = async () => {
    await importData(BASE_COMMUNITY_BOUNDARY_URL, "Community Boundary");
};

// When importing the crime data, check if the month and date of the current crime exists in the date range collection.
async function loadCrimeDateRecord(crimeYear, crimeMonth) {
    const existingCrimeDateRecord = await findCrimeDateRecordByValues(crimeYear, crimeMonth);
    if (!existingCrimeDateRecord) {
        await createCrimeDateRecord(crimeYear, crimeMonth);
    }
}

// Schedule a task to run at 2am on the 6th day of each month
export const initializeCronJob = () => {
    cron.schedule('0 2 6 * *', () => {
        importCrimeData();
        importDisturbanceData();
        importCommunityBoundaryData();
    });
    console.log(`Data imports scheduled for 2AM on the 6th of each month.`);
};