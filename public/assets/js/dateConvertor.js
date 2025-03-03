function convertToJalaliDate(utcDateStr) {

    if (/^\d{4}\/\d{1,2}\/\d{1,2} \| \d{2}:\d{2}$/.test(utcDateStr)) {
        return utcDateStr;
    }

    // بررسی فرمت UTC
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(utcDateStr)) {
        return "فرمت نامعتبر است!";
    }

    // ایجاد شیء Date از رشته ورودی
    const date = new Date(utcDateStr);

    // گرفتن ساعت و دقیقه (بدون تغییر)
    let hours = date.getUTCHours() + 3;
    let minutes = date.getUTCMinutes() + 30;

    // تنظیم افزایش ساعت در صورت نیاز
    if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
    }
    if (hours >= 24) {
        hours -= 24;
        date.setUTCDate(date.getUTCDate() + 1);
    }

    // گرفتن سال، ماه و روز میلادی
    let gYear = date.getUTCFullYear();
    let gMonth = date.getUTCMonth() + 1; // ماه‌ها از 0 شروع می‌شوند، پس +1 می‌کنیم
    let gDay = date.getUTCDate();

    // تبدیل تاریخ میلادی به شمسی
    let jYear, jMonth, jDay;
    const g_d_m = [0, 31, (gYear % 4 === 0 && gYear % 100 !== 0) || gYear % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let gy = gYear - 1600;
    let gm = gMonth - 1;
    let gd = gDay - 1;

    let g_day_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
    for (let i = 0; i < gm; i++) {
        g_day_no += g_d_m[i];
    }
    g_day_no += gd;

    let j_day_no = g_day_no - 79;
    let j_np = Math.floor(j_day_no / 12053);
    j_day_no %= 12053;

    jYear = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
    j_day_no %= 1461;

    if (j_day_no >= 366) {
        jYear += Math.floor((j_day_no - 1) / 365);
        j_day_no = (j_day_no - 1) % 365;
    }

    const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    for (jMonth = 0; jMonth < 12 && j_day_no >= j_days_in_month[jMonth]; jMonth++) {
        j_day_no -= j_days_in_month[jMonth];
    }
    jDay = j_day_no + 1;
    jMonth += 1;

    // تبدیل عدد ماه و روز به فرمت دو رقمی (مثلاً 01، 02، ...)
    const formattedMonth = jMonth.toString().padStart(2, '0');
    const formattedDay = jDay.toString().padStart(2, '0');
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // فرمت نهایی خروجی
    return `${jYear}/${(formattedMonth * 1) + 1}/${(formattedDay * 1) +1} | ${formattedHours}:${formattedMinutes}`;
}

// تست تابع
// const utcTime = "2025-02-15T16:40:54.000Z";
