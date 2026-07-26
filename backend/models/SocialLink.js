import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
    github: { type: String },
    linkedin: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String }
});

export default mongoose.model('SocialLink', socialLinkSchema);