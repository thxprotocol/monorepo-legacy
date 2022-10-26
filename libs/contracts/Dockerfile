#####################################################################################################
## Develop stage
#####################################################################################################
FROM node:16-alpine as develop

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max_old_space_size=4096"

RUN /sbin/ip route|awk '/default/ { print $3 }'

RUN apk --no-cache add g++ make py3-pip build-base cairo-dev jpeg-dev pango pango-dev giflib-dev imagemagick freetype fontconfig
COPY package.json yarn.lock ./
RUN yarn
COPY . .

WORKDIR /usr/src/app/libs/contracts

CMD ["npx", "hardhat", "node"]