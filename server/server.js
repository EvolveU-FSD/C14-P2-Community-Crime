import express from 'express';
import crimeRecordRoutes from './routes/crimeRecordRoutes.js';
import communityBoundaryRoutes from './routes/communityBoundaryRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { initializeCronJob, importCommunityBoundaryData } from './scheduled/daily.js';

// Outlines the variables needed to run the server.
const app = express();
// Add middleware to process the body.
app.use(express.json());
app.use(express.static('public'));
// Get a port from the environment, or default to 3000 if one can't be retrieved.
const PORT = process.env.PORT || 3000;

// Navigate to the crimeRecordRoutes file when navigating to the home location
// (http://localhost:3000)- If there was a /name after 3000, it would go in the '/' section below.
// Next logic goes to routes/crimeRecordRoutes.js.
app.use('/allCrimes', crimeRecordRoutes);
app.use('/allCommunities', communityBoundaryRoutes)
app.use('/api', apiRoutes);

// importCrimeData();
// importCommunityBoundaryData();
initializeCronJob();

// Run the server. Write to console what port it selected.
const server = app.listen(PORT, () => {
    console.log(`server listening on PORT ${PORT}`);
})


