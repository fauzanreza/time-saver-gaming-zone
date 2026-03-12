FROM node:20-alpine

# Use an alpine image and add openssl (needed by prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for tsx)
RUN npm install

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build frontend using Vite
RUN npm run build

# Expose backend port
EXPOSE 3001

# The start command pushes the DB schema ensuring table creation, and starts the backend
CMD ["sh", "-c", "npx prisma db push && npx tsx server/index.ts"]
