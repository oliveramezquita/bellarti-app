
# Builder stage
FROM node:22 AS builder

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm run build:icons
RUN pnpm run msw:init
RUN pnpm run build

# Production stage
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
