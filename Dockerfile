FROM node:20.19.3-alpine
RUN apk update && apk add tzdata && apk --no-cache add curl
WORKDIR /usr/src/app
RUN npm install -g @nestjs/cli
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start:dev"]