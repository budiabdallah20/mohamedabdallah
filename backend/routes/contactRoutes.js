import express from 'express';
import nodemailer from 'nodemailer';
import ContactMessage from '../models/ContactMessage.js';

const router = express.Router();

// إعدادات خدمة البريد الإلكتروني
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// إرسال رسالة تواصل جديدة (من زائر الموقع) وإرسال إيميل تنبيه
router.post('/', async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // 1. حفظ الرسالة في قاعدة البيانات
        const newMessage = await ContactMessage.create(req.body);

        // 2. إرسال إيميل تنبيه ليك
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // هيجيلك إيميل على نفس إيميلك
            subject: `New Portfolio Message: ${subject || 'No Subject'}`,
            html: `
                <h3>You have a new message from your portfolio!</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        // إرسال الإيميل في الخلفية بدون ما نوقف رد الـ API لو حصل خطأ في الإيميل
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent successfully:', info.response);
            }
        });

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