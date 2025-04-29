import express from 'express';
import { findAllCommunityBoundaries, findCommunityBoundaryByCommCode, getCommunityBoundaryList } from '../models/communityBoundary.js';
import { findAllCrimeRecords, getCrimeTypeList } from '../models/crimes.js';
import { getCrimesByCategoryAndCommunity, getCrimesByCategorySingleMonthAndYear, getCrimesByCommunity, getCrimesByCommunityAndYear } from '../models/summaries.js';
import { CrimeDateRecord } from '../models/crimeDateRecords.js';

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

// Get a single community by the commCode.
router.get('/community/:communityCommCode', async function (req, res) {
    const commCode = req.params.communityCommCode
    try {
        const communityRecord = await findCommunityBoundaryByCommCode(commCode);
        if (!communityRecord) { 
            return res.status(404).json({ message: 'Community not found' });
        }
        res.send(communityRecord);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Get the Community Boundary list for the multiselect.
router.get('/communityBoundaryList', async (req, res) => {
    try {
        const communityBoundaryList = await getCommunityBoundaryList();
        res.json(communityBoundaryList);
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

router.post('/crimeSummary', async (req, res) => {
    try {
        const filters = req.body;
        const data = await getCrimesByCommunity(filters);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

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

// Get the Crime Type list for the multiselect.
router.get('/crimeTypeList', async (req, res) => {
    try {
        const crimeTypeList = await getCrimeTypeList();
        res.json(crimeTypeList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Date Range route.
router.get('/dateRanges', async (req, res) => {
    try {
        const dateRanges = await CrimeDateRecord.find({}).sort({ year: 1, month: 1 });
        res.json(dateRanges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add the new endpoint to get crime data for a specific month and year
router.post('/crimeByDate', async (req, res) => {
    try {
        const { year, month, communitiesListFilter, crimeListFilter } = req.body;
        
        if (!year || !month) {
            return res.status(400).json({ error: 'Year and month are required' });
        }
        
        const crimeSummary = await getCrimesByCategorySingleMonthAndYear(year, month, communitiesListFilter, crimeListFilter);
        
        res.json(crimeSummary);
    } catch (error) {
        console.error('Error fetching crime by date:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;