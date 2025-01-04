# Use the official Node.js image as the base image
FROM node:23-alpine3.20

# Set the working directory inside the container
WORKDIR /app

#download ssl certificate for db connection from aws
RUN curl -o rds-combined-ca-bundle.pem https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application

#RUN npm run build

# Install PM2 globally
RUN npm install pm2 -g

# Expose the port the app runs on
EXPOSE 5555

# Set environment variables
ENV PORT 5555

# Start the application using PM2
CMD ["pm2-runtime", "src/index.js"]