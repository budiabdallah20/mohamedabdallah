import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';

// استيراد ملفات الـ Routes
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

// تحميل إعدادات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

const app = express();

// أدوات الحماية والتشغيل
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// مسار تجريبي للاختبار
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Backend Foundation is running smoothly!' });
});

// ==========================================
// ربط المسارات (Routes) بالـ API
// ==========================================
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/analytics', analyticsRoutes);

// معالجة الأخطاء (يجب أن تكون دائماً في النهاية بعد الـ Routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running successfully on port ${PORT}`);
});