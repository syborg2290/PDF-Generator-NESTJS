FROM node:16-alpine3.11 AS BUILD_IMAGE

RUN apk update && apk add yarn curl bash make && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

# install dependencies

RUN yarn --frozen-lockfile

COPY . .

RUN yarn install

RUN yarn build

RUN npm prune --production

FROM timbru31/java-node:11-alpine-16

WORKDIR /home/node/app

COPY --from=BUILD_IMAGE /usr/src/app/dist /home/node/app/dist

COPY --from=BUILD_IMAGE /usr/src/app/node_modules /home/node/app/node_modules

COPY --from=BUILD_IMAGE /usr/src/app/dist/views /home/views



EXPOSE 80

ENTRYPOINT ["node"]

CMD ["/home/node/app/dist/main.js"]