FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy environment file
COPY .env .env

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
