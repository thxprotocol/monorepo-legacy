#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-alpine AS develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=8192"

RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-2.35-r1.apk
RUN apk --no-cache add g++ make py3-pip gcompat glibc-2.35-r1.apk build-base cairo-dev jpeg-dev pango pango-dev giflib-dev

COPY package.json yarn.lock ./
RUN yarn install --build-from-source
COPY . .

CMD [ "npx", "nx", "serve", "api" ]

#####################################################################################################
## Build stage
#####################################################################################################
FROM node:16-alpine AS build

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=develop ./usr/src/app/ ./
RUN npx nx build api --prod
COPY ./newrelic.js ./yarn.lock ./dist/apps/api/
COPY ./libs/contracts/exports ./dist/apps/api/libs/contracts/exports

#####################################################################################################
## Production stage
#####################################################################################################
FROM node:16-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=build ./usr/src/app/dist/apps/api/package.json ./usr/src/app/dist/apps/api/yarn.lock  ./

RUN apk add --no-cache --virtual .build g++ make py3-pip glibc-2.35-r1.apk build-base cairo-dev jpeg-dev pango pango-dev giflib-dev && \
    yarn install --build-from-source && \
    apk del .build
COPY --from=build ./usr/src/app/dist/apps/api ./

CMD [ "main.js" ]