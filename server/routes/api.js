import express from 'express';
import { findAllCommunityBoundaries } from '../models/communities.js';
import { findAllCrimeRecords } from '../models/crimes.js';
import { getCrimesByCategoryAndCommunity, getCrimesByCommunity, getCrimesByCommunityAndYear } from '../models/summaries.js';

const router = express.Router();

// When the user navigates to allCommunities they get the raw JSON of everything.
router.get('/allCommunities', async (req, res) => {
    try {
        const communities = await findAllCommunityBoundaries();
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// When navigating to allCrimes it returns raw JSON of all our crime records.
router.get('/allCrimes', async (req, res) => {
    try {
        const crimes = await findAllCrimeRecords();
        res.json(crimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Based on the crimeSummary url, call the summary function to summarize the count.
router.get('/crimeSummary', async (req, res) => {
    try {
        const summary = await getCrimesByCommunity();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// If giving a single community, return summarized crime data, broken down by crime type.
router.get('/crimeSummary/:community', async (req, res) => {
    try {
        const summary = await getCrimesByCategoryAndCommunity(req.params.community);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Give the option to return crimes summarized by year by community.
router.get('/crimeSummaryByYear', async (req, res) => {
    try {
        const summary = await getCrimesByCommunityAndYear();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;