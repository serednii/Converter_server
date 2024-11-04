const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const { AbortController } = require('node-abort-controller');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const { generatorFormData } = require("./utils/generatorFormData");
const { LoadBalancer } = require("./utils/LoadBalancer");

const { archiveDir, pauseSend, dataStore } = require('./utils/store');
const { deleteArchive } = require('./utils/deleteFilesInDirectory');
const { ServerPorts } = require('./utils/ServerPorts');
const { QueryController, dataQuery } = require('./utils/QueryController')
const USERS_FILE = path.join(__dirname, 'users.json');

//генеруємо список вільниз портів
// [ 8105, 8106, 8107, 8108, 8109, 8110, 8111, 8112,  8113, 8114, 8115, 8116, 8117, 8118, 8119]
ServerPorts.generateFreePorts();

// const numberServers1 = Math.ceil(20 / numberImageToServer);
// const serverPorts = new ServerPorts(5);

// createServers(serverPorts.ports);
console.log('ServerPorts.ports', ServerPorts.freePorts)
// console.log('ServerPorts.ports', serverPorts.ports)

// console.log('ServerPorts.ports', serverPorts.urlPorts)
myEmitter.setMaxListeners(200); // Збільшуємо ліміт до 20

const app = express();
const port = 8000;

// Створимо директорію для збереження зображень, якщо вона не існує

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

app.post('/upload-multiple', upload.array('images', 300), async (req, res) => {
    try {
        console.log('upload-multiple')

        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Будь ласка, завантажте зображення');
        }

        if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir);
        }

        const { idQuery, userEmail } = req.body;


        // console.log('HHHHHHHHHHHHHHHHHHHHHHHH', dataQuery)
        // console.log('HHHHHHHHHHHHHHHHHHHHHHHH', idQuery)
        dataQuery[idQuery].processingStatus = 'processing images';
        dataQuery[idQuery].total = req.files.length;

        //буде видавати почерзі файли поки незакінчаться 
        const generatorData = generatorFormData(req)

        const dataForLoadBalancer = {
            generatorData,
            dataQueryId: dataQuery[idQuery],
            res,
        }

        for (let i = 0; i < dataQuery[idQuery].serverPorts.length; i++) {
            const workServer = `http://localhost:${dataQuery[idQuery].serverPorts.ports[i]}/process-images`
            new LoadBalancer(dataForLoadBalancer, workServer, i);
        }


        // if (userEmail) {
        //     const users = readUsers();
        //     // console.log('************** ********** ********* ', users)
        //     // Знаходимо користувача за логіном
        //     const indexUser = users.findIndex(user => user.email === userEmail);

        //     // if (!user) {
        //     //     return res.status(400).json({ message: 'Невірний логін або пароль' });
        //     // }
        //     // Додаємо нову історію

        //     const dataHistory = {
        //         date: new Date(),
        //         numberImage: 14,
        //         sizeFiles: 54846
        //     }
        //     users[indexUser].history.push(dataHistory)
        //     const usersCopy = JSON.parse(JSON.stringify(users));
        //     // setInterval(() => {
        //     writeUsersAsync(usersCopy);
        //     // }, 50_000)
        // }

    } catch (error) {
        console.log('upload-multiple ', error)
    }

});


