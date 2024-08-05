# Use the official Node.js image from Docker Hub
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json and package-lock.json (if exists) to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Set the default command to run the application
CMD ["node", "app.js"]