const express = require('express');
const router = express.Router();
const OtherController = require('../controllers/OtherController');

// Додаткові маршрути
router.post('/status', OtherController.status);
router.post('/abort', OtherController.abort);
router.get('/archive/:file', OtherController.archiveFile);

module.exports = router;
