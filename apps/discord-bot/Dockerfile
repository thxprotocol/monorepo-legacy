#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-alpine as develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=4096"

RUN apk --no-cache add g++ make py3-pip 
COPY package.json yarn.lock ./
RUN yarn
COPY . .

CMD [ "npx", "nx", "serve", "discord-bot" ]

#####################################################################################################
## Build stage
#####################################################################################################
FROM node:16-alpine as build

WORKDIR /usr/src/app
COPY --from=develop ./usr/src/app/ ./
RUN npx nx build discord-bot --prod
COPY ./newrelic.js ./yarn.lock ./dist/apps/discord-bot/


#####################################################################################################
## Production stage
#####################################################################################################
FROM node:16-alpine as production

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=build ./usr/src/app/dist/apps/discord-bot/package.json ./usr/src/app/dist/apps/discord-bot/yarn.lock  ./
RUN apk add --no-cache --virtual .build g++ make py3-pip && \
    yarn && \
    apk del .build
COPY --from=build ./usr/src/app/dist/apps/discord-bot ./

CMD [ "main.js" ]