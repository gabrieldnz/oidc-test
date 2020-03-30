FROM node:12.16.1-alpine3.11 AS builder

WORKDIR /opt/app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY src src
RUN npm run build

FROM node:12.16.1-alpine3.11

WORKDIR /opt/oidc-provider

COPY package.json package-lock.json ./
RUN npm ci --only=prod
COPY --from=builder /opt/app/dist dist

CMD ["node", "dist/app.js"]
