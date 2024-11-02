# Use Node.js as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# # Build the application
# RUN npm run build

# Expose port 5173 (Vite default port)
EXPOSE 5173

# Run the application
CMD ["sh", "./script.sh"]