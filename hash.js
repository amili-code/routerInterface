const crypto = require('crypto');

const secretKey = "QWErTYU10P";  // مقدار اصلی کلید
const hashedKey = crypto.createHash('sha256').update(secretKey).digest('hex');

console.log("🔑 مقدار هش‌شده برای .env:");
console.log(hashedKey);
