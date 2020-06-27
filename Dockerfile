FROM node:alpine3.12

WORKDIR /usr/src/app

VOLUME /usr/src/app/data
VOLUME /usr/src/app/md

COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile --non-interactive

COPY . /usr/src/app

CMD yarn start
