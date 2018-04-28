FROM node:8

EXPOSE 3000

ADD dist /app/dist
ADD package.json /app/
WORKDIR /app
RUN ["npm", "install", "--only=production"]

ENTRYPOINT ["npm", "run", "prod"]
