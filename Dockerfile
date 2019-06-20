FROM node:lts-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN npm i -g yarn && \
  yarn

COPY . ./

CMD ["yarn", "start"]
