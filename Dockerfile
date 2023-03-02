FROM node:18-alpine

EXPOSE 3000

ADD dist /app/dist
ADD src/public /app/dist/public
ADD package.json /app/
WORKDIR /app
RUN ["npm", "install", "--only=production"]

ENTRYPOINT ["node", "dist/main"]
