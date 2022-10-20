ARG ARCH=
FROM ${ARCH}node:16-alpine

WORKDIR /usr/src/app

RUN apk add bash && npm install -g npm@8.5.1

COPY ../../package*.json ./

RUN apk add --virtual .build g++ make py3-pip && \
    npm ci && \
    apk del .build

COPY . .

RUN npm run compile

CMD ["npx", "hardhat", "node"]
