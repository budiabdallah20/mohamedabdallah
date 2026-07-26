import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    visitors: { type: Number, default: 0 },
    projectViews: { type: Number, default: 0 },
    cvDownloads: { type: Number, default: 0 },
    contactMessages: { type: Number, default: 0 }
});

export default mongoose.model('Analytics', analyticsSchema);