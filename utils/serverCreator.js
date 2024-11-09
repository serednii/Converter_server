// utils/createServer.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { processImage } = require('./imageProcessor');
const { dataQuery } = require('../utils/QueryController');



function createServer(port, idQuery) {
    const app = express();
    app.use(cors());

    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    app.post('/process-images', upload.array('images', 200), async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).send('Please upload images');
            }
            const processedImages = await Promise.all(
                req.files.map(async (file) => {
                    const imageBase64 = await processImage(file.buffer, req.body);
                    return { imageBase64, fileName: file.originalname };
                })
            );


            res.json(processedImages);
        } catch (error) {
            // if (req.aborted) {
            //     console.log('ERROR process-images', error)
            //     res.status(499).send('Aborted by client************************');
            // } else {
            console.log('ERROR process-images', error)
            res.status(500).send('Error processing images');
            // }
        }
    });

    const serverInstance = app.listen(port, () => {
        console.log(`Processing server running on http://localhost:${port}`);
    });


    dataQuery[idQuery]?.linkWorkServers.push(serverInstance);
}

function createServers(ports, idQuery) {
    console.log('portsportsportsportsports', ports)
    if (ports) {
        ports.forEach((port) => {
            createServer(port, idQuery);
        })
    }
};

module.exports = { createServer, createServers };
