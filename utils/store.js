
const path = require('path');
const projectRoot = path.resolve(__dirname, '..');

const dataStore = {
    urlWorkServer: '',
    numberFreePorts: 20,
    numberImageToServer: 2,
    startPorts: 8100
}
// dataQuery = {}
const archiveDir = path.join(projectRoot, 'archive'); // Директорія для архіву
const archivePath = path.join(archiveDir, 'images_archive.zip'); // Шлях до архіву, включаючи ім'я файлу
const pauseSend = { pause: 300 };

// const workerServers = ['https://sharpiraworksserver-production.up.railway.app/process-images']

module.exports = { dataStore, pauseSend, archivePath, projectRoot, archiveDir };