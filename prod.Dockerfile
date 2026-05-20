# Builder stage
FROM node:22 as builder

WORKDIR /app

# Enable corepack (maneja pnpm/yarn/npm correctamente)
RUN corepack enable

# Copy dependency manifests first (better cache)
COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* ./

# Install dependencies
RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy source
COPY . .

# Build
RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm run build; \
  elif [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  else yarn build; \
  fi


# Production stage
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
