import { disconnectDb } from "../db.js";
import { createCrimeRecord } from "../models/crimes.js";

// This file exists solely to be called from the Command Line.
// We will likely only use it once or twice in order to create a few records.
// Eventually this will be tied directly to the API that still needs to be built and will be bypassed.

// Only do something if there are more than 7 arguments.
// 0 and 1 are hard coded, the rest are what we want to consume. 
if (process.argv.length < 7) {
    console.log("usage: node createCrimeRecord <community> <category> <crimeCount> <year> <month>");
    process.exit();
}

// Set a variable for each argument coming from the command line.
const community = process.argv[2];
const category = process.argv[3];
const crimeCount = process.argv[4];
const year = process.argv[5];
const month = process.argv[6];

// Log what was entered.
console.log(`Creating: ${community}`);
console.log(`   from category ${category}`)
console.log(`   with count ${crimeCount}`)
console.log(`   in year ${year}`)
console.log(`   in month ${month}`)

// Call the createCrimeRecord function from the models folder with the arguments we retrieved above
// then print it to the log.
const newCrimeRecord = await createCrimeRecord(community, category, crimeCount, year, month);
console.log(`Created ${newCrimeRecord}`);

// Ensure you clean up after yourself.
disconnectDb();
