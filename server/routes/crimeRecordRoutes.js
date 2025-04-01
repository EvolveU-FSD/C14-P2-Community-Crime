import { Router } from "express";
import { createCrimeRecord, findAllCrimeRecords, findCrimeById} from '../models/crimes.js';

const router = Router();

// Get all crime records.
router.get('/', async (req, res) => {
    try {
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
