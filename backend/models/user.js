import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // لسه مش هنعملها تشفير دلوقتي
    role: { type: String, default: 'admin' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