app.post('/init', (req, res) => {
    try {
        const { idQuery, urlMainServer, numberImage, sizeFiles, userEmail } = req.body;
        //Перевірка на правильність даних
        if (!numberImage || !idQuery || !urlMainServer) {
            res.status(400).send('неправильный, некорректный запрос.');
        }
        // перевірка на унікальність id
        if (QueryController.checkIsId(idQuery)) {
            res.status(409).send('Запит з таким номером вже існує');
        }
        //Вираховуємо кількість серверів в залежності від кількості файлів
        const numberServers = Math.ceil(numberImage / dataStore.numberImageToServer);
        // console.log('numberServers', numberServers)
        const dataSend = {
            message: 'Дані проініціалізовано',
        }

        if (ServerPorts.freePorts.length <= 0) {
            res.status(503).json({ ports: 0, messag: 'Немає вільних серверів для обробки запиту. Будь ласка, спробуйте пізніше.' });
        }
        // console.log('user', userEmail, idQuery)

        if (userEmail) {
            const users = readUsers();
            // console.log('************** ********** ********* ', users)
            // Знаходимо користувача за логіном
            const indexUser = users.findIndex(user => user.email === userEmail);

            // if (!user) {
            //     return res.status(400).json({ message: 'Невірний логін або пароль' });
            // }
            // Додаємо нову історію

            const dataHistory = {
                date: new Date(),
                numberImage,
                sizeFiles
            }
            users[indexUser].history.push(dataHistory)
            const usersCopy = JSON.parse(JSON.stringify(users));
            setInterval(() => {
                writeUsersAsync(usersCopy);
            }, 50_000)
        }

        //Записуєму свій зовнішній  адрес сервера на який прийшов визов
        dataStore.urlWorkServer = urlMainServer

        //якщо є вільні порти то створюємо нового клієнта
        const controller = new AbortController();
        // console.log('ServerPorts.ports', ServerPorts.freePorts);
        const serverPorts = new ServerPorts(numberServers);
        // console.log('ServerPorts.ports', ServerPorts.freePorts);
        dataSend.ports = serverPorts.length;
        // console.log('serverPorts', serverPorts.ports);
        // новий обєкт з параметрами для нового запиту
        const newQuery = {
            controller,//Обєкт для преривання запиту
            id: idQuery,//id процесу
            progress: 0,//прогрес обробки даних (кількість оброблених файлів)
            total: 0,//Загальна кількість файлів
            processingStatus: 'unloading',// (unloading, processing images, archive images, downloading )
            processedImages: [],//масив з обробленими файлами
            serverPorts,//обєкт класу ServerPorts який має адреса портів [ 8100, 8101, 8102, 8103] 
            linkWorkServers: [],//Обєкти запущених серверів пізніше будемо їх закривати
            isServersTrue: [],//флаги для позначення закритих серверів (горшки з каміннями)
        }
        dataQuery[idQuery] = new QueryController(newQuery)
        //створюємо сервери
        createServers(serverPorts.ports, idQuery);

        setTimeout(() => {
            clearInitData(idQuery)
        }, (5 * 60 * 1000));

        res.json(dataSend);
    } catch (error) {
        console.log('init ', error)
    }

});


// Додайте новий ендпоінт для отримання статусу
app.post('/status', (req, res) => {
    try {
        const { idQuery } = req.body;
        // console.log('get status', idQuery)
        // console.log(dataQuery)
        res.json({
            progress: dataQuery[idQuery]?.progress,
            total: dataQuery[idQuery]?.total,
            processingStatus: dataQuery[idQuery]?.processingStatus,
        });
    } catch (error) {
        console.log('status ', error)
    }
});

app.post('/killer', (req, res) => {
    let { pause } = req.body;
    if (pause > 3000) {
        pause = 3000
    }
    pauseSend.pause = parseInt(pause);
    console.log(pauseSend)
    // console.log('serverStopped')
    dataQuery[idQuery]?.linkWorkServers[0].close(() => {
        console.log(`Сервер  зупинено`);
    })
    // linkWorkServers[1].close(() => {
    //     console.log(`Сервер  зупинено`);
    // })
    // linkWorkServers[2].close(() => {
    //     console.log(`Сервер  зупинено`);
    // })
    res.json({
        message: 'Server stopped',
    });
});

app.post('/abort', (req, res) => {
    try {
        const { idQuery } = req.body;
        console.log('abort', idQuery)

        dataQuery[idQuery]?.controller.abort(); // Скасовуємо всі запити

        clearInitData(idQuery)

        res.send('Запит скасовано');
    } catch (error) {
        console.log('abort ', error)
    }
});


