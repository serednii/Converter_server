const express = require('express');
const router = express.Router();
const multer = require('multer');
const ImageProcessingController = require('../controllers/ImageProcessingController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Маршрут для завантаження зображень
router.post('/upload-multiple', upload.array('images', 300), ImageProcessingController.uploadMultiple);

module.exports = router;
