import { Router } from "express";
import { findAllCommunityBoundaries } from "../models/communities.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const communityBoundaries = await findAllCommunityBoundaries();
        res.send(communityBoundaries);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

export default router;
