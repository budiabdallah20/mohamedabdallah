import express from 'express';
import SiteSetting from '../models/SiteSetting.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const settings = await SiteSetting.findOne();
        res.status(200).json(settings || {});
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const updatedSettings = await SiteSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json(updatedSettings);
    } catch (error) {
        next(error);
    }
});

export default router;