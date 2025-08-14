FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install all dependencies
RUN npm ci

# Build the TypeScript code
RUN npm run build

# Expose port
EXPOSE 8000

# Start the server in HTTP mode
ENV TRANSPORT=http
CMD ["node", "dist/index.js"]
