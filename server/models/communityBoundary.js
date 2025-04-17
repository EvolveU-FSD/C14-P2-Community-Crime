import { connectDb } from "../db.js";

// Create a mongoose connection from the db file.
const mongoose = await connectDb();

// Schema
const communityBoundarySchema = mongoose.Schema({
    commCode: String,
    name: String,
    sector: String,
    // multiPolygon: multiPolygon,
    boundary: {
        type: {
            type: String,
            enum: ['MultiPolygon'],
            required: true
        },
        coordinates: {
            type: [[[[Number]]]],
            required: true
        }
    },
    createdDate: Date,
    modifiedDate: Date
})

communityBoundarySchema.index({ boundary: '2dsphere' });

// Models
const CommunityBoundary = mongoose.model('communityBoundary', communityBoundarySchema, 'communityBoundaries');

// Functions to expose the tables/collection
// Create a new record.
export async function createCommunityBoundary(
        commCode,
        name,
        sector,
        boundary,
        createdDate,
        modifiedDate
    ) {
    const newCommunityBoundary = await CommunityBoundary.create({
        commCode,
        name,
        sector,
        boundary,
        createdDate,
        modifiedDate
    })
    return newCommunityBoundary
}

// Find one and update.
export async function communityFindOneAndUpdate(code, name, sector, multiPolygon, createdDate, modifiedDate) {
    try {
        const filter = {
            code: code,
            name: name,
            sector: sector,
            createdDate: createdDate,
        }

        const update = {
            boundary: {
                type: 'MultiPolygon',
                coordinates: multiPolygon
            },
            modifiedDate: modifiedDate
        }

        const options = {
            upsert: true,
            new: true
        }

        const newBoundary = await CommunityBoundary.findOneAndUpdate(filter, update, options);
        return newBoundary;
    } catch (error) {
        console.error(`Error in findOneAndUpdate: ${error}`);
        throw error;
    }
}

export async function findCommunityBoundaryByCommCode(commCode) {
    console.log(`In communityBoundary model with var ${commCode}`)
    const communityBoundary = await CommunityBoundary.findOne({ commCode: commCode })
    console.log(`In the communityBoundary with result: ${communityBoundary}`)
    return communityBoundary
}

// Delete a record (not called from the app).

// Export all records.
export async function findAllCommunityBoundaries() {
    const communityBoundaries = await CommunityBoundary.find({});
    return communityBoundaries;
}

// Find a single record based on id.
// TODO: consider searching by community instead of id.
export async function findCommunityBoundaryById(id) {
    const communityBoundary = await CommunityBoundary.findCommunityBoundaryById(id);
    return communityBoundary;
}
