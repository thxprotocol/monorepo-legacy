#####################################################################################################
## Base stage
#####################################################################################################
FROM node:16-alpine as base

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=8192"

RUN apk --no-cache add g++ make py3-pip

#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-alpine as develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=8192"

RUN apk --no-cache add g++ make py3-pip
COPY package.json yarn.lock ./
RUN yarn
COPY . .

VOLUME ["/usr/src/app/node_modules"]

CMD [ "npx", "nx", "serve", "api" ]

#####################################################################################################
## Build stage
#####################################################################################################
FROM develop as build

ENV NODE_ENV=production

RUN npx nx build api --prod
COPY ./newrelic.js ./libs/contracts/exports ./dist/apps/api/
COPY ./yarn.lock ./dist/apps/api/

#####################################################################################################
## Production stage
#####################################################################################################
FROM base as production

ENV NODE_ENV=production

COPY --from=build ./dist/apps/api/package.json ./dist/apps/api/yarn.lock ./

RUN apk add --no-cache --virtual .build g++ make py3-pip && \
    yarn && \
    apk del .build

COPY --from=build ./dist/apps/api ./

CMD [ "main.js" ]