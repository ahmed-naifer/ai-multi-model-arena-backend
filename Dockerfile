FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

# On ajoute le flag --experimental-sqlite, obligatoire pour node:sqlite
CMD ["node", "--experimental-sqlite", "server.js"]