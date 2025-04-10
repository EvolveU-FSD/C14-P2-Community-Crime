import express from 'express';
import { findAllCommunityBoundaries } from '../models/communities.js';
import { findAllCrimeRecords } from '../models/crimes.js';

const router = express.Router();

router.get('/api/allCommunities', async (req, res) => {
    try {
        const communities = await findAllCommunityBoundaries();
        console.log(communities)
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/api/allCrimes', async (req, res) => {
    try {
        const crimes = await findAllCrimeRecords();
        res.json(crimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;