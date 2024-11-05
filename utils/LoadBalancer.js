const { sendData } = require("./sendData")
const path = require('path');
const fs = require('fs');
const { deleteArchive } = require('./deleteFilesInDirectory');
const { archivePath, archiveDir } = require('./store');
const { dataStore, pauseSend } = require('./store');
const ServerPorts = require('./ServerPorts');
const { QueryController } = require('./QueryController')
const { archiveFromBuffers } = require('./archiveImagesBuffer');

let flag = 0
let knacked = false
class LoadBalancer {

    static process = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
        // console.log('this.linkWorkServers', this.linkWorkServers)


        while (!finish) {
            try {
                if (dataStore.urlWorkServer !== "http://localhost:8000") {
                    console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    await new Promise(resolve => setTimeout(resolve, pauseSend.pause));
                }

                if (this.dataQueryId?.controller.signal.aborted) {
                    this.dataQueryId.download = 'cancelled';
                    break;
                }
                // Якщо немає доступних серверів, припиняємо обробку
                console.log('server', this.workServer + " " + this.indexProcess)
                if (!this.workServer) {
                    throw new Error('No available servers');
                }

                formData.append('idProcess', this.indexProcess);

                const res = await sendData(this.workServer, formData, this.dataQueryId?.controller, this.indexProcess)


                if (res) {
                    this.dataQueryId?.processedImages.push({ res, name: res[0].fileName })
                    this.dataQueryId.progress += 1;
                    ({ formData, index, finish } = this.generatorData.nextFormData())

                } else {
                    this.generatorData.returnFormData(formData);
                    this.#checkServersTrue();
                    break
                }
            } catch (error) {
                console.log(error)
                this.#checkServersTrue()
            }

        }
        this.#checkServersTrue()
    }

    async #checkServersTrue() {
        try {

            this.dataQueryId.isServersTrue.pop()
            const { finish } = this.generatorData.nextFormData()

            if (this.dataQueryId.isServersTrue.length === 0) {
                this.dataQueryId.serverPorts.returnPorts();

                this.dataQueryId.linkWorkServers.forEach(server => server.close(() => console.log(`Сервер  зупинено`)));
                this.dataQueryId.linkWorkServers.length = 0;

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
                const newArchivePath = path.join(archiveDir, `${id}_images_archive.zip`);//Папка для архіва з фото
                const downloadLink = `${dataStore.urlWorkServer}/other/archive/${id}_images_archive.zip`//Імя архів з фотографіями
                this.dataQueryId.processingStatus = 'archive images';

                await archiveFromBuffers(this.dataQueryId?.processedImages, newArchivePath);

                setTimeout(() => {
                    console.log('DeleteArchive file in load Balancer');
                    deleteArchive(newArchivePath);
                }, 60000 * 60);

                this.dataQueryId.processingStatus = "downloading";
                QueryController.deleteId(this.idQuery);
                this.res.json({ processedImages: this.dataQueryId?.processedImages, downloadLink });
            }
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = { LoadBalancer };