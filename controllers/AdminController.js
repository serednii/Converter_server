const FileService = require('../utils/FileService');
const ServerPorts = require('../utils/ServerPorts');
const { dataStore } = require('../utils/config');
const { dataQuery } = require('../utils//QueryController');


const AdminController = {

    getAdminData: (req, res) => {
        try {
            res.json({
                freePorts: ServerPorts.freePorts,
                dataStore,
                workIdQuery: Object.keys(dataQuery).length,
                users: FileService.readUsers()
            });
        } catch (error) {
            console.log('AdminController-getAdminData', error)
            res.status(500).send(`AdminController-getAdminData ${error}`)
        }
    },


    setAdminData: (req, res) => {
        console.log(req.body)
        try {

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
        } catch (error) {
            console.log('AdminController-setAdminData ', error)
            res.status(500).send(`AdminController-setAdminData ${error}`)
        }
    }
}

module.exports = AdminController;