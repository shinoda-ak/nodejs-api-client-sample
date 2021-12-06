FROM node:alpine

COPY package.json ./

RUN npm install

COPY . .

CMD ["run.sh"]