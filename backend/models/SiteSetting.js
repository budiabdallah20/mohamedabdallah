import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema({
    heroTitle: { type: String, required: true },
    heroSubtitle: { type: String, required: true },
    aboutText: { type: String, required: true },
    profileImage: { type: String, required: true },
    cvLink: { type: String, required: true },
    language: { type: String, default: 'ar' },
    theme: { type: String, default: 'dark' }
});

export default mongoose.model('SiteSetting', siteSettingSchema);