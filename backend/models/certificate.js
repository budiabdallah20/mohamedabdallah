import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    image: { type: String, required: true },
    date: { type: Date, required: true },
    link: { type: String }
});

export default mongoose.model('Certificate', certificateSchema);