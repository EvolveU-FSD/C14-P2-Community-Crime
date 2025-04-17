import { disconnectDb } from "../db.js"
import { createCommunityBoundary,  findCommunityBoundaryByCommCode} from "../models/communityBoundary.js"
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly when using ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log(path.resolve(__dirname, '../.env'));
console.log(process.env.MONGO_URI)

const response = await fetch('https://data.calgary.ca/resource/surr-xmvs.json')
if (!response.ok) {
    console.log('Problem getting data from the city', response)
    process.exit()
}

const communityBoundaries = await response.json()
for (const community of communityBoundaries) {
    const {comm_code, name, multipolygon} = community

    const existingCommunityBoundary = await findCommunityBoundaryByCommCode(comm_code) 
    if (existingCommunityBoundary) {
        console.log('Updating',comm_code)
        existingCommunityBoundary.name = name
        existingCommunityBoundary.boundary = multipolygon
        await existingCommunityBoundary.save()
    }
    else {
        // console.log('Creating', comm_code, 'of', name)
        await createCommunityBoundary(comm_code, name, multipolygon)
    }
}

await disconnectDb()
