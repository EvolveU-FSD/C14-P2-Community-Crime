import { getCommunityBoundaryList } from '../models/communityBoundary.js';
import { connectDb, disconnectDb } from '../db.js';

const main = async () => {
    try {
        await connectDb();
        const communities = await getCommunityBoundaryList();
        communities.forEach(c => {
            console.log(`[${c.label}]`);
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
    } finally {
        await disconnectDb();
    }
};

main();
