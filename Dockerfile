FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src/ ./src/
COPY server.js ./
COPY database.sqlite ./

# Install dependencies
RUN npm install --production

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "server.js"] 