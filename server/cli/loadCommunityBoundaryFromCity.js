import { disconnectDb } from "../db.js"
import { createCommunityBoundary,  findCommunityBoundaryByCommCode} from "../models/communityBoundary.js"

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
        console.log('Creating', comm_code, 'of', name)
        await createCommunityBoundary(comm_code, name, multipolygon)
    }
}

await disconnectDb()
