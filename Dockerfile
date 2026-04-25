FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Set node environment for optimization
ENV NODE_ENV=production

CMD ["node", "src/app.js"]
