import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// جلب كل المشاريع
router.get('/', async (req, res, next) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
});

// إضافة مشروع جديد
router.post('/', async (req, res, next) => {
    try {
        const newProject = await Project.create(req.body);
        res.status(201).json(newProject);
    } catch (error) {
        next(error);
    }
});

export { router };
export default router;