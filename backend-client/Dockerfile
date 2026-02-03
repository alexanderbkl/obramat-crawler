FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

EXPOSE 3002

# Start the application
CMD ["npm", "run", "dev"]
