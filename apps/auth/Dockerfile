#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-alpine as develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=4096"

RUN apk --no-cache add g++ make py3-pip
# node canvas deps
RUN apk --no-cache add build-essential cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

COPY package.json yarn.lock ./
RUN yarn
COPY . .

CMD [ "npx", "nx", "serve", "auth" ]

#####################################################################################################
## Build stage
#####################################################################################################
FROM node:16-alpine as build

WORKDIR /usr/src/app
COPY --from=develop ./usr/src/app/ ./
RUN npx nx build auth --prod
COPY ./newrelic.js ./yarn.lock ./dist/apps/auth/


#####################################################################################################
## Production stage
#####################################################################################################
FROM node:16-alpine as production

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=build ./usr/src/app/dist/apps/auth/package.json ./usr/src/app/dist/apps/auth/yarn.lock  ./
RUN apk add --no-cache --virtual .build g++ make py3-pip build-essential cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev && \
    yarn && \
    apk del .build
COPY --from=build ./usr/src/app/dist/apps/auth ./

CMD [ "main.js" ]