#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-alpine as develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=8192"

RUN apk --no-cache add g++ make py3-pip build-base cairo-dev jpeg-dev pango pango-dev giflib-dev imagemagick freetype fontconfig
COPY package.json yarn.lock ./
RUN yarn
COPY . .

CMD [ "npx", "nx", "serve", "api" ]

#####################################################################################################
## Build stage
#####################################################################################################
FROM node:16-alpine as build

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=develop ./usr/src/app/ ./
RUN npx nx build api --prod
COPY ./newrelic.js ./yarn.lock ./dist/apps/api/
COPY ./libs/contracts/exports ./dist/apps/api/libs/contracts/exports

#####################################################################################################
## Production stage
#####################################################################################################
FROM node:16-alpine as production

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=build ./usr/src/app/dist/apps/api/package.json ./usr/src/app/dist/apps/api/yarn.lock  ./

# install node-canvas dependencies
RUN apk add --no-cache build-base cairo-dev jpeg-dev pango pango-dev giflib-dev imagemagick freetype fontconfig

RUN apk add --no-cache --virtual .build g++ make py3-pip && \
    yarn && \
    apk del .build
COPY --from=build ./usr/src/app/dist/apps/api ./

CMD [ "main.js" ]