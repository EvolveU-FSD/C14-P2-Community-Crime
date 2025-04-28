import { connectDb } from "../db.js";

const mongoose = await connectDb();

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
