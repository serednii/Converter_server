const FileService = require('../utils/FileService');
const ServerPorts = require('../utils/ServerPorts');
const { dataStore } = require('../utils/store');
const { dataQuery } = require('../utils//QueryController');


const AdminController = {

    // Додайте новий ендпоінт для отримання статусу
    getAdminData: (req, res) => {
        try {
            res.json({
                freePorts: ServerPorts.freePorts,
                dataStore,
                workIdQuery: Object.keys(dataQuery).length,
                users: FileService.readUsers()
            });
        } catch (error) {
            console.log('status ', error)
        }
    },

    // Додайте новий ендпоінт для отримання статусу
    setAdminData: (req, res) => {
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
    }
}

module.exports = AdminController;