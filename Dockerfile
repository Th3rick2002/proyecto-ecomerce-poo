FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --production


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

USER node

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/src ./src

COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 3000

CMD ["node", "src/index.js"]