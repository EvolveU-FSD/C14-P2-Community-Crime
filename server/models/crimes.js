import { connectDb } from "../db.js";

const mongoose = await connectDb();

// Schema
const crimeRecordSchema = mongoose.Schema({
    community: String,
    category: String,
    crimeCount: Number,
    year: Number,
    month: Number,
})

// Models
const CrimeRecord = mongoose.model('crime', crimeRecordSchema, 'crimes');

// Functions to expose the tables
export async function createCrimeRecord(community, category, crimeCount, year, month) {
    const newCrime = await CrimeRecord.create({
        community, 
        category, 
        crimeCount,
        year,
        month,
    })
}

export async function findAllCrimeRecords() {
    const crimes = await CrimeRecord.find();
    return crimes;
}

export async function findCrimeById(id) {
    const crime = await CrimeRecord.findCrimeById(id);
    return crime;
}