// Маршрут для завантаження конкретного файлу
app.get('/archive/:file', (req, res) => {
    try {
        const filePath = path.join(archiveDir, req.params.file);
        console.log('archive/:file', req.params.file)
        // Перевіряємо, чи існує файл
        if (fs.existsSync(filePath)) {
            console.log('Завантаження архіву:', filePath);

            // Відправляємо файл на завантаження
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Помилка при завантаженні файлу:', err);
                    res.status(500).send('Помилка при завантаженні файлу.');
                } else {
                    // Успішне завантаження, видаляємо файл
                    deleteArchive(filePath)
                }
            });
        } else {
            res.status(404).send('Файл не знайдено.');
        }
    } catch (error) {
        console.log('/archive/:file ', error)
    }
});


app.listen(port, () => {
    console.log(`Центральний сервер працює на http://localhost:${port}`);
});

//ADMIN

// Додайте новий ендпоінт для отримання статусу
app.post('/getAdminData', (req, res) => {
    try {

        res.json({
            freePorts: ServerPorts.freePorts,
            dataStore,
            workIdQuery: Object.keys(dataQuery).length,
            users: readUsers()
        });
    } catch (error) {
        console.log('status ', error)
    }
});

app.post('/getUserData', (req, res) => {

    try {
        const { email } = req.body;
        const users = readUsers()
        const user = users.find(user => user.email === email);
        res.json({
            user,
        });
    } catch (error) {
        console.log('status ', error)
    }
});

// Додайте новий ендпоінт для отримання статусу
app.post('/setAdminData', (req, res) => {
    console.log(req.body)
    const { key, value } = req.body;
    dataStore[key] = parseInt(value)
    switch (key) {
        case "numberFreePorts":
            ServerPorts.generateFreePorts();
            console.log("returnPorts After", ServerPorts.freePorts)

            break;
        case "startPorts":
            ServerPorts.generateFreePorts();
            console.log("returnPorts After", ServerPorts.freePorts)
            break;
    }
});


























// Ініціалізуємо файл, якщо він не існує
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Функція для зчитування користувачів з файлу
function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE));
};

// Функція для запису користувачів у файл
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

function writeUsersAsync(users) {
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
        if (err) {
            console.error('Помилка запису у файл:', err);
        } else {
            console.log('Дані успішно записані у файл');
        }
    });
};
// async function writeUsersAsync(users) {
//     try {
//         await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
//         console.log('Дані успішно записані у файл');
//     } catch (error) {
//         console.error('Помилка запису у файл:', error);
//     }
// }

