#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-slim AS develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=8192"

RUN apt-get update \
    && apt-get install -y g++ make python3-pip build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && apt-get install libasound2=1.1.8-1 libatk-bridge2.0-0=2.30.0-5 libatk1.0-0=2.30.0-2 libatspi2.0-0=2.30.0-7 libc6=2.28-10+deb10u1 libcairo2=1.16.0-4+deb10u1 libcups2=2.2.10-6+deb10u5 libdbus-1-3=1.12.20-0+deb10u1 libdrm2=2.4.97-1 libexpat1=2.2.6-2+deb10u4 libgbm1=18.3.6-2+deb10u1 libgcc1=1:8.3.0-6 libglib2.0-0=2.58.3-2+deb10u3 libnspr4=2:4.20-1 libnss3=2:3.42.1-1+deb10u5 libpango-1.0-0=1.42.4-7~deb10u1 libpangocairo-1.0-0=1.42.4-7~deb10u1 libstdc++6=8.3.0-6 libuuid1=2.33.1-0.1 libx11-6=2:1.6.7-1+deb10u2 libx11-xcb1=2:1.6.7-1+deb10u2 libxcb-dri3-0=1.13.1-2 libxcb1=1.13.1-2 libxcomposite1=1:0.4.4-2 libxcursor1=1:1.1.15-2 libxdamage1=1:1.1.4-3+b3 libxext6=2:1.3.3-1+b2 libxfixes3=1:5.0.3-1 libxi6=2:1.7.9-1 libxkbcommon0=0.8.2-1 libxrandr2=2:1.5.1-1 libxrender1=1:0.9.10-1 libxshmfence1=1.3-1 libxss1=1:1.2.3-1 libxtst6=2:1.2.3-1 \
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