const fs = require('fs').promises;
const { log } = require('../utils/log');

// const fs = require('fs');
// const path = require('path');

// const deleteFilesInDirectory = (directory) => {
//     fs.readdir(directory, (err, files) => {
//         if (err) {
//             console.error(`Помилка при зчитуванні каталогу: ${err}`);
//             return;
//         }
//         files.forEach((file) => {
//             const filePath = path.join(directory, file);
//             fs.unlink(filePath, (err) => {
//                 if (err) {
//                     console.error(`Помилка при видаленні файлу: ${err}`);
//                 } else {
//                     console.log(`Файл видалено: ${filePath}`);
//                 }
//             });
//         });
//     });
// };

// const deleteFilesInDirectory = async (directory) => {
//     try {
//         const files = await fs.readdir(directory); // Чекаємо список файлів
//         for (const file of files) {
//             const filePath = path.join(directory, file);
//             await fs.unlink(filePath); // Чекаємо видалення кожного файлу
//             console.log(`Файл видалено: ${filePath}`);
//         }
//     } catch (err) {
//         console.error(`Помилка: ${err}`);
//     }
// };

// const deleteArchive = async (filePath) => {
//     console.log('filePath', filePath)
//     fs.unlink(filePath, (err) => {
//         if (err) {
//             console.error(`Помилка при видаленні файлу ${filePath}: ${err}`);
//         } else {
//             console.log(`Файл успішно видалено: ${filePath}`);
//         }
//     });
// }

const deleteArchive = async (filePath) => {
    try {
        log('Attempting to delete file:', filePath);
        await fs.unlink(filePath);
        log(`Файл успішно видалено: ${filePath}`);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            log('error', `Файл не існує: ${filePath}`);
            return false;
        } else {
            log('error', `Помилка при видаленні файлу ${filePath}: ${error.message}`);
            throw error; // Прокидуємо помилку далі, якщо це не відсутність файлу
        }
    }
};

const deleteDirectory = async (directory) => {
    try {
        await fs.rm(directory, { recursive: true, force: true }); // Видаляємо папку рекурсивно
        log(`Директорія та її вміст видалені: ${directory}`);
    } catch (err) {
        log('error', `Помилка при видаленні директорії: ${err}`);
    }
};


const deleteFileAfterTimeout = (filePath, timeout = 60000) => { // 60000 мс = 1 хвилина
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                log('error', `Помилка при видаленні файлу ${filePath}: ${err}`);
            } else {
                log(`Файл успішно видалено: ${filePath}`);
            }
        });
    }, timeout);
};

module.exports = { deleteDirectory, deleteFileAfterTimeout, deleteArchive };

