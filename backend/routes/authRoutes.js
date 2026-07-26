import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // تأكد إن مسار الـ Model صح

const router = express.Router();

// مسار التسجيل (Register)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // التأكد من إدخال كل البيانات المطلوبة
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide username, email, and password' });
        }

        // التأكد إن المستخدم مش مسجل قبل كده
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // تشفير الباسورد
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // إنشاء وتخزين المستخدم الجديد
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ status: 'success', message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// مسار تسجيل الدخول (Login)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // البحث عن المستخدم بالـ username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // مطابقة الباسورد
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // إنشاء الـ Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.status(200).json({ status: 'success', token, message: 'Logged in successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;