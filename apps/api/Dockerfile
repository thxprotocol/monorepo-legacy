#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-slim AS develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=8192"

RUN apt-get update \
    && apt-get install -y g++ make python3-pip build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock  ./
RUN yarn
COPY . .

CMD [ "npx", "nx", "serve", "api" ]

#####################################################################################################
## Build stage
#####################################################################################################
FROM node:16-slim AS build

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=develop ./usr/src/app/ ./
RUN npx nx build api --prod
COPY ./newrelic.js ./yarn.lock ./dist/apps/api/
COPY ./libs/contracts/exports ./dist/apps/api/libs/contracts/exports

#####################################################################################################
## Production stage
#####################################################################################################
FROM node:16-slim AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=build ./usr/src/app/dist/apps/api/package.json  ./usr/src/app/dist/apps/api/yarn.lock  ./

# Install your application dependencies (assuming it uses Node.js)
RUN yarn

COPY --from=build ./usr/src/app/dist/apps/api ./

CMD [ "main.js" ]