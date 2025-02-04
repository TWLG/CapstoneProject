FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

COPY . .
RUN npm install

# Expose port 3000
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
