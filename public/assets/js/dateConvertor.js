function convertToJalaliDate(utcDateStr) {

    if (/^\d{4}\/\d{1,2}\/\d{1,2} \| \d{2}:\d{2}$/.test(utcDateStr)) {
        return utcDateStr;
    }

    // بررسی فرمت UTC
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(utcDateStr)) {
        return "فرمت نامعتبر است!";
    }

    // ایجاد شیء Date و تبدیل به منطقه زمانی ایران
    const date = new Date(utcDateStr);
    date.setUTCHours(date.getUTCHours() + 3, date.getUTCMinutes() + 30);

    // گرفتن اطلاعات میلادی
    const gYear = date.getUTCFullYear();
    const gMonth = date.getUTCMonth() + 1;
    const gDay = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    // تبدیل تاریخ میلادی به شمسی
    const { jy, jm, jd } = jalaali.toJalaali(gYear, gMonth, gDay);

    // فرمت خروجی به صورت `YYYY/MM/DD | HH:MM`
    return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')} | ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
} 