// Ендпоінт для реєстрації
app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Перевірка обов'язкових полів
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Всі поля є обов’язковими' });
        }

        const users = readUsers();

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
        writeUsers(users);

        res.status(201).json({ message: 'Реєстрація успішна' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// Ендпоінт для входу
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password)
        // Перевірка обов'язкових полів
        if (!email || !password) {
            return res.status(400).json({ message: 'Логін і пароль є обов’язковими' });
        }

        const users = readUsers();

        // Знаходимо користувача за логіном
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(400).json({ message: 'Невірний логін або пароль' });
        }

        // Перевірка пароля
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Невірний логін або пароль' });
        }

        const { name, role } = user;
        res.status(200).json({ name, role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

























// Функція для створення сервера 
function createServer(port, idQuery) {
    const app = express();

    // Використовуємо CORS для дозволу запитів з інших доменів
    app.use(cors());

    // Налаштування multer для завантаження файлів
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    // Функція обробки зображень
    const processImages = async (req, res) => {
        console.log('worker server worker server 111111111111111111111 ' + req.body.idProcess)
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).send('Будь ласка, завантажте зображення');
            }
            // console.log('worker server worker server 2222222222222222222222 ' + req.body.idProcess)

            const processType = req.body.processType;
            const processedImages = [];

            // console.log('worker server worker server 33333333333333333333 ' + req.body.idProcess)

            for (let i = 0; i < req.files.length; i++) {
                // console.log('worker server worker server 444444444444444444444 ' + req.body.idProcess)

                let processedImage;
                console.log(`Обробляється зображення на сервері з портом: ${port}`); // Виводимо номер порта
                switch (processType) {
                    case 'resize':
                        const width = parseInt(req.body.resizeWidth) || 300;
                        const height = parseInt(req.body.resizeHeight) || 300;
                        processedImage = await sharp(req.files[i].buffer).resize(width, height).toBuffer();
                        break;
                    case 'grayscale':
                        processedImage = await sharp(req.files[i].buffer).grayscale().toBuffer();
                        break;
                    case 'rotate':
                        const degrees = parseInt(req.body.rotateDegrees) || 90;
                        processedImage = await sharp(req.files[i].buffer).rotate(degrees).toBuffer();
                        break;
                    case 'blur':
                        const blurLevel = parseFloat(req.body.blurLevel) || 5;
                        processedImage = await sharp(req.files[i].buffer).blur(blurLevel).toBuffer();
                        break;
                    case 'brightness':
                        const brightnessLevel = parseFloat(req.body.brightnessLevel) || 1;
                        processedImage = await sharp(req.files[i].buffer).modulate({ brightness: brightnessLevel }).toBuffer();
                        break;
                    case 'contrast':
                        const contrastLevel = parseFloat(req.body.contrastLevel) || 1;
                        processedImage = await sharp(req.files[i].buffer).modulate({ contrast: contrastLevel }).toBuffer();
                        break;
                    case 'crop':
                        const cropWidth = parseInt(req.body.cropWidth) || 300;
                        const cropHeight = parseInt(req.body.cropHeight) || 300;
                        processedImage = await sharp(req.files[i].buffer).extract({ width: cropWidth, height: cropHeight, left: 0, top: 0 }).toBuffer();
                        break;
                    default:
                        return res.status(400).send('Невідомий тип обробки');
                }
                // console.log('worker server worker server 555555555555555555555 ' + req.body.idProcess)

                const imageBase64 = `data:image/jpeg;base64, ${processedImage.toString('base64')}`;
                const fileName = req.files[i].originalname;
                processedImages.push({ imageBase64, fileName });

            }

            res.json(processedImages);
        } catch (error) {
            console.log('processImages', error)

            if (req.aborted) {
                console.log('Запит було скасовано');
                res.status(499).send('Перервано користувачем');
            } else {
                res.status(500).send('Помилка під час обробки зображень');
            }
        }
        // console.log('worker server worker server 777777777777777777777 ' + req.body.idProcess)

    };

    // Роут для обробки зображень
    app.post('/process-images', upload.array('images', 200), processImages);

    // Запускаємо сервер
    const linkServer = app.listen(port, () => {
        console.log(`Оброблювальний сервер працює на http://localhost:${port}`);
    });

    dataQuery[idQuery]?.linkWorkServers.push(linkServer)

    app.get('/status', (req, res) => {
        console.log('get status port  ', port)
        res.json({ st: "Сервер работает" });
    });
};

// Функція для створення кількох серверів

function createServers(ports, idQuery) {
    console.log('portsportsportsportsports', ports)
    ports.forEach((port) => {
        createServer(port, idQuery);
    })
};
// createServers([8106, 8107, 8108, 8109], 54654)


// Кількість серверів і стартовий порт
const startPort = 8100; // Початковий порт




function clearInitData(idQuery) {
    try {
        if (dataQuery[idQuery]) {
            dataQuery[idQuery]?.serverPorts.returnPorts();
            dataQuery[idQuery]?.linkWorkServers.forEach(server => server.close(() => console.log(`Сервер  зупинено`)));
            const id = idQuery.toString();
            const newArchivePath = path.join(archiveDir, `${id}_images_archive.zip`);//Папка для архіва з фото
            deleteArchive(newArchivePath);
            QueryController.deleteId(idQuery)
        }
    } catch (error) {
        console.log('clear data error in init edpoint ', error)
    }
}

