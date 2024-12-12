
const path = require('path');
const fs = require('fs');
const { dataQuery } = require('../utils/QueryController')
const { archiveDir } = require('../utils/config');
const { deleteArchive } = require('../utils/deleteFilesInDirectory');

const OtherController = {
    status: (req, res) => {
        try {
            const { idQuery } = req.body;
            res.json({
                progress: dataQuery[idQuery]?.progress,
                total: dataQuery[idQuery]?.total,
                processingStatus: dataQuery[idQuery]?.processingStatus,
            });
        } catch (error) {
            console.log('status ', error)
            res.status(404).send(`OtherController status ${error}`);

        }
    },

    abort: (req, res) => {
        try {
            const { idQuery } = req.body;
            console.log('abort', idQuery)

            dataQuery[idQuery]?.controller.abort(); // Скасовуємо всі запити

            clearInitData(idQuery)

            res.send('Запит скасовано');
        } catch (error) {
            console.log('OtherController abort ', error)
            res.status(404).send(`OtherController abort ${error}`);
        }
    },


    // Маршрут для завантаження конкретного файлу
    archiveFile: (req, res) => {
        try {
            console.log(req.params.file)
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
            console.log('OtherController archiveFile', error)
            res.status(404).send(`OtherController archiveFile ${error}`);
        }
    }
}

module.exports = OtherController;