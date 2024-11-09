const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

// Маршрути для адміністратора
router.post('/getAdminData', AdminController.getAdminData);
router.post('/setAdminData', AdminController.setAdminData);

module.exports = router;