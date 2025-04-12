import { connectDb } from "../db.js";
import { CrimeRecord } from "./crimes.js";

const mongoose = await connectDb();

export async function getCrimesByCommunity() {
    try {
        const crimeSummary = await CrimeRecord.aggregate([
            {
                $group: {
                    _id: "$community",
                    totalCrimes: { $sum: "$crimeCount"},
                    crimesByCategory: {
                        $push: {
                            category: "$category",
                            count: "$crimeCount"
                        }
                    }
                }
            },
            {
                $sort: { totalCrimes: -1 }
            }
        ]);
        return crimeSummary;
    } catch (error) {
        console.error(`Error in getCrimesByCommunity: ${error}`);
        throw error;
    }
}

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
                $sort: { totalCrimes: -1 }
            }
        ]);
        return crimeSummary;
    } catch (error) {
        console.error(`Error in getCrimesByCategoryAndCommunity: ${error}`);
        throw error;
    }
}
