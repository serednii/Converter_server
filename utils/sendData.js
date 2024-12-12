const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendData(workerServer, formData, controller) {
    try {
        const headers = formData.getHeaders ? formData.getHeaders() : {};

        const response = await fetch(workerServer, {
            method: 'POST',
            body: formData,
            headers,
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
            throw error; // Просто передаємо помилку далі без форматування
        }
    }
}

module.exports = { sendData };
