FROM node:16-alpine as develop

WORKDIR /usr/src/app
RUN apk add g++ make py3-pip
# install node-canvas dependencies
RUN apk add build-base cairo-dev jpeg-dev pango pango-dev giflib-dev imagemagick freetype fontconfig
COPY package-lock.json ./
RUN npm ci
COPY ./dist/apps/api .

CMD [ "node", "main.js" ]


FROM node:16-alpine as build

WORKDIR /usr/src/app
COPY --from=develop ./usr/src/app/ ./
RUN npm run build
COPY newrelic.js dist/newrelic.js

FROM node:16-alpine as production

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package* ./
RUN npm config set update-notifier false
RUN apk add --virtual .build g++ make py3-pip && \
    # install node-canvas dependencies
    apk add build-base cairo-dev jpeg-dev pango pango-dev giflib-dev imagemagick freetype fontconfig && \
    npm ci --production && \
    apk del .build
COPY --from=build ./usr/src/app/dist ./
COPY tsconfig.json ./

CMD [ "-r", "tsconfig-paths/register", "src/server.js" ]