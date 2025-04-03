import cron from 'node-cron';
import { connectDb, disconnectDb } from '../db.js';
import { findOneAndUpdate } from '../models/crimes.js';

export const importCrimeData = async () => {
    try {
        // Make a connection and fetch the data from the city of Calgary API.
        await connectDb();
        const response = await fetch("https://data.calgary.ca/resource/78gh-n26t.json");
        const crimeData = await response.json();

        //TODO: remove when writing more than 20 records.
        let i = 0;
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
            // TODO: remove- Temporarily writing the new record created.
            // console.log(`Created ${newCrimeRecord}`);
            //TODO: remove- Breaking after writing about 20 records.
            i++;
            if (i > 50) break;
        }

        console.log(`Crime data import completed.`);
        await disconnectDb();
    } catch (error) {
        console.error(`Import failed: ${error}`);
    }
}