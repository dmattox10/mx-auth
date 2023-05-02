FROM node:14
WORKDIR /usr/src/app
COPY ./ ./
EXPOSE ${PORT}
RUN yarn
CMD ["node", "server.js"]