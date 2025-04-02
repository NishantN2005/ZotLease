# Use the official Node.js image as the base image
FROM node:23-alpine3.20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Remove node_modules and package-lock.json if they exist
RUN rm -rf node_modules package-lock.json

#Set environment variables before building

ARG VITE_AWS_ACCESS_KEY_ID
ARG VITE_AWS_SECRET_ACCESS_KEY
ARG VITE_AWS_REGION
ARG VITE_MAPBOX_TOKEN
ARG VITE_ENV
ARG VITE_API_URL
ARG VITE_CLIENT_ID
ARG VITE_CLIENT_SECRET
ARG VITE_GOOGLE_MAP_URL

ENV VITE_AWS_ACCESS_KEY_ID=$VITE_AWS_ACCESS_KEY_ID
ENV VITE_AWS_SECRET_ACCESS_KEY=$VITE_AWS_SECRET_ACCESS_KEY
ENV VITE_AWS_REGION=$VITE_AWS_REGION
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
ENV VITE_ENV=$VITE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_CLIENT_SECRET=$VITE_CLIENT_SECRET
ENV VITE_GOOGLE_MAP_URL=$GOOGLE_MAP_URL


# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 5173

# Set environment variables
ENV PORT 5173

# Start the application
CMD ["npm", "start"]