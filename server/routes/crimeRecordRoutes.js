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
        res.send(crimeRecord);  
    }
    catch (error){
        console.log(error);
        res.sendStatus(500);
    } 
})

router.post('/', async (req, res) => {
    const {community, category, crimeCount, year, month} = req.body;

    if (req.body) {
        const crimeRecord = await createCrimeRecord(community, category, crimeCount, year, month);
        return res.send(crimeRecord);
    } else {
        return res.sendStatus(400);
    }
})

export default router;
