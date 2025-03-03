const { NodeSSH } = require("node-ssh");

/**
 * اتصال به روتر و اجرای یک دستور
 * @param {Object} router - اطلاعات روتر شامل ip، port، username، password
 * @param {string} command - دستوری که می‌خواهی روی روتر اجرا کنی
 * @returns {Promise<string|null>} - خروجی دستور اجرا شده یا null در صورت خطا
 */
async function executeCommand(router, command) {
    const ssh = new NodeSSH(); // هر بار یک شیء جدید ایجاد کن

    try {

        await ssh.connect({
            host: router.ip,
            port: router.port,
            username: router.username,
            password: router.password,
        });

        // اجرای دستور روی روتر
        const result = await ssh.execCommand(command);
        ssh.dispose(); // قطع اتصال
        
        if (result.stderr) {
            console.error(`Error executing command on ${router.ip}: ${result.stderr}`);
            return null;
        }

        return result.stdout.trim(); // حذف فضای اضافی و بازگشت مقدار مناسب
    } catch (error) {
        console.error(`Failed to execute command on ${router.ip}: ${error.message}`);
        return null; // مقدار null برگردان تا در لیست پردازش به‌درستی هندل شود
    }
}

module.exports = { executeCommand };
