const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// مسار تجريبي للتأكد إن السيرفر شغال
app.get('/', (req, res) => {
    res.json({ message: "Hello Mohamed, Backend is working successfully! 🚀" });
});
// مسار خاص بعدادات السوشيال ميديا
app.get('/api/social-stats', (req, res) => {
    const stats = {
        instagram: "15.4K",
        tiktok: "28.2K",
        facebook: "10.1K"
    };
    res.json(stats);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});