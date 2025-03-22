FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . /app/

EXPOSE 3001

ENV NAME networkapp

CMD [ "npm","run","server"]