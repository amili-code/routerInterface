require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);

// تابع هش کردن رمز عبور
async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
}

// تابع بررسی رمز عبور
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// تولید توکن JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name }, // اطلاعات داخل توکن
        process.env.JWT_SECRET, // کلید امضای JWT
        { expiresIn: process.env.JWT_EXPIRES_IN } // زمان انقضا
    );
}


function verifyToken(token) {
    try {
        if (!token) return { login: false };
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { login: true, id: decoded.id, name: decoded.name };
    } catch (error) {
        return { login: false };
    }
}


module.exports = { hashPassword, comparePassword, generateToken, verifyToken };
