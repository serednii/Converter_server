const express = require('express');
const router = express.Router();
const InitController = require('../controllers/InitController');

// Ініціалізаційний маршрут
router.post('/init', InitController.init);

module.exports = router;
