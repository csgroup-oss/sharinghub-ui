FROM node:lts-alpine3.18 AS builder

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.25-alpine3.18

ARG VERSION=latest
LABEL version=${VERSION}

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
