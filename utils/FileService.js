
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../users.json');
const FileService = {

    // Функція для зчитування користувачів з файлу
    readUsers: () => JSON.parse(fs.readFileSync(USERS_FILE)),

    // Функція для запису користувачів у файл
    writeUsers: (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)),

    // Функція для запису користувачів у файл асинхронно
    writeUsersAsync: (users) => {
        fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Помилка запису у файл:', err);
            } else {
                console.log('Дані успішно записані у файл');
            }
        })
    }


}

module.exports = FileService;