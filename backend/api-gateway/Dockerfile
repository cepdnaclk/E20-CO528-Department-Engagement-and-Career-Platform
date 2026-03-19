FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY shared ./shared
COPY api-gateway ./api-gateway

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app

WORKDIR /app/api-gateway
EXPOSE 5000
CMD ["node", "server.js"]
