import { connectDb } from "../db.js";

const mongoose = await connectDb();

const communityBoundarySchema = mongoose.Schema({
    commCode: String,
    name: String,
    sector: String,
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
});

communityBoundarySchema.index({ boundary: '2dsphere' });

const CommunityBoundary = mongoose.model('communityBoundary', communityBoundarySchema, 'communityBoundaries');

// Create a new record
export async function createCommunityBoundary(
    commCode,
    name,
    sector,
    boundary,
    createdDate,
    modifiedDate
) {
    try {
        const newCommunityBoundary = await CommunityBoundary.create({
            commCode,
            name,
            sector,
            boundary,
            createdDate,
            modifiedDate
        });
        return newCommunityBoundary;
    } catch (error) {
        console.error(`Error in createCommunityBoundary: ${error}`);
        throw error;
    }
}

// Update or insert a record
export async function communityFindOneAndUpdate(code, name, sector, multiPolygon, createdDate, modifiedDate) {
    try {
        const filter = {
            code: code,
            name: name,
            sector: sector,
            createdDate: createdDate,
        };

        const update = {
            boundary: {
                type: 'MultiPolygon',
                coordinates: multiPolygon
            },
            modifiedDate: modifiedDate
        };

        const options = {
            upsert: true,
            new: true
        };

        const newBoundary = await CommunityBoundary.findOneAndUpdate(filter, update, options);
        return newBoundary;
    } catch (error) {
        console.error(`Error in communityFindOneAndUpdate: ${error}`);
        throw error;
    }
}

// Find a community boundary by commCode
export async function findCommunityBoundaryByCommCode(commCode) {
    try {
        const communityBoundary = await CommunityBoundary.findOne({ commCode: commCode });
        return communityBoundary;
    } catch (error) {
        console.error(`Error in findCommunityBoundaryByCommCode: ${error}`);
        throw error;
    }
}

// Get all community boundaries
export async function findAllCommunityBoundaries() {
    try {
        const communityBoundaries = await CommunityBoundary.find({});
        return communityBoundaries;
    } catch (error) {
        console.error(`Error in findAllCommunityBoundaries: ${error}`);
        throw error;
    }
}

// Find by ID
export async function findCommunityBoundaryById(id) {
    try {
        const communityBoundary = await CommunityBoundary.findById(id);
        return communityBoundary;
    } catch (error) {
        console.error(`Error in findCommunityBoundaryById: ${error}`);
        throw error;
    }
}
