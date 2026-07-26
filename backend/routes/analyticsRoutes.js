import express from 'express';
import Analytics from '../models/Analytics.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const analytics = await Analytics.findOne();
        res.status(200).json(analytics || { visitors: 0, projectViews: 0, cvDownloads: 0, contactMessages: 0 });
    } catch (error) {
        next(error);
    }
});

export default router;