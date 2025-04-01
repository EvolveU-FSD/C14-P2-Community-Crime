import { Router } from "express";
import { createCrimeRecord, findAllCrimeRecords, findCrimeById} from '../models/crimes.js';

// Create a new router- This is an automatically created object from express.
const router = Router();

// Get ALL crime records.
// The second parameter is a single function that waits to finish before executing.
router.get('/', async (req, res) => {
    try {
        // Run the findAllCrimeRecords function from the crime model.
        const crimeRecord = await findAllCrimeRecords();
        // Send the record we just got from the database to the screen.
        // Right now this results in ugly JSON but we'll format it later.
        res.send(crimeRecord);  
    }
    // If we ever get to this point then we broke something and the user gets the error saying so.
    catch (error){
        console.log(error);
        res.sendStatus(500);
    } 
})

// Create a new record. We may never use this but it's good practice.
router.post('/', async (req, res) => {
    const {community, category, crimeCount, year, month} = req.body;

    if (req.body) {
        const crimeRecord = await createCrimeRecord(community, category, crimeCount, year, month);
        return res.send(crimeRecord);
    } else {
        return res.sendStatus(400);
    }
})

// Make sure to export the router so it can be used by the application.
export default router;
