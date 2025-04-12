import { connectDb } from "../db.js";
import { CrimeRecord } from "./crimes.js";

const mongoose = await connectDb();

// We want to by default display all our cimes as a total on the main map.
// This function will group all of the results first by community, summarize them,
// then will summarize them by crime.
export async function getCrimesByCommunity() {
    try {
        const crimeSummary = await CrimeRecord.aggregate([
            {
                // Within Mongoose create a group variable. The key is the community field and will then crime by that value.
                $group: {
                    _id: "$community",
                    totalCrimes: { $sum: "$crimeCount" },
                    crimesByCategory: {
                        // In addition to the original grouping, a second grouping exists to also split by crime.
                        $push: {
                            category: "$category",
                            count: "$crimeCount"
                        }
                    }
                }
            },
            {
                // sorting by totalCrimes -1 is descending order.
                $sort: { totalCrimes: -1 }
            }
        ]);
        return crimeSummary;
    } catch (error) {
        console.error(`Error in getCrimesByCommunity: ${error}`);
        throw error;
    }
}

// Similar to the function above, this one instead gets information just for one community
// that is passed in and gets the summary. This will be good for individual information pages and stats.
export async function getCrimesByCategoryAndCommunity(community) {
    try {
        const crimeSummary = CrimeRecord.aggregate([
            {
                $match: { community: community }
            },
            {
                $group: {
                    _id: "$category",
                    totalCrimes: { $sum: "$crimeCount" }
                }
            },
            {
                // Again sort in decending order.
                $sort: { totalCrimes: -1 }
            }
        ]);
        return crimeSummary;
    } catch (error) {
        console.error(`Error in getCrimesByCategoryAndCommunity: ${error}`);
        throw error;
    }
}

// Get a summary of crimes by year as an option in the breakdown.
// Should be useful for graphing in the front end to see trends.
export async function getCrimesByCommunityAndYear() {
    try {
        const crimeSummary = await CrimeRecord.aggregate([
            {
                $group: {
                    _id: {
                        community: "$community",
                        year: "$year",
                    },
                    totalCrimes: { $sum: "$crimeCount" }
                }
            },
            {
                $sort: { 
                    "_id.community": -1,
                    "_id.year": -1,
                    "totalCrimes": -1
                }
            }

        ]);
        return crimeSummary;
    } catch (error) {
        console.error(`Error in getCrimesByCommunityAndYear: ${error}`);
        throw error;
    }
}