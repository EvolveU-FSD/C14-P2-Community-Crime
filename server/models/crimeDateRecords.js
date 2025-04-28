import { connectDb } from "../db.js";

const mongoose = await connectDb();

// Schema
const crimeDateRecordsSchema = mongoose.Schema({
    year: Number,
    month: Number,
})

// Models
export const CrimeDateRecord = mongoose.model('crimeDate', crimeDateRecordsSchema, 'crimeDate');

export async function createCrimeDateRecord(year, month) {
    return await CrimeDateRecord.create({
        year,
        month,
    })
}

export async function findCrimeDateRecordByValues(year, month) {
    return await CrimeDateRecord.findOne({ year: year, month: month })
}
