import { connectDb } from "../db";

const mongoose = await connectDb();

// TODO- Schema
const crimeRecordSchema = mongoose.Schema({
    community: String,
    category: String,
    crimeCount: Number,
    year: Number,
    month: Number,
})

// TODO- Models
const CrimeRecord = mongoose.model('crime', crimeRecordSchema, 'crimes');

// TODO- Functions to expose the tables
export async function createCrime(community, category, crimeCount, year, month) {
    const newCrime = await CrimeRecord.create({
        community, 
        category, 
        crimeCount,
        year,
        month,
    })
}

export async function findAllCrimes() {
    const crimes = await CrimeRecord.find();
    return crimes;
}

export async function findCrimeById(id) {
    const crime = await CrimeRecord.findCrimeById(id);
    return crime;
}
