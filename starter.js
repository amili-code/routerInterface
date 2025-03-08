require("dotenv").config(); // لود کردن متغیرهای محیطی از .env
const axios = require("axios");


try {
    const serverUrl = `http://${process.env.HOST}:${process.env.PORT}/api/register`;

    // اطلاعات ادمین از .env
    const adminData = {
        name: process.env.ADMIN_NAME,
        password: process.env.ADMIN_PASSWORD,
        phoneNumber: process.env.ADMIN_PHONE,
        nationalCode: process.env.ADMIN_NATIONAL_CODE,
    };

    // ارسال درخواست به روت ثبت‌نام
    const response = await axios.post(`${serverUrl}/register`, adminData);

    console.log("ادمین با موفقیت ایجاد شد:", response.data);
} catch (error) {
    if (error.response) {
        console.error("خطا در ایجاد ادمین:", error.response.data);
    } else {
        console.error("خطای سرور:", error.message);
    }
}

