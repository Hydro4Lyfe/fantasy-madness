FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src
COPY scenarios ./scenarios

EXPOSE 4010
CMD ["npm", "run", "dev"]
