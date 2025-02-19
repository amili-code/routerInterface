const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

/**
 * اتصال به روتر و اجرای یک دستور
 * @param {Object} router - اطلاعات روتر شامل ip، port، username، password
 * @param {string} command - دستوری که می‌خواهی روی روتر اجرا کنی
 * @returns {Promise<string>} - خروجی دستور اجرا شده
 */
async function executeCommand(router, command) {
    try {
        // اتصال به روتر
        await ssh.connect({
            host: router.ip,
            port: router.port || 22,
            username: router.username,
            password: router.password,
        });

        // اجرای دستور روی روتر
        const result = await ssh.execCommand(command);

        // قطع اتصال
        ssh.dispose();

        return result.stdout || result.stderr;
    } catch (error) {
        console.error("خطا در اتصال به روتر:", error);
        throw new Error("اتصال به روتر ناموفق بود.");
    }
}

module.exports = { executeCommand };
