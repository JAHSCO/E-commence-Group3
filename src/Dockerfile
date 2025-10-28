# Use an official Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Expose the port (React uses 5173 if Vite, or 3000 if CRA)
EXPOSE 3000

# Command to start the app
CMD ["npm", "run", "dev"]
