import { disconnectDb } from "../db.js";
import { createCrimeRecord } from "../models/crimes.js";

if (process.argv.length < 7) {
    console.log("usage: node createCrimeRecord <community> <category> <crimeCount> <year> <month>");
    process.exit();
}
const community = process.argv[2];
const category = process.argv[3];
const crimeCount = process.argv[4];
const year = process.argv[5];
const month = process.argv[6];

console.log(`Creating: ${community}`);
console.log(`   from category ${category}`)
console.log(`   with count ${crimeCount}`)
console.log(`   in year ${year}`)
console.log(`   in month ${month}`)

const newCrimeRecord = await createCrimeRecord(community, category, crimeCount, year, month);
console.log(`Created ${newCrimeRecord}`);

disconnectDb();
