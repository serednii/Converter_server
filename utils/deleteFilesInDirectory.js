const fs = require('fs').promises;

const deleteArchive = async (filePath) => {
    try {
        console.log('Attempting to delete file:', filePath);
        await fs.unlink(filePath);
        console.log(`Файл успішно видалено: ${filePath}`);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('error', `Файл не існує: ${filePath}`);
            return false;
        } else {
            console.log('error', `Помилка при видаленні файлу ${filePath}: ${error.message}`);
            throw error; // Прокидуємо помилку далі, якщо це не відсутність файлу
        }
    }
};

const deleteDirectory = async (directory) => {
    try {
        await fs.rm(directory, { recursive: true, force: true }); // Видаляємо папку рекурсивно
        consolee.log(`Директорія та її вміст видалені: ${directory}`);
    } catch (err) {
        console.log('error', `Помилка при видаленні директорії: ${err}`);
    }
};

const deleteFileAfterTimeout = (filePath, timeout = 60000) => { // 60000 мс = 1 хвилина
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log('error', `Помилка при видаленні файлу ${filePath}: ${err}`);
            } else {
                console.log(`Файл успішно видалено: ${filePath}`);
            }
        });
    }, timeout);
};

module.exports = { deleteDirectory, deleteFileAfterTimeout, deleteArchive };

