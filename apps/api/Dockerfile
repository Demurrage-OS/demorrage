FROM node:20-alpine

WORKDIR /app

# Copy package definition and Prisma
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies (tsx)
RUN npm install --legacy-peer-deps
RUN npx prisma generate

# Copy source code
COPY src ./src

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Run directly via tsx without tsc compilation errors
CMD ["npx", "tsx", "src/server.ts"]
