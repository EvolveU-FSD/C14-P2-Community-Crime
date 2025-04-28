import { connectDb } from '../db.js';
const mongoose = await connectDb();

const crimeRecordSchema = mongoose.Schema({
    community: String,
    category: String,
    crimeCount: Number,
    year: Number,
    month: Number,
});

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

const crimeDateRecordsSchema = mongoose.Schema({
    year: Number,
    month: Number,
})