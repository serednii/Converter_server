const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const ServerPorts = require('./utils/ServerPorts');

const UserController = require('./controllers/UserController');
const AdminController = require('./controllers/AdminController');
const ImageProcessingController = require('./controllers/ImageProcessingController');
const InitController = require('./controllers/InitController');
const OtherController = require('./controllers/OtherController');
//генеруємо список вільниз портів
// [ 8105, 8106, 8107, 8108, 8109, 8110, 8111, 8112,  8113, 8114, 8115, 8116, 8117, 8118, 8119]
ServerPorts.generateFreePorts();

// console.log('ServerPorts.ports', serverPorts.urlPorts)
myEmitter.setMaxListeners(200); // Збільшуємо ліміт до 20

const app = express();
const PORT = 8000;

// Створимо директорію для збереження зображень, якщо вона не існує

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

app.post('/upload-multiple', upload.array('images', 300), ImageProcessingController.uploadMultiple);

app.post('/init', InitController.init);

// Додайте новий ендпоінт для отримання статусу
app.post('/status', OtherController.status);

app.post('/killer', OtherController.killer);

app.post('/abort', OtherController.abort);

// Маршрут для завантаження конкретного файлу
app.get('/archive/:file', OtherController.archiveFile);

//ADMIN
// Додайте новий ендпоінт для отримання статусу
app.post('/getAdminData', AdminController.getAdminData);

// Додайте новий ендпоінт для отримання статусу
app.post('/setAdminData', AdminController.setAdminData,);

app.post('/getUserData', UserController.getUserData);

// Ендпоінт для реєстрації
app.post('/register', UserController.register);

// Ендпоінт для входу
app.post('/login', UserController.login);

app.listen(PORT, () => {
    console.log(`Центральний сервер працює на http://localhost:${PORT}`);
});



