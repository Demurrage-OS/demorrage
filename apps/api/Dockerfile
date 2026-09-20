FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package definition and Prisma
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client with native debian engine
RUN npm install --legacy-peer-deps
RUN npx prisma generate

# Copy source code
COPY src ./src

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npx", "tsx", "src/server.ts"]
