FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

COPY . .
RUN npm install --force

# Expose port 3001
EXPOSE 3001

# Start the Next.js development server
CMD ["npm", "run", "dev"]