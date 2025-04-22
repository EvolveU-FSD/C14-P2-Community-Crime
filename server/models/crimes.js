// Create a mongoose connection from the db file.
const mongoose = await connectDb();

// Schema
const crimeRecordSchema = mongoose.Schema({
    community: String,
    category: String,
    crimeCount: Number,
    year: Number,
    month: Number,
});

// Models
export const CrimeRecord = mongoose.model('crime', crimeRecordSchema, 'crimeData');

// Functions to expose the tables/collection

export async function createCrimeRecord(community, category, crimeCount, year, month) {
    try {
        const newCrime = await CrimeRecord.create({
            community,
            category,
            crimeCount,
            year,
            month,
        });
        return newCrime;
    } catch (error) {
        console.error(`Error in createCrimeRecord: ${error}`);
        throw error;
    }
}

export async function findOneAndUpdate(community, category, crimeCount, year, month) {
    try {
        const filter = { community, category, year, month };
        const update = { ...filter, crimeCount };
        const options = { upsert: true, new: true };

        const newCrime = await CrimeRecord.findOneAndUpdate(filter, update, options);
        return newCrime;
    } catch (error) {
        console.error(`Error in findOneAndUpdate: ${error}`);
        throw error;
    }
}

export async function findAllCrimeRecords() {
    try {
        const crimes = await CrimeRecord.find();
        return crimes;
    } catch (error) {
        console.error(`Error in findAllCrimeRecords: ${error}`);
        throw error;
    }
}

export async function findCrimeById(id) {
    try {
        const crime = await CrimeRecord.findById(id);
        return crime;
    } catch (error) {
        console.error(`Error in findCrimeById: ${error}`);
        throw error;
    }
}

export async function getCrimeTypeList() {
    try {
        const crimeTypeList = await CrimeRecord.distinct('category');
        return crimeTypeList;
    } catch (error) {
        console.error(`Error in getCrimeTypeList: ${error}`);
        throw error;
    }
}
