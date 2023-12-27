FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .
RUN npm ci --only=production

EXPOSE 8080
CMD [ "node", "index.js" ]
