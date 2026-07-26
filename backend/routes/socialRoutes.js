import express from 'express';
import SocialLink from '../models/SocialLink.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const social = await SocialLink.findOne();
        res.status(200).json(social || {});
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const updatedSocial = await SocialLink.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json(updatedSocial);
    } catch (error) {
        next(error);
    }
});

export default router;