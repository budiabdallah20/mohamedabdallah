import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    github: { type: String },
    liveDemo: { type: String },
    technologies: [String],
    category: { type: String, required: true },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);