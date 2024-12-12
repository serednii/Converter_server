const { QueryController, dataQuery } = require('../utils/QueryController')
const { dataStore } = require('../utils/config');
const ServerPorts = require('../utils/ServerPorts');
const { AbortController } = require('node-abort-controller');
const clearInitData = require('../utils/clearInitData');
const FileService = require('../utils/FileService');
const { createServers } = require('../utils/serverCreator');

const InitController = {
    init: (req, res) => {
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

            if (userEmail) {
                const users = FileService.readUsers();
                // console.log('************** ********** ********* ', users)
                // Знаходимо користувача за логіном
                const indexUser = users.findIndex(user => user.email === userEmail);

                // Додаємо нову історію

                const dataHistory = {
                    date: new Date(),
                    numberImage,
                    sizeFiles
                }
                users[indexUser].history.push(dataHistory)
                const usersCopy = JSON.parse(JSON.stringify(users));
                setInterval(() => {
                    FileService.writeUsersAsync(usersCopy);
                }, 50_000)
            }

            //Записуєму свій зовнішній  адрес сервера на який прийшов визов
            dataStore.urlWorkServer = urlMainServer

            //якщо є вільні порти то створюємо нового клієнта
            const controller = new AbortController();
            // 
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
            console.log('serverPorts*******************', serverPorts)
            createServers(serverPorts.ports, idQuery);

            setTimeout(() => clearInitData(idQuery), (5 * 60 * 1000));

            res.json(dataSend);
        } catch (error) {
            console.log('init ', error)
            res.status(500).send('InitController', error)
        }

    }
}

module.exports = InitController;