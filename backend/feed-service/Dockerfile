FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY shared ./shared
COPY feed-service ./feed-service

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app

WORKDIR /app/feed-service
EXPOSE 5002
CMD ["node", "server.js"]
