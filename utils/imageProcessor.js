const sharp = require('sharp');

async function processImage(fileBuffer, processOptions = {}) {
    let processedImage;
    const { processType } = processOptions;
    console.log('processType', processType);

    try {
        switch (processType) {
            case 'resize':
                const width = parseInt(processOptions.resizeWidth) || 300;
                const height = parseInt(processOptions.resizeHeight) || 300;
                processedImage = await sharp(fileBuffer).resize(width, height).toBuffer();
                break;
            case 'grayscale':
                processedImage = await sharp(fileBuffer).grayscale().toBuffer();
                break;
            case 'rotate':
                const degrees = parseInt(processOptions.rotateDegrees) || 90;
                processedImage = await sharp(fileBuffer).rotate(degrees).toBuffer();
                break;
            case 'blur':
                const blurLevel = parseFloat(processOptions.blurLevel) || 5;
                processedImage = await sharp(fileBuffer).blur(blurLevel).toBuffer();
                break;
            case 'brightness':
                const brightnessLevel = parseFloat(processOptions.brightnessLevel) || 1;
                processedImage = await sharp(fileBuffer).modulate({ brightness: brightnessLevel }).toBuffer();
                break;
            case 'contrast':
                const contrastLevel = parseFloat(processOptions.contrastLevel) || 1;
                processedImage = await sharp(fileBuffer).modulate({ contrast: contrastLevel }).toBuffer();
                break;
            case 'crop':
                const cropWidth = parseInt(processOptions.cropWidth) || 300;
                const cropHeight = parseInt(processOptions.cropHeight) || 300;
                processedImage = await sharp(fileBuffer).extract({ width: cropWidth, height: cropHeight, left: 0, top: 0 }).toBuffer();
                break;
            default:
                console.error('Не вибрано жодного процесу');
                throw new Error('Не вибрано жодного процесу');
        }
    } catch (error) {
        console.error('Error processing:', error.message);
        throw new Error(`Error processing: ${error.message}`);
    }

    return `data:image/jpeg;base64,${processedImage.toString('base64')}`;
}

module.exports = { processImage };
