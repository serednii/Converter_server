
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendData(workerServer, formData, controller, idProcess) {
    try {
        // console.log(`sendData called for process ID: ${idProcess}`);
        // console.log(`Worker Server: ${workerServer} for process ID: ${idProcess}`);

        const response = await fetch(workerServer, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
            signal: controller.signal, // Передаємо сигнал скасування
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Помилка ${response.status}: ${errorText}`);
        }

        const jsonResponse = await response.json();
        return jsonResponse;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Запит було скасовано на робочому сервері');
        } else {
            console.error('Сталася помилка:', error.message);
            throw new Error(`Сталася помилка:', ${error}`)
        }
    }
}


module.exports = { sendData };