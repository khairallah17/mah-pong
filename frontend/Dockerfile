FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# COPY node_modules ./

RUN npm install

COPY . .

CMD ["sh", "./script.sh"]