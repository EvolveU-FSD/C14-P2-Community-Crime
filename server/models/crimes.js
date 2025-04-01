import { connectDb } from "../db.js";

// Create a mongoose connection from the db file.
// Navigate there for more documentation.
const mongoose = await connectDb();

// Schema
// The Schema is the restrictions placed upon data that is stored in the database.
// In our case right now we will only be taking the exact data coming from the API in the format
// it's already stored in.
const crimeRecordSchema = mongoose.Schema({
    community: String,
    category: String,
    crimeCount: Number,
    year: Number,
    month: Number,
})

// Models
// The model is information that mongoose will use to talk to the Mongo database.
// It will enforce the schema created above and place the information into the 'crimes' collection/table.
const CrimeRecord = mongoose.model('crime', crimeRecordSchema, 'crimes');

// Functions to expose the tables/collection
// Everything below will be exported so that we can actually make use of the model and collection
// that has been outlined above.
// First we make the ability to create a new record by passing all the fields in.
export async function createCrimeRecord(community, category, crimeCount, year, month) {
    // Use the CrimeRecord model from above to add a new record to the database.
    // The create keyword is part of the mongoose connection. 
    const newCrime = await CrimeRecord.create({
        community, 
        category, 
        crimeCount,
        year,
        month,
    })

    return newCrime;
}

// Use the CrimeRecord model to find all records in the collection/table. 
// In this case the model is built on the "crimes" collection. 
export async function findAllCrimeRecords() {
    const crimes = await CrimeRecord.find();
    return crimes;
}

// So far we aren't using this. It's the same as the function above however but it gets a single crime
// based on the object ID. There's a good chance we'll never have to use this function in our environment.
export async function findCrimeById(id) {
    const crime = await CrimeRecord.findCrimeById(id);
    return crime;
}
