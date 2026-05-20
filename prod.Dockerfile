# Builder stage
FROM node:22 as builder

WORKDIR /app

# Enable corepack + fix pnpm version
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy ALL source FIRST (IMPORTANTE)
COPY . .

# Install dependencies WITHOUT triggering broken lifecycle timing
RUN pnpm install --frozen-lockfile

# Run build steps manually (NO postinstall dependency)
RUN pnpm run build:icons
RUN pnpm run msw:init
RUN pnpm run build


# Production stage
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
