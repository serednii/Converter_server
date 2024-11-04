// utils/imageProcessor.js
const sharp = require('sharp');

async function processImage(fileBuffer, processType, processOptions = {}) {
    let processedImage;

    switch (processType) {
        case 'resize':
            const { resizeWidth = 300, resizeHeight = 300 } = processOptions;
            processedImage = await sharp(fileBuffer).resize(resizeWidth, resizeHeight).toBuffer();
            break;
        case 'grayscale':
            processedImage = await sharp(fileBuffer).grayscale().toBuffer();
            break;
        case 'rotate':
            const { rotateDegrees = 90 } = processOptions;
            processedImage = await sharp(fileBuffer).rotate(rotateDegrees).toBuffer();
            break;
        case 'blur':
            const { blurLevel = 5 } = processOptions;
            processedImage = await sharp(fileBuffer).blur(blurLevel).toBuffer();
            break;
        case 'brightness':
            const { brightnessLevel = 1 } = processOptions;
            processedImage = await sharp(fileBuffer).modulate({ brightness: brightnessLevel }).toBuffer();
            break;
        case 'contrast':
            const { contrastLevel = 1 } = processOptions;
            processedImage = await sharp(fileBuffer).modulate({ contrast: contrastLevel }).toBuffer();
            break;
        case 'crop':
            const { cropWidth = 300, cropHeight = 300 } = processOptions;
            processedImage = await sharp(fileBuffer).extract({ width: cropWidth, height: cropHeight, left: 0, top: 0 }).toBuffer();
            break;
        default:
            throw new Error('Unknown process type');
    }

    return `data:image/jpeg;base64,${processedImage.toString('base64')}`;
}

module.exports = { processImage };
