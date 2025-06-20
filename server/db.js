import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

let defaultURI = 'mongodb://localhost:27017/c14-P2-Crimes';

// Set a URL path for the database. This will later be updated to point to Atlas when setup.
// TODO- Create a linear task to create the Atlas DB.
const mongo_uri = process.env.MONGO_URI || defaultURI;

if (mongo_uri === defaultURI) {
    console.log(`***NOTE***, .env server is not working or not set up. Using default localhost Mongo connection.`);
} else {
    console.log(`Connected to dotenv server connection.`)
}

let connectionPromise = null

// Export a function that will be used to create a connection to the database listed above.
// This will return as an object which referrs to that connection.
export async function connectDb() {
    // If one doesn't already exist, create a connection.
    if (!connectionPromise) {
        console.log('Connecting to MongoDB...');
        connectionPromise = mongoose.connect(mongo_uri);
    }
    // Wait until it has been created, then return the connection object.
    return await connectionPromise;
}

// Exports a function that can be used to close the connection created above.
// This is needed to clean up after yourself. Stop making a mess.
export async function disconnectDb() {
    // If there is a connection, close it.
    if (connectionPromise) {
        const mongoose = await connectionPromise;
        // Wait until the close command has executed before leaving.
        await mongoose.connection.close();
        connectionPromise = null;
    }
}
