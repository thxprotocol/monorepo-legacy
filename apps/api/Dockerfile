#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-slim AS develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=8192"

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y g++ make python3-pip build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

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

# Install dependencies and packages
RUN apt-get update \
    && apt-get install -y g++ make python3-pip build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install your application dependencies (assuming it uses Node.js)
RUN yarn

# Clean up unnecessary packages and files
RUN apt-get purge -y --auto-remove build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build ./usr/src/app/dist/apps/api ./

CMD [ "main.js" ]