const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Маршрути для користувача
router.post('/getUserData', UserController.getUserData);
router.post('/register', UserController.register);
router.post('/login', UserController.login);

module.exports = router;
