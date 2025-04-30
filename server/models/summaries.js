import { connectDb } from "../db.js";
import { CrimeRecord } from "./crimes.js";

const mongoose = await connectDb();

// We want to by default display all our cimes as a total on the main map.
// This function will group all of the results first by community, summarize them,
// then will summarize them by crime.
export async function getCrimesByCommunity(filters) {
    const { communitiesListFilter, crimeListFilter, dateRangeFilter } = filters || {};

    const matchCondition = {};
    
    // Add community filter
    if (communitiesListFilter?.length > 0) {
        matchCondition.community = { $in: communitiesListFilter.map(c => c.label) };
    }

    // Add crime filter
    if (crimeListFilter?.length > 0) {
        matchCondition.category = { $in: crimeListFilter.map(c => c.value) };
    }
    
    // Add date range filter
    if (dateRangeFilter?.startYear) {
        // Create date conditions
        const dateConditions = [];
        
        // Start date condition
        if (dateRangeFilter.startMonth) {
            // Both year and month specified
            dateConditions.push({
                $or: [
                    { year: { $gt: dateRangeFilter.startYear.value } },
                    {
                        year: dateRangeFilter.startYear.value,
                        month: { $gte: dateRangeFilter.startMonth.value }
                    }
                ]
            });
        } else {
            // Only year specified
            dateConditions.push({ year: { $gte: dateRangeFilter.startYear.value } });
        }
        
        // End date condition
        if (dateRangeFilter.endYear) {
            if (dateRangeFilter.endMonth) {
                // Both year and month specified
                dateConditions.push({
                    $or: [
                        { year: { $lt: dateRangeFilter.endYear.value } },
                        {
                            year: dateRangeFilter.endYear.value,
                            month: { $lte: dateRangeFilter.endMonth.value }
                        }
                    ]
                });
            } else {
                // Only year specified
                dateConditions.push({ year: { $lte: dateRangeFilter.endYear.value } });
            }
        }
        
        // Add date conditions to main match
        if (dateConditions.length > 0) {
            matchCondition.$and = dateConditions;
        }
    }

    try {
        const crimeSummary = await CrimeRecord.aggregate([
            // Only add match if conditions exist
            ...(Object.keys(matchCondition).length > 0 ? [{
                $match: matchCondition
            }] : []),
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
                // Add a lookup to join with community boundaries
                $lookup: {
                    from: "communityBoundaries",
                    let: { communityName: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$commCode", "$$communityName"]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                sector: 1,
                                commCode: 1,
                                boundary: 1
                            }
                        }
                    ],
                    as: "communityInfo"
                }
            },
            {
                // Unwind the array from the lookup.
                $unwind: "$communityInfo"
                // $unwind: {
                //     path: "$communityInfo",
                //     preserveNullAndEmptyArrays: true
                // }
            },
            {
                // Shape the output.
                $project: {
                    _id: 1,
                    totalCrimes: 1,
                    crimesByCategory: 1,
                    sector: "$communityInfo.sector",
                    commCode: "$communityInfo.commCode",
                    boundary: "$communityInfo.boundary"
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