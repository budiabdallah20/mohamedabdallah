import express from 'express';
import Certificate from '../models/Certificate.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const certificates = await Certificate.find();
        res.status(200).json(certificates);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const newCert = await Certificate.create(req.body);
        res.status(201).json(newCert);
    } catch (error) {
        next(error);
    }
});

export default router;