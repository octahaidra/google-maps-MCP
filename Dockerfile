FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Clean npm cache and install compatible npm version
RUN npm cache clean --force && \
    npm install -g npm@10.8.2

# Copy package files
COPY package*.json ./

# Install TypeScript and shx globally
RUN npm install -g typescript shx

# Install all dependencies
#RUN npm install

# Copy source code
COPY . .

# Create tsconfig.json if it doesn't exist
RUN if [ ! -f tsconfig.json ]; then \
    echo '{ \
      "compilerOptions": { \
        "target": "es2020", \
        "module": "commonjs", \
        "outDir": "./dist", \
        "rootDir": "./", \
        "strict": true, \
        "esModuleInterop": true, \
        "skipLibCheck": true, \
        "forceConsistentCasingInFileNames": true \
      }, \
      "include": ["./**/*"], \
      "exclude": ["node_modules", "dist"] \
    }' > tsconfig.json; \
    fi

# Build TypeScript files
RUN npm run build || tsc

# Set environment variables
ENV NODE_ENV=production

# Copy test files
COPY test-server.js ./

# Expose port if needed
# EXPOSE 3000

# Start the server
CMD ["node", "dist/server.js"]