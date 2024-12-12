const FileService = require('../utils/FileService');
const bcrypt = require('bcrypt');
const UserController = {

    getUserData: (req, res) => {

        try {
            const { email } = req.body;
            const users = FileService.readUsers()
            const user = users.find(user => user.email === email);
            res.json({
                user,
            });
        } catch (error) {
            console.log('status ', error)
        }
    },

    register: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            // Перевірка обов'язкових полів
            if (!email || !password || !name) {
                return res.status(400).json({ message: 'Всі поля є обов’язковими' });
            }

            const users = FileService.readUsers();

            // Перевірка, чи існує користувач з таким логіном
            const userExists = users.some(user => user.email === email);

            if (userExists) {
                return res.status(400).json({ message: 'Користувач з таким логіном вже існує' });
            }

            // Хешування пароля
            const hashedPassword = await bcrypt.hash(password, 10);

            // Додаємо нового користувача
            const newUser = { email, password: hashedPassword, name, role: "user", history: [] };
            users.push(newUser);
            FileService.writeUsers(users);

            res.status(201).json({ message: 'Реєстрація успішна' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Помилка сервера' });
        }
    },

    // Ендпоінт для входу
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log(email, password)

            // Перевірка обов'язкових полів
            if (!email || !password) {
                return res.status(400).json({ message: `Логін і пароль є обов’язковими` });
            }

            const users = FileService.readUsers();

            // Знаходимо користувача за логіном
            const user = users.find(user => user.email === email);

            if (!user) {
                return res.status(400).json({ message: `Невірний логін або пароль` });
            }

            // Перевірка пароля
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ message: `Невірний логін або пароль` });
            }

            const { name, role } = user;
            res.status(200).json({ name, role });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: `UserController login  Помилка сервера ${error}` });
        }
    }

}


module.exports = UserController;