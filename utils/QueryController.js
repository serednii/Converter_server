const { dataQuery } = require('./store')


class QueryController {
    static dataQuery = {}
    constructor({ controller, id, progress, total, processingStatus, processedImages, serverPorts, linkWorkServers, isServersTrue }) {
        this.controller = controller;
        this.id = id;
        this.progress = progress;
        this.total = total;
        this.processingStatus = processingStatus;
        this.processedImages = processedImages;
        this.serverPorts = serverPorts;
        this.linkWorkServers = linkWorkServers;
        this.isServersTrue = isServersTrue;
    }

    static checkIsId(newId) {
        return !!QueryController.dataQuery[newId]
    }


    static deleteId(id) {
        delete QueryController.dataQuery[id]
    }
}



module.exports = { QueryController, dataQuery: QueryController.dataQuery }