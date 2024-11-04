const express = require('express');
const cors = require('cors');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const ServerPorts = require('./utils/ServerPorts');
const { log } = require('./utils/log');
const app = express();
const PORT = 8000;

// Генеруємо список вільних портів
ServerPorts.generateFreePorts();
myEmitter.setMaxListeners(200); // Збільшуємо ліміт

// Підключення middleware
app.use(express.json());
app.use(cors());

// Підключення маршрутизаторів
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const imageRoutes = require('./routes/imageRoutes');
const initRoutes = require('./routes/initRoutes');
const otherRoutes = require('./routes/otherRoutes');

// Використання маршрутизаторів
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/images', imageRoutes);
app.use('/init', initRoutes);
app.use('/other', otherRoutes);

// Запуск сервера
app.listen(PORT, () => {
    log(`Центральний сервер працює на http://localhost:${PORT}`);
});
