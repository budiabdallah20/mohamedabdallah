import express from 'express';
import Project from '../models/Project.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. جلب كل المشاريع (متاح للجميع)
router.get('/', async (req, res, next) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
});

// 2. إضافة مشروع جديد (محمي بالتوكن)
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { title, description, image, github, liveDemo, category, technologies, featured } = req.body;

        const newProject = new Project({
            title,
            description,
            image,
            github,
            liveDemo,
            category,
            technologies,
            featured
        });

        await newProject.save();
        res.status(201).json({ status: 'success', message: 'Project added successfully!', project: newProject });
    } catch (error) {
        next(error);
    }
});

// 3. حذف مشروع (محمي بالتوكن)
router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ status: 'success', message: 'Project deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;