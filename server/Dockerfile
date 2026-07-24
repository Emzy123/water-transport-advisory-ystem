FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && (node prisma/seed.js || true) && node src/index.js"]
