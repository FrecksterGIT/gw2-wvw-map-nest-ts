FROM node:8

ADD dist /app/dist
ADD node_modules /app/node_modules
ADD package.json /app/

EXPOSE 3000

WORKDIR /app
ENTRYPOINT ["npm", "run", "prod"]
