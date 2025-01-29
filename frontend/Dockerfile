# FROM node:20-alpine AS build

# WORKDIR /app

# COPY package.json ./

# RUN yarn install

# ENV PATH /app/node_modules/.bin:$PATH

# COPY . .

# RUN yarn run build

# FROM nginx:1.25.4-alpine3.18

# COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /app/dist /var/www/html/

# EXPOSE 3000

# ENTRYPOINT ["nginx","-g","daemon off;"]

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

CMD ["sh", "./script.sh"]