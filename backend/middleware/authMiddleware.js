import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    // بنجت الهيدر الخاص بالتوكن اللي جاي من الفرونت إند
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // فك تشفير التلُوكِن والتأكد إنه سليم
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret_key_portfolio');
        req.user = verified;
        next(); // كمل طريقك للطلب العادي
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

export default verifyToken;