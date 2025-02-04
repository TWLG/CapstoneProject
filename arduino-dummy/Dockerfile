FROM node:22-alpine

# Set the working directory
WORKDIR /usr/src/app

COPY . .
RUN npm install

# Expose no ports since this is a client
CMD ["npm", "start"]