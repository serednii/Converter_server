const path = require('path');
const fs = require('fs');
const { sendData } = require("./sendData")
const { deleteArchive } = require('./deleteFilesInDirectory');
const { archivePath, archiveDir } = require('./config');
const { dataStore, pauseSend } = require('./config');
const { QueryController } = require('./QueryController')
const { archiveFromBuffers } = require('./archiveImagesBuffer');


class LoadBalancer {

    constructor({ generatorData, dataQueryId, res }, workServer, indexProcess) {
        this.generatorData = generatorData;
        this.dataQueryId = dataQueryId;
        this.res = res;
        this.idQuery = dataQueryId.id;
        this.indexProcess = indexProcess;
        this.workServer = workServer;
        this.dataQueryId?.isServersTrue.push(1)
        this.#callNewServer();
    }

    async #callNewServer() {
        let { formData, index, finish } = this.generatorData.nextFormData()


        while (!finish) {
            try {

                if (this.dataQueryId?.controller.signal.aborted) {
                    this.#checkServersTrue()
                }

                // Якщо немає доступних серверів, припиняємо обробку
                console.log('server', this.workServer + " " + this.indexProcess)
                if (!this.workServer) {
                    this.dataQueryId.serverPorts.returnPorts();
                    this.#checkServersTrue()
                }

                const response = await sendData(this.workServer, formData, this.dataQueryId?.controller)

                if (response) {
                    this.dataQueryId?.processedImages.push({ response, name: response[0].fileName })
                    this.dataQueryId.progress += 1;
                    ({ formData, index, finish } = this.generatorData.nextFormData())
                } else {
                    this.generatorData.returnFormData(formData);
                    this.#checkServersTrue();
                }
            } catch (error) {
                this.dataQueryId.serverPorts.returnPorts();
                this.#checkServersTrue();
            }

        }
        this.#checkServersTrue()
    }

    async #checkServersTrue() {
        let newArchivePath = null;
        try {

            this.dataQueryId.isServersTrue.pop()
            const { finish } = this.generatorData.nextFormData()

            if (this.dataQueryId.isServersTrue.length === 0) {
                this.dataQueryId.serverPorts.returnPorts();

                this.dataQueryId.linkWorkServers.forEach(server => server.close(() => console.log(`Сервер  зупинено`)));

                if (!finish) {
                    QueryController.deleteId(this.idQuery)
                    this.res.status(500).send('Помилка сервера не всі файли опрацьовано');
                }

                // Перевіряємо існування вихідної директорії

                if (!fs.existsSync(archiveDir)) {
                    fs.mkdirSync(archiveDir);
                }

                // Перевіряємо, чи "archivePath" не є директорією
                if (fs.existsSync(archivePath) && fs.lstatSync(archivePath).isDirectory()) {
                    throw new Error(`Помилка: ${archivePath} є директорією, а не файлом.`);
                }

                const id = this.idQuery.toString();
                newArchivePath = path.join(archiveDir, `${id}_images_archive.zip`);//Папка для архіва з фото
                const downloadLink = `${dataStore.urlWorkServer}/other/archive/${id}_images_archive.zip`//Імя архів з фотографіями
                this.dataQueryId.processingStatus = 'archive images';

                await archiveFromBuffers(this.dataQueryId?.processedImages, newArchivePath);

                setTimeout(() => {
                    console.log('DeleteArchive file in load Balancer');
                    deleteArchive(newArchivePath);
                }, 2 * 60 * 1000);
                this.dataQueryId.processingStatus = "downloading";
                this.res.json({ processedImages: this.dataQueryId?.processedImages, downloadLink });
                QueryController.deleteId(this.idQuery);
            }
        } catch (error) {
            console.log(error)
            deleteArchive(newArchivePath);
            QueryController.deleteId(this.idQuery);
            this.res.status(500).send(`Помилка сервера ${error}`);
        }
    }
}

module.exports = { LoadBalancer };

