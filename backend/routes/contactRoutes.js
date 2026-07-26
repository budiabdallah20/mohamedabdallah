import express from 'express';
import ContactMessage from '../models/ContactMessage.js';

const router = express.Router();

// إرسال رسالة تواصل جديدة (من زائر الموقع)
router.post('/', async (req, res, next) => {
    try {
        const newMessage = await ContactMessage.create(req.body);
        res.status(201).json({ status: 'success', message: 'Message sent successfully!', newMessage });
    } catch (error) {
        next(error);
    }
});

// جلب كل الرسائل (للأدمن)
router.get('/', async (req, res, next) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
});

export default router;