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

module.exports = clearInitData;