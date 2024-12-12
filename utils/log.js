const log = (...args) => {
    const levels = {
        info: '\x1b[36m%s\x1b[0m',   // Блакитний
        warn: '\x1b[33m%s\x1b[0m',   // Жовтий
        error: '\x1b[31m%s\x1b[0m',  // Червоний
        debug: '\x1b[35m%s\x1b[0m'   // Фіолетовий
    };

    let level = 'info';  // Значення за замовчуванням
    let messageArgs = args;

    // Перевірка: якщо перший аргумент є строкою та співпадає з рівнем
    if (typeof args[0] === 'string' && levels[args[0]]) {
        level = args[0];
        messageArgs = args.slice(1); // Решта аргументів — повідомлення
    }

    if (level == 'info') {
        return 0
    }
    const timestamp = new Date().toISOString();
    const color = levels[level];

    // Форматуємо всі аргументи повідомлення
    const message = messageArgs.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');

    console.log(color, `[${level.toUpperCase()}] ${timestamp} - ${message}`);
}

module.exports = { log }