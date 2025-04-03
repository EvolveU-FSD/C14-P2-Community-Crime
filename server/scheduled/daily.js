import cron from 'node-cron';
import { connectDb, disconnectDb } from '../db.js';
import { findOneAndUpdate } from '../models/crimes.js';

export const importCrimeData = async () => {
    try {
        // Make a connection and fetch the data from the city of Calgary API.
        await connectDb();
        const response = await fetch("https://data.calgary.ca/resource/78gh-n26t.json");
        const crimeData = await response.json();

        let i = 0;
        // Process and save each crime.
        for (const crimeRecord of crimeData) {
            // console.log(crimeRecord);
            const newCrimeRecord = await findOneAndUpdate(
               crimeRecord.community,
               crimeRecord.category,
               crimeRecord.crime_count,
               crimeRecord.year,
               crimeRecord.month 
            )
            console.log(`Created ${newCrimeRecord}`);
            i++;
            if (i > 20) break;
        }

        console.log(`Crime data import completed.`);
        await disconnectDb();
    } catch (error) {
        console.error(`Import failed: ${error}`);
    }
}