import { connectDb } from "../db.js";

// Create a mongoose connection from the db file.
const mongoose = await connectDb();

// Schema
const communityBoundarySchema = mongoose.Schema({
    code: String,
    name: String,
    sector: String,
    multiPolygon: String,
    createdDate: Date,
    modifiedDate: Date
})

// Models
const CommunityBoundaryRecord = mongoose.model('communityBoundary', communityBoundarySchema, 'communityBoundaries');

// Functions to expose the tables/collection
// Create a new record.

// Find one and update.
export async function findOneAndUpdate(code, name, sector, multiPolygon, createdDate, modifiedDate) {
    try {
        const filter = {
            code: code,
            name: name,
            sector: sector,
            createdDate: createdDate,
        }

        const update = {
            multiPolygon: multiPolygon,
            modifiedDate: modifiedDate
        }

        const options = {
            upsert: true,
            new: true
        }

        const newBoundary = await CommunityBoundaryRecord.findOneAndUpdate(filter, update, options);
        return newBoundary;
    } catch (error) {
        console.error(`Error in findOneAndUpdate: ${error}`);
        throw error;
    }
}

// Delete a record (not called from the app).

// Export all records.
export async function findAllCommunityBoundaries() {
    const communityBoundaries = await CommunityBoundaryRecord.find();
    return communityBoundaries;
}

// Find a single record based on id.
// TODO: consider searching by community instead of id.
export async function findCommunityBoundaryById(id) {
    const communityBoundary = await CommunityBoundaryRecord.findCommunityBoundaryById(id);
    return communityBoundary;
}
