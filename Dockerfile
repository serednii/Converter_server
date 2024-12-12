# # Використовуйте базовий образ з потрібною версією Node.js
# FROM node:14

# # Встановіть робочу директорію
# WORKDIR /usr/src/app

# # Копіюйте package.json та package-lock.json
# COPY package*.json ./

# # Встановіть залежності
# RUN npm install

# # Копіюйте решту файлів
# COPY . .
# RUN npm rebuild sharp
# # # Вказуємо порт, на якому працюватиме сервер
# # EXPOSE 800
# # Відкрийте порт, використовуючи змінну середовища PORT

# EXPOSE $PORT

# # Запустіть додаток
# CMD ["node", "server.js"]

# Використовуємо базовий образ з необхідною версією Node.js
FROM node:14

# Встановлюємо робочу директорію
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо решту файлів
COPY . .

# Встановлюємо змінну середовища для порту, якщо вона не вказана
ENV PORT=8000

# Перезбираємо бібліотеку sharp (якщо потрібно)
RUN npm rebuild sharp

# Відкриваємо порт
EXPOSE $PORT

# Запускаємо додаток
CMD ["node", "server.js"]

