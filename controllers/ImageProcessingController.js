const fs = require('fs');
const { dataQuery } = require('../utils/QueryController');
const { LoadBalancer } = require("../utils/LoadBalancer");
const { generatorFormData } = require("../utils/generatorFormData");

const ImageProcessingController = {
    uploadMultiple: async (req, res) => {
        try {
            console.log('upload-multiple')

            if (!req.files || req.files.length === 0) {
                return res.status(400).send('Будь ласка, завантажте зображення');
            }

            const { idQuery } = req.body;
            if (!dataQuery[idQuery]) {
                return res.status(400).send(`Такого обєкто з id ${idQuery} не має`);
            }

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

        } catch (error) {
            console.log('upload-multiple ', error)
            res.status(500).send('ImageProcessingController', error)
        }

    }
}

module.exports = ImageProcessingController;