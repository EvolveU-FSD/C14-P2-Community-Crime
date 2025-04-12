import express from 'express';
import { findAllCommunityBoundaries } from '../models/communities.js';
import { findAllCrimeRecords } from '../models/crimes.js';
import { getCrimesByCategoryAndCommunity, getCrimesByCommunity } from '../models/summaries.js';

const router = express.Router();

router.get('/allCommunities', async (req, res) => {
    try {
        const communities = await findAllCommunityBoundaries();
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/allCrimes', async (req, res) => {
    try {
        const crimes = await findAllCrimeRecords();
        res.json(crimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/crimeSummary', async (req, res) => {
    try {
        const summary = await getCrimesByCommunity();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/crimeSummary/:community', async (req, res) => {
    try {
        const summary = await getCrimesByCategoryAndCommunity(req.params.community);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